import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processarNotaComAI } from '@/lib/claude';
import { verifySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { conteudo } = await request.json();

    if (!conteudo || typeof conteudo !== 'string') {
      return NextResponse.json(
        { error: 'Conteúdo é obrigatório' },
        { status: 400 },
      );
    }

    // Criar nota inicial com valores básicos
    const nota = await prisma.nota.create({
      data: {
        conteudo,
        tipo: 'outro',
        status: 'ativa',
      },
    });

    // Processar com IA em background (não bloquear a resposta)
    processarNotaComAI(conteudo)
      .then(async (resultado) => {
        try {
          // Verificar se existe projeto sugerido
          let projetoId = null;
          if (resultado.projeto_sugerido) {
            const projeto = await prisma.projeto.findFirst({
              where: {
                nome: {
                  contains: resultado.projeto_sugerido,
                  mode: 'insensitive',
                },
                status: 'ativo',
              },
            });
            if (projeto) {
              projetoId = projeto.id;
            }
          }

          // Atualizar nota com resultado da IA
          await prisma.nota.update({
            where: { id: nota.id },
            data: {
              titulo: resultado.titulo,
              tipo: resultado.tipo,
              resumo: resultado.resumo,
              tags: resultado.tags,
              prioridade: resultado.prioridade,
              prazo: resultado.prazo ? new Date(resultado.prazo) : null,
              projetoId,
            },
          });
        } catch (error) {
          console.error('Erro ao atualizar nota com IA:', error);
        }
      })
      .catch((error) => {
        console.error('Erro ao processar nota com IA:', error);
      });

    return NextResponse.json(nota);
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const projetoId = searchParams.get('projetoId');
    const busca = searchParams.get('busca');

    const where: Record<string, unknown> = {
      status: 'ativa',
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (projetoId) {
      where.projetoId = projetoId;
    }

    if (busca) {
      where.OR = [
        { conteudo: { contains: busca, mode: 'insensitive' } },
        { titulo: { contains: busca, mode: 'insensitive' } },
        { resumo: { contains: busca, mode: 'insensitive' } },
        { tags: { has: busca } },
      ];
    }

    const notas = await prisma.nota.findMany({
      where,
      include: {
        projeto: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return NextResponse.json(notas);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

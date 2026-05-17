import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { nome, descricao, cor } = await request.json();

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 },
      );
    }

    const projeto = await prisma.projeto.create({
      data: {
        nome,
        descricao,
        cor: cor || '#3b82f6',
      },
    });

    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const projetos = await prisma.projeto.findMany({
      where: {
        status: 'ativo',
      },
      include: {
        _count: {
          select: { notas: true },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return NextResponse.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

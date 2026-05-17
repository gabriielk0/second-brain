import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar notas da última semana
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

    const notas = await prisma.nota.findMany({
      where: {
        criadoEm: {
          gte: umaSemanaAtras,
        },
        status: 'ativa',
      },
      include: {
        projeto: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    // Buscar tarefas pendentes com prazo próximo
    const tarefasPendentes = await prisma.nota.findMany({
      where: {
        tipo: 'tarefa',
        status: 'ativa',
        prazo: {
          not: null,
        },
      },
      orderBy: {
        prazo: 'asc',
      },
    });

    // Preparar dados para a IA
    const notasTexto = notas
      .map(
        (n) =>
          `- [${n.tipo}] ${n.titulo || n.conteudo.substring(0, 50)}... (${new Date(n.criadoEm).toLocaleDateString('pt-BR')})`,
      )
      .join('\n');

    const tarefasTexto = tarefasPendentes
      .filter((t) => t.prazo)
      .slice(0, 10)
      .map((t) => {
        const dias = Math.floor(
          (new Date(t.prazo!).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return `- ${t.titulo || t.conteudo.substring(0, 50)}... (prazo: ${dias} dias)`;
      })
      .join('\n');

    const prompt = `Você é um assistente de organização pessoal. Analise as notas e tarefas abaixo e gere um resumo semanal em português.

Notas capturadas esta semana:
${notasTexto || 'Nenhuma nota capturada esta semana.'}

Tarefas pendentes com prazo:
${tarefasTexto || 'Nenhuma tarefa pendente com prazo.'}

Gere um resumo com as seguintes seções:
1. **O que foi capturado**: Resumo das principais ideias, tarefas e reflexões da semana
2. **Padrões identificados**: Temas recorrentes ou áreas de foco
3. **Tarefas pendentes com prazo próximo**: Lista das tarefas que precisam de atenção
4. **Sugestão de foco para a próxima semana**: Recomendações baseadas no que foi capturado

Seja conciso e prático. Use formatação markdown para as seções.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return NextResponse.json({ resumo: content.text });
    }

    throw new Error('Resposta da IA não é texto');
  } catch (error) {
    console.error('Erro ao gerar resumo semanal:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

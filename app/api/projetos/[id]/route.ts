import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const projeto = await prisma.projeto.findUnique({
      where: { id: params.id },
      include: {
        notas: {
          where: { status: 'ativa' },
          orderBy: { criadoEm: 'desc' },
        },
        _count: {
          select: { notas: true },
        },
      },
    });

    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    const data = await request.json();

    const projeto = await prisma.projeto.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const params = await context.params;
    await prisma.projeto.update({
      where: { id: params.id },
      data: { status: 'arquivado' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao arquivar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

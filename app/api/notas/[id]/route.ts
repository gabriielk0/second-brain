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
    const nota = await prisma.nota.findUnique({
      where: { id: params.id },
      include: {
        projeto: true,
      },
    });

    if (!nota) {
      return NextResponse.json(
        { error: 'Nota não encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(nota);
  } catch (error) {
    console.error('Erro ao buscar nota:', error);
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

    const nota = await prisma.nota.update({
      where: { id: params.id },
      data,
      include: {
        projeto: true,
      },
    });

    return NextResponse.json(nota);
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
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
    await prisma.nota.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Nota {
  id: string;
  conteudo: string;
  tipo: string;
  titulo: string | null;
  tags: string[];
  criadoEm: string;
}

interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  criadoEm: string;
  notas: Nota[];
}

export default function ProjetoDetalhe() {
  const router = useRouter();
  const params = useParams();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [carregado, setCarregado] = useState(false);

  const carregarProjeto = async () => {
    try {
      const response = await fetch(`/api/projetos/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProjeto(data);
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!carregado) {
    carregarProjeto();
    setCarregado(true);
  }

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'tarefa': return 'bg-blue-500/20 text-blue-400';
      case 'ideia': return 'bg-purple-500/20 text-purple-400';
      case 'reflexao': return 'bg-green-500/20 text-green-400';
      case 'referencia': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/projetos')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-xl font-bold text-foreground">{projeto.nome}</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info do Projeto */}
        <div className="mb-8 p-6 bg-card border border-border rounded-xl">
          <div className="flex items-start gap-4">
            <div
              className="w-4 h-4 rounded-full mt-1"
              style={{ backgroundColor: projeto.cor }}
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">{projeto.nome}</h2>
              {projeto.descricao && (
                <p className="text-muted-foreground mb-4">{projeto.descricao}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {projeto.notas.length} nota{projeto.notas.length !== 1 ? 's' : ''} • Criado em{' '}
                {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Notas do Projeto */}
        <div className="space-y-4">
          {projeto.notas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma nota neste projeto ainda.</p>
            </div>
          ) : (
            projeto.notas.map((nota) => (
              <div
                key={nota.id}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/notas/${nota.id}`)}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    {nota.titulo && (
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {nota.titulo}
                      </h3>
                    )}
                    <p className="text-foreground mb-3">{nota.conteudo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(nota.tipo)}`}>
                    {nota.tipo}
                  </span>
                </div>

                {nota.tags && nota.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {nota.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  {new Date(nota.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

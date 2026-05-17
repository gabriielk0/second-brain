'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Nota {
  id: string;
  conteudo: string;
  tipo: string;
  titulo: string | null;
  resumo: string | null;
  tags: string[];
  status: string;
  criadoEm: string;
  projeto: { id: string; nome: string; cor: string } | null;
}

export default function IdeiasPage() {
  const router = useRouter();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregado, setCarregado] = useState(false);

  const carregarNotas = async () => {
    try {
      const response = await fetch('/api/notas?tipo=ideia');
      if (response.ok) {
        const data = await response.json();
        setNotas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
    }
  };

  if (!carregado) {
    carregarNotas();
    setCarregado(true);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-foreground">Ideias</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notas.map((nota) => (
            <div
              key={nota.id}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/notas/${nota.id}`)}
            >
              {nota.titulo && (
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {nota.titulo}
                </h3>
              )}
              <p className="text-foreground mb-4 line-clamp-3">{nota.conteudo}</p>
              
              {nota.resumo && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {nota.resumo}
                </p>
              )}

              {nota.tags && nota.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {nota.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {nota.tags.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                      +{nota.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {new Date(nota.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
                {nota.projeto && (
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: nota.projeto.cor + '20', color: nota.projeto.cor }}
                  >
                    {nota.projeto.nome}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {notas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma ideia encontrada. Capture suas ideias na página principal!</p>
          </div>
        )}
      </div>
    </div>
  );
}

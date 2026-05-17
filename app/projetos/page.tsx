'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Projeto {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  criadoEm: string;
  _count: { notas: number };
}

export default function ProjetosPage() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [novoProjeto, setNovoProjeto] = useState({ nome: '', descricao: '', cor: '#3b82f6' });
  const [carregado, setCarregado] = useState(false);

  const carregarProjetos = async () => {
    try {
      const response = await fetch('/api/projetos');
      if (response.ok) {
        const data = await response.json();
        setProjetos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  if (!carregado) {
    carregarProjetos();
    setCarregado(true);
  }

  const handleCriarProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProjeto),
      });

      if (response.ok) {
        setMostrarFormulario(false);
        setNovoProjeto({ nome: '', descricao: '', cor: '#3b82f6' });
        carregarProjetos();
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  const handleArquivar = async (id: string) => {
    if (!confirm('Tem certeza que deseja arquivar este projeto?')) return;

    try {
      await fetch(`/api/projetos/${id}`, {
        method: 'DELETE',
      });
      carregarProjetos();
    } catch (error) {
      console.error('Erro ao arquivar projeto:', error);
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
          >
            + Novo Projeto
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {mostrarFormulario && (
          <div className="mb-8 p-6 bg-card border border-border rounded-xl">
            <h2 className="text-xl font-semibold text-foreground mb-4">Criar Novo Projeto</h2>
            <form onSubmit={handleCriarProjeto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={novoProjeto.nome}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={novoProjeto.descricao}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cor
                </label>
                <div className="flex gap-2">
                  {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map((cor) => (
                    <button
                      key={cor}
                      type="button"
                      onClick={() => setNovoProjeto({ ...novoProjeto, cor })}
                      className={`w-10 h-10 rounded-lg border-2 transition-colors ${
                        novoProjeto.cor === cor ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-6 py-2 bg-card text-foreground border border-border rounded-lg font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/projetos/${projeto.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: projeto.cor }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArquivar(projeto.id);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  Arquivar
                </button>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-2">{projeto.nome}</h3>

              {projeto.descricao && (
                <p className="text-muted-foreground mb-4 line-clamp-2">{projeto.descricao}</p>
              )}

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{projeto._count.notas} notas</span>
                <span>
                  {new Date(projeto.criadoEm).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {projetos.length === 0 && !mostrarFormulario && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum projeto encontrado. Crie seu primeiro projeto!</p>
          </div>
        )}
      </div>
    </div>
  );
}

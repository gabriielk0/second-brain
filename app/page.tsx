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
  prioridade: string | null;
  prazo: string | null;
  criadoEm: string;
  projeto: { id: string; nome: string; cor: string } | null;
}

export default function Home() {
  const router = useRouter();
  const [conteudo, setConteudo] = useState('');
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [carregado, setCarregado] = useState(false);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [resumo, setResumo] = useState('');
  const [carregandoResumo, setCarregandoResumo] = useState(false);

  const carregarNotas = async (tipo?: string, buscaTexto?: string) => {
    try {
      const params = new URLSearchParams();
      if (tipo && tipo !== 'todos') params.append('tipo', tipo);
      if (buscaTexto) params.append('busca', buscaTexto);

      const response = await fetch(`/api/notas?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNotas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const handleFiltroChange = (novoTipo: string) => {
    setFiltroTipo(novoTipo);
    carregarNotas(novoTipo, busca);
  };

  const handleBuscaChange = (novoBusca: string) => {
    setBusca(novoBusca);
    carregarNotas(filtroTipo, novoBusca);
  };

  if (!carregado) {
    carregarNotas();
    setCarregado(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/notas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo }),
      });

      if (response.ok) {
        const novaNota = await response.json();
        setNotas([novaNota, ...notas]);
        setConteudo('');

        // Recarregar após um momento para pegar os dados processados pela IA
        setTimeout(carregarNotas, 2000);
      }
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleGerarResumo = async () => {
    setCarregandoResumo(true);
    try {
      const response = await fetch('/api/resumo-semanal', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setResumo(data.resumo);
        setMostrarResumo(true);
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
    } finally {
      setCarregandoResumo(false);
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'tarefa':
        return 'bg-blue-500/20 text-blue-400';
      case 'ideia':
        return 'bg-purple-500/20 text-purple-400';
      case 'reflexao':
        return 'bg-green-500/20 text-green-400';
      case 'referencia':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPrioridadeBadgeColor = (prioridade: string | null) => {
    if (!prioridade) return '';
    switch (prioridade) {
      case 'alta':
        return 'bg-red-500/20 text-red-400';
      case 'media':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'baixa':
        return 'bg-green-500/20 text-green-400';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Second Brain</h1>
          <div className="flex gap-4">
            <button
              onClick={handleGerarResumo}
              disabled={carregandoResumo}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {carregandoResumo ? 'Gerando...' : 'Resumo da Semana'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Campo de Captura */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="O que está na sua cabeça agora? (Ctrl+Enter para salvar)"
              className="w-full h-32 px-6 py-4 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none text-lg"
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? 'Processando...'
                  : 'Pressione Ctrl+Enter para salvar'}
              </p>
              <button
                type="submit"
                disabled={loading || !conteudo.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>

        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFiltroChange('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === 'todos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => handleFiltroChange('tarefa')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === 'tarefa'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Tarefas
            </button>
            <button
              onClick={() => handleFiltroChange('ideia')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === 'ideia'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Ideias
            </button>
            <button
              onClick={() => handleFiltroChange('reflexao')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroTipo === 'reflexao'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              Reflexões
            </button>
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => handleBuscaChange(e.target.value)}
            placeholder="Buscar..."
            className="px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
          />
        </div>

        {/* Lista de Notas */}
        <div className="space-y-4">
          {notas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma nota encontrada. Comece capturando suas ideias!</p>
            </div>
          ) : (
            notas.map((nota) => (
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
                  <div className="flex gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoBadgeColor(nota.tipo)}`}
                    >
                      {nota.tipo}
                    </span>
                    {nota.prioridade && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPrioridadeBadgeColor(nota.prioridade)}`}
                      >
                        {nota.prioridade}
                      </span>
                    )}
                  </div>
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
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {new Date(nota.criadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {nota.projeto && (
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: nota.projeto.cor + '20',
                        color: nota.projeto.cor,
                      }}
                    >
                      {nota.projeto.nome}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Resumo Semanal */}
      {mostrarResumo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Resumo da Semana
              </h2>
              <button
                onClick={() => setMostrarResumo(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground">
                {resumo}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

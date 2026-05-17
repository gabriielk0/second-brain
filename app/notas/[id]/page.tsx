'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  atualizadoEm: string;
  projeto: { id: string; nome: string; cor: string } | null;
}

export default function NotaDetalhe() {
  const router = useRouter();
  const params = useParams();
  const [nota, setNota] = useState<Nota | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    conteudo: '',
    titulo: '',
    resumo: '',
    tags: '',
    tipo: 'outro',
    prioridade: '',
    prazo: '',
  });
  const [carregado, setCarregado] = useState(false);

  const carregarNota = async () => {
    try {
      const response = await fetch(`/api/notas/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setNota(data);
        setFormData({
          conteudo: data.conteudo,
          titulo: data.titulo || '',
          resumo: data.resumo || '',
          tags: data.tags ? data.tags.join(', ') : '',
          tipo: data.tipo,
          prioridade: data.prioridade || '',
          prazo: data.prazo ? data.prazo.split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar nota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!carregado) {
    carregarNota();
    setCarregado(true);
  }

  const handleSalvar = async () => {
    try {
      const response = await fetch(`/api/notas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conteudo: formData.conteudo,
          titulo: formData.titulo || null,
          resumo: formData.resumo || null,
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
          tipo: formData.tipo,
          prioridade: formData.prioridade || null,
          prazo: formData.prazo ? new Date(formData.prazo).toISOString() : null,
        }),
      });

      if (response.ok) {
        const atualizada = await response.json();
        setNota(atualizada);
        setEditando(false);
      }
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
    }
  };

  const handleArquivar = async () => {
    try {
      await fetch(`/api/notas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'arquivada' }),
      });
      router.push('/');
    } catch (error) {
      console.error('Erro ao arquivar nota:', error);
    }
  };

  const handleExcluir = async () => {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return;

    try {
      await fetch(`/api/notas/${params.id}`, {
        method: 'DELETE',
      });
      router.push('/');
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
    }
  };

  const handleConcluir = async () => {
    try {
      await fetch(`/api/notas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida' }),
      });
      router.push('/');
    } catch (error) {
      console.error('Erro ao concluir nota:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!nota) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Nota não encontrada</p>
      </div>
    );
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
          <h1 className="text-xl font-bold text-foreground">
            Detalhes da Nota
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {editando ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Conteúdo
              </label>
              <textarea
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                className="w-full h-48 px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resumo
              </label>
              <textarea
                value={formData.resumo}
                onChange={(e) =>
                  setFormData({ ...formData, resumo: e.target.value })
                }
                className="w-full h-24 px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ideia">Ideia</option>
                  <option value="tarefa">Tarefa</option>
                  <option value="reflexao">Reflexão</option>
                  <option value="referencia">Referência</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.prioridade}
                  onChange={(e) =>
                    setFormData({ ...formData, prioridade: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sem prioridade</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prazo
              </label>
              <input
                type="date"
                value={formData.prazo}
                onChange={(e) =>
                  setFormData({ ...formData, prazo: e.target.value })
                }
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSalvar}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
              >
                Salvar
              </button>
              <button
                onClick={() => setEditando(false)}
                className="px-6 py-2 bg-card text-foreground border border-border rounded-lg font-medium hover:bg-muted"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {nota.titulo && (
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {nota.titulo}
                  </h2>
                )}
                <p className="text-lg text-foreground whitespace-pre-wrap">
                  {nota.conteudo}
                </p>
              </div>
            </div>

            {nota.resumo && (
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Resumo
                </h3>
                <p className="text-foreground">{nota.resumo}</p>
              </div>
            )}

            {nota.tags && nota.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Tags
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {nota.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Tipo
                </h3>
                <p className="text-foreground capitalize">{nota.tipo}</p>
              </div>

              {nota.prioridade && (
                <div className="p-4 bg-card border border-border rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Prioridade
                  </h3>
                  <p className="text-foreground capitalize">
                    {nota.prioridade}
                  </p>
                </div>
              )}

              {nota.prazo && (
                <div className="p-4 bg-card border border-border rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Prazo
                  </h3>
                  <p className="text-foreground">
                    {new Date(nota.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {nota.projeto && (
                <div className="p-4 bg-card border border-border rounded-lg">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                    Projeto
                  </h3>
                  <p
                    className="text-foreground"
                    style={{ color: nota.projeto.cor }}
                  >
                    {nota.projeto.nome}
                  </p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Criado em: {new Date(nota.criadoEm).toLocaleString('pt-BR')}
              </p>
              <p>
                Atualizado em:{' '}
                {new Date(nota.atualizadoEm).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-border">
              <button
                onClick={() => setEditando(true)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
              >
                Editar
              </button>

              {nota.tipo === 'tarefa' && nota.status !== 'concluida' && (
                <button
                  onClick={handleConcluir}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Concluir
                </button>
              )}

              <button
                onClick={handleArquivar}
                className="px-6 py-2 bg-card text-foreground border border-border rounded-lg font-medium hover:bg-muted"
              >
                Arquivar
              </button>

              <button
                onClick={handleExcluir}
                className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

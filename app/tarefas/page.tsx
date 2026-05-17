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

export default function TarefasPage() {
  const router = useRouter();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [carregado, setCarregado] = useState(false);

  const carregarNotas = async () => {
    try {
      const response = await fetch('/api/notas?tipo=tarefa');
      if (response.ok) {
        const data = await response.json();
        setNotas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  if (!carregado) {
    carregarNotas();
    setCarregado(true);
  }

  const getPrazoStatus = (prazo: string | null) => {
    if (!prazo) return null;
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const dias = Math.floor(
      (dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dias < 0) return { text: 'Vencido', color: 'text-red-400' };
    if (dias === 0) return { text: 'Hoje', color: 'text-yellow-400' };
    if (dias === 1) return { text: 'Amanhã', color: 'text-yellow-400' };
    if (dias <= 7) return { text: `${dias} dias`, color: 'text-green-400' };
    return { text: `${dias} dias`, color: 'text-muted-foreground' };
  };

  const handleConcluir = async (id: string) => {
    try {
      await fetch(`/api/notas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'concluida' }),
      });
      carregarNotas();
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  // Separar por prioridade
  const tarefasAlta = notas.filter((n) => n.prioridade === 'alta');
  const tarefasMedia = notas.filter((n) => n.prioridade === 'media');
  const tarefasBaixa = notas.filter((n) => n.prioridade === 'baixa');
  const tarefasSemPrioridade = notas.filter((n) => !n.prioridade);

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
          <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {tarefasAlta.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full" />
              Alta Prioridade
            </h2>
            <div className="space-y-3">
              {tarefasAlta.map((nota) => (
                <div
                  key={nota.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/notas/${nota.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {nota.titulo && (
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {nota.titulo}
                        </h3>
                      )}
                      <p className="text-foreground mb-2">{nota.conteudo}</p>
                      {nota.prazo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`font-medium ${getPrazoStatus(nota.prazo)?.color}`}
                          >
                            {getPrazoStatus(nota.prazo)?.text}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(nota.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConcluir(nota.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tarefasMedia.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full" />
              Média Prioridade
            </h2>
            <div className="space-y-3">
              {tarefasMedia.map((nota) => (
                <div
                  key={nota.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/notas/${nota.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {nota.titulo && (
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {nota.titulo}
                        </h3>
                      )}
                      <p className="text-foreground mb-2">{nota.conteudo}</p>
                      {nota.prazo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`font-medium ${getPrazoStatus(nota.prazo)?.color}`}
                          >
                            {getPrazoStatus(nota.prazo)?.text}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(nota.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConcluir(nota.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tarefasBaixa.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full" />
              Baixa Prioridade
            </h2>
            <div className="space-y-3">
              {tarefasBaixa.map((nota) => (
                <div
                  key={nota.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/notas/${nota.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {nota.titulo && (
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {nota.titulo}
                        </h3>
                      )}
                      <p className="text-foreground mb-2">{nota.conteudo}</p>
                      {nota.prazo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`font-medium ${getPrazoStatus(nota.prazo)?.color}`}
                          >
                            {getPrazoStatus(nota.prazo)?.text}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(nota.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConcluir(nota.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tarefasSemPrioridade.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-500 rounded-full" />
              Sem Prioridade
            </h2>
            <div className="space-y-3">
              {tarefasSemPrioridade.map((nota) => (
                <div
                  key={nota.id}
                  className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/notas/${nota.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {nota.titulo && (
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {nota.titulo}
                        </h3>
                      )}
                      <p className="text-foreground mb-2">{nota.conteudo}</p>
                      {nota.prazo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={`font-medium ${getPrazoStatus(nota.prazo)?.color}`}
                          >
                            {getPrazoStatus(nota.prazo)?.text}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(nota.prazo).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConcluir(nota.id);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {notas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>
              Nenhuma tarefa encontrada. Capture suas tarefas na página
              principal!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

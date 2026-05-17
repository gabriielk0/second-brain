import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface NotaProcessada {
  titulo: string;
  tipo: 'ideia' | 'tarefa' | 'reflexao' | 'referencia' | 'outro';
  resumo: string;
  tags: string[];
  prioridade: 'alta' | 'media' | 'baixa' | null;
  prazo: string | null;
  projeto_sugerido: string | null;
}

export async function processarNotaComAI(conteudo: string): Promise<NotaProcessada> {
  const prompt = `Você é um assistente de organização pessoal. Analise a nota abaixo e retorne APENAS um JSON válido (sem markdown, sem explicação) com os campos solicitados.
Seja conciso nos títulos e tags. Detecte prazos implícitos (ex: "semana que vem", "amanhã", "em dezembro"). Classifique o tipo com base no conteúdo.

Nota: ${conteudo}

Responda APENAS com JSON:
{
  "titulo": "",
  "tipo": "",
  "resumo": "",
  "tags": [],
  "prioridade": null,
  "prazo": null,
  "projeto_sugerido": null
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Limpar o JSON removendo markdown se existir
      const jsonStr = content.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const resultado = JSON.parse(jsonStr) as NotaProcessada;
      
      // Formatar prazo se existir
      if (resultado.prazo) {
        resultado.prazo = formatarPrazo(resultado.prazo);
      }
      
      return resultado;
    }
    
    throw new Error('Resposta da IA não é texto');
  } catch (error) {
    console.error('Erro ao processar nota com IA:', error);
    // Retornar valores padrão em caso de erro
    return {
      titulo: conteudo.substring(0, 60),
      tipo: 'outro',
      resumo: conteudo.substring(0, 100),
      tags: [],
      prioridade: null,
      prazo: null,
      projeto_sugerido: null,
    };
  }
}

function formatarPrazo(prazo: string): string | null {
  try {
    // Tentar converter para formato ISO
    const data = new Date(prazo);
    if (!isNaN(data.getTime())) {
      return data.toISOString().split('T')[0];
    }
    
    // Tentar interpretar expressões comuns
    const hoje = new Date();
    const prazoLower = prazo.toLowerCase();
    
    if (prazoLower.includes('amanhã') || prazoLower.includes('amanha')) {
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      return amanha.toISOString().split('T')[0];
    }
    
    if (prazoLower.includes('semana que vem')) {
      const proximaSemana = new Date(hoje);
      proximaSemana.setDate(hoje.getDate() + 7);
      return proximaSemana.toISOString().split('T')[0];
    }
    
    return null;
  } catch {
    return null;
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface ProcessarNotaResult {
  titulo: string | null;
  tipo: string;
  resumo: string | null;
  tags: string[];
  prioridade: string | null;
  prazo: string | null;
  projeto_sugerido: string | null;
}

export async function processarNotaComAI(conteudo: string): Promise<ProcessarNotaResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analise a seguinte nota e retorne um JSON com os campos:
- titulo: título curto e descritivo
- tipo: um de "ideia", "tarefa", "reflexao", "referencia", "outro"
- resumo: resumo em uma frase
- tags: array de 3-5 tags relevantes
- prioridade: um de "alta", "media", "baixa" (ou null se não for tarefa)
- prazo: data ISO 8601 se houver prazo mencionado (ou null)
- projeto_sugerido: nome do projeto se parecer relacionado (ou null)

Nota: "${conteudo}"

Retorne apenas o JSON, sem texto adicional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Limpar o texto para extrair o JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON da resposta');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      titulo: parsed.titulo || null,
      tipo: parsed.tipo || 'outro',
      resumo: parsed.resumo || null,
      tags: parsed.tags || [],
      prioridade: parsed.prioridade || null,
      prazo: parsed.prazo || null,
      projeto_sugerido: parsed.projeto_sugerido || null,
    };
  } catch (error) {
    console.error('Erro ao processar nota com Gemini:', error);
    // Retornar valores padrão em caso de erro
    return {
      titulo: null,
      tipo: 'outro',
      resumo: null,
      tags: [],
      prioridade: null,
      prazo: null,
      projeto_sugerido: null,
    };
  }
}

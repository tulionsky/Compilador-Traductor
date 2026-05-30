// ============================================================
// GroqClient.js — Sugerencias de corrección con Groq
// Dado un conjunto de errores ya detectados por el compilador,
// Groq genera explicaciones y sugerencias en lenguaje natural.
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

const GROQ_API_KEY = '';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.1-8b-instant';

function construirPromptSugerencias(textoOriginal, errores, idioma) {
    const idiomaTexto = idioma === 'en' ? 'INGLÉS' : 'ESPAÑOL';

    const listaErrores = errores.map((e, i) =>
        `${i + 1}. Tipo: ${e.tipo || 'SEMÁNTICO'} | Token: "${e.token || e.token_problematico}" | Descripción: ${e.descripcion}`
    ).join('\n');

    return `Eres un asistente de corrección gramatical para un compilador traductor ${idiomaTexto}.

El compilador detectó los siguientes errores en el texto: "${textoOriginal}"

ERRORES DETECTADOS:
${listaErrores}

Para cada error genera una sugerencia de corrección clara y concisa.
Responde ÚNICAMENTE con JSON válido sin markdown:
{
  "sugerencias": [
    {
      "original": "fragmento con error",
      "correccion": "fragmento corregido",
      "explicacion": "explicación breve en español de máximo 15 palabras"
    }
  ],
  "texto_corregido": "el texto completo con todos los errores corregidos"
}`;
}

export async function obtenerSugerenciasGroq(textoOriginal, errores, idioma) {
    if (!errores || errores.length === 0) {
        return { sugerencias: [], textoCorregido: textoOriginal };
    }

    const prompt = construirPromptSugerencias(textoOriginal, errores, idioma);
    let respuestaTexto = '';

    try {
        const response = await fetch(GROQ_URL, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model:    GROQ_MODEL,
                messages: [
                    {
                        role:    'system',
                        content: 'Eres un asistente de corrección gramatical. Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.'
                    },
                    {
                        role:    'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens:  400,
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Groq API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        respuestaTexto = data?.choices?.[0]?.message?.content || '';

        respuestaTexto = respuestaTexto
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        const resultado = JSON.parse(respuestaTexto);

        const sugerenciasFiltradas = (resultado.sugerencias || []).filter(s =>
            s.original &&
            s.correccion &&
            s.original.toLowerCase().trim() !== s.correccion.toLowerCase().trim()
        );

        return {
            sugerencias:    sugerenciasFiltradas,
            textoCorregido: resultado.texto_corregido || textoOriginal
        };

    } catch (e) {
        console.error('Error en Groq:', e);
        return {
            sugerencias:    [],
            textoCorregido: textoOriginal,
            advertencia:    `Sugerencias de IA no disponibles: ${e.message}`
        };
    }
}
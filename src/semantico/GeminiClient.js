// ============================================================
// GeminiClient.js — Cliente de la API de Gemini
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

const GEMINI_API_KEY = "AIzaSyDyJdyVuWBnV6_Th4X7_yi8Mirx4lIkz1Y";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── CONSTRUIR PROMPT ─────────────────────────────────────────
function construirPrompt(texto, tablaSimbolos, tipoOracion, idioma) {
    const tablaResumida = tablaSimbolos.map(t =>
        `  pos:${t.posicion} token:"${t.token}" lema:"${t.lema}" cat:${t.categoria} num:${t.numero} gen:${t.genero}`
    ).join('\n');

    const idiomaTexto = idioma === 'en' ? 'INGLÉS' : 'ESPAÑOL';

    const reglas = idioma === 'en' ? `
REGLAS A VERIFICAR (INGLÉS):
1. CONCORDANCIA SUJETO-VERBO: sujeto plural + verbo singular → ERROR. Ej: "The cats runs" → ERROR.
2. ARTÍCULO INDEFINIDO: "a" antes de vocal o "an" antes de consonante → ERROR.
3. NEGACIÓN SIN AUXILIAR: "not" sin do/does/did/is/are → ERROR.
4. MEZCLA DE TIEMPOS: verbos en tiempos distintos sin justificación → ERROR.
5. USO INCORRECTO DE PRONOMBRES: "me" como sujeto, "I" como objeto → ERROR.
` : `
REGLAS A VERIFICAR (ESPAÑOL):
1. CONCORDANCIA GÉNERO: artículo y sustantivo deben concordar en género → "El niña" es ERROR.
2. CONCORDANCIA NÚMERO: artículo y sustantivo deben concordar en número → "Los gato" es ERROR.
3. CONCORDANCIA SUJETO-VERBO: "Los gatos corre" → ERROR, debe ser "corren".
4. POSICIÓN NEGACIÓN: "no" debe ir antes del verbo → "El gato corre no" es ERROR.
5. USO DE PRONOMBRES: pronombre debe concordar con el referente.
`;

    return `Eres un analizador semántico estricto para un compilador universitario.
Analiza la siguiente oración en ${idiomaTexto} y detecta errores semánticos.

ORACIÓN: "${texto}"
TIPO: ${tipoOracion}
IDIOMA: ${idiomaTexto}

TABLA DE SÍMBOLOS:
${tablaResumida}

${reglas}

INSTRUCCIONES:
- Si las reglas locales ya detectaron errores, busca errores ADICIONALES que ellas no cubran.
- Sé estricto. Si hay error, repórtalo con token_problematico específico.
- La oración corregida debe ser la versión completa y correcta.
- Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.

FORMATO DE RESPUESTA:
Si hay errores: {"valido":false,"errores":[{"regla":"nombre","descripcion":"explicación en español","token_problematico":"palabra"}],"sugerencias":[{"original":"fragmento con error","correccion":"fragmento correcto","explicacion":"razón"}],"oracion_corregida":"oración completa corregida"}
Si no hay errores: {"valido":true,"errores":[],"sugerencias":[],"oracion_corregida":"${texto}"}`;
}

// ─── LLAMAR A GEMINI ──────────────────────────────────────────
export async function analizarConGemini(texto, tablaSimbolos, tipoOracion, idioma) {
    const prompt = construirPrompt(texto, tablaSimbolos, tipoOracion, idioma);
    let respuestaTexto = '';

    try {
        const response = await fetch(GEMINI_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature:     0.1,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API error ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        respuestaTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Limpiar markdown si viene
        respuestaTexto = respuestaTexto
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

        const resultado = JSON.parse(respuestaTexto);

        if (typeof resultado.valido !== 'boolean') {
            throw new Error('Respuesta de Gemini con estructura inesperada.');
        }

        return {
            valido:           resultado.valido,
            errores:          resultado.errores     || [],
            sugerencias:      resultado.sugerencias || [],
            oracionCorregida: resultado.oracion_corregida || texto
        };

    } catch (e) {
        console.error('Error en Gemini:', e);
        console.error('Respuesta raw:', respuestaTexto);

        // Fallo seguro — devolver sin errores de IA
        return {
            valido:           true,
            errores:          [],
            sugerencias:      [],
            oracionCorregida: texto,
            advertencia:      `Análisis semántico con IA no disponible: ${e.message}`
        };
    }
}
// ============================================================
// js/semántico.js — Módulo de Análisis Semántico
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

"use strict";

var GEMINI_API_KEY = "AIzaSyBDokJ0d16i8sZmI8y1Q-Beer9EpRrVDSI";
var GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─────────────────────────────────────────────────────────────
// VALIDACIONES LOCALES (JS puro, sin IA)
// ─────────────────────────────────────────────────────────────
function validarLocalmente(tablaSimbolos) {
    const errores     = [];
    const sugerencias = [];

    for (let i = 0; i < tablaSimbolos.length - 1; i++) {
        const actual    = tablaSimbolos[i];
        const siguiente = tablaSimbolos[i + 1];

        // REGLA: "a" antes de vocal -> debe ser "an"
        if (actual.lema === 'a' && actual.categoria === 'ARTICULO') {
            const primeraLetra = siguiente.token[0].toLowerCase();
            if ('aeiou'.includes(primeraLetra)) {
                errores.push({
                    regla:              'Artículo indefinido',
                    descripcion:        `Se usó "a" antes de "${siguiente.token}" que empieza con vocal. Debe ser "an ${siguiente.token}".`,
                    token_problematico: actual.token
                });
                sugerencias.push({
                    original:    `a ${siguiente.token}`,
                    correccion:  `an ${siguiente.token}`,
                    explicacion: '"an" se usa antes de palabras que empiezan con sonido vocal.'
                });
            }
        }

        // REGLA: "an" antes de consonante -> debe ser "a"
        if (actual.lema === 'an' && actual.categoria === 'ARTICULO') {
            const primeraLetra = siguiente.token[0].toLowerCase();
            if (!'aeiou'.includes(primeraLetra)) {
                errores.push({
                    regla:              'Artículo indefinido',
                    descripcion:        `Se usó "an" antes de "${siguiente.token}" que empieza con consonante. Debe ser "a ${siguiente.token}".`,
                    token_problematico: actual.token
                });
                sugerencias.push({
                    original:    `an ${siguiente.token}`,
                    correccion:  `a ${siguiente.token}`,
                    explicacion: '"a" se usa antes de palabras que empiezan con sonido consonante.'
                });
            }
        }
    }

    // REGLA: sujeto plural + verbo en 3ra persona singular
    const sustantivo = tablaSimbolos.find(t => t.categoria === 'SUSTANTIVO');
    const verbo      = tablaSimbolos.find(t => t.categoria === 'VERBO');

    if (sustantivo && verbo) {
        const tokenSust = sustantivo.token || '';
        const lemaSust  = sustantivo.lema  || '';
        const tokenVerbo = verbo.token || '';
        const lemaVerbo  = verbo.lema  || '';

        // Plural por campo numero O por morfología (token != lema y termina en s/es)
        const esPluralPorCampo      = sustantivo.numero === 'plural';
        const esPluralPorMorfologia = tokenSust.toLowerCase() !== lemaSust.toLowerCase()
            && (tokenSust.endsWith('s') || tokenSust.endsWith('es'))
            && !lemaSust.endsWith('s');
        const esPlural = esPluralPorCampo || esPluralPorMorfologia;

        // Verbo en 3ra persona singular: termina en s, lema no termina en s
        const verbEnSingular = tokenVerbo.endsWith('s') && !lemaVerbo.endsWith('s');

        if (esPlural && verbEnSingular) {
            errores.push({
                regla:              'Concordancia sujeto-verbo',
                descripcion:        `El sujeto "${sustantivo.token}" es plural pero el verbo "${verbo.token}" está en singular. Debe ser "${lemaVerbo}".`,
                token_problematico: verbo.token
            });
            sugerencias.push({
                original:    verbo.token,
                correccion:  lemaVerbo,
                explicacion: 'Con sujeto plural el verbo no lleva "s" en presente simple.'
            });
        }
    }


    // REGLA: mezcla de tiempos verbales
    // Detecta si hay un verbo en pasado (token termina en 'ed', lema no)
    // y otro verbo en presente (token termina en 's', lema no) en la misma oración
    const verbos = tablaSimbolos.filter(t => t.categoria === 'VERBO');
    if (verbos.length >= 2) {
        const verbosEnPasado   = verbos.filter(v => v.token.endsWith('ed') && !v.lema.endsWith('ed'));
        const verbosEnPresente = verbos.filter(v => v.token.endsWith('s')  && !v.lema.endsWith('s'));

        if (verbosEnPasado.length > 0 && verbosEnPresente.length > 0) {
            errores.push({
                regla:              'Mezcla de tiempos verbales',
                descripcion:        `Se mezclan tiempos verbales: "${verbosEnPasado[0].token}" está en pasado y "${verbosEnPresente[0].token}" está en presente. Deben coincidir.`,
                token_problematico: verbosEnPresente[0].token
            });
            sugerencias.push({
                original:    verbosEnPresente[0].token,
                correccion:  verbosEnPasado[0].lema + 'ed',
                explicacion: 'Todos los verbos deben estar en el mismo tiempo verbal.'
            });
        }
    }

    return { errores, sugerencias };
}

// ─────────────────────────────────────────────────────────────
// PROMPT PARA GEMINI
// ─────────────────────────────────────────────────────────────
function construirPrompt(textoOriginal, tablaSimbolos, tipoOracion) {
    const tablaResumida = tablaSimbolos.map(t =>
        `  pos:${t.posicion} token:"${t.token}" lema:"${t.lema}" cat:${t.categoria} num:${t.numero} gen:${t.genero}`
    ).join("\n");

    return `Eres un analizador semántico estricto para un compilador universitario Inglés-Español.
Debes detectar errores gramaticales concretos. NO seas permisivo. Si hay un error, repórtalo.

ORACION A ANALIZAR: "${textoOriginal}"
TIPO DE ORACION: ${tipoOracion}

TABLA DE SIMBOLOS:
${tablaResumida}

REGLAS QUE DEBES VERIFICAR:

REGLA 1 - CONCORDANCIA SUJETO-VERBO:
- Si el sujeto es plural (numero=plural) y el verbo termina en "s" (forma singular), es ERROR.
- Ejemplo de ERROR: "The cats runs" -> "cats" es plural, "runs" es singular -> ERROR.
- Ejemplo CORRECTO: "The cat runs" -> sujeto singular, verbo singular -> OK.

REGLA 2 - MEZCLA DE TIEMPOS VERBALES:
- Si hay dos verbos principales y uno esta en pasado y otro en presente sin justificacion -> ERROR.
- Ejemplo de ERROR: "She studied and learns" -> mezcla pasado y presente.

REGLA 3 - AUXILIAR EN NEGATIVA:
- Una oracion negativa (con "not") debe tener un verbo auxiliar (do/does/did/is/are/was/were).
- Si hay negacion sin auxiliar -> ERROR.

INSTRUCCION: Si encuentras violaciones, "valido" DEBE ser false. Se estricto.

Responde UNICAMENTE con JSON valido, sin markdown:
Si hay errores: {"valido":false,"errores":[{"regla":"nombre","descripcion":"explicacion en español","token_problematico":"palabra"}],"sugerencias":[{"original":"fragmento","correccion":"corregido","explicacion":"razon"}]}
Si no hay errores: {"valido":true,"errores":[],"sugerencias":[]}`;
}

// ─────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL — ANÁLISIS SEMÁNTICO
// ─────────────────────────────────────────────────────────────
async function analizarSemantico(textoOriginal, tablaSimbolos, tipoOracion) {

    // 1. Validaciones locales primero (rápidas, deterministas, sin IA)
    const { errores: erroresLocales, sugerencias: sugerenciasLocales } = validarLocalmente(tablaSimbolos);

    const prompt = construirPrompt(textoOriginal, tablaSimbolos, tipoOracion);
    let respuestaTexto = "";

    try {
        const response = await fetch(GEMINI_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
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
        respuestaTexto = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        respuestaTexto = respuestaTexto
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        const resultado = JSON.parse(respuestaTexto);

        if (typeof resultado.valido !== "boolean") {
            throw new Error("Respuesta de Gemini con estructura inesperada.");
        }

        // 2. Fusionar errores locales + errores de Gemini
        const erroresFusionados     = [...erroresLocales,     ...(resultado.errores     || [])];
        const sugerenciasFusionadas = [...sugerenciasLocales, ...(resultado.sugerencias || [])];

        return {
            valido:      erroresFusionados.length === 0,
            errores:     erroresFusionados,
            sugerencias: sugerenciasFusionadas
        };

    } catch (e) {
        console.error("Error en análisis semántico:", e);
        console.error("Respuesta raw de Gemini:", respuestaTexto);

        // Fallo seguro: devolver al menos los errores locales
        return {
            valido:      erroresLocales.length === 0,
            errores:     erroresLocales,
            sugerencias: sugerenciasLocales,
            advertencia: erroresLocales.length === 0
                ? `Análisis semántico con IA no disponible: ${e.message}`
                : null
        };
    }
}

// ─────────────────────────────────────────────────────────────
// RENDERIZAR ERRORES SEMÁNTICOS EN EL HTML
// ─────────────────────────────────────────────────────────────
function renderizarErroresSemanticos(errores, advertencia) {
    const cuerpo = document.getElementById("cuerpo-errores-semanticos");
    if (!cuerpo) return;

    cuerpo.innerHTML = "";

    if (advertencia) {
        cuerpo.innerHTML = `<tr><td colspan="3" class="error-advertencia">⚠️ ${advertencia}</td></tr>`;
        return;
    }

    if (errores.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="3" class="placeholder-text">✅ Sin errores semánticos</td></tr>`;
        return;
    }

    errores.forEach((err, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="error-semantico">${err.regla || "Semántico"}</td>
            <td><strong>${err.token_problematico || ""}</strong> — ${err.descripcion}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─────────────────────────────────────────────────────────────
// RENDERIZAR SUGERENCIAS EN EL HTML
// ─────────────────────────────────────────────────────────────
function renderizarSugerencias(sugerencias) {
    const contenedor = document.getElementById("contenedor-sugerencias");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!sugerencias || sugerencias.length === 0) {
        contenedor.innerHTML = `<p class="placeholder-text">Sin sugerencias.</p>`;
        return;
    }

    sugerencias.forEach((sug, i) => {
        const card = document.createElement("div");
        card.className = "tarjeta-sugerencia";
        card.innerHTML = `
            <p class="sug-explicacion">${sug.explicacion}</p>
            <div class="sug-comparacion">
                <span class="sug-original">❌ ${sug.original}</span>
                <span class="sug-flecha">→</span>
                <span class="sug-correccion">✅ ${sug.correccion}</span>
            </div>
            <button class="btn-aplicar" data-original="${sug.original}" data-correccion="${sug.correccion}">
                Aplicar corrección
            </button>
        `;

        card.querySelector(".btn-aplicar").addEventListener("click", () => {
            const textarea = document.getElementById("texto-entrada");
            if (textarea) {
                textarea.value = textarea.value.replace(sug.original, sug.correccion);
            }
        });

        contenedor.appendChild(card);
    });
}
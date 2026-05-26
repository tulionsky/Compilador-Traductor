// ============================================================
// Semantico.js — Orquestador del análisis semántico
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { validarEN, validarES }  from './ReglasLocales.js';
import { analizarConGemini }     from './GeminiClient.js';

// ─── ANÁLISIS SEMÁNTICO PRINCIPAL ────────────────────────────
export async function analizarSemantico(texto, tablaSimbolos, tipoOracion, idioma = 'en') {

    // ── PASO 1: Validaciones locales (rápidas, sin IA) ────────
    const { errores: erroresLocales, sugerencias: sugerenciasLocales } =
        idioma === 'en'
            ? validarEN(tablaSimbolos)
            : validarES(tablaSimbolos);

    // ── PASO 2: Análisis con Gemini ───────────────────────────
    const resultadoGemini = await analizarConGemini(
        texto, tablaSimbolos, tipoOracion, idioma
    );

    // ── PASO 3: Fusionar resultados ───────────────────────────
    // Evitar duplicados — si Gemini reporta el mismo token que las reglas locales, no duplicar
    const tokensLocales = new Set(erroresLocales.map(e => e.token_problematico));

    const erroresGeminiNuevos = resultadoGemini.errores.filter(
        e => !tokensLocales.has(e.token_problematico)
    );

    const erroresFusionados     = [...erroresLocales, ...erroresGeminiNuevos];
    const sugerenciasFusionadas = [...sugerenciasLocales, ...resultadoGemini.sugerencias];

    return {
        valido:           erroresFusionados.length === 0,
        errores:          erroresFusionados,
        sugerencias:      sugerenciasFusionadas,
        oracionCorregida: resultadoGemini.oracionCorregida || texto,
        advertencia:      resultadoGemini.advertencia || null
    };
}
// ============================================================
// Semantico.js — Orquestador del análisis semántico
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { validarEN, validarES } from './ReglasLocales.js';

// ─── ANÁLISIS SEMÁNTICO PRINCIPAL ────────────────────────────
// Solo reglas locales — Groq se usa en UiController para sugerencias
export async function analizarSemantico(texto, tablaSimbolos, tipoOracion, idioma = 'en') {

    const { errores, sugerencias } =
        idioma === 'en'
            ? validarEN(tablaSimbolos)
            : validarES(tablaSimbolos);

    return {
        valido:           errores.length === 0,
        errores,
        sugerencias,
        oracionCorregida: texto,
        advertencia:      null
    };
}
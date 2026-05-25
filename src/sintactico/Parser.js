// ============================================================
// Parser.js — Orquestador del análisis sintáctico
// Decide qué parser usar según el idioma
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { ParserEN } from './ParserEN.js';
import { ParserES } from './ParserES.js';

export class AnalizadorSintactico {

    analizar(tokens, idioma = 'en') {
        const parser = idioma === 'en'
            ? new ParserEN()
            : new ParserES();

        return parser.analizar(tokens);
    }
}
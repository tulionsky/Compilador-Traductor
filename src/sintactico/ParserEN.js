// ============================================================
// ParserEN.js — Analizador sintáctico para inglés
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

"use strict";

import { BNF_EN } from './BnfRules.js';
import { ArbolDerivacion } from './ArbolDerivacion.js';

const CAT = {
    ARTICULO:               "ARTICULO",
    SUSTANTIVO:             "SUSTANTIVO",
    SUSTANTIVO_PROPIO:      "SUSTANTIVO_PROPIO",
    PRONOMBRE_PERSONAL:     "PRONOMBRE_PERSONAL",
    PRONOMBRE_DEMOSTRATIVO: "PRONOMBRE_DEMOSTRATIVO",
    PRONOMBRE_INTERROGATIVO:"PRONOMBRE_INTERROGATIVO",
    INDEFINIDO:             "INDEFINIDO",
    VERBO:                  "VERBO",
    VERBO_AUXILIAR:         "VERBO_AUXILIAR",
    ADJETIVO:               "ADJETIVO",
    ADVERBIO:               "ADVERBIO",
    NEGACION:               "NEGACION",
    CONJUNCION_COORD:       "CONJUNCION_COORDINANTE",
    CONJUNCION_SUB:         "CONJUNCION_SUBORDINANTE",
    PREPOSICION:            "PREPOSICION",
    INTERJECCION:           "INTERJECCION",
    POSESIVO:               "POSESIVO",
    DEMOSTRATIVO:           "DEMOSTRATIVO",
    NUMERAL_CARDINAL:       "NUMERAL_CARDINAL",
    NUMERAL_ORDINAL:        "NUMERAL_ORDINAL",
    PUNTUACION:             "PUNTUACION",
    CONTRACCION:            "CONTRACCION",
};

const POSESIVOS_COMO_OBJETO = ['her', 'him', 'them', 'us', 'me'];

export class ParserEN {

    constructor() {
        this.tokens   = [];
        this.posicion = 0;
        this.errores  = [];
        this.arbol    = new ArbolDerivacion();
    }

    analizar(tokens) {
        this.tokens   = tokens;
        this.posicion = 0;
        this.errores  = [];
        this.arbol.limpiar();

        this._saltarPuntuacion();

        try {
            const raiz = this._parsearOracion();
            this.arbol.cargar(raiz);

            // Verificar tokens no consumidos al final
            //this._verificarTokensRestantes();
        } catch (e) {
            this._registrarError(e.message, this.posicion);
        }

        return {
            valido:  this.errores.length === 0,
            arbol:   this.arbol.obtener(),
            tipo:    this.arbol.obtenerTipo(),
            regla:   this.arbol.obtenerRegla(),
            errores: this.errores,
            bnf:     BNF_EN
        };
    }

    // ─── VERIFICAR TOKENS NO CONSUMIDOS ───────────────────────
    // _verificarTokensRestantes() {
    //     this._saltarPuntuacion();
    //     const restante = this._ver();
    //     if (restante) {
    //         this._registrarError(
    //             `Token inesperado al final de la oración: "${restante.token}" (${restante.categoria})`,
    //             this.posicion
    //         );
    //     }
    // }

    // ─── PARSEO PRINCIPAL ─────────────────────────────────────
    _parsearOracion() {
        const token = this._ver();

        if (!token) {
            this._registrarError("La oración está vacía.", 0);
            return null;
        }

        if (this._esAuxiliar(token))              return this._parsearInterrogativa();
        if (this._esExclamacionInicio(token))     return this._parsearExclamativa();
        if (this._esCat(token, CAT.INTERJECCION)) return this._parsearExclamativaSimple();
        if (this._esCat(token, CAT.CONJUNCION_SUB)) return this._parsearSubordinadaInvertida();

        return this._parsearOracionConSujeto();
    }

    // ─── ORACIÓN CON SUJETO ───────────────────────────────────
    _parsearOracionConSujeto() {
        const sujeto = this._parsearSujeto();

        if (!sujeto) {
            this._registrarError(
                `Se esperaba un sujeto pero se encontró: "${this._ver()?.token}"`,
                this.posicion
            );
            return null;
        }

        if (this._esAuxiliar(this._ver()) &&
            this._esNegacion(this._verEn(1))) {
            return this._parsearNegativa(sujeto);
        }

        const predicado = this._parsearPredicado();

        if (this._esCat(this._ver(), CAT.CONJUNCION_COORD)) {
            return this._parsearCompuesta(sujeto, predicado);
        }

        if (this._esCat(this._ver(), CAT.CONJUNCION_SUB)) {
            return this._parsearSubordinada(sujeto, predicado);
        }

        return {
            tipo:  "DECLARATIVA",
            regla: BNF_EN.DECLARATIVA.regla,
            hijos: [sujeto, predicado]
        };
    }

    // ─── SUJETO ───────────────────────────────────────────────
    _parsearSujeto() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT.ARTICULO))     hijos.push(this._consumir(CAT.ARTICULO));
        if (this._esCat(this._ver(), CAT.POSESIVO))     hijos.push(this._consumir(CAT.POSESIVO));
        if (this._esCat(this._ver(), CAT.DEMOSTRATIVO)) hijos.push(this._consumir(CAT.DEMOSTRATIVO));
        if (this._esCat(this._ver(), CAT.INDEFINIDO))   hijos.push(this._consumir(CAT.INDEFINIDO));

        while (this._esCat(this._ver(), CAT.ADJETIVO)) {
            hijos.push(this._consumir(CAT.ADJETIVO));
        }

        if (this._esCat(this._ver(), CAT.NUMERAL_CARDINAL)) hijos.push(this._consumir(CAT.NUMERAL_CARDINAL));
        if (this._esCat(this._ver(), CAT.NUMERAL_ORDINAL))  hijos.push(this._consumir(CAT.NUMERAL_ORDINAL));

        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT.SUSTANTIVO_PROPIO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO_PROPIO));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_PERSONAL));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_DEMOSTRATIVO)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_DEMOSTRATIVO));
        } else if (this._esCat(this._ver(), CAT.INDEFINIDO) && hijos.length === 0) {
            hijos.push(this._consumir(CAT.INDEFINIDO));
        } else if (hijos.length === 0) {
            return null;
        } else if (!this._tieneNucleoSujeto(hijos)) {
            return null;
        }

        return {
            tipo:  "SUJETO",
            regla: "<sujeto> ::= [DET] [POSESIVO] [ADJ]* (SUST | PRON | INDEF)",
            hijos
        };
    }

    // ─── PREDICADO ────────────────────────────────────────────
    _parsearPredicado() {
        const hijos = [];

        while (this._esAuxiliar(this._ver())) {
            hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        }

        if (!this._esCat(this._ver(), CAT.VERBO)) {
            this._registrarError(
                `Se esperaba un VERBO pero se encontró: "${this._ver()?.token || 'fin de oración'}"`,
                this.posicion
            );
        } else {
            hijos.push(this._consumir(CAT.VERBO));
        }

        while (this._esCat(this._ver(), CAT.ADVERBIO)) {
            hijos.push(this._consumir(CAT.ADVERBIO));
        }

        this._consumirInfinitivos(hijos);

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        while (this._esCat(this._ver(), CAT.PREPOSICION) &&
        !this._esInfinitivoTo()) {
            hijos.push(this._consumir(CAT.PREPOSICION));
            const comp = this._parsearObjeto();
            if (comp) hijos.push(comp);
        }

        while (this._esCat(this._ver(), CAT.ADVERBIO)) {
            hijos.push(this._consumir(CAT.ADVERBIO));
        }

        return {
            tipo:  "PREDICADO",
            regla: "<predicado> ::= [AUX]* VERBO [ADV]* [to VERBO]* [<objeto>] [PREP <comp>]*",
            hijos
        };
    }

    // ─── OBJETO ───────────────────────────────────────────────
    _parsearObjeto() {
        const hijos = [];
        const posInicial = this.posicion;

        if (this._esCat(this._ver(), CAT.ARTICULO)) {
            hijos.push(this._consumir(CAT.ARTICULO));
        }

        if (this._esCat(this._ver(), CAT.POSESIVO)) {
            const siguienteEsSust =
                this._esCat(this._verEn(1), CAT.SUSTANTIVO) ||
                this._esCat(this._verEn(1), CAT.SUSTANTIVO_PROPIO) ||
                this._esCat(this._verEn(1), CAT.ADJETIVO);
            if (siguienteEsSust || !POSESIVOS_COMO_OBJETO.includes(this._ver()?.lema)) {
                hijos.push(this._consumir(CAT.POSESIVO));
            }
        }

        if (this._esCat(this._ver(), CAT.DEMOSTRATIVO)) hijos.push(this._consumir(CAT.DEMOSTRATIVO));
        if (this._esCat(this._ver(), CAT.INDEFINIDO))   hijos.push(this._consumir(CAT.INDEFINIDO));

        while (this._esCat(this._ver(), CAT.ADJETIVO)) {
            hijos.push(this._consumir(CAT.ADJETIVO));
        }

        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT.SUSTANTIVO_PROPIO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO_PROPIO));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_PERSONAL));
        } else if (this._esCat(this._ver(), CAT.POSESIVO) &&
            POSESIVOS_COMO_OBJETO.includes(this._ver()?.lema)) {
            hijos.push(this._consumir(CAT.POSESIVO));
        } else {
            this.posicion = posInicial;
            return null;
        }

        return {
            tipo:  "OBJETO",
            regla: "<objeto> ::= [DET] [ADJ]* (SUST | PRON)",
            hijos
        };
    }

    // ─── NEGATIVA ─────────────────────────────────────────────
    _parsearNegativa(sujeto) {
        const hijos = [sujeto];

        while (this._esAuxiliar(this._ver())) {
            hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        }
        hijos.push(this._consumir(CAT.NEGACION));

        if (this._esCat(this._ver(), CAT.VERBO)) {
            hijos.push(this._consumir(CAT.VERBO));
        }

        this._consumirInfinitivos(hijos);

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        return {
            tipo:  "NEGATIVA",
            regla: BNF_EN.NEGATIVA.regla,
            hijos
        };
    }

    // ─── INTERROGATIVA ────────────────────────────────────────
    _parsearInterrogativa() {
        const hijos = [];

        while (this._esAuxiliar(this._ver())) {
            hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        }

        const sujeto = this._parsearSujeto();
        if (sujeto) hijos.push(sujeto);
        else this._registrarError("Interrogativa: falta el sujeto.", this.posicion);

        if (this._esCat(this._ver(), CAT.VERBO)) {
            hijos.push(this._consumir(CAT.VERBO));
        }

        this._consumirInfinitivos(hijos);

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        while (this._esCat(this._ver(), CAT.ADVERBIO)) {
            hijos.push(this._consumir(CAT.ADVERBIO));
        }

        while (this._esCat(this._ver(), CAT.PREPOSICION) &&
        !this._esInfinitivoTo()) {
            hijos.push(this._consumir(CAT.PREPOSICION));
            const comp = this._parsearObjeto();
            if (comp) hijos.push(comp);
        }

        if (this._ver()?.token === '?') {
            hijos.push({ tipo: "PUNTUACION", token: "?" });
            this._avanzar();
        } else {
            this._registrarError("Interrogativa: falta el signo '?'.", this.posicion);
        }

        return {
            tipo:  "INTERROGATIVA",
            regla: BNF_EN.INTERROGATIVA.regla,
            hijos
        };
    }

    // ─── EXCLAMATIVA What/How ─────────────────────────────────
    _parsearExclamativa() {
        const hijos = [];
        hijos.push({ tipo: "EXCLAMACION_INICIO", token: this._ver()?.token });
        this._avanzar();

        if (this._esCat(this._ver(), CAT.ARTICULO))    hijos.push(this._consumir(CAT.ARTICULO));
        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));
        if (this._esCat(this._ver(), CAT.SUSTANTIVO))  hijos.push(this._consumir(CAT.SUSTANTIVO));

        if (this._esCat(this._ver(), CAT.VERBO) || this._esAuxiliar(this._ver())) {
            const pred = this._parsearPredicado();
            if (pred) hijos.push(pred);
        }

        if (this._ver()?.token === '!') {
            hijos.push({ tipo: "PUNTUACION", token: "!" });
            this._avanzar();
        } else {
            this._registrarError("Exclamativa: falta el signo '!'.", this.posicion);
        }

        return {
            tipo:  "EXCLAMATIVA",
            regla: BNF_EN.EXCLAMATIVA.regla,
            hijos
        };
    }

    // ─── EXCLAMATIVA SIMPLE ───────────────────────────────────
    _parsearExclamativaSimple() {
        const hijos = [];
        hijos.push(this._consumir(CAT.INTERJECCION));

        if (this._ver()?.token === '!') {
            hijos.push({ tipo: "PUNTUACION", token: "!" });
            this._avanzar();
        }

        return {
            tipo:  "EXCLAMATIVA",
            regla: "<sentence> ::= INTERJ '!'",
            hijos
        };
    }

    // ─── COMPUESTA ────────────────────────────────────────────
    _parsearCompuesta(sujeto, predicado) {
        const hijos = [
            { tipo: "ORACION_SIMPLE", hijos: [sujeto, predicado] },
            this._consumir(CAT.CONJUNCION_COORD)
        ];

        // En inglés la segunda cláusula puede no tener sujeto explícito
        // Ej: "She drinks coffee and reads her book"
        const sujeto2 = this._parsearSujeto();

        if (sujeto2) {
            const predicado2 = this._parsearPredicado();
            if (predicado2) {
                hijos.push({ tipo: "ORACION_SIMPLE", hijos: [sujeto2, predicado2] });
            }
        } else if (this._esCat(this._ver(), CAT.VERBO) ||
            this._esAuxiliar(this._ver())) {
            // Sin sujeto explícito: "She drinks coffee and reads her book"
            const predicado2 = this._parsearPredicado();
            if (predicado2) {
                hijos.push({ tipo: "ORACION_SIMPLE", hijos: [predicado2] });
            }
        } else {
            this._registrarError("Compuesta: falta la segunda cláusula.", this.posicion);
        }

        return {
            tipo:  "COMPUESTA",
            regla: BNF_EN.COMPUESTA.regla,
            hijos
        };
    }

    // ─── SUBORDINADA ──────────────────────────────────────────
    _parsearSubordinada(sujeto, predicado) {
        const hijos = [
            { tipo: "ORACION_PRINCIPAL", hijos: [sujeto, predicado] },
            this._consumir(CAT.CONJUNCION_SUB)
        ];

        const sujeto2    = this._parsearSujeto();
        const predicado2 = sujeto2 ? this._parsearPredicado() : null;

        if (sujeto2 && predicado2) {
            hijos.push({ tipo: "ORACION_SECUNDARIA", hijos: [sujeto2, predicado2] });
        } else {
            this._registrarError("Subordinada: falta la cláusula secundaria.", this.posicion);
        }

        return {
            tipo:  "SUBORDINADA",
            regla: BNF_EN.SUBORDINADA.regla,
            hijos
        };
    }

    // ─── SUBORDINADA INVERTIDA ────────────────────────────────
    _parsearSubordinadaInvertida() {
        const hijos = [];
        hijos.push(this._consumir(CAT.CONJUNCION_SUB));

        const sujeto1    = this._parsearSujeto();
        const predicado1 = sujeto1 ? this._parsearPredicado() : null;

        if (sujeto1 && predicado1) {
            hijos.push({ tipo: "ORACION_SECUNDARIA", hijos: [sujeto1, predicado1] });
        }

        if (this._ver()?.token === ',') this._avanzar();

        const sujeto2    = this._parsearSujeto();
        const predicado2 = sujeto2 ? this._parsearPredicado() : null;

        if (sujeto2 && predicado2) {
            hijos.push({ tipo: "ORACION_PRINCIPAL", hijos: [sujeto2, predicado2] });
        } else {
            this._registrarError("Subordinada invertida: falta la oración principal.", this.posicion);
        }

        return {
            tipo:  "SUBORDINADA",
            regla: BNF_EN.SUBORDINADA.regla,
            hijos
        };
    }

    // ─── HELPER: CONSUMIR INFINITIVOS ─────────────────────────
    _consumirInfinitivos(hijos) {
        while (this._esCat(this._ver(), CAT.PREPOSICION) &&
        this._ver()?.lema === 'to' &&
        (this._esCat(this._verEn(1), CAT.VERBO) ||
            this._esCat(this._verEn(1), CAT.VERBO_AUXILIAR))) {

            hijos.push(this._consumir(CAT.PREPOSICION));

            if (this._esCat(this._ver(), CAT.VERBO)) {
                hijos.push(this._consumir(CAT.VERBO));
            } else if (this._esCat(this._ver(), CAT.VERBO_AUXILIAR)) {
                hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
            }

            const objInf = this._parsearObjeto();
            if (objInf) hijos.push(objInf);
        }
    }

    // ─── HELPER: DETECTAR "to" INFINITIVO ─────────────────────
    _esInfinitivoTo() {
        return this._esCat(this._ver(), CAT.PREPOSICION) &&
            this._ver()?.lema === 'to' &&
            (this._esCat(this._verEn(1), CAT.VERBO) ||
                this._esCat(this._verEn(1), CAT.VERBO_AUXILIAR));
    }

    // ─── UTILITARIOS ──────────────────────────────────────────
    _ver()               { return this.tokens[this.posicion] || null; }
    _verEn(offset)       { return this.tokens[this.posicion + offset] || null; }
    _avanzar()           { this.posicion++; }
    _esCat(token, cat)   { return token?.categoria === cat; }
    _esAuxiliar(token)   { return token?.categoria === CAT.VERBO_AUXILIAR; }
    _esNegacion(token)   { return token?.categoria === CAT.NEGACION; }
    _esExclamacionInicio(token) {
        return token && ['what', 'how'].includes(token.token?.toLowerCase());
    }

    _saltarPuntuacion() {
        while (this._ver()?.categoria === CAT.PUNTUACION) this._avanzar();
    }

    _tieneNucleoSujeto(hijos) {
        return hijos.some(h => [
            CAT.SUSTANTIVO, CAT.SUSTANTIVO_PROPIO,
            CAT.PRONOMBRE_PERSONAL, CAT.PRONOMBRE_DEMOSTRATIVO,
            CAT.INDEFINIDO
        ].includes(h.tipo));
    }

    _consumir(categoriaEsperada) {
        const token = this._ver();

        if (!token) {
            this._registrarError(
                `Se esperaba ${categoriaEsperada} pero se llegó al fin de la oración.`,
                this.posicion
            );
            return { tipo: "ERROR", token: "EOF" };
        }

        if (!this._esCat(token, categoriaEsperada)) {
            this._registrarError(
                `Error sintáctico: se esperaba [${categoriaEsperada}] pero se encontró "${token.token}" (${token.categoria})`,
                this.posicion
            );
        }

        this._avanzar();
        return {
            tipo:     categoriaEsperada,
            token:    token.token,
            lema:     token.lema || token.token,
            posicion: this.posicion - 1
        };
    }

    _registrarError(mensaje, posicion) {
        this.errores.push({
            tipo:        "SINTÁCTICO",
            posicion:    posicion,
            token:       this.tokens[posicion]?.token || "N/A",
            descripcion: mensaje
        });
    }
}
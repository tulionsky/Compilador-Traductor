// ============================================================
// ParserES.js — Analizador sintáctico para español
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

"use strict";

import { BNF_ES } from './BnfRules.js';
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

const CLITICOS = ['me','te','se','lo','la','le','nos','os','los','las','les'];

export class ParserES {

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
            bnf:     BNF_ES
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

        if (token.token === '¿')                    return this._parsearInterrogativa();
        if (token.token === '¡')                    return this._parsearExclamativa();
        if (this._esCat(token, CAT.INTERJECCION))   return this._parsearExclamativaSimple();
        if (this._esCat(token, CAT.CONJUNCION_SUB)) return this._parsearSubordinadaInvertida();
        if (this._esCat(token, CAT.NEGACION))       return this._parsearNegativaSinSujeto();
        if (this._esCat(token, CAT.VERBO) ||
            this._esCat(token, CAT.VERBO_AUXILIAR)) return this._parsearOracionVerboInicial();

        return this._parsearOracionConSujeto();
    }

    // ─── VERIFICAR TOKENS NO CONSUMIDOS ───────────────────────
    _saltarPuntuacion() {
        while (this._ver()?.categoria === CAT.PUNTUACION &&
        !['¿', '¡'].includes(this._ver()?.token)) {
            this._avanzar();
        }
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

        if (this._esCat(this._ver(), CAT.NEGACION)) {
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
            regla: BNF_ES.DECLARATIVA.regla,
            hijos: [sujeto, predicado]
        };
    }

    // ─── ORACIÓN CON VERBO INICIAL ────────────────────────────
    _parsearOracionVerboInicial() {
        const hijos = [];

        while (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        if (this._esCat(this._ver(), CAT.VERBO)) hijos.push(this._consumir(CAT.VERBO));

        while (this._esCat(this._ver(), CAT.ADVERBIO)) hijos.push(this._consumir(CAT.ADVERBIO));

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        while (this._esCat(this._ver(), CAT.PREPOSICION)) {
            hijos.push(this._consumir(CAT.PREPOSICION));
            const comp = this._parsearObjeto();
            if (comp) hijos.push(comp);
        }

        return {
            tipo:  "DECLARATIVA",
            regla: "<oracion> ::= VERBO [<objeto>] [PREP <comp>]*",
            hijos: [{ tipo: "PREDICADO", regla: "", hijos }]
        };
    }

    // ─── SUJETO ───────────────────────────────────────────────
    _parsearSujeto() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT.ARTICULO))    hijos.push(this._consumir(CAT.ARTICULO));
        if (this._esCat(this._ver(), CAT.POSESIVO))    hijos.push(this._consumir(CAT.POSESIVO));
        if (this._esCat(this._ver(), CAT.DEMOSTRATIVO)) hijos.push(this._consumir(CAT.DEMOSTRATIVO));
        if (this._esCat(this._ver(), CAT.INDEFINIDO))  hijos.push(this._consumir(CAT.INDEFINIDO));

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

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
        } else if (hijos.length === 0) {
            return null;
        } else {
            return null;
        }

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

        return {
            tipo:  "SUJETO",
            regla: "<sujeto> ::= [DET] [ADJ]* (SUST | PRON) [ADJ]*",
            hijos
        };
    }

    // ─── PREDICADO ────────────────────────────────────────────
    _parsearPredicado() {
        const hijos = [];

        while (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));

        while (this._ver() &&
        (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL) ||
            this._esCat(this._ver(), CAT.ARTICULO)) &&
        CLITICOS.includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push({ tipo: "CLITICO", token: this._ver().token });
            this._avanzar();
        }

        if (!this._esCat(this._ver(), CAT.VERBO)) {
            this._registrarError(
                `Se esperaba un VERBO pero se encontró: "${this._ver()?.token || 'fin de oración'}"`,
                this.posicion
            );
        } else {
            hijos.push(this._consumir(CAT.VERBO));
        }

        while (this._esCat(this._ver(), CAT.ADVERBIO)) hijos.push(this._consumir(CAT.ADVERBIO));

        while (this._ver() &&
        (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL) ||
            this._esCat(this._ver(), CAT.ARTICULO)) &&
        CLITICOS.includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push({ tipo: "CLITICO", token: this._ver().token });
            this._avanzar();
        }

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        while (this._esCat(this._ver(), CAT.PREPOSICION)) {
            hijos.push(this._consumir(CAT.PREPOSICION));
            const comp = this._parsearObjeto();
            if (comp) hijos.push(comp);
        }

        while (this._esCat(this._ver(), CAT.ADVERBIO)) hijos.push(this._consumir(CAT.ADVERBIO));

        return {
            tipo:  "PREDICADO",
            regla: "<predicado> ::= [AUX]* [CLIT]* VERBO [ADV]* [<objeto>] [PREP <comp>]*",
            hijos
        };
    }

    // ─── OBJETO ───────────────────────────────────────────────
    _parsearObjeto() {
        const hijos = [];
        const posInicial = this.posicion;

        if (this._esCat(this._ver(), CAT.ARTICULO))    hijos.push(this._consumir(CAT.ARTICULO));
        if (this._esCat(this._ver(), CAT.POSESIVO))    hijos.push(this._consumir(CAT.POSESIVO));
        if (this._esCat(this._ver(), CAT.DEMOSTRATIVO)) hijos.push(this._consumir(CAT.DEMOSTRATIVO));
        if (this._esCat(this._ver(), CAT.INDEFINIDO))  hijos.push(this._consumir(CAT.INDEFINIDO));

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT.SUSTANTIVO_PROPIO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO_PROPIO));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_PERSONAL));
        } else {
            this.posicion = posInicial;
            return null;
        }

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

        return {
            tipo:  "OBJETO",
            regla: "<objeto> ::= [DET] [ADJ]* (SUST | PRON) [ADJ]*",
            hijos
        };
    }

    // ─── NEGATIVA ─────────────────────────────────────────────
    _parsearNegativa(sujeto) {
        const hijos = [sujeto];
        hijos.push(this._consumir(CAT.NEGACION));

        while (this._ver() &&
        (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL) ||
            this._esCat(this._ver(), CAT.ARTICULO)) &&
        CLITICOS.includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push({ tipo: "CLITICO", token: this._ver().token });
            this._avanzar();
        }

        while (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        if (this._esCat(this._ver(), CAT.VERBO)) hijos.push(this._consumir(CAT.VERBO));

        while (this._esCat(this._ver(), CAT.ADVERBIO)) hijos.push(this._consumir(CAT.ADVERBIO));

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        return {
            tipo:  "NEGATIVA",
            regla: BNF_ES.NEGATIVA.regla,
            hijos
        };
    }

    // ─── NEGATIVA SIN SUJETO ──────────────────────────────────
    _parsearNegativaSinSujeto() {
        const hijos = [];
        hijos.push(this._consumir(CAT.NEGACION));

        while (this._ver() &&
        (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL) ||
            this._esCat(this._ver(), CAT.ARTICULO)) &&
        CLITICOS.includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push({ tipo: "CLITICO", token: this._ver().token });
            this._avanzar();
        }

        while (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        if (this._esCat(this._ver(), CAT.VERBO)) hijos.push(this._consumir(CAT.VERBO));

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        return {
            tipo:  "NEGATIVA",
            regla: "<oracion> ::= NEG [CLIT]* VERBO [<objeto>]",
            hijos
        };
    }

    // ─── INTERROGATIVA ────────────────────────────────────────
    _parsearInterrogativa() {
        const hijos = [];

        hijos.push({ tipo: "PUNTUACION", token: "¿" });
        this._avanzar();

        // Interrogativa con pronombre interrogativo: ¿Cómo estás? ¿Qué haces? ¿Dónde vas?
        if (this._esCat(this._ver(), CAT.PRONOMBRE_INTERROGATIVO)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_INTERROGATIVO));

            // Verbo principal o auxiliar
            if (this._esAuxiliar(this._ver())) {
                hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
            } else if (this._esCat(this._ver(), CAT.VERBO)) {
                hijos.push(this._consumir(CAT.VERBO));
            }

            // Sujeto opcional
            const sujetoInt = this._parsearSujeto();
            if (sujetoInt) hijos.push(sujetoInt);

            // Objeto opcional
            const objetoInt = this._parsearObjeto();
            if (objetoInt) hijos.push(objetoInt);

            // Complementos preposicionales
            while (this._esCat(this._ver(), CAT.PREPOSICION)) {
                hijos.push(this._consumir(CAT.PREPOSICION));
                const comp = this._parsearObjeto();
                if (comp) hijos.push(comp);
            }

            // Adverbios al final
            while (this._esCat(this._ver(), CAT.ADVERBIO)) {
                hijos.push(this._consumir(CAT.ADVERBIO));
            }

            if (this._ver()?.token === '?') {
                hijos.push({ tipo: "PUNTUACION", token: "?" });
                this._avanzar();
            } else {
                this._registrarError("Interrogativa: falta el signo '?'.", this.posicion);
            }

            return {
                tipo:  "INTERROGATIVA",
                regla: BNF_ES.INTERROGATIVA.regla,
                hijos
            };
        }

        // Interrogativa normal: ¿Corre el gato? ¿Quiere ella ser médica?
        while (this._ver() &&
        (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL) ||
            this._esCat(this._ver(), CAT.ARTICULO)) &&
        CLITICOS.includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push({ tipo: "CLITICO", token: this._ver().token });
            this._avanzar();
        }

        while (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        if (this._esCat(this._ver(), CAT.VERBO)) hijos.push(this._consumir(CAT.VERBO));

        const sujeto = this._parsearSujeto();
        if (sujeto) hijos.push(sujeto);

        // Verbos adicionales: ¿Quiere ella ser médica?
        while (this._esCat(this._ver(), CAT.VERBO) ||
        this._esAuxiliar(this._ver())) {
            if (this._esAuxiliar(this._ver())) hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
            if (this._esCat(this._ver(), CAT.VERBO)) hijos.push(this._consumir(CAT.VERBO));
            const objInf = this._parsearObjeto();
            if (objInf) hijos.push(objInf);
        }

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        while (this._esCat(this._ver(), CAT.ADVERBIO)) hijos.push(this._consumir(CAT.ADVERBIO));

        if (this._ver()?.token === '?') {
            hijos.push({ tipo: "PUNTUACION", token: "?" });
            this._avanzar();
        } else {
            this._registrarError("Interrogativa: falta el signo '?'.", this.posicion);
        }

        return {
            tipo:  "INTERROGATIVA",
            regla: BNF_ES.INTERROGATIVA.regla,
            hijos
        };
    }

    // ─── EXCLAMATIVA ──────────────────────────────────────────
    _parsearExclamativa() {
        const hijos = [];

        hijos.push({ tipo: "PUNTUACION", token: "¡" });
        this._avanzar();

        // Si después de ¡ viene una interjección → ¡Hola! ¡Oye!
        if (this._esCat(this._ver(), CAT.INTERJECCION)) {
            hijos.push(this._consumir(CAT.INTERJECCION));

            while (this._esCat(this._ver(), CAT.ADVERBIO) ||
            this._esCat(this._ver(), CAT.ADJETIVO) ||
            this._esCat(this._ver(), CAT.SUSTANTIVO)) {
                hijos.push(this._consumir(this._ver().categoria));
            }

            if (this._ver()?.token === '!') {
                hijos.push({ tipo: "PUNTUACION", token: "!" });
                this._avanzar();
            } else {
                this._registrarError("Exclamativa: falta el signo '!'.", this.posicion);
            }
            return {
                tipo:  "EXCLAMATIVA",
                regla: "<oracion> ::= '¡' INTERJ '!'",
                hijos
            };
        }

        // Qué / Cómo opcionales
        if (['qué', 'que', 'cómo', 'como'].includes(this._ver()?.token?.toLowerCase())) {
            hijos.push({ tipo: "EXCLAMACION_INICIO", token: this._ver().token });
            this._avanzar();
        }

        if (this._esCat(this._ver(), CAT.ARTICULO))  hijos.push(this._consumir(CAT.ARTICULO));
        if (this._esCat(this._ver(), CAT.POSESIVO))  hijos.push(this._consumir(CAT.POSESIVO));

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) hijos.push(this._consumir(CAT.SUSTANTIVO));

        // "tan + adjetivo": ¡Qué carrera tan difícil!
        if (this._esCat(this._ver(), CAT.ADVERBIO) &&
            ['tan', 'más', 'muy'].includes(this._ver()?.lema || this._ver()?.token)) {
            hijos.push(this._consumir(CAT.ADVERBIO));
            if (this._esCat(this._ver(), CAT.ADJETIVO)) {
                hijos.push(this._consumir(CAT.ADJETIVO));
            }
        }

        while (this._esCat(this._ver(), CAT.ADJETIVO)) hijos.push(this._consumir(CAT.ADJETIVO));

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
            regla: BNF_ES.EXCLAMATIVA.regla,
            hijos
        };
    }

    // ─── EXCLAMATIVA SIMPLE ───────────────────────────────────
    _parsearExclamativaSimple() {
        console.log('Tokens en exclamativa simple:', this.tokens.map(t => `${t.token}(${t.categoria})`));
        const hijos = [];
        hijos.push(this._consumir(CAT.INTERJECCION));

        if (this._ver()?.token === '!') {
            hijos.push({ tipo: "PUNTUACION", token: "!" });
            this._avanzar();
        }

        return {
            tipo:  "EXCLAMATIVA",
            regla: "<oracion> ::= INTERJ '!'",
            hijos
        };
    }

    // ─── COMPUESTA ────────────────────────────────────────────
    _parsearCompuesta(sujeto, predicado) {
        const hijos = [
            { tipo: "ORACION_SIMPLE", hijos: [sujeto, predicado] },
            this._consumir(CAT.CONJUNCION_COORD)
        ];

        const sujeto2    = this._parsearSujeto();
        const predicado2 = sujeto2 ? this._parsearPredicado() : null;

        if (sujeto2 && predicado2) {
            hijos.push({ tipo: "ORACION_SIMPLE", hijos: [sujeto2, predicado2] });
        } else {
            this._registrarError("Compuesta: falta la segunda cláusula.", this.posicion);
        }

        return {
            tipo:  "COMPUESTA",
            regla: BNF_ES.COMPUESTA.regla,
            hijos
        };
    }

    // ─── SUBORDINADA ──────────────────────────────────────────
    _parsearSubordinada(sujeto, predicado) {
        const hijos = [
            { tipo: "ORACION_PRINCIPAL", hijos: [sujeto, predicado] },
            this._consumir(CAT.CONJUNCION_SUB)
        ];

        const sujeto2 = this._parsearSujeto();

        if (sujeto2) {
            const predicado2 = this._parsearPredicado();
            if (predicado2) {
                hijos.push({ tipo: "ORACION_SECUNDARIA", hijos: [sujeto2, predicado2] });
            }
        } else if (this._esCat(this._ver(), CAT.VERBO) ||
            this._esAuxiliar(this._ver())) {
            const predicado2 = this._parsearPredicado();
            if (predicado2) {
                hijos.push({ tipo: "ORACION_SECUNDARIA", hijos: [predicado2] });
            }
        } else {
            this._registrarError("Subordinada: falta la cláusula secundaria.", this.posicion);
        }

        return {
            tipo:  "SUBORDINADA",
            regla: BNF_ES.SUBORDINADA.regla,
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
            regla: BNF_ES.SUBORDINADA.regla,
            hijos
        };
    }

    // ─── UTILITARIOS ──────────────────────────────────────────
    _ver()               { return this.tokens[this.posicion] || null; }
    _verEn(offset)       { return this.tokens[this.posicion + offset] || null; }
    _avanzar()           { this.posicion++; }
    _esCat(token, cat)   { return token?.categoria === cat; }
    _esAuxiliar(token)   { return token?.categoria === CAT.VERBO_AUXILIAR; }
    _esNegacion(token)   { return token?.categoria === CAT.NEGACION; }

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
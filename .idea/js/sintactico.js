// js/sintactico.js
// Módulo de Análisis Sintáctico — Compilador Traductor Inglés-Español
// Autor: Melki
// Descripción: Valida la estructura gramatical de los tokens recibidos del
//              análisis léxico y construye el árbol de derivación.

"use strict";

// ─────────────────────────────────────────────
// CATEGORÍAS (renombradas a CAT_SINT para evitar conflicto con lexico.js)
// ─────────────────────────────────────────────
const CAT_SINT = {
    ARTICULO:               "ARTICULO",
    SUSTANTIVO:             "SUSTANTIVO",
    PRONOMBRE_PERSONAL:     "PRONOMBRE_PERSONAL",
    PRONOMBRE_DEMOSTRATIVO: "PRONOMBRE_DEMOSTRATIVO",
    PRONOMBRE_INTERROGATIVO:"PRONOMBRE_INTERROGATIVO",
    VERBO:                  "VERBO",
    VERBO_AUXILIAR:         "VERBO_AUXILIAR",
    ADJETIVO:               "ADJETIVO",
    ADVERBIO:               "ADVERBIO",
    NEGACION:               "NEGACION",
    CONJUNCION_COORD:       "CONJUNCION_COORDINANTE",
    CONJUNCION_SUB:         "CONJUNCION_SUBORDINANTE",
    PREPOSICION:            "PREPOSICION",
    INTERJECCION:           "INTERJECCION",
    SIGNO_PUNTUACION:       "SIGNO_PUNTUACION",
    CONTRACCION:            "CONTRACCION",
    POSESIVO:               "POSESIVO",
    NUMERAL:                "NUMERAL",
};

// ─────────────────────────────────────────────
// CLASE PRINCIPAL DEL ANALIZADOR SINTÁCTICO
// ─────────────────────────────────────────────
class AnalizadorSintactico {

    constructor() {
        this.tokens   = [];
        this.posicion = 0;
        this.errores  = [];
        this.arbol    = null;
    }

    // ── MÉTODO PÚBLICO PRINCIPAL ──────────────────
    analizar(tokens) {
        this.tokens   = tokens;
        this.posicion = 0;
        this.errores  = [];
        this.arbol    = null;

        try {
            this.arbol = this._parsearOracion();
        } catch (e) {
            this._registrarError(e.message, this.posicion);
        }

        return {
            valido:  this.errores.length === 0,
            arbol:   this.arbol,
            errores: this.errores,
            tipo:    this.arbol ? this.arbol.tipo : "DESCONOCIDO"
        };
    }

    // ─────────────────────────────────────────────
    // PARSEO PRINCIPAL
    // ─────────────────────────────────────────────
    _parsearOracion() {
        const tokenActual = this._ver();

        if (!tokenActual) {
            this._registrarError("La oración está vacía.", 0);
            return null;
        }

        if (this._esAuxiliar(tokenActual)) {
            return this._parsearInterrogativa();
        }

        if (this._esExclamacion(tokenActual)) {
            return this._parsearExclamativa();
        }

        if (this._esInterjeccion(tokenActual)) {
            return this._parsearExclamativaSimple();
        }

        return this._parsearOracionConSujeto();
    }

    // ─────────────────────────────────────────────
    // ORACIÓN CON SUJETO (declarativa / negativa / compuesta / subordinada)
    // ─────────────────────────────────────────────
    _parsearOracionConSujeto() {
        const nodoSujeto = this._parsearSujeto();

        if (!nodoSujeto) {
            this._registrarError(
                `Se esperaba un sujeto (artículo, sustantivo o pronombre) pero se encontró: "${this._ver()?.token}"`,
                this.posicion
            );
            return null;
        }

        if (this._esAuxiliar(this._ver()) && this._esNegacion(this._verEn(1))) {
            return this._parsearNegativa(nodoSujeto);
        }

        const nodoPredicado = this._parsearPredicado();

        if (this._esCat(this._ver(), CAT_SINT.CONJUNCION_COORD)) {
            return this._parsearCompuesta(nodoSujeto, nodoPredicado);
        }

        if (this._esCat(this._ver(), CAT_SINT.CONJUNCION_SUB)) {
            return this._parsearSubordinada(nodoSujeto, nodoPredicado);
        }

        return {
            tipo:  "DECLARATIVA",
            regla: "<oracion> ::= <sujeto> <predicado>",
            hijos: [nodoSujeto, nodoPredicado]
        };
    }

    // ─────────────────────────────────────────────
    // PARSEAR SUJETO
    // <sujeto> ::= [ARTICULO] [POSESIVO] [ADJETIVO] SUSTANTIVO | PRONOMBRE
    // ─────────────────────────────────────────────
    _parsearSujeto() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT_SINT.ARTICULO)) {
            hijos.push(this._consumir(CAT_SINT.ARTICULO));
        }

        if (this._esCat(this._ver(), CAT_SINT.POSESIVO)) {
            hijos.push(this._consumir(CAT_SINT.POSESIVO));
        }

        if (this._esCat(this._ver(), CAT_SINT.ADJETIVO)) {
            hijos.push(this._consumir(CAT_SINT.ADJETIVO));
        }

        if (this._esCat(this._ver(), CAT_SINT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT_SINT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT_SINT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT_SINT.PRONOMBRE_PERSONAL));
        } else if (this._esCat(this._ver(), CAT_SINT.PRONOMBRE_DEMOSTRATIVO)) {
            hijos.push(this._consumir(CAT_SINT.PRONOMBRE_DEMOSTRATIVO));
        } else {
            return null;
        }

        return {
            tipo:  "SUJETO",
            regla: "<sujeto> ::= [ARTICULO] [POSESIVO] [ADJETIVO] SUSTANTIVO | PRONOMBRE",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // PARSEAR PREDICADO
    // <predicado> ::= [AUXILIAR] VERBO [ADVERBIO] [<objeto>] [PREPOSICION <complemento>]
    // ─────────────────────────────────────────────
    _parsearPredicado() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT_SINT.VERBO_AUXILIAR)) {
            hijos.push(this._consumir(CAT_SINT.VERBO_AUXILIAR));
        }

        if (!this._esCat(this._ver(), CAT_SINT.VERBO)) {
            this._registrarError(
                `Se esperaba un VERBO pero se encontró: "${this._ver()?.token || "fin de oración"}"`,
                this.posicion
            );
            this._avanzar();
        } else {
            hijos.push(this._consumir(CAT_SINT.VERBO));
        }

        if (this._esCat(this._ver(), CAT_SINT.ADVERBIO)) {
            hijos.push(this._consumir(CAT_SINT.ADVERBIO));
        }

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        if (this._esCat(this._ver(), CAT_SINT.PREPOSICION)) {
            hijos.push(this._consumir(CAT_SINT.PREPOSICION));
            const compPrep = this._parsearSujeto();
            if (compPrep) hijos.push(compPrep);
        }

        return {
            tipo:  "PREDICADO",
            regla: "<predicado> ::= [AUXILIAR] VERBO [ADVERBIO] [<objeto>] [PREPOSICION <complemento>]",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // PARSEAR OBJETO
    // <objeto> ::= [ARTICULO] [ADJETIVO] SUSTANTIVO | PRONOMBRE
    // ─────────────────────────────────────────────
    _parsearObjeto() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT_SINT.ARTICULO)) {
            hijos.push(this._consumir(CAT_SINT.ARTICULO));
        }

        if (this._esCat(this._ver(), CAT_SINT.ADJETIVO)) {
            hijos.push(this._consumir(CAT_SINT.ADJETIVO));
        }

        if (this._esCat(this._ver(), CAT_SINT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT_SINT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT_SINT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT_SINT.PRONOMBRE_PERSONAL));
        } else {
            return null;
        }

        return {
            tipo:  "OBJETO",
            regla: "<objeto> ::= [ARTICULO] [ADJETIVO] SUSTANTIVO | PRONOMBRE",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN NEGATIVA
    // <neg> ::= <sujeto> AUXILIAR NEGACION VERBO [<objeto>]
    // ─────────────────────────────────────────────
    _parsearNegativa(nodoSujeto) {
        const hijos = [nodoSujeto];

        hijos.push(this._consumir(CAT_SINT.VERBO_AUXILIAR));
        hijos.push(this._consumir(CAT_SINT.NEGACION));
        hijos.push(this._consumir(CAT_SINT.VERBO));

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        return {
            tipo:  "NEGATIVA",
            regla: "<oracion_negativa> ::= <sujeto> AUXILIAR NEGACION VERBO [<objeto>]",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN INTERROGATIVA
    // <inter> ::= AUXILIAR <sujeto> VERBO [<objeto>] ?
    // ─────────────────────────────────────────────
    _parsearInterrogativa() {
        const hijos = [];

        hijos.push(this._consumir(CAT_SINT.VERBO_AUXILIAR));

        const sujeto = this._parsearSujeto();
        if (!sujeto) {
            this._registrarError("Oración interrogativa: falta el sujeto después del auxiliar.", this.posicion);
        } else {
            hijos.push(sujeto);
        }

        if (this._esCat(this._ver(), CAT_SINT.VERBO)) {
            hijos.push(this._consumir(CAT_SINT.VERBO));
        } else {
            this._registrarError("Oración interrogativa: falta el verbo principal.", this.posicion);
        }

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        if (this._ver()?.token === "?") {
            hijos.push({ tipo: "SIGNO_PUNTUACION", token: "?" });
            this._avanzar();
        } else {
            this._registrarError("Oración interrogativa: falta el signo de pregunta '?'.", this.posicion);
        }

        return {
            tipo:  "INTERROGATIVA",
            regla: "<oracion_interrogativa> ::= AUXILIAR <sujeto> VERBO [<objeto>] '?'",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN EXCLAMATIVA con What/How
    // <excl> ::= (What|How) [ARTICULO] [ADJETIVO] SUSTANTIVO !
    // ─────────────────────────────────────────────
    _parsearExclamativa() {
        const hijos = [];
        hijos.push({ tipo: "EXCLAMACION_INICIO", token: this._ver()?.token });
        this._avanzar();

        if (this._esCat(this._ver(), CAT_SINT.ARTICULO)) {
            hijos.push(this._consumir(CAT_SINT.ARTICULO));
        }
        if (this._esCat(this._ver(), CAT_SINT.ADJETIVO)) {
            hijos.push(this._consumir(CAT_SINT.ADJETIVO));
        }
        if (this._esCat(this._ver(), CAT_SINT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT_SINT.SUSTANTIVO));
        }

        if (this._ver()?.token === "!") {
            hijos.push({ tipo: "SIGNO_PUNTUACION", token: "!" });
            this._avanzar();
        } else {
            this._registrarError("Oración exclamativa: falta el signo de exclamación '!'.", this.posicion);
        }

        return {
            tipo:  "EXCLAMATIVA",
            regla: "<oracion_exclamativa> ::= (What|How) [ARTICULO] [ADJETIVO] SUSTANTIVO '!'",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN EXCLAMATIVA simple con interjección
    // <excl_simple> ::= INTERJECCION !
    // ─────────────────────────────────────────────
    _parsearExclamativaSimple() {
        const hijos = [];
        hijos.push(this._consumir(CAT_SINT.INTERJECCION));

        if (this._ver()?.token === "!") {
            hijos.push({ tipo: "SIGNO_PUNTUACION", token: "!" });
            this._avanzar();
        } else {
            this._registrarError("Se esperaba '!' después de la interjección.", this.posicion);
        }

        return {
            tipo:  "EXCLAMATIVA",
            regla: "<oracion_exclamativa_simple> ::= INTERJECCION '!'",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN COMPUESTA
    // <compuesta> ::= <oracion_simple> CONJUNCION_COORD <oracion_simple>
    // ─────────────────────────────────────────────
    _parsearCompuesta(nodoSujeto, nodoPredicado) {
        const hijos = [
            { tipo: "ORACION_SIMPLE", hijos: [nodoSujeto, nodoPredicado] },
            this._consumir(CAT_SINT.CONJUNCION_COORD)
        ];

        const sujeto2    = this._parsearSujeto();
        const predicado2 = sujeto2 ? this._parsearPredicado() : null;

        if (!sujeto2 || !predicado2) {
            this._registrarError("Oración compuesta: falta la segunda cláusula después de la conjunción.", this.posicion);
        } else {
            hijos.push({ tipo: "ORACION_SIMPLE", hijos: [sujeto2, predicado2] });
        }

        return {
            tipo:  "COMPUESTA",
            regla: "<oracion_compuesta> ::= <oracion_simple> CONJUNCION_COORD <oracion_simple>",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // ORACIÓN SUBORDINADA
    // <subordinada> ::= <oracion_principal> CONJUNCION_SUB <oracion_secundaria>
    // ─────────────────────────────────────────────
    _parsearSubordinada(nodoSujeto, nodoPredicado) {
        const hijos = [
            { tipo: "ORACION_PRINCIPAL", hijos: [nodoSujeto, nodoPredicado] },
            this._consumir(CAT_SINT.CONJUNCION_SUB)
        ];

        const sujeto2    = this._parsearSujeto();
        const predicado2 = sujeto2 ? this._parsearPredicado() : null;

        if (!sujeto2 || !predicado2) {
            this._registrarError("Oración subordinada: falta la cláusula secundaria después de la conjunción.", this.posicion);
        } else {
            hijos.push({ tipo: "ORACION_SECUNDARIA", hijos: [sujeto2, predicado2] });
        }

        return {
            tipo:  "SUBORDINADA",
            regla: "<oracion_subordinada> ::= <oracion_principal> CONJUNCION_SUB <oracion_secundaria>",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // MÉTODOS UTILITARIOS
    // ─────────────────────────────────────────────

    _ver() {
        return this.tokens[this.posicion] || null;
    }

    _verEn(offset) {
        return this.tokens[this.posicion + offset] || null;
    }

    _avanzar() {
        this.posicion++;
    }

    _consumir(categoriaEsperada) {
        const tokenActual = this._ver();

        if (!tokenActual) {
            this._registrarError(`Se esperaba ${categoriaEsperada} pero se llegó al fin de la oración.`, this.posicion);
            return { tipo: "ERROR", token: "EOF" };
        }

        if (!this._esCat(tokenActual, categoriaEsperada)) {
            this._registrarError(
                `Error sintáctico: se esperaba [${categoriaEsperada}] pero se encontró "${tokenActual.token}" (${tokenActual.categoria})`,
                this.posicion
            );
        }

        this._avanzar();
        return {
            tipo:     categoriaEsperada,
            token:    tokenActual.token,
            lema:     tokenActual.lema || tokenActual.token,
            posicion: this.posicion - 1
        };
    }

    _esCat(token, categoria) {
        return token && token.categoria === categoria;
    }

    _esAuxiliar(token) {
        return token && token.categoria === CAT_SINT.VERBO_AUXILIAR;
    }

    _esNegacion(token) {
        return token && token.categoria === CAT_SINT.NEGACION;
    }

    _esExclamacion(token) {
        return token && ["what", "how"].includes(token.token?.toLowerCase());
    }

    _esInterjeccion(token) {
        return token && token.categoria === CAT_SINT.INTERJECCION;
    }

    _registrarError(mensaje, posicion) {
        this.errores.push({
            tipo:     "SINTÁCTICO",
            posicion: posicion,
            token:    this.tokens[posicion]?.token || "N/A",
            mensaje:  mensaje
        });
    }
}

module.exports = { AnalizadorSintactico };
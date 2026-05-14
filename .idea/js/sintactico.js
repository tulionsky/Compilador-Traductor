// js/sintactico.js
// Módulo de Análisis Sintáctico — Compilador Traductor Inglés-Español
// Autor: Melki
// Descripción: Valida la estructura gramatical de los tokens recibidos del
//              análisis léxico y construye el árbol de derivación.

"use strict";

// ─────────────────────────────────────────────
// CATEGORÍAS que vienen del módulo léxico (Tulio)
// ─────────────────────────────────────────────
const CAT = {
    ARTICULO:              "ARTICULO",
    SUSTANTIVO:            "SUSTANTIVO",
    PRONOMBRE_PERSONAL:    "PRONOMBRE_PERSONAL",
    PRONOMBRE_DEMOSTRATIVO:"PRONOMBRE_DEMOSTRATIVO",
    PRONOMBRE_INTERROGATIVO:"PRONOMBRE_INTERROGATIVO",
    VERBO:                 "VERBO",
    VERBO_AUXILIAR:        "VERBO_AUXILIAR",
    ADJETIVO:              "ADJETIVO",
    ADVERBIO:              "ADVERBIO",
    NEGACION:              "NEGACION",          // not, n't
    CONJUNCION_COORD:      "CONJUNCION_COORDINANTE",
    CONJUNCION_SUB:        "CONJUNCION_SUBORDINANTE",
    PREPOSICION:           "PREPOSICION",
    INTERJECCIÓN:          "INTERJECCION",
    SIGNO_PUNTUACION:      "SIGNO_PUNTUACION",
    CONTRACCION:           "CONTRACCION",
    POSESIVO:              "POSESIVO",
    NUMERAL:               "NUMERAL",
};

// ─── ADAPTADOR — convierte tablaSimbolos de Tulio al formato del parser ───
const VERBOS_AUXILIARES = [
    'is','are','was','were','am',
    'do','does','did',
    'have','has','had',
    'will','would','shall','should',
    'can','could','may','might','must'
];

function adaptarTokens(tablaSimbolos) {
    return tablaSimbolos.map(fila => {
        let categoria = fila.categoria;

        // Normalizar puntuación
        if (categoria === 'PUNTUACION') {
            categoria = 'SIGNO_PUNTUACION';
        }

        // Normalizar todos los adverbios excepto negación
        if (categoria === 'ADVERBIO_NEGACION' &&
            (fila.lema === 'not' || fila.lema === "n't")) {
            categoria = 'NEGACION';
        } else if (categoria.startsWith('ADVERBIO_')) {
            categoria = 'ADVERBIO';
        }

        // Detectar verbos auxiliares (Tulio los clasifica como VERBO)
        if (categoria === 'VERBO' &&
            VERBOS_AUXILIARES.includes(fila.lema.toLowerCase())) {
            categoria = 'VERBO_AUXILIAR';
        }

        return {
            token:    fila.token,
            lema:     fila.lema,
            categoria: categoria
        };
    });
}

// ─────────────────────────────────────────────
// CLASE PRINCIPAL DEL ANALIZADOR SINTÁCTICO
// ─────────────────────────────────────────────
class AnalizadorSintactico {

    constructor() {
        this.tokens   = [];   // Array de tokens del léxico
        this.posicion = 0;    // Puntero actual en el array
        this.errores  = [];   // Errores encontrados
        this.arbol    = null; // Árbol de derivación resultante
    }

    // ── MÉTODO PÚBLICO PRINCIPAL ──────────────────
    // Recibe el array de tokens y devuelve el resultado completo
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
    // PARSEO PRINCIPAL — detecta qué tipo de oración es
    // ─────────────────────────────────────────────
    _parsearOracion() {
        const tokenActual = this._ver();

        if (!tokenActual) {
            this._registrarError("La oración está vacía.", 0);
            return null;
        }

        // Detectar tipo de oración por el primer token
        if (this._esAuxiliar(tokenActual)) {
            return this._parsearInterrogativa();
        }

        if (this._esExclamacion(tokenActual)) {
            return this._parsearExclamativa();
        }

        if (this._esInterjeccion(tokenActual)) {
            return this._parsearExclamativaSimple();
        }

        // Si empieza con sujeto → puede ser declarativa, negativa, compuesta o subordinada
        return this._parsearOracionConSujeto();
    }

    // ─────────────────────────────────────────────
    // ORACIÓN DECLARATIVA / NEGATIVA / COMPUESTA / SUBORDINADA
    // Comparten el inicio con un sujeto
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

        // Verificar si es NEGATIVA (auxiliar + not/n't antes del verbo)
        if (this._esAuxiliar(this._ver()) && this._esNegacion(this._verEn(1))) {
            return this._parsearNegativa(nodoSujeto);
        }

        const nodoPredicado = this._parsearPredicado();

        // Verificar si hay conjunción coordinante → COMPUESTA
        if (this._esCat(this._ver(), CAT.CONJUNCION_COORD)) {
            return this._parsearCompuesta(nodoSujeto, nodoPredicado);
        }

        // Verificar si hay conjunción subordinante → SUBORDINADA
        if (this._esCat(this._ver(), CAT.CONJUNCION_SUB)) {
            return this._parsearSubordinada(nodoSujeto, nodoPredicado);
        }

        // Si llegamos aquí: DECLARATIVA simple
        return {
            tipo: "DECLARATIVA",
            regla: "<oracion> ::= <sujeto> <predicado>",
            hijos: [nodoSujeto, nodoPredicado]
        };
    }

    // ─────────────────────────────────────────────
    // PARSEAR SUJETO
    // <sujeto> ::= [ARTICULO] SUSTANTIVO | PRONOMBRE
    // ─────────────────────────────────────────────
    _parsearSujeto() {
        const hijos = [];

        // Artículo opcional
        if (this._esCat(this._ver(), CAT.ARTICULO)) {
            hijos.push(this._consumir(CAT.ARTICULO));
        }

        // Posesivo opcional (my, your, his...)
        if (this._esCat(this._ver(), CAT.POSESIVO)) {
            hijos.push(this._consumir(CAT.POSESIVO));
        }

        // Adjetivo opcional antes del sustantivo
        if (this._esCat(this._ver(), CAT.ADJETIVO)) {
            hijos.push(this._consumir(CAT.ADJETIVO));
        }

        // Núcleo del sujeto: Sustantivo o Pronombre
        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_PERSONAL));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_DEMOSTRATIVO)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_DEMOSTRATIVO));
        } else {
            return null; // No hay sujeto válido
        }

        return {
            tipo:  "SUJETO",
            regla: "<sujeto> ::= [ARTICULO] [POSESIVO] [ADJETIVO] SUSTANTIVO | PRONOMBRE",
            hijos: hijos
        };
    }

    // ─────────────────────────────────────────────
    // PARSEAR PREDICADO
    // <predicado> ::= VERBO [ADVERBIO] [<objeto>]
    // ─────────────────────────────────────────────
    _parsearPredicado() {
        const hijos = [];

        // Auxiliar opcional (is, are, was, were, have...)
        if (this._esCat(this._ver(), CAT.VERBO_AUXILIAR)) {
            hijos.push(this._consumir(CAT.VERBO_AUXILIAR));
        }

        // Verbo principal (obligatorio)
        if (!this._esCat(this._ver(), CAT.VERBO)) {
            this._registrarError(
                `Se esperaba un VERBO pero se encontró: "${this._ver()?.token || "fin de oración"}"`,
                this.posicion
            );
            // Intentar recuperación: avanzar al siguiente token
            this._avanzar();
        } else {
            hijos.push(this._consumir(CAT.VERBO));
        }

        // Adverbio opcional
        if (this._esCat(this._ver(), CAT.ADVERBIO)) {
            hijos.push(this._consumir(CAT.ADVERBIO));
        }

        // Objeto directo opcional
        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        // Preposición + complemento opcional
        if (this._esCat(this._ver(), CAT.PREPOSICION)) {
            hijos.push(this._consumir(CAT.PREPOSICION));
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
    // <objeto> ::= [ARTICULO] SUSTANTIVO [ADJETIVO]
    // ─────────────────────────────────────────────
    _parsearObjeto() {
        const hijos = [];

        if (this._esCat(this._ver(), CAT.ARTICULO)) {
            hijos.push(this._consumir(CAT.ARTICULO));
        }

        if (this._esCat(this._ver(), CAT.ADJETIVO)) {
            hijos.push(this._consumir(CAT.ADJETIVO));
        }

        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
        } else if (this._esCat(this._ver(), CAT.PRONOMBRE_PERSONAL)) {
            hijos.push(this._consumir(CAT.PRONOMBRE_PERSONAL));
        } else {
            return null; // No hay objeto
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

        hijos.push(this._consumir(CAT.VERBO_AUXILIAR)); // does, do, did, is...
        hijos.push(this._consumir(CAT.NEGACION));        // not / n't
        hijos.push(this._consumir(CAT.VERBO));

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

        hijos.push(this._consumir(CAT.VERBO_AUXILIAR));

        const sujeto = this._parsearSujeto();
        if (!sujeto) {
            this._registrarError("Oración interrogativa: falta el sujeto después del auxiliar.", this.posicion);
        } else {
            hijos.push(sujeto);
        }

        if (this._esCat(this._ver(), CAT.VERBO)) {
            hijos.push(this._consumir(CAT.VERBO));
        } else {
            this._registrarError("Oración interrogativa: falta el verbo principal.", this.posicion);
        }

        const objeto = this._parsearObjeto();
        if (objeto) hijos.push(objeto);

        // Signo de pregunta obligatorio
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

        if (this._esCat(this._ver(), CAT.ARTICULO)) {
            hijos.push(this._consumir(CAT.ARTICULO));
        }
        if (this._esCat(this._ver(), CAT.ADJETIVO)) {
            hijos.push(this._consumir(CAT.ADJETIVO));
        }
        if (this._esCat(this._ver(), CAT.SUSTANTIVO)) {
            hijos.push(this._consumir(CAT.SUSTANTIVO));
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
        hijos.push(this._consumir(CAT.INTERJECCIÓN));

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
    // ORACIÓN COMPUESTA (coordinada)
    // <compuesta> ::= <oracion_simple> CONJUNCION_COORD <oracion_simple>
    // ─────────────────────────────────────────────
    _parsearCompuesta(nodoSujeto, nodoPredicado) {
        const hijos = [
            { tipo: "ORACION_SIMPLE", hijos: [nodoSujeto, nodoPredicado] },
            this._consumir(CAT.CONJUNCION_COORD)
        ];

        const sujeto2   = this._parsearSujeto();
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
            this._consumir(CAT.CONJUNCION_SUB)
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

    // Ver token en la posición actual (sin consumir)
    _ver() {
        return this.tokens[this.posicion] || null;
    }

    // Ver token en posición actual + offset (sin consumir)
    _verEn(offset) {
        return this.tokens[this.posicion + offset] || null;
    }

    // Avanzar el puntero
    _avanzar() {
        this.posicion++;
    }

    // Consumir un token de la categoría esperada
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
            tipo:   categoriaEsperada,
            token:  tokenActual.token,
            lema:   tokenActual.lema   || tokenActual.token,
            posicion: this.posicion - 1
        };
    }

    // Verificar si un token pertenece a una categoría
    _esCat(token, categoria) {
        return token && token.categoria === categoria;
    }

    // Verificar si es token auxiliar (do, does, did, is, are, was, were...)
    _esAuxiliar(token) {
        return token && token.categoria === CAT.VERBO_AUXILIAR;
    }

    // Verificar si es negación (not, n't)
    _esNegacion(token) {
        return token && token.categoria === CAT.NEGACION;
    }

    // Verificar si es inicio de exclamativa (What, How)
    _esExclamacion(token) {
        return token && ["what", "how"].includes(token.token?.toLowerCase());
    }

    // Verificar si es interjección
    _esInterjeccion(token) {
        return token && token.categoria === CAT.INTERJECCIÓN;
    }


    // Registrar un error en la lista
    _registrarError(mensaje, posicion) {
        this.errores.push({
            tipo:      "SINTÁCTICO",
            posicion:  posicion,
            token:     this.tokens[posicion]?.token || "N/A",
            mensaje:   mensaje
        });
    }
}

// ─────────────────────────────────────────────
// EXPORTAR para usar en el proyecto principal
// ─────────────────────────────────────────────
// Si el proyecto usa módulos ES6:
// export { AnalizadorSintactico };

// Si el proyecto es JS puro sin módulos (HTML simple):
// simplemente usar la clase directamente en el mismo scope.
// Al final de sintactico.js
module.exports = { AnalizadorSintactico };
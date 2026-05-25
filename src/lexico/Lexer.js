// ============================================================
// Lexer.js — Análisis léxico principal (bilingüe EN/ES)
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { CAT, REGEX, LISTAS_EN, LISTAS_ES, VERBOS_ES_COMUNES } from './Tokens.js';
import { existeEnIdioma }    from './Diccionario.js';
import { clasificarES }      from './LematizadorES.js';

// ─── TOKENIZADOR ──────────────────────────────────────────────
function tokenizar(texto) {
    return texto
        .replace(/([.,;:!?¡¿()\-"'…])/g, ' $1 ')
        .trim()
        .split(/\s+/)
        .filter(t => t.length > 0);
}

// ─── DETECTAR NOMBRE PROPIO ───────────────────────────────────
// Una palabra es nombre propio si:
// 1. Empieza con mayúscula
// 2. No es la primera palabra de la oración
// 3. El token anterior NO es ¿ o ¡ (no aplicar en interrogativas/exclamativas)
function esNombrePropio(token, posicion, tokens) {
    if (posicion === 0) return false;

    // Si el token anterior es ¿ o ¡, no es nombre propio
    const anterior = tokens[posicion - 1];
    if (anterior && ['¿', '¡'].includes(anterior)) return false;

    return /^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]+$/.test(token);
}

// ─── CLASIFICAR ADVERBIO EN INGLÉS ───────────────────────────
function clasificarAdverbioEN(t) {
    if (LISTAS_EN.adv_tiempo.includes(t))     return CAT.ADVERBIO_TIEMPO;
    if (LISTAS_EN.adv_lugar.includes(t))      return CAT.ADVERBIO_LUGAR;
    if (LISTAS_EN.adv_cantidad.includes(t))   return CAT.ADVERBIO_CANTIDAD;
    if (LISTAS_EN.adv_modo.includes(t))       return CAT.ADVERBIO_MODO;
    if (LISTAS_EN.adv_afirmacion.includes(t)) return CAT.ADVERBIO_AFIRMACION;
    if (LISTAS_EN.adv_negacion.includes(t))   return CAT.ADVERBIO_NEGACION;
    if (LISTAS_EN.adv_duda.includes(t))       return CAT.ADVERBIO_DUDA;
    return CAT.ADVERBIO_MODO;
}

// ─── CLASIFICAR ADVERBIO EN ESPAÑOL ──────────────────────────
function clasificarAdverbioES(t) {
    if (LISTAS_ES.adv_tiempo.includes(t))     return CAT.ADVERBIO_TIEMPO;
    if (LISTAS_ES.adv_lugar.includes(t))      return CAT.ADVERBIO_LUGAR;
    if (LISTAS_ES.adv_cantidad.includes(t))   return CAT.ADVERBIO_CANTIDAD;
    if (LISTAS_ES.adv_modo.includes(t))       return CAT.ADVERBIO_MODO;
    if (LISTAS_ES.adv_afirmacion.includes(t)) return CAT.ADVERBIO_AFIRMACION;
    if (LISTAS_ES.adv_negacion.includes(t))   return CAT.ADVERBIO_NEGACION;
    if (LISTAS_ES.adv_duda.includes(t))       return CAT.ADVERBIO_DUDA;
    return CAT.ADVERBIO_MODO;
}

// ─── CLASIFICAR TOKEN EN INGLÉS ───────────────────────────────
function clasificarTokenEN(token, posicion, tokens) {
    const t = token.toLowerCase();

    // Capa 1 — Regex
    if (REGEX.puntuacion.test(t))      return { lema: t, categoria: CAT.PUNTUACION,       numero: '-', genero: '-' };
    if (REGEX.numero_ordinal.test(t))  return { lema: t, categoria: CAT.NUMERAL_ORDINAL,  numero: '-', genero: '-' };
    if (REGEX.numero_cardinal.test(t)) return { lema: t, categoria: CAT.NUMERAL_CARDINAL, numero: '-', genero: '-' };
    if (REGEX.contraccion_en.test(t))  return { lema: t, categoria: CAT.CONTRACCION,      numero: '-', genero: '-' };

    // Capa 2 — Nombre propio
    if (esNombrePropio(token, posicion, tokens)) {
        return { lema: token, categoria: CAT.SUSTANTIVO_PROPIO, numero: 'singular', genero: '-' };
    }

    // Capa 3 — Listas propias
    if (LISTAS_EN.articulos.includes(t))           return { lema: t, categoria: CAT.ARTICULO,                numero: '-', genero: '-' };
    if (LISTAS_EN.posesivos.includes(t))           return { lema: t, categoria: CAT.POSESIVO,                numero: '-', genero: '-' };
    if (LISTAS_EN.demostrativos.includes(t))       return { lema: t, categoria: CAT.DEMOSTRATIVO,            numero: '-', genero: '-' };
    if (LISTAS_EN.indefinidos.includes(t))         return { lema: t, categoria: CAT.INDEFINIDO,              numero: '-', genero: '-' };
    if (LISTAS_EN.pron_personales.includes(t))     return { lema: t, categoria: CAT.PRONOMBRE_PERSONAL,      numero: '-', genero: '-' };
    if (LISTAS_EN.pron_interrogativos.includes(t)) return { lema: t, categoria: CAT.PRONOMBRE_INTERROGATIVO, numero: '-', genero: '-' };
    if (LISTAS_EN.verbos_auxiliares.includes(t))   return { lema: t, categoria: CAT.VERBO_AUXILIAR,          numero: '-', genero: '-' };
    if (LISTAS_EN.preposiciones.includes(t))       return { lema: t, categoria: CAT.PREPOSICION,             numero: '-', genero: '-' };
    if (LISTAS_EN.conj_coord.includes(t))          return { lema: t, categoria: CAT.CONJUNCION_COORDINANTE,  numero: '-', genero: '-' };
    if (LISTAS_EN.conj_subord.includes(t))         return { lema: t, categoria: CAT.CONJUNCION_SUBORDINANTE, numero: '-', genero: '-' };
    if (LISTAS_EN.interjecciones.includes(t))      return { lema: t, categoria: CAT.INTERJECCION,            numero: '-', genero: '-' };

    // Sustantivos forzados — palabras ambiguas que compromise clasifica mal
    if (LISTAS_EN.sustantivos_forzados.includes(t)) {
        return { lema: t, categoria: CAT.SUSTANTIVO, numero: 'singular', genero: '-' };
    }

    // Adverbios
    const esAdverbio = [
        ...LISTAS_EN.adv_tiempo, ...LISTAS_EN.adv_lugar,
        ...LISTAS_EN.adv_cantidad, ...LISTAS_EN.adv_modo,
        ...LISTAS_EN.adv_afirmacion, ...LISTAS_EN.adv_negacion,
        ...LISTAS_EN.adv_duda
    ].includes(t);
    if (esAdverbio) return { lema: t, categoria: clasificarAdverbioEN(t), numero: '-', genero: '-' };

    // Numerales en letras — inglés
    if (LISTAS_EN.numerales_letras_en.includes(t)) {
        return { lema: t, categoria: CAT.NUMERAL_CARDINAL, numero: '-', genero: '-' };
    }

    // Capa 4 — Validación ortográfica con Typo.js
    if (!existeEnIdioma(token, 'en')) {
        return { lema: t, categoria: CAT.DESCONOCIDO, numero: '-', genero: '-' };
    }

    // Capa 5 — Clasificación con compromise.js
    const doc = nlp(token);
    let categoria = CAT.DESCONOCIDO;
    let lema      = t;
    let numero    = '-';
    let genero    = '-';

    if (doc.verbs().found) {
        categoria = CAT.VERBO;
        lema      = doc.verbs().toInfinitive().text() || t;
    } else if (doc.nouns().found) {
        numero    = doc.nouns().isPlural().found ? 'plural' : 'singular';
        lema      = doc.nouns().toSingular().text() || t;
        categoria = CAT.SUSTANTIVO;
    } else if (doc.adjectives().found) {
        categoria = CAT.ADJETIVO;
        lema      = doc.adjectives().text() || t;
    } else if (doc.adverbs().found) {
        categoria = clasificarAdverbioEN(t);
    }

    return { lema, categoria, numero, genero };
}

// ─── CLASIFICAR TOKEN EN ESPAÑOL ──────────────────────────────
function clasificarTokenES(token, posicion, tokens) {
    const t = token.toLowerCase();

    // Capa 1 — Regex
    if (REGEX.puntuacion.test(t))      return { lema: t, categoria: CAT.PUNTUACION,       numero: '-', genero: '-' };
    if (REGEX.numero_ordinal.test(t))  return { lema: t, categoria: CAT.NUMERAL_ORDINAL,  numero: '-', genero: '-' };
    if (REGEX.numero_cardinal.test(t)) return { lema: t, categoria: CAT.NUMERAL_CARDINAL, numero: '-', genero: '-' };
    if (REGEX.contraccion_es.test(t))  return { lema: t, categoria: CAT.CONTRACCION,      numero: '-', genero: '-' };

    // Capa 2 — Nombre propio
    if (esNombrePropio(token, posicion, tokens)) {
        return { lema: token, categoria: CAT.SUSTANTIVO_PROPIO, numero: 'singular', genero: '-' };
    }

    // Capa 3 — Listas propias
    if (LISTAS_ES.articulos.includes(t))           return { lema: t, categoria: CAT.ARTICULO,                numero: '-', genero: '-' };
    if (LISTAS_ES.posesivos.includes(t))           return { lema: t, categoria: CAT.POSESIVO,                numero: '-', genero: '-' };
    if (LISTAS_ES.demostrativos.includes(t))       return { lema: t, categoria: CAT.DEMOSTRATIVO,            numero: '-', genero: '-' };
    if (LISTAS_ES.indefinidos.includes(t))         return { lema: t, categoria: CAT.INDEFINIDO,              numero: '-', genero: '-' };
    if (LISTAS_ES.pron_personales.includes(t))     return { lema: t, categoria: CAT.PRONOMBRE_PERSONAL,      numero: '-', genero: '-' };
    if (LISTAS_ES.pron_interrogativos.includes(t)) return { lema: t, categoria: CAT.PRONOMBRE_INTERROGATIVO, numero: '-', genero: '-' };
    if (LISTAS_ES.verbos_auxiliares.includes(t))   return { lema: t, categoria: CAT.VERBO_AUXILIAR,          numero: '-', genero: '-' };
    if (LISTAS_ES.preposiciones.includes(t))       return { lema: t, categoria: CAT.PREPOSICION,             numero: '-', genero: '-' };
    if (LISTAS_ES.conj_coord.includes(t))          return { lema: t, categoria: CAT.CONJUNCION_COORDINANTE,  numero: '-', genero: '-' };
    if (LISTAS_ES.conj_subord.includes(t))         return { lema: t, categoria: CAT.CONJUNCION_SUBORDINANTE, numero: '-', genero: '-' };
    if (LISTAS_ES.interjecciones.includes(t))      return { lema: t, categoria: CAT.INTERJECCION,            numero: '-', genero: '-' };

    // Adverbios
    const esAdverbio = [
        ...LISTAS_ES.adv_tiempo, ...LISTAS_ES.adv_lugar,
        ...LISTAS_ES.adv_cantidad, ...LISTAS_ES.adv_modo,
        ...LISTAS_ES.adv_afirmacion, ...LISTAS_ES.adv_negacion,
        ...LISTAS_ES.adv_duda
    ].includes(t);
    if (esAdverbio) return { lema: t, categoria: clasificarAdverbioES(t), numero: '-', genero: '-' };

    // Sustantivos forzados en español
    if (LISTAS_ES.sustantivos_forzados?.includes(t)) {
        const numero = t.endsWith('s') ? 'plural' : 'singular';
        return { lema: t, categoria: CAT.SUSTANTIVO, numero, genero: '-' };
    }

    // Capa 4 — Lista de verbos conjugados en español
    if (VERBOS_ES_COMUNES.includes(t)) {
        return { lema: t, categoria: CAT.VERBO, numero: '-', genero: '-' };
    }

    // Numerales en letras — español
    if (LISTAS_ES.numerales_letras_es.includes(t)) {
        return { lema: t, categoria: CAT.NUMERAL_CARDINAL, numero: '-', genero: '-' };
    }

    // Capa 5 — Validación ortográfica con Typo.js
    if (!existeEnIdioma(token, 'es')) {
        return { lema: t, categoria: CAT.DESCONOCIDO, numero: '-', genero: '-' };
    }

    // Capa 6 — Clasificación con LematizadorES
    return clasificarES(token);
}

// ─── ANÁLISIS LÉXICO COMPLETO ─────────────────────────────────
export function analizarLexico(texto, idioma = 'en') {
    const errores       = [];
    const tablaSimbolos = [];
    const tokens        = tokenizar(texto);

    tokens.forEach((token, index) => {
        const resultado = idioma === 'en'
            ? clasificarTokenEN(token, index, tokens)
            : clasificarTokenES(token, index, tokens);

        if (resultado.categoria === CAT.DESCONOCIDO) {
            errores.push({
                tipo:        'LÉXICO',
                posicion:    index + 1,
                token:       token,
                descripcion: `"${token}" no es una palabra válida en ${idioma === 'en' ? 'inglés' : 'español'}`,
                sugerencia:  '-'
            });
        }

        tablaSimbolos.push({
            posicion:  index + 1,
            token:     token,
            lema:      resultado.lema,
            categoria: resultado.categoria,
            numero:    resultado.numero,
            genero:    resultado.genero,
        });
    });

    return { tablaSimbolos, errores };
}
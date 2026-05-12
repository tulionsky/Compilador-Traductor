// ============================================================
// lexico.js — Módulo de Análisis Léxico
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── EXPRESIONES REGULARES ───────────────────────────────────
const REGEX = {
    contraccion:      /^(al|del)$/i,
    puntuacion:       /^[.,;:!?¡¿()\-"'…]$/,
    numero_cardinal:  /^\d+$/,
    numero_ordinal:   /^\d+(st|nd|rd|th|ro|mo|to|vo)$/i,
};

// ─── CATEGORÍAS GRAMATICALES ─────────────────────────────────
const CAT = {
    SUSTANTIVO:              'SUSTANTIVO',
    ADJETIVO:                'ADJETIVO',
    ARTICULO:                'ARTICULO',
    POSESIVO:                'POSESIVO',
    DEMOSTRATIVO:            'DEMOSTRATIVO',
    INDEFINIDO:              'INDEFINIDO',
    NUMERAL_CARDINAL:        'NUMERAL_CARDINAL',
    NUMERAL_ORDINAL:         'NUMERAL_ORDINAL',
    PRONOMBRE_PERSONAL:      'PRONOMBRE_PERSONAL',
    PRONOMBRE_INTERROGATIVO: 'PRONOMBRE_INTERROGATIVO',
    VERBO:                   'VERBO',
    ADVERBIO_TIEMPO:         'ADVERBIO_TIEMPO',
    ADVERBIO_LUGAR:          'ADVERBIO_LUGAR',
    ADVERBIO_CANTIDAD:       'ADVERBIO_CANTIDAD',
    ADVERBIO_MODO:           'ADVERBIO_MODO',
    ADVERBIO_AFIRMACION:     'ADVERBIO_AFIRMACION',
    ADVERBIO_NEGACION:       'ADVERBIO_NEGACION',
    ADVERBIO_DUDA:           'ADVERBIO_DUDA',
    PREPOSICION:             'PREPOSICION',
    CONJUNCION_COORDINANTE:  'CONJUNCION_COORDINANTE',
    CONJUNCION_SUBORDINANTE: 'CONJUNCION_SUBORDINANTE',
    INTERJECCION:            'INTERJECCION',
    CONTRACCION:             'CONTRACCION',
    PUNTUACION:              'PUNTUACION',
    DESCONOCIDO:             'DESCONOCIDO',
};

// ─── LISTAS DE PALABRAS ESPECIALES (inglés) ──────────────────
const LISTAS = {
    articulos:    ['the', 'a', 'an'],
    posesivos:    ['my', 'your', 'his', 'her', 'its', 'our', 'their'],
    demostrativos:['this', 'that', 'these', 'those'],
    indefinidos:  ['some', 'any', 'few', 'many', 'much', 'several', 'all', 'both', 'each', 'every'],
    pron_personales: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'us', 'them'],
    pron_interrogativos: ['who', 'whom', 'whose', 'which', 'what'],
    preposiciones:['in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
        'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
        'up', 'down', 'of', 'off', 'over', 'under', 'into', 'onto'],
    conj_coord:   ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'],
    conj_subord:  ['if', 'because', 'although', 'though', 'while', 'when', 'since',
        'unless', 'until', 'after', 'before', 'as', 'than', 'that', 'whether'],
    adv_tiempo:   ['now', 'then', 'today', 'yesterday', 'tomorrow', 'soon', 'already',
        'still', 'yet', 'always', 'never', 'often', 'recently', 'lately'],
    adv_lugar:    ['here', 'there', 'everywhere', 'somewhere', 'nowhere', 'inside',
        'outside', 'above', 'below', 'nearby'],
    adv_cantidad: ['very', 'too', 'enough', 'almost', 'quite', 'rather', 'just',
        'only', 'more', 'less', 'most', 'least'],
    adv_afirmacion: ['yes', 'certainly', 'definitely', 'absolutely', 'indeed', 'sure'],
    adv_negacion:   ['no', 'not', 'never', 'neither', 'nor', "n't"],
    adv_duda:       ['maybe', 'perhaps', 'probably', 'possibly', 'apparently'],
    interjecciones: ['oh', 'ah', 'wow', 'hey', 'oops', 'ouch', 'hi', 'hello', 'bye'],
};

// ─── TOKENIZADOR ─────────────────────────────────────────────
function tokenizar(texto) {
    return texto
        .replace(/([.,;:!?¡¿()\-"'…])/g, ' $1 ')
        .trim()
        .split(/\s+/)
        .filter(t => t.length > 0);
}

// ─── CLASIFICADOR DE ADVERBIOS ───────────────────────────────
function clasificarAdverbio(token) {
    const t = token.toLowerCase();
    if (LISTAS.adv_tiempo.includes(t))      return CAT.ADVERBIO_TIEMPO;
    if (LISTAS.adv_lugar.includes(t))       return CAT.ADVERBIO_LUGAR;
    if (LISTAS.adv_cantidad.includes(t))    return CAT.ADVERBIO_CANTIDAD;
    if (LISTAS.adv_afirmacion.includes(t))  return CAT.ADVERBIO_AFIRMACION;
    if (LISTAS.adv_negacion.includes(t))    return CAT.ADVERBIO_NEGACION;
    if (LISTAS.adv_duda.includes(t))        return CAT.ADVERBIO_DUDA;
    return CAT.ADVERBIO_MODO; // por defecto si compromise lo detectó como adverbio
}

// ─── CLASIFICADOR PRINCIPAL DE UN TOKEN ──────────────────────
function clasificarToken(token) {
    const t = token.toLowerCase();

    // Reglas por expresión regular primero
    if (REGEX.contraccion.test(t))     return { lema: t, categoria: CAT.CONTRACCION,       numero: '-', genero: '-' };
    if (REGEX.puntuacion.test(t))      return { lema: t, categoria: CAT.PUNTUACION,         numero: '-', genero: '-' };
    if (REGEX.numero_ordinal.test(t))  return { lema: t, categoria: CAT.NUMERAL_ORDINAL,    numero: '-', genero: '-' };
    if (REGEX.numero_cardinal.test(t)) return { lema: t, categoria: CAT.NUMERAL_CARDINAL,   numero: '-', genero: '-' };

    // Listas de palabras conocidas
    if (LISTAS.articulos.includes(t))           return { lema: t, categoria: CAT.ARTICULO,                numero: '-',      genero: '-' };
    if (LISTAS.posesivos.includes(t))           return { lema: t, categoria: CAT.POSESIVO,                numero: '-',      genero: '-' };
    if (LISTAS.demostrativos.includes(t))       return { lema: t, categoria: CAT.DEMOSTRATIVO,            numero: '-',      genero: '-' };
    if (LISTAS.indefinidos.includes(t))         return { lema: t, categoria: CAT.INDEFINIDO,              numero: '-',      genero: '-' };
    if (LISTAS.pron_personales.includes(t))     return { lema: t, categoria: CAT.PRONOMBRE_PERSONAL,      numero: '-',      genero: '-' };
    if (LISTAS.pron_interrogativos.includes(t)) return { lema: t, categoria: CAT.PRONOMBRE_INTERROGATIVO, numero: '-',      genero: '-' };
    if (LISTAS.conj_coord.includes(t))          return { lema: t, categoria: CAT.CONJUNCION_COORDINANTE,  numero: '-',      genero: '-' };
    if (LISTAS.conj_subord.includes(t))         return { lema: t, categoria: CAT.CONJUNCION_SUBORDINANTE, numero: '-',      genero: '-' };
    if (LISTAS.preposiciones.includes(t))       return { lema: t, categoria: CAT.PREPOSICION,             numero: '-',      genero: '-' };
    if (LISTAS.interjecciones.includes(t))      return { lema: t, categoria: CAT.INTERJECCION,            numero: '-',      genero: '-' };
    if (LISTAS.adv_tiempo.includes(t) || LISTAS.adv_lugar.includes(t) ||
        LISTAS.adv_cantidad.includes(t) || LISTAS.adv_afirmacion.includes(t) ||
        LISTAS.adv_negacion.includes(t) || LISTAS.adv_duda.includes(t))
        return { lema: t, categoria: clasificarAdverbio(t), numero: '-', genero: '-' };

    // compromise.js para lo que no está en las listas
    const doc = nlp(token);
    let categoria = CAT.DESCONOCIDO;
    let lema = t;
    let numero = '-';
    let genero = '-';

    if (doc.verbs().found) {
        categoria = CAT.VERBO;
        lema = doc.verbs().toInfinitive().text() || t;
    } else if (doc.nouns().found) {
        categoria = CAT.SUSTANTIVO;
        lema      = doc.nouns().toSingular().text() || t;
        numero    = doc.nouns().isPlural().found ? 'plural' : 'singular';
    } else if (doc.adjectives().found) {
        categoria = CAT.ADJETIVO;
        lema      = doc.adjectives().text() || t;
    } else if (doc.adverbs().found) {
        categoria = clasificarAdverbio(t);
    }

    return { lema, categoria, numero, genero };
}

// ─── ANÁLISIS LÉXICO COMPLETO ────────────────────────────────
function analizarLexico(texto) {
    const errores       = [];
    const tablaSimbolos = [];
    const tokens        = tokenizar(texto);

    tokens.forEach((token, index) => {
        const resultado = clasificarToken(token);

        if (resultado.categoria === CAT.DESCONOCIDO) {
            errores.push({
                tipo:        'LÉXICO',
                posicion:    index + 1,
                token:       token,
                descripcion: `Token no reconocido: "${token}"`
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

// ─── RENDERIZAR TABLA DE SÍMBOLOS EN EL HTML ─────────────────
function renderizarTablaSimbolos(tablaSimbolos) {
    const cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = '';
    tablaSimbolos.forEach(fila => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fila.posicion}</td>
            <td>${fila.token}</td>
            <td>${fila.lema}</td>
            <td>${fila.categoria}</td>
            <td>${fila.numero}</td>
            <td>${fila.genero}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── RENDERIZAR TABLA DE ERRORES EN EL HTML ──────────────────
function renderizarTablaErrores(errores) {
    const cuerpo = document.getElementById('cuerpo-errores');
    cuerpo.innerHTML = '';
    if (errores.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5">✅ Sin errores léxicos</td></tr>';
        return;
    }
    errores.forEach((err, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${err.tipo}</td>
            <td>${err.posicion}</td>
            <td>${err.token}</td>
            <td>${err.descripcion}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── BOTÓN ANALIZAR ──────────────────────────────────────────
document.getElementById('btn-analizar').addEventListener('click', () => {
    const texto = document.getElementById('texto-entrada').value.trim();
    if (!texto) {
        alert('Escribe una oración primero.');
        return;
    }
    const { tablaSimbolos, errores } = analizarLexico(texto);
    renderizarTablaSimbolos(tablaSimbolos);
    renderizarTablaErrores(errores);
    console.log('Tabla de símbolos:', tablaSimbolos);
    console.log('Errores léxicos:', errores);
});
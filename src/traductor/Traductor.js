// ============================================================
// Traductor.js — Orquestador de traducción
// Capa 1: diccionario local token por token
// Capa 2: MyMemory API para refinamiento
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { EN_ES, ES_EN }            from './Diccionario.js';
import { traducirConMyMemory }     from './MyMemoryClient.js';

// ─── GÉNERO DEL SUSTANTIVO ESPAÑOL ───────────────────────────
// Determina si una palabra española es femenina por su terminación.
// Regla general: termina en -a, -ción, -sión, -dad, -tad, -tud, -umbre → femenino.
function esFemenino(palabraES) {
    if (!palabraES) return false;
    const p = palabraES.toLowerCase();
    return (
        p.endsWith('a')      ||
        p.endsWith('ción')   ||
        p.endsWith('sión')   ||
        p.endsWith('dad')    ||
        p.endsWith('tad')    ||
        p.endsWith('tud')    ||
        p.endsWith('umbre')  ||
        p.endsWith('ie')
    );
}

// ─── CAPA 1: TRADUCCIÓN LOCAL ────────────────────────────────
function traducirLocal(tablaSimbolos, idioma) {
    const diccionario = idioma === 'en' ? EN_ES : ES_EN;

    const tokens = tablaSimbolos.filter(t => t.categoria !== 'PUNTUACION');

    return tokens.map((t, i) => {
        const token = t.token.toLowerCase();
        const lema  = t.lema?.toLowerCase();

        // ── Concordancia de género para artículo indefinido EN→ES ──
        // "a/an" + sustantivo → "un/una" según el género del sustantivo siguiente
        if (idioma === 'en' && (token === 'a' || token === 'an')) {
            // Buscar el siguiente token no puntuación
            const siguiente = tokens[i + 1];
            if (siguiente) {
                const sigToken = siguiente.token.toLowerCase();
                const sigLema  = siguiente.lema?.toLowerCase();
                const tradSig  = diccionario[sigToken] || diccionario[sigLema] || sigToken;
                return esFemenino(tradSig) ? 'una' : 'un';
            }
        }

        return diccionario[token] || diccionario[lema] || t.token;
    }).join(' ');
}

// ─── CAPA 2: REFINAMIENTO CON MYMEMORY ────────────────────────
async function refinarConAPI(texto, idioma) {
    const idiomaOrigen  = idioma;
    const idiomaDestino = idioma === 'en' ? 'es' : 'en';

    const resultado = await traducirConMyMemory(texto, idiomaOrigen, idiomaDestino);

    if (resultado.exito) {
        return resultado.traduccion;
    }

    return null;
}

// ─── CORRECCIÓN POST-API ──────────────────────────────────────
// Reemplaza en la traducción de API las palabras que nuestro
// diccionario conoce mejor — evita que MyMemory traduzca mal
// palabras simples como "apple" → "Apple" (marca)
function corregirConDiccionario(traduccionAPI, tablaSimbolos, idioma) {
    const diccionario = idioma === 'en' ? EN_ES : ES_EN;

    // Categorías que NO deben reemplazarse — MyMemory las maneja bien
    // y son palabras cortas que pueden causar falsos positivos
    const categoriasExcluidas = [
        'ARTICULO', 'PREPOSICION', 'CONJUNCION_COORDINANTE',
        'CONJUNCION_SUBORDINANTE', 'PRONOMBRE_PERSONAL',
        'ADVERBIO_NEGACION', 'NEGACION'
    ];

    let resultado = traduccionAPI;

    tablaSimbolos
        .filter(t => t.categoria !== 'PUNTUACION')
        .filter(t => !categoriasExcluidas.includes(t.categoria))
        .filter(t => t.token.length > 2) // Evitar palabras de 1-2 letras
        .forEach(t => {
            const token     = t.token.toLowerCase();
            const lema      = t.lema?.toLowerCase();
            const tradLocal = diccionario[token] || diccionario[lema];

            if (tradLocal) {
                const regex = new RegExp(
                    '\\b' + t.token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b',
                    'gi'
                );
                if (regex.test(resultado)) {
                    resultado = resultado.replace(regex, tradLocal);
                }
            }
        });

    return resultado;
}

// ─── CORRECCIÓN DE GÉNERO POST-TRADUCCIÓN ────────────────────
// Recorre la traducción final buscando "un/una" mal concordados
// con el sustantivo siguiente y los corrige según género.
function corregirGeneroArticulos(texto, tablaSimbolos, idioma) {
    if (idioma !== 'en') return texto;   // Solo aplica EN→ES

    const diccionario = EN_ES;
    const tokens = tablaSimbolos.filter(t => t.categoria !== 'PUNTUACION');

    // Construir mapa: token_original → artículo correcto (un/una)
    // para cada "a/an" que aparezca en la tabla de símbolos
    const correcciones = [];
    tokens.forEach((t, i) => {
        const tk = t.token.toLowerCase();
        if (tk === 'a' || tk === 'an') {
            const siguiente = tokens[i + 1];
            if (siguiente) {
                const sigToken = siguiente.token.toLowerCase();
                const sigLema  = siguiente.lema?.toLowerCase();
                const tradSig  = diccionario[sigToken] || diccionario[sigLema] || sigToken;
                const articulo = esFemenino(tradSig) ? 'una' : 'un';
                // Guardamos: sustantivo siguiente en español → artículo correcto
                correcciones.push({ sustantivo: tradSig, articulo });
            }
        }
    });

    // Aplicar correcciones sobre el texto traducido
    let resultado = texto;
    correcciones.forEach(({ sustantivo, articulo }) => {
        const sustEscapado = sustantivo.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');
        // Corregir "un" → "una" si el sustantivo es femenino
        if (articulo === 'una') {
            resultado = resultado.replace(
                new RegExp('\\bun\\b(\\s+' + sustEscapado + ')', 'gi'),
                'una$1'
            );
        }
        // Corregir "una" → "un" si el sustantivo es masculino
        if (articulo === 'un') {
            resultado = resultado.replace(
                new RegExp('\\buna\\b(\\s+' + sustEscapado + ')', 'gi'),
                'un$1'
            );
        }
    });

    return resultado;
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────
export async function traducir(oracion, tablaSimbolos, idioma) {

    // Capa 1 — traducción local token por token
    const traduccionLocal = traducirLocal(tablaSimbolos, idioma);

    // Capa 2 — MyMemory con el texto original
    const traduccionAPI = await refinarConAPI(oracion, idioma);

    // Determinar traducción final
    let traduccionFinal;

    if (traduccionAPI) {
        // Usar MyMemory como base pero corregir
        // palabras que el diccionario local conoce mejor
        traduccionFinal = corregirConDiccionario(traduccionAPI, tablaSimbolos, idioma);
    } else {
        // Fallback: usar traducción local si MyMemory falla
        traduccionFinal = traduccionLocal;
    }

    // Corrección de género sobre la traducción final (aplica a API y local)
    traduccionFinal = corregirGeneroArticulos(traduccionFinal, tablaSimbolos, idioma);

    return {
        traduccion:      traduccionFinal,
        traduccionLocal,
        traduccionAPI,
        usóAPI:          !!traduccionAPI
    };
}
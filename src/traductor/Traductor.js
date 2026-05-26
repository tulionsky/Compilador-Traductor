// ============================================================
// Traductor.js — Orquestador de traducción
// Capa 1: diccionario local token por token
// Capa 2: MyMemory API para refinamiento
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { EN_ES, ES_EN }            from './Diccionario.js';
import { traducirConMyMemory }     from './MyMemoryClient.js';

// ─── CAPA 1: TRADUCCIÓN LOCAL ────────────────────────────────
function traducirLocal(tablaSimbolos, idioma) {
    const diccionario = idioma === 'en' ? EN_ES : ES_EN;

    return tablaSimbolos
        .filter(t => t.categoria !== 'PUNTUACION')
        .map(t => {
            const token = t.token.toLowerCase();
            const lema  = t.lema?.toLowerCase();
            return diccionario[token] || diccionario[lema] || t.token;
        })
        .join(' ');
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

    return {
        traduccion:      traduccionFinal,
        traduccionLocal,
        traduccionAPI,
        usóAPI:          !!traduccionAPI
    };
}
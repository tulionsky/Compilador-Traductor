// ============================================================
// Diccionario.js — Validación ortográfica con Typo.js
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

let diccionarioEN = null;
let diccionarioES = null;
let cargando      = false;
let cargado       = false;

// ─── CARGAR DICCIONARIOS ──────────────────────────────────────
export async function cargarDiccionarios() {
    if (cargado || cargando) return;
    cargando = true;

    try {
        const [affEN, dicEN, affES, dicES] = await Promise.all([
            fetch('/dict/en_US.aff').then(r => r.text()),
            fetch('/dict/en_US.dic').then(r => r.text()),
            fetch('/dict/es_ES.aff').then(r => r.text()),
            fetch('/dict/es_ES.dic').then(r => r.text()),
        ]);

        diccionarioEN = new Typo('en_US', affEN, dicEN, { platform: 'any' });
        diccionarioES = new Typo('es_ES', affES, dicES, { platform: 'any' });

        cargado  = true;
        cargando = false;

        console.log('✅ Diccionarios cargados correctamente');
    } catch (e) {
        cargando = false;
        console.error('❌ Error cargando diccionarios:', e);
        throw new Error('No se pudieron cargar los diccionarios de idioma.');
    }
}

// ─── VERIFICAR SI UNA PALABRA EXISTE ─────────────────────────
export function existeEnIdioma(palabra, idioma) {
    if (!cargado) {
        console.warn('Diccionarios no cargados aún.');
        return true; // permisivo si no están cargados
    }

    const dic = idioma === 'en' ? diccionarioEN : diccionarioES;
    if (!dic) return true;

    return dic.check(palabra);
}

// ─── ESTADO DE CARGA ──────────────────────────────────────────
export function diccionariosCargados() {
    return cargado;
}
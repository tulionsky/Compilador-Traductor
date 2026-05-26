// ============================================================
// SintesisVoz.js — Síntesis de voz con Web Speech API
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================
//
// Usa la Web Speech API nativa del navegador (SpeechSynthesis).
// Sin descargas, sin dependencias externas, funciona en Chrome,
// Edge y Firefox. Selecciona automáticamente la voz más natural
// según el idioma de salida.
//
// API pública:
//   inicializarVoces()       → precarga la lista de voces del sistema
//   hablar(texto, idioma)    → sintetiza y reproduce
//   pausar()                 → pausa la reproducción
//   reanudar()               → reanuda desde donde se pausó
//   detener()                → para completamente
//   estadoAudio()            → "idle" | "cargando" | "reproduciendo" | "pausado"
//   modeloListo()            → true si hay voces disponibles
// ============================================================

"use strict";

// ─── ESTADO INTERNO ───────────────────────────────────────────
let _estado     = "idle";
let _utterance  = null;
let _vocesList  = [];
let _vocesListas = false;

// Callbacks
let _onEstadoCambio = null;
let _onProgreso     = null;
let _onError        = null;

// ─── REGISTRAR CALLBACKS ──────────────────────────────────────
export function onEstadoCambio(fn) { _onEstadoCambio = fn; }
export function onProgreso(fn)     { _onProgreso     = fn; }
export function onError(fn)        { _onError        = fn; }

// ─── HELPERS ──────────────────────────────────────────────────
function _setEstado(nuevo) {
    _estado = nuevo;
    if (_onEstadoCambio) _onEstadoCambio(nuevo);
}

function _notificarError(msg) {
    console.error("[SintesisVoz]", msg);
    if (_onError) _onError(msg);
}

// ─── SELECCIÓN DE VOZ ─────────────────────────────────────────
// Prioriza voces locales (más naturales) sobre remotas (Google online)
function _elegirVoz(idioma) {
    const lang = idioma === "es" ? "es" : "en";

    // Busca primero voces locales del sistema para ese idioma
    let candidatas = _vocesList.filter(v =>
        v.lang.toLowerCase().startsWith(lang) && v.localService
    );

    // Si no hay locales, acepta remotas
    if (candidatas.length === 0) {
        candidatas = _vocesList.filter(v =>
            v.lang.toLowerCase().startsWith(lang)
        );
    }

    // Preferencias de nombre por idioma
    const preferencias = lang === "es"
        ? ["Google español", "Microsoft Sabina", "Mónica", "Paulina", "es-"]
        : ["Google US English", "Microsoft Zira", "Samantha", "Karen", "en-US"];

    for (const pref of preferencias) {
        const v = candidatas.find(v =>
            v.name.includes(pref) || v.lang.startsWith(pref)
        );
        if (v) return v;
    }

    return candidatas[0] || null;
}

// ─── INICIALIZACIÓN ───────────────────────────────────────────
/**
 * Precarga la lista de voces del sistema.
 * En Chrome las voces se cargan asíncronamente; hay que esperar el evento.
 */
export function inicializarVoces() {
    if (!window.speechSynthesis) {
        _notificarError("Este navegador no soporta síntesis de voz.");
        return;
    }

    function cargarVoces() {
        _vocesList   = window.speechSynthesis.getVoices();
        _vocesListas = _vocesList.length > 0;
        if (_vocesListas && _onProgreso) {
            _onProgreso(100, "Voces de síntesis listas ✅");
            setTimeout(() => _onEstadoCambio?.("idle"), 800);
        }
    }

    // Las voces pueden ya estar disponibles (Firefox) o cargarse después (Chrome)
    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;
}

// Alias para compatibilidad con ControladorAudio.js que llama inicializarKokoro()
export async function inicializarKokoro() {
    inicializarVoces();
}

// ─── HABLAR ───────────────────────────────────────────────────
export async function hablar(texto, idioma = "en") {
    if (!window.speechSynthesis) {
        _notificarError("Síntesis de voz no disponible en este navegador.");
        return;
    }

    if (!texto || !texto.trim()) {
        _notificarError("No hay texto para sintetizar.");
        return;
    }

    // Parar cualquier cosa que esté sonando
    detener();

    _setEstado("cargando");

    // Chrome bug: speechSynthesis se "congela" si la página lleva mucho tiempo abierta.
    // Cancelar y esperar un tick lo desbloquea.
    window.speechSynthesis.cancel();
    await new Promise(r => setTimeout(r, 100));

    // Asegurar que las voces estén cargadas
    if (!_vocesListas) {
        _vocesList   = window.speechSynthesis.getVoices();
        _vocesListas = _vocesList.length > 0;
    }

    _utterance = new SpeechSynthesisUtterance(texto.trim());

    // Voz
    const voz = _elegirVoz(idioma);
    if (voz) {
        _utterance.voice = voz;
        console.info("[SintesisVoz] Voz seleccionada:", voz.name, voz.lang);
    }

    // Parámetros
    _utterance.lang  = idioma === "es" ? "es-ES" : "en-US";
    _utterance.rate  = 0.92;   // ligeramente más lento que lo default → más claro
    _utterance.pitch = 1.0;
    _utterance.volume = 1.0;

    // Eventos
    _utterance.onstart = () => _setEstado("reproduciendo");
    _utterance.onend   = () => { _utterance = null; _setEstado("idle"); };
    _utterance.onerror = (e) => {
        _utterance = null;
        // "interrupted" no es error real — pasa cuando se llama detener()
        if (e.error !== "interrupted" && e.error !== "canceled") {
            _notificarError(`Error de voz: ${e.error}`);
        }
        _setEstado("idle");
    };
    _utterance.onpause  = () => _setEstado("pausado");
    _utterance.onresume = () => _setEstado("reproduciendo");

    window.speechSynthesis.speak(_utterance);
}

// ─── CONTROLES ────────────────────────────────────────────────
export function pausar() {
    if (window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        _setEstado("pausado");
    }
}

export function reanudar() {
    if (window.speechSynthesis?.paused) {
        window.speechSynthesis.resume();
        _setEstado("reproduciendo");
    }
}

export function detener() {
    window.speechSynthesis?.cancel();
    _utterance = null;
    if (_estado !== "idle") _setEstado("idle");
}

export function estadoAudio() { return _estado; }

export function modeloListo() {
    // Con Web Speech API siempre está "listo" si el navegador lo soporta
    return !!window.speechSynthesis;
}

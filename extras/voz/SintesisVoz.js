// ============================================================
// SintesisVoz.js — Síntesis de voz con Web Speech API
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

"use strict";

let _estado      = "idle";
let _utterance   = null;
let _vocesList   = [];
let _vocesListas = false;

let _onEstadoCambio = null;
let _onProgreso     = null;
let _onError        = null;

export function onEstadoCambio(fn) { _onEstadoCambio = fn; }
export function onProgreso(fn)     { _onProgreso     = fn; }
export function onError(fn)        { _onError        = fn; }

function _setEstado(nuevo) {
    _estado = nuevo;
    if (_onEstadoCambio) _onEstadoCambio(nuevo);
}

function _notificarError(msg) {
    console.error("[SintesisVoz]", msg);
    if (_onError) _onError(msg);
}

function _elegirVoz(idioma) {
    const lang = idioma === "es" ? "es" : "en";

    let candidatas = _vocesList.filter(v =>
        v.lang.toLowerCase().startsWith(lang) && v.localService
    );

    if (candidatas.length === 0) {
        candidatas = _vocesList.filter(v =>
            v.lang.toLowerCase().startsWith(lang)
        );
    }

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

    cargarVoces();
    window.speechSynthesis.onvoiceschanged = cargarVoces;
}

export async function inicializarKokoro() {
    inicializarVoces();
}

export async function hablar(texto, idioma = "en") {
    if (!window.speechSynthesis) {
        _notificarError("Síntesis de voz no disponible en este navegador.");
        return;
    }

    if (!texto || !texto.trim()) {
        _notificarError("No hay texto para sintetizar.");
        return;
    }

    detener();
    _setEstado("cargando");

    window.speechSynthesis.cancel();
    await new Promise(r => setTimeout(r, 100));

    if (!_vocesListas) {
        _vocesList   = window.speechSynthesis.getVoices();
        _vocesListas = _vocesList.length > 0;
    }

    _utterance = new SpeechSynthesisUtterance(texto.trim());

    const voz = _elegirVoz(idioma);
    if (voz) {
        _utterance.voice = voz;
        console.info("[SintesisVoz] Voz seleccionada:", voz.name, voz.lang);
    }

    _utterance.lang   = idioma === "es" ? "es-ES" : "en-US";
    _utterance.rate   = 0.92;
    _utterance.pitch  = 1.0;
    _utterance.volume = 1.0;

    _utterance.onstart  = () => _setEstado("reproduciendo");
    _utterance.onend    = () => { _utterance = null; _setEstado("idle"); };
    _utterance.onerror  = (e) => {
        _utterance = null;
        if (e.error !== "interrupted" && e.error !== "canceled") {
            _notificarError(`Error de voz: ${e.error}`);
        }
        _setEstado("idle");
    };
    _utterance.onpause  = () => _setEstado("pausado");
    _utterance.onresume = () => _setEstado("reproduciendo");

    window.speechSynthesis.speak(_utterance);
}

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
    return !!window.speechSynthesis;
}
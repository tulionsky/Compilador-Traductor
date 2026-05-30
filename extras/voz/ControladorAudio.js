// ============================================================
// ControladorAudio.js — Eventos de los botones de voz
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

"use strict";

import {
    inicializarKokoro,
    hablar,
    pausar,
    reanudar,
    detener,
    estadoAudio,
    modeloListo,
    onEstadoCambio,
    onProgreso,
    onError,
} from "./SintesisVoz.js";

const btnPlay   = document.getElementById("btn-play");
const btnPausa  = document.getElementById("btn-pausa");
const btnStop   = document.getElementById("btn-stop");
const estadoVoz = document.getElementById("estado-voz");

const contenedorProgreso = document.getElementById("contenedor-progreso-voz");
const labelProgreso      = document.getElementById("label-progreso-voz");
const barraFill          = document.getElementById("barra-progreso-voz-fill");

function obtenerTextoDeSalida() {
    return (document.getElementById("texto-salida")?.value || "").trim();
}

function obtenerIdiomaSalida() {
    const idiomaEntrada = document.getElementById("idioma-entrada")?.value || "en";
    return idiomaEntrada === "en" ? "es" : "en";
}

function actualizarBotones(estado) {
    const hayTexto = obtenerTextoDeSalida().length > 0;
    const listo    = modeloListo();

    switch (estado) {
        case "idle":
            btnPlay.disabled    = !hayTexto || !listo;
            btnPlay.textContent = "▶ Reproducir";
            btnPausa.disabled   = true;
            btnStop.disabled    = true;
            estadoVoz.textContent = "";
            break;
        case "cargando":
            btnPlay.disabled    = true;
            btnPlay.textContent = "⏳ Preparando...";
            btnPausa.disabled   = true;
            btnStop.disabled    = true;
            estadoVoz.textContent = "Iniciando voz...";
            break;
        case "reproduciendo":
            btnPlay.disabled    = true;
            btnPlay.textContent = "▶ Reproducir";
            btnPausa.disabled   = false;
            btnStop.disabled    = false;
            estadoVoz.textContent = "🔊 Reproduciendo...";
            break;
        case "pausado":
            btnPlay.disabled    = false;
            btnPlay.textContent = "▶ Reanudar";
            btnPausa.disabled   = true;
            btnStop.disabled    = false;
            estadoVoz.textContent = "⏸ Pausado";
            break;
    }
}

function mostrarProgreso(pct, msg) {
    if (pct >= 100) {
        labelProgreso.textContent = msg;
        barraFill.style.width = "100%";
        setTimeout(() => {
            contenedorProgreso.style.display = "none";
            barraFill.style.width = "0%";
        }, 1200);
    } else if (pct > 0) {
        contenedorProgreso.style.display = "block";
        labelProgreso.textContent = msg;
        barraFill.style.width = `${pct}%`;
    }
}

onEstadoCambio((estado) => actualizarBotones(estado));

onProgreso((pct, msg) => {
    mostrarProgreso(pct, msg);
    if (pct >= 100) setTimeout(() => actualizarBotones("idle"), 1200);
});

onError((msg) => {
    estadoVoz.textContent = `❌ ${msg}`;
    setTimeout(() => {
        if (estadoVoz.textContent.startsWith("❌")) estadoVoz.textContent = "";
    }, 5000);
    actualizarBotones("idle");
    contenedorProgreso.style.display = "none";
});

btnPlay.addEventListener("click", async () => {
    if (estadoAudio() === "pausado") {
        reanudar();
        return;
    }

    const texto  = obtenerTextoDeSalida();
    const idioma = obtenerIdiomaSalida();

    if (!texto) {
        estadoVoz.textContent = "⚠️ No hay traducción para reproducir.";
        setTimeout(() => { estadoVoz.textContent = ""; }, 3000);
        return;
    }

    await hablar(texto, idioma);
});

btnPausa.addEventListener("click", () => pausar());
btnStop.addEventListener("click", () => {
    detener();
    contenedorProgreso.style.display = "none";
});

window.addEventListener("traduccion-lista", () => actualizarBotones("idle"));

actualizarBotones("idle");

inicializarKokoro().then(() => {
    actualizarBotones("idle");
    console.info("[ControladorAudio] Síntesis de voz lista.");
});
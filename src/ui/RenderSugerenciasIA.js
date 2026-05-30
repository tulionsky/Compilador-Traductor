// ============================================================
// RenderSugerenciasIA.js — Orquestador de sugerencias con IA
// Llama a Groq con los errores detectados y renderiza
// las sugerencias de corrección en la interfaz.
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { obtenerSugerenciasGroq } from './GroqClient.js';
import { renderizarSugerencias }  from './RenderSugerencias.js';

// Fix 2: mostrar botón re-traducir cuando hay errores críticos y no hay sugerencias
function mostrarBotonRetraducir() {
    const contenedor = document.getElementById('contenedor-sugerencias');
    if (!contenedor) return;

    // Solo insertar si no hay tarjetas ni botón ya
    if (contenedor.querySelector('.btn-retraducir')) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'text-align:center; margin-top:14px;';
    wrapper.innerHTML = '<button id="btn-retraducir" class="btn-retraducir">⚡ Traducir de nuevo</button>';
    contenedor.appendChild(wrapper);

    wrapper.querySelector('#btn-retraducir')?.addEventListener('click', () => {
        if (window.KirbyMind?.irA) window.KirbyMind.irA('ingreso');
        setTimeout(() => document.getElementById('btn-analizar')?.click(), 350);
    });
}

export async function procesarYMostrarSugerencias(
    texto,
    erroresCompilador,
    sugerenciasLocales,
    idioma,
    hayErroresCriticos = false
) {
    // Sin errores — solo mostrar sugerencias locales
    if (!erroresCompilador || erroresCompilador.length === 0) {
        renderizarSugerencias(sugerenciasLocales || []);
        return;
    }

    // Llamar a Groq con los errores detectados
    const { sugerencias: sugerenciasGroq } = await obtenerSugerenciasGroq(
        texto,
        erroresCompilador,
        idioma
    );

    // Combinar sugerencias locales + sugerencias de Groq
    const todasLasSugerencias = [
        ...(sugerenciasLocales || []),
        ...sugerenciasGroq
    ];

    renderizarSugerencias(todasLasSugerencias);

    // Fix 2: si hay errores críticos, forzar zona visible y mostrar botón re-traducir
    // Se hace DESPUÉS de renderizarSugerencias porque esta puede ocultar la zona
    // cuando no hay sugerencias
    if (hayErroresCriticos) {
        const zona = document.getElementById('zona-errores-sugerencias');
        if (zona) zona.style.display = 'grid';
        mostrarBotonRetraducir();
    }
}
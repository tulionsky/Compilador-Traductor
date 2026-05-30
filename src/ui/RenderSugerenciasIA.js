// ============================================================
// RenderSugerenciasIA.js — Orquestador de sugerencias con IA
// Llama a Groq con los errores detectados y renderiza
// las sugerencias de corrección en la interfaz.
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { obtenerSugerenciasGroq } from './GroqClient.js';
import { renderizarSugerencias }  from './RenderSugerencias.js';

export async function procesarYMostrarSugerencias(
    texto,
    erroresCompilador,
    sugerenciasLocales,
    idioma
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
}
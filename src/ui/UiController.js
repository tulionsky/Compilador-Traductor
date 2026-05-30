// ============================================================
// UiController.js — Eventos y conexión entre UI y compilador
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { Compilador }                      from '../Compilador.js';
import { cargarDiccionarios,
    diccionariosCargados }            from '../lexico/Diccionario.js';
import { renderizarTablaSimbolos,
    renderizarTablaErrores }          from './RenderTablas.js';
import { renderizarArboles }               from './RenderArbol.js';
import { renderizarErroresSemanticos,
    renderizarSugerencias }           from './RenderSugerencias.js';
import { procesarYMostrarSugerencias }     from './RenderSugerenciasIA.js';

const compilador = new Compilador();

// ─── CARGA INICIAL DE DICCIONARIOS ────────────────────────────
async function inicializar() {
    const estadoEl = document.getElementById('estado-diccionarios');

    try {
        estadoEl.textContent = '⏳ Cargando diccionarios...';
        estadoEl.style.color = 'var(--accent-amber)';

        await cargarDiccionarios();

        estadoEl.textContent = '✅ Diccionarios listos';
        estadoEl.style.color = 'var(--accent-green)';

        setTimeout(() => { estadoEl.style.display = 'none'; }, 3000);

    } catch (e) {
        estadoEl.textContent = '❌ Error cargando diccionarios';
        estadoEl.style.color = 'var(--accent-red)';
        console.error(e);
    }
}

// ─── OBTENER IDIOMA ───────────────────────────────────────────
function obtenerIdioma() {
    return document.getElementById('idioma-entrada').value;
}

// ─── MOSTRAR ESTADO FASE ──────────────────────────────────────
function mostrarEstadoFase(mensaje, tipo = 'info') {
    const badge  = document.getElementById('tipo-oracion-badge');
    const clases = {
        info:     'badge-analizando',
        valida:   'badge-valida',
        invalida: 'badge-invalida'
    };
    badge.innerHTML = `<span class="oracion-badge ${clases[tipo] || ''}">${mensaje}</span>`;
}

// ─── LIMPIAR UI ───────────────────────────────────────────────
function limpiarUI() {
    document.getElementById('texto-entrada').value        = '';
    document.getElementById('cuerpo-tabla').innerHTML     =
        '<tr><td colspan="6" class="placeholder-text">Sin datos aún.</td></tr>';
    document.getElementById('cuerpo-errores').innerHTML   =
        '<tr><td colspan="5" class="placeholder-text">Sin errores detectados.</td></tr>';
    document.getElementById('arbol-derivacion').innerHTML =
        '<p class="placeholder-text">El árbol aparecerá aquí después de analizar.</p>';
    document.getElementById('tipo-oracion-badge').innerHTML = '';
    document.getElementById('cuerpo-errores-semanticos').innerHTML =
        '<tr><td colspan="3" class="placeholder-text">Sin errores semánticos.</td></tr>';
    document.getElementById('contenedor-sugerencias').innerHTML =
        '<p class="placeholder-text">Sin sugerencias.</p>';

    // Ocultar zona errores/sugerencias
    const zona = document.getElementById('zona-errores-sugerencias');
    if (zona) zona.style.display = 'none';

    // Ocultar análisis detallado
    const detalle = document.getElementById('analisis-detallado');
    if (detalle) detalle.classList.remove('visible');
    const btnVer = document.getElementById('btn-ver-analisis');
    if (btnVer) {
        btnVer.classList.remove('abierto');
        btnVer.innerHTML = 'Ver análisis detallado <span class="chevron">▼</span>';
    }
}

// ─── BLOQUEAR BOTÓN ──────────────────────────────────────────
function bloquearBoton(bloqueado) {
    const btn       = document.getElementById('btn-analizar');
    btn.disabled    = bloqueado;
    btn.textContent = bloqueado ? '⏳ Analizando...' : '⚡ Analizar';
}

// ─── EVENTO: ANALIZAR ─────────────────────────────────────────
document.getElementById('btn-analizar').addEventListener('click', async () => {
    const texto = document.getElementById('texto-entrada').value.trim();

    if (!texto) {
        alert('Escribe una oración primero.');
        return;
    }

    if (!diccionariosCargados()) {
        alert('Los diccionarios aún se están cargando. Espera un momento.');
        return;
    }

    bloquearBoton(true);

    try {
        const idioma    = obtenerIdioma();
        const resultado = await compilador.compilar(texto, idioma, mostrarEstadoFase);

        // ── Navegar a pantalla de resultados ─────────────────
        if (window.KirbyMind?.irA) {
            await window.KirbyMind.irA('resultados');
        }

        // ── Mostrar texto original en panel resultado ─────────
        const textoResultado = document.getElementById('texto-entrada-resultado');
        if (textoResultado) textoResultado.value = texto;

        // ── Tabla de símbolos ─────────────────────────────────
        renderizarTablaSimbolos(resultado.tablaSimbolos);

        // ── Tabla de errores ──────────────────────────────────
        renderizarTablaErrores(resultado.tablaErrores);

        // ── Árbol — solo sin errores léxicos/sintácticos ──────
        const hayErroresCriticos = resultado.tablaErrores.some(
            e => e.tipo === 'LÉXICO' || e.tipo === 'SINTÁCTICO'
        );
        document.getElementById('arbol-derivacion').innerHTML = hayErroresCriticos
            ? '<p class="placeholder-text">El árbol aparece cuando no hay errores léxicos ni sintácticos.</p>'
            : renderizarArboles(resultado.arboles);

        // ── Errores semánticos ────────────────────────────────
        renderizarErroresSemanticos(
            resultado.erroresSemanticos,
            resultado.advertencia
        );

        // ── Sugerencias — locales + Groq ──────────────────────
        const hayErrores = resultado.tablaErrores.length > 0 ||
            resultado.erroresSemanticos?.length > 0;

        if (hayErrores) {
            // Mostrar zona de errores/sugerencias
            const zona = document.getElementById('zona-errores-sugerencias');
            if (zona) zona.style.display = 'grid';

            mostrarEstadoFase('💡 Generando sugerencias...', 'info');
        }

        await procesarYMostrarSugerencias(
            texto,
            resultado.tablaErrores,
            resultado.sugerencias,
            idioma
        );

        // ── Badge final ───────────────────────────────────────
        if (resultado.tablaErrores.some(e => e.tipo === 'LÉXICO')) {
            mostrarEstadoFase('❌ Errores léxicos detectados', 'invalida');
        } else if (resultado.tablaErrores.some(e => e.tipo === 'SINTÁCTICO')) {
            mostrarEstadoFase('❌ Errores sintácticos detectados', 'invalida');
        } else if (resultado.tablaErrores.some(e => e.tipo === 'SEMÁNTICO')) {
            mostrarEstadoFase('❌ Errores semánticos detectados', 'invalida');
        }

        // ── Traducción — solo sin errores ─────────────────────
        document.getElementById('texto-salida').value =
            resultado.traduccion || '';

        // Notificar ControladorAudio
        if (resultado.traduccion) {
            window.dispatchEvent(new CustomEvent('traduccion-lista'));
        }

        // ── Labels de idioma en resultados ────────────────────
        const labelEntrada = document.getElementById('label-idioma-entrada');
        const labelSalida  = document.getElementById('label-idioma-salida');
        if (labelEntrada) labelEntrada.textContent = idioma === 'en' ? 'EN' : 'ES';
        if (labelSalida)  labelSalida.textContent  = idioma === 'en' ? 'ES' : 'EN';

    } finally {
        bloquearBoton(false);
    }
});

// ─── EVENTO: LIMPIAR ──────────────────────────────────────────
document.getElementById('btn-limpiar').addEventListener('click', limpiarUI);

// ─── EVENTO: CAMBIO DE IDIOMA ─────────────────────────────────
document.getElementById('idioma-entrada').addEventListener('change', () => {
    limpiarUI();
    const idioma = obtenerIdioma();
    document.getElementById('texto-entrada').placeholder =
        idioma === 'en'
            ? 'Escribe una oración en inglés para analizar y traducir...'
            : 'Escribe una oración en español para analizar y traducir...';
});

// ─── INICIALIZAR ──────────────────────────────────────────────
inicializar();
// ============================================================
// UiController.js — Eventos y conexión entre UI y compilador
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { Compilador }                from '../Compilador.js';
import { cargarDiccionarios,
    diccionariosCargados }      from '../lexico/Diccionario.js';
import { renderizarTablaSimbolos,
    renderizarTablaErrores }    from './RenderTablas.js';
import { renderizarArboles }         from './RenderArbol.js';

const compilador = new Compilador();

// ─── CARGA INICIAL DE DICCIONARIOS ────────────────────────────
async function inicializar() {
    const estadoEl = document.getElementById('estado-diccionarios');

    try {
        estadoEl.textContent = '⏳ Cargando diccionarios...';
        estadoEl.style.color = 'orange';

        await cargarDiccionarios();

        estadoEl.textContent = '✅ Diccionarios listos';
        estadoEl.style.color = 'green';

        setTimeout(() => { estadoEl.style.display = 'none'; }, 3000);

    } catch (e) {
        estadoEl.textContent = '❌ Error cargando diccionarios — verifica la carpeta /dict';
        estadoEl.style.color = 'red';
        console.error(e);
    }
}

// ─── OBTENER IDIOMA SELECCIONADO ──────────────────────────────
function obtenerIdioma() {
    return document.getElementById('idioma-entrada').value;
}

// ─── HELPERS UI ───────────────────────────────────────────────
function mostrarEstadoFase(mensaje, tipo = 'info') {
    const badge  = document.getElementById('tipo-oracion-badge');
    const clases = {
        info:     'badge-analizando',
        valida:   'badge-valida',
        invalida: 'badge-invalida'
    };
    badge.innerHTML = `<span class="oracion-badge ${clases[tipo] || ''}">${mensaje}</span>`;
}

function limpiarUI() {
    document.getElementById('texto-entrada').value        = '';
    document.getElementById('texto-salida').value         = '';
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
}

function bloquearBoton(bloqueado) {
    const btn       = document.getElementById('btn-analizar');
    btn.disabled    = bloqueado;
    btn.textContent = bloqueado ? 'Analizando...' : 'Analizar';
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

        // Renderizar tabla de símbolos
        renderizarTablaSimbolos(resultado.tablaSimbolos);

        // Renderizar tabla de errores unificada
        renderizarTablaErrores(resultado.tablaErrores);

        // Solo mostrar árbol si no hay errores léxicos ni sintácticos
        const hayErrores = resultado.tablaErrores.some(
            e => e.tipo === 'LÉXICO' || e.tipo === 'SINTÁCTICO'
        );

        document.getElementById('arbol-derivacion').innerHTML = hayErrores
            ? '<p class="placeholder-text">El árbol aparecerá aquí cuando no haya errores léxicos ni sintácticos.</p>'
            : renderizarArboles(resultado.arboles);

        // Mostrar traducción si existe
        document.getElementById('texto-salida').value =
            resultado.traduccion || '';

        // TODO: Mijeli — renderizar errores semánticos y sugerencias
        // renderizarErroresSemanticos(resultado.erroresSemanticos);
        // renderizarSugerencias(resultado.sugerencias);

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
            ? 'Escribe una oración en inglés...'
            : 'Escribe una oración en español...';
});

// ─── INICIALIZAR AL CARGAR LA PÁGINA ─────────────────────────
inicializar();
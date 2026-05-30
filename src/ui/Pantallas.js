// ============================================================
// Pantallas.js — Manejo de transiciones entre pantallas
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── REFERENCIAS ──────────────────────────────────────────────
const pantallas = {
    portada:     document.getElementById('pantalla-portada'),
    ingreso:     document.getElementById('pantalla-ingreso'),
    resultados:  document.getElementById('pantalla-resultados'),
};

// ─── TRANSICIÓN ENTRE PANTALLAS ───────────────────────────────
export function irA(destino, duracion = 600) {
    return new Promise(resolve => {
        const actual = Object.values(pantallas).find(p => p.classList.contains('activa'));

        if (!actual || !pantallas[destino]) {
            resolve();
            return;
        }

        if (actual === pantallas[destino]) {
            resolve();
            return;
        }

        // Animar salida
        actual.classList.add('saliendo');

        setTimeout(() => {
            actual.classList.remove('activa', 'saliendo');

            // Mostrar destino
            pantallas[destino].classList.add('activa');

            // Scroll al top
            pantallas[destino].scrollTo({ top: 0, behavior: 'instant' });

            resolve();
        }, duracion / 2);
    });
}

// ─── BOTÓN: Empezar a traducir (Portada → Ingreso) ────────────
document.getElementById('btn-empezar')?.addEventListener('click', () => {
    irA('ingreso');
});

// ─── BOTÓN: Nueva traducción (Resultados → Ingreso) ───────────
document.getElementById('btn-nueva-traduccion')?.addEventListener('click', () => {
    irA('ingreso');
    // Limpiar el textarea de entrada de resultados
    document.getElementById('texto-entrada-resultado').value = '';
    document.getElementById('texto-salida').value = '';
});

// ─── BOTÓN: Ver análisis detallado ────────────────────────────
document.getElementById('btn-ver-analisis')?.addEventListener('click', () => {
    const btn      = document.getElementById('btn-ver-analisis');
    const detalle  = document.getElementById('analisis-detallado');

    const estaAbierto = detalle.classList.contains('visible');

    if (estaAbierto) {
        detalle.classList.remove('visible');
        btn.classList.remove('abierto');
        btn.innerHTML = 'Ver análisis detallado <span class="chevron">▼</span>';
    } else {
        detalle.classList.add('visible');
        btn.classList.add('abierto');
        btn.innerHTML = 'Ocultar análisis detallado <span class="chevron">▼</span>';
        // Scroll suave hacia el detalle
        setTimeout(() => {
            detalle.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});

// ─── CAMBIO DE IDIOMA — actualizar labels en resultados ───────
document.getElementById('idioma-entrada')?.addEventListener('change', (e) => {
    const idioma = e.target.value;
    const labelEntrada = document.getElementById('label-idioma-entrada');
    const labelSalida  = document.getElementById('label-idioma-salida');

    if (labelEntrada && labelSalida) {
        labelEntrada.textContent = idioma === 'en' ? 'EN' : 'ES';
        labelSalida.textContent  = idioma === 'en' ? 'ES' : 'EN';
    }
});

// ─── EXPORTAR función para que UiController pueda usarla ──────
window.KirbyMind = window.KirbyMind || {};
window.KirbyMind.irA = irA;
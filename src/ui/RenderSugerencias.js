// ============================================================
// RenderSugerencias.js — Renderizado de errores semánticos y sugerencias
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── RENDERIZAR ERRORES SEMÁNTICOS ───────────────────────────
export function renderizarErroresSemanticos(errores, advertencia = null) {
    const cuerpo = document.getElementById('cuerpo-errores-semanticos');
    if (!cuerpo) return;

    cuerpo.innerHTML = '';

    if (advertencia) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="3" class="placeholder-text">
                    ⚠️ ${advertencia}
                </td>
            </tr>`;
        return;
    }

    if (!errores || errores.length === 0) {
        cuerpo.innerHTML = `
            <tr>
                <td colspan="3" class="placeholder-text">
                    ✅ Sin errores semánticos
                </td>
            </tr>`;
        return;
    }

    errores.forEach((err, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="error-semantico">${err.regla || 'Semántico'}</td>
            <td>
                <strong>${err.token_problematico || ''}</strong>
                ${err.token_problematico ? ' — ' : ''}
                ${err.descripcion}
            </td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── RENDERIZAR SUGERENCIAS ───────────────────────────────────
export function renderizarSugerencias(sugerencias) {
    const contenedor = document.getElementById('contenedor-sugerencias');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (!sugerencias || sugerencias.length === 0) {
        contenedor.innerHTML = `<p class="placeholder-text">Sin sugerencias.</p>`;
        return;
    }

    sugerencias.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'tarjeta-sugerencia';
        card.innerHTML = `
            <p class="sug-explicacion">${sug.explicacion}</p>
            <div class="sug-comparacion">
                <span class="sug-original">❌ ${sug.original}</span>
                <span class="sug-flecha">→</span>
                <span class="sug-correccion">✅ ${sug.correccion}</span>
            </div>
            <button class="btn-aplicar"
                    data-original="${sug.original}"
                    data-correccion="${sug.correccion}">
                Aplicar corrección
            </button>
        `;

        card.querySelector('.btn-aplicar').addEventListener('click', () => {
            const textarea = document.getElementById('texto-entrada');
            if (textarea) {
                textarea.value = textarea.value.replace(sug.original, sug.correccion);
            }
        });

        contenedor.appendChild(card);
    });
}
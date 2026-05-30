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
        tr.className = 'error-semantico-row';
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>
                <span class="regla-badge">${err.regla || 'Semántico'}</span>
            </td>
            <td>
                ${err.token_problematico
            ? `<strong style="color:var(--kirby-pink)">${err.token_problematico}</strong> — `
            : ''}
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

    // Mostrar/ocultar zona de errores y sugerencias
    const zonaErrores = document.getElementById('zona-errores-sugerencias');
    if (zonaErrores) {
        zonaErrores.style.display = sugerencias && sugerencias.length > 0
            ? 'grid'
            : 'none';
    }

    if (!sugerencias || sugerencias.length === 0) {
        contenedor.innerHTML = `<p class="placeholder-text">Sin sugerencias.</p>`;
        return;
    }

    sugerencias.forEach(sug => {
        const card = document.createElement('div');
        card.className = 'tarjeta-sugerencia';

        card.innerHTML = `
            <p class="sug-explicacion">${sug.explicacion || ''}</p>
            <div class="sug-comparacion">
                <span class="sug-original">✗ ${sug.original}</span>
                <span class="sug-flecha">→</span>
                <span class="sug-correccion">✓ ${sug.correccion}</span>
            </div>
            <button class="btn-aplicar">
                ✓ Aplicar corrección
            </button>
        `;

        // ─── BOTÓN APLICAR ─────────────────────────────────────
        card.querySelector('.btn-aplicar').addEventListener('click', () => {
            // Aplicar en el textarea de ingreso
            const textarea = document.getElementById('texto-entrada');
            if (textarea) {
                textarea.value = textarea.value.replace(
                    new RegExp(sug.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                    sug.correccion
                );
            }

            // Animación de salida
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease, max-height 0.4s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateX(20px)';
            card.style.maxHeight = card.offsetHeight + 'px';

            setTimeout(() => {
                card.style.maxHeight = '0';
                card.style.padding = '0';
                card.style.margin = '0';
                card.style.overflow = 'hidden';
            }, 150);

            setTimeout(() => {
                card.remove();
                // Si no quedan tarjetas mostrar mensaje
                const restantes = contenedor.querySelectorAll('.tarjeta-sugerencia');
                if (restantes.length === 0) {
                    contenedor.innerHTML = `
                        <p class="placeholder-text">✅ Todas las correcciones aplicadas.</p>
                    `;
                    // Ocultar zona si no hay errores semánticos tampoco
                    const cuerpoSem = document.getElementById('cuerpo-errores-semanticos');
                    const hayErroresSem = cuerpoSem &&
                        !cuerpoSem.querySelector('.placeholder-text');
                    if (!hayErroresSem) {
                        const zona = document.getElementById('zona-errores-sugerencias');
                        if (zona) zona.style.display = 'none';
                    }
                }
            }, 550);
        });

        contenedor.appendChild(card);
    });
}
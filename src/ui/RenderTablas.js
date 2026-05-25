// ============================================================
// RenderTablas.js — Renderizado de tabla de símbolos y errores
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── TABLA DE SÍMBOLOS ────────────────────────────────────────
export function renderizarTablaSimbolos(tablaSimbolos) {
    const cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = '';

    if (tablaSimbolos.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="6">Sin tokens para mostrar</td></tr>';
        return;
    }

    tablaSimbolos.forEach(fila => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fila.posicion}</td>
            <td>${fila.token}</td>
            <td>${fila.lema}</td>
            <td>${fila.categoria}</td>
            <td>${fila.numero}</td>
            <td>${fila.genero}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── TABLA DE ERRORES ─────────────────────────────────────────
export function renderizarTablaErrores(errores) {
    const cuerpo = document.getElementById('cuerpo-errores');
    cuerpo.innerHTML = '';

    if (errores.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5">✅ Sin errores</td></tr>';
        return;
    }

    errores.forEach((err, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${err.tipo}</td>
            <td>${err.posicion}</td>
            <td>${err.token}</td>
            <td>${err.descripcion}</td>
        `;
        cuerpo.appendChild(tr);
    });
}
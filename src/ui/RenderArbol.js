// ============================================================
// RenderArbol.js — Renderizado visual del árbol de derivación
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── ESCAPAR HTML ─────────────────────────────────────────────
function escaparHTML(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─── RENDERIZAR MÚLTIPLES ÁRBOLES (párrafos) ─────────────────
export function renderizarArboles(arboles) {
    if (!arboles || arboles.length === 0) {
        return '<span class="placeholder-text">Sin árbol generado.</span>';
    }

    // Una sola oración — renderizar directo sin encabezado
    if (arboles.length === 1) {
        return renderizarArbol(arboles[0].arbol, true);
    }

    // Múltiples oraciones — una sección por oración
    return arboles.map(({ num, oracion, arbol, tipo, valido }) => {
        const estado    = valido ? '✅' : '❌';
        const tipoLabel = tipo   || 'ERROR';

        // Obtener la regla BNF del nodo raíz escapada
        const regla = arbol?.regla
            ? escaparHTML(Array.isArray(arbol.regla)
                ? arbol.regla.join(', ')
                : arbol.regla)
            : '';

        return `
            <div class="arbol-oracion">
                <div class="arbol-oracion-header">
                    <span class="arbol-num">Oración ${num}</span>
                    <span class="arbol-tipo">${tipoLabel}</span>
                    <span class="arbol-estado">${estado}</span>
                    <span class="arbol-texto">"${oracion}"</span>
                    ${regla ? `<span class="arbol-regla-header">${regla}</span>` : ''}
                </div>
                <div class="arbol-oracion-body">
                    ${renderizarArbol(arbol, true)}
                </div>
            </div>
        `;
    }).join('');
}

// ─── RENDERIZAR UN ÁRBOL INDIVIDUAL ──────────────────────────
export function renderizarArbol(nodo, esRaiz = true) {
    if (!nodo) {
        return '<span class="placeholder-text">Sin árbol generado.</span>';
    }

    const claseRaiz = esRaiz ? 'arbol-root arbol-nodo' : 'arbol-nodo';

    let html = `<div class="${claseRaiz}">`;
    html += `<span class="nodo-tipo">${nodo.tipo || ''}</span>`;

    if (nodo.token) {
        html += `<span class="nodo-token">"${nodo.token}"</span>`;
    }

    // Mostrar regla BNF solo en el nodo raíz
    if (nodo.regla && esRaiz) {
        const reglaTexto = escaparHTML(
            Array.isArray(nodo.regla)
                ? nodo.regla.join(', ')
                : nodo.regla
        );
        html += `<span class="nodo-regla"> — ${reglaTexto}</span>`;
    }

    if (nodo.hijos && nodo.hijos.length > 0) {
        html += `<div class="nodo-children">`;
        nodo.hijos.forEach(hijo => {
            html += renderizarArbol(hijo, false);
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}
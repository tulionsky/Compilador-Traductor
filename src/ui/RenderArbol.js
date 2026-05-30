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
        return renderizarConPestanas(arboles[0].arbol, null);
    }

    // Múltiples oraciones — una sección por oración
    return arboles.map(({ num, oracion, arbol, tipo, valido }) => {
        const estado    = valido ? '✅' : '❌';
        const tipoLabel = tipo   || 'ERROR';

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
                    ${renderizarConPestanas(arbol, num)}
                </div>
            </div>
        `;
    }).join('');
}

// ─── CONTENEDOR CON PESTAÑAS ──────────────────────────────────
function renderizarConPestanas(nodo, id) {
    const uid = id ?? 'unico';
    return `
        <div class="arbol-tabs-container" data-arbol-id="${uid}">
            <div class="arbol-tabs">
                <button class="arbol-tab activa" data-tab="texto" data-id="${uid}">
                    <span>⌨</span> Texto
                </button>
                <button class="arbol-tab" data-tab="grafico" data-id="${uid}">
                    <span>🌐</span> Gráfico
                </button>
            </div>
            <div class="arbol-panel-texto activo" data-panel="texto" data-id="${uid}">
                ${renderizarArbol(nodo, true)}
            </div>
            <div class="arbol-panel-grafico" data-panel="grafico" data-id="${uid}">
                <div class="arbol-svg-wrapper" id="arbol-svg-wrapper-${uid}">
                    <div class="arbol-svg-controles">
                        <button class="arbol-btn-zoom" data-action="zoom-in"  data-id="${uid}">＋</button>
                        <button class="arbol-btn-zoom" data-action="zoom-out" data-id="${uid}">－</button>
                        <button class="arbol-btn-zoom" data-action="reset"    data-id="${uid}">⌖</button>
                    </div>
                    <svg id="arbol-svg-${uid}" class="arbol-svg" xmlns="http://www.w3.org/2000/svg">
                        <g id="arbol-svg-g-${uid}"></g>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

// ─── RENDERIZAR UN ÁRBOL INDIVIDUAL (TEXTO) ───────────────────
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

// ─── LAYOUT DEL ÁRBOL GRÁFICO ────────────────────────────────
const NODE_W  = 110;
const NODE_H  = 38;
const GAP_Y   = 70;
const GAP_X   = 14;

function calcularLayout(nodo, depth = 0) {
    if (!nodo) return null;
    const hijos = (nodo.hijos || []).map(h => calcularLayout(h, depth + 1)).filter(Boolean);

    let width;
    if (hijos.length === 0) {
        width = NODE_W;
    } else {
        width = hijos.reduce((s, h) => s + h.width, 0) + GAP_X * (hijos.length - 1);
    }

    return { nodo, hijos, depth, width };
}

function asignarX(layout, startX = 0) {
    if (layout.hijos.length === 0) {
        layout.x = startX + layout.width / 2;
        return;
    }
    let cursor = startX;
    layout.hijos.forEach(h => {
        asignarX(h, cursor);
        cursor += h.width + GAP_X;
    });
    const first = layout.hijos[0].x;
    const last  = layout.hijos[layout.hijos.length - 1].x;
    layout.x = (first + last) / 2;
}

function renderizarNodosSVG(layout, svgG, colorFn) {
    const cx = layout.x;
    const cy = layout.depth * (NODE_H + GAP_Y) + NODE_H / 2 + 10;
    const label = layout.nodo.tipo || '';
    const token = layout.nodo.token || '';

    // Líneas a hijos
    layout.hijos.forEach(hijo => {
        const hx = hijo.x;
        const hy = hijo.depth * (NODE_H + GAP_Y) + NODE_H / 2 + 10;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy + NODE_H / 2);
        line.setAttribute('x2', hx);
        line.setAttribute('y2', hy - NODE_H / 2);
        line.setAttribute('stroke', 'rgba(124,58,237,0.4)');
        line.setAttribute('stroke-width', '1.5');
        svgG.appendChild(line);

        renderizarNodosSVG(hijo, svgG, colorFn);
    });

    // Rectángulo nodo
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', cx - NODE_W / 2);
    rect.setAttribute('y', cy - NODE_H / 2);
    rect.setAttribute('width', NODE_W);
    rect.setAttribute('height', NODE_H);
    rect.setAttribute('rx', 8);
    rect.setAttribute('fill', token ? 'rgba(6,182,212,0.12)' : 'rgba(124,58,237,0.15)');
    rect.setAttribute('stroke', token ? '#06B6D4' : '#7C3AED');
    rect.setAttribute('stroke-width', '1.2');
    svgG.appendChild(rect);

    // Texto tipo
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy - (token ? 5 : 0));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', token ? '#22D3EE' : '#9F5FFF');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-family', 'JetBrains Mono, monospace');
    text.setAttribute('font-weight', '600');
    text.textContent = label.length > 13 ? label.slice(0, 12) + '…' : label;
    svgG.appendChild(text);

    // Texto token
    if (token) {
        const ttoken = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        ttoken.setAttribute('x', cx);
        ttoken.setAttribute('y', cy + 9);
        ttoken.setAttribute('text-anchor', 'middle');
        ttoken.setAttribute('dominant-baseline', 'middle');
        ttoken.setAttribute('fill', '#F0F0FF');
        ttoken.setAttribute('font-size', '10');
        ttoken.setAttribute('font-family', 'JetBrains Mono, monospace');
        const tokenLabel = `"${token}"`;
        ttoken.textContent = tokenLabel.length > 14 ? tokenLabel.slice(0, 13) + '…"' : tokenLabel;
        svgG.appendChild(ttoken);
    }
}

function dibujarArbolSVG(nodo, uid) {
    const svg  = document.getElementById(`arbol-svg-${uid}`);
    const svgG = document.getElementById(`arbol-svg-g-${uid}`);
    if (!svg || !svgG) return;

    svgG.innerHTML = '';

    const layout = calcularLayout(nodo);
    if (!layout) return;

    asignarX(layout, 0);

    // Calcular dimensiones totales
    const totalW   = layout.width + NODE_W;
    const maxDepth = obtenerProfundidad(layout);
    const totalH   = (maxDepth + 1) * (NODE_H + GAP_Y) + 30;

    svg.setAttribute('width',  totalW);
    svg.setAttribute('height', totalH);
    svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);

    // Centrar layout
    const offsetX = (totalW - layout.width) / 2;
    desplazarLayout(layout, offsetX);

    renderizarNodosSVG(layout, svgG, null);

    // Inicializar pan/zoom
    inicializarPanZoom(svg, svgG, uid);
}

function obtenerProfundidad(layout) {
    if (!layout.hijos || layout.hijos.length === 0) return layout.depth;
    return Math.max(...layout.hijos.map(obtenerProfundidad));
}

function desplazarLayout(layout, dx) {
    layout.x += dx;
    layout.hijos.forEach(h => desplazarLayout(h, dx));
}

// ─── PAN & ZOOM ───────────────────────────────────────────────
function inicializarPanZoom(svg, svgG, uid) {
    let scale = 1, tx = 0, ty = 0;
    let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0;

    function applyTransform() {
        svgG.setAttribute('transform', `translate(${tx},${ty}) scale(${scale})`);
    }

    // Zoom con rueda
    svg.addEventListener('wheel', e => {
        e.preventDefault();
        const rect   = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta  = e.deltaY < 0 ? 1.12 : 0.89;
        const newScale = Math.min(4, Math.max(0.2, scale * delta));

        tx = mouseX - (mouseX - tx) * (newScale / scale);
        ty = mouseY - (mouseY - ty) * (newScale / scale);
        scale = newScale;
        applyTransform();
    }, { passive: false });

    // Pan con drag
    svg.addEventListener('mousedown', e => {
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        startTx = tx; startTy = ty;
        svg.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        tx = startTx + (e.clientX - startX);
        ty = startTy + (e.clientY - startY);
        applyTransform();
    });
    window.addEventListener('mouseup', () => {
        dragging = false;
        svg.style.cursor = 'grab';
    });

    // Touch pan
    let lastTouchX = 0, lastTouchY = 0;
    svg.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }
    }, { passive: true });
    svg.addEventListener('touchmove', e => {
        if (e.touches.length === 1) {
            tx += e.touches[0].clientX - lastTouchX;
            ty += e.touches[0].clientY - lastTouchY;
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
            applyTransform();
            e.preventDefault();
        }
    }, { passive: false });

    // Botones zoom/reset
    document.querySelectorAll(`.arbol-btn-zoom[data-id="${uid}"]`).forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'zoom-in')  { scale = Math.min(4,   scale * 1.25); }
            if (action === 'zoom-out') { scale = Math.max(0.2, scale * 0.8);  }
            if (action === 'reset')    { scale = 1; tx = 0; ty = 0; }
            applyTransform();
        });
    });

    svg.style.cursor = 'grab';
    applyTransform();
}

// ─── MANEJO DE PESTAÑAS (delegación global) ───────────────────
let tabListenerRegistrado = false;

export function registrarListenerPestanas() {
    if (tabListenerRegistrado) return;
    tabListenerRegistrado = false; // Permitir re-registro al redibujar

    document.getElementById('arbol-derivacion')?.addEventListener('click', e => {
        const tab = e.target.closest('.arbol-tab');
        if (!tab) return;

        const uid   = tab.dataset.id;
        const tipo  = tab.dataset.tab;
        const conte = tab.closest('.arbol-tabs-container');
        if (!conte) return;

        // Activar pestaña
        conte.querySelectorAll('.arbol-tab').forEach(t => t.classList.remove('activa'));
        tab.classList.add('activa');

        // Mostrar panel
        conte.querySelectorAll('[data-panel]').forEach(p => p.classList.remove('activo'));
        conte.querySelector(`[data-panel="${tipo}"][data-id="${uid}"]`)?.classList.add('activo');

        // Dibujar SVG la primera vez que se abre la pestaña gráfica
        if (tipo === 'grafico') {
            const wrapper = document.getElementById(`arbol-svg-wrapper-${uid}`);
            if (wrapper && !wrapper.dataset.dibujado) {
                wrapper.dataset.dibujado = '1';
                // Recuperar el nodo desde el store global
                const nodo = window._arbolesData?.[uid];
                if (nodo) dibujarArbolSVG(nodo, uid);
            }
        }
    });

    tabListenerRegistrado = true;
}

// ─── STORE GLOBAL DE NODOS ────────────────────────────────────
export function guardarNodosArbol(arboles) {
    window._arbolesData = {};
    if (!arboles || arboles.length === 0) return;
    if (arboles.length === 1) {
        window._arbolesData['unico'] = arboles[0].arbol;
    } else {
        arboles.forEach(({ num, arbol }) => {
            window._arbolesData[num] = arbol;
        });
    }
}
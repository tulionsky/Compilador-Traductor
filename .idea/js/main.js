// ============================================================
// main.js — Integración del Compilador
// Conecta: Léxico (Tulio) + Sintáctico (Melki) + Semántico + Traducción (Mijeli)
// ============================================================

// ─── VERBOS AUXILIARES ───────────────────────────────────────
const VERBOS_AUXILIARES = [
    'is','are','was','were','am',
    'do','does','did',
    'have','has','had',
    'will','would','shall','should',
    'can','could','may','might','must'
];

// ─── ADAPTADOR ───────────────────────────────────────────────
// Convierte tablaSimbolos de Tulio al formato que espera el parser de Melki
function adaptarTokens(tablaSimbolos) {
    return tablaSimbolos.map(fila => {
        let categoria = fila.categoria;

        // PUNTUACION → SIGNO_PUNTUACION
        if (categoria === 'PUNTUACION') {
            categoria = 'SIGNO_PUNTUACION';
        }

        // ADVERBIO_NEGACION (not, n't) → NEGACION
        if (categoria === 'ADVERBIO_NEGACION' &&
            (fila.lema === 'not' || fila.lema === "n't")) {
            categoria = 'NEGACION';
        }
        // Resto de adverbios → ADVERBIO genérico
        else if (categoria.startsWith('ADVERBIO_')) {
            categoria = 'ADVERBIO';
        }

        // Verbos auxiliares: Tulio los marca como VERBO, Melki necesita VERBO_AUXILIAR
        if (categoria === 'VERBO' &&
            VERBOS_AUXILIARES.includes(fila.lema.toLowerCase())) {
            categoria = 'VERBO_AUXILIAR';
        }

        return {
            token:     fila.token,
            lema:      fila.lema,
            categoria: categoria
        };
    });
}

// ─── RENDERIZAR TABLA DE SÍMBOLOS ────────────────────────────
function renderizarTablaSimbolos(tablaSimbolos) {
    const cuerpo = document.getElementById('cuerpo-tabla');
    cuerpo.innerHTML = '';

    tablaSimbolos.forEach(fila => {
        const chipClass = 'chip chip-' + fila.categoria;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fila.posicion}</td>
            <td>${fila.token}</td>
            <td>${fila.lema}</td>
            <td><span class="${chipClass}">${fila.categoria}</span></td>
            <td>${fila.numero}</td>
            <td>${fila.genero}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── RENDERIZAR TABLA DE ERRORES ─────────────────────────────
// Ahora recibe también errores semánticos (Mijeli)
function renderizarTablaErrores(erroresLexicos, erroresSintacticos, erroresSemanticos = []) {
    const cuerpo = document.getElementById('cuerpo-errores');
    cuerpo.innerHTML = '';

    const todosLosErrores = [
        ...erroresLexicos.map(e => ({
            tipo:        'LÉXICO',
            posicion:    e.posicion,
            token:       e.token,
            descripcion: e.descripcion,
            clase:       'error-lexico'
        })),
        ...erroresSintacticos.map(e => ({
            tipo:        'SINTÁCTICO',
            posicion:    e.posicion,
            token:       e.token,
            descripcion: e.mensaje,
            clase:       'error-sintactico'
        })),
        ...erroresSemanticos.map(e => ({
            tipo:        'SEMÁNTICO',
            posicion:    '-',
            token:       e.token_problematico || '-',
            descripcion: `[${e.regla}] ${e.descripcion}`,
            clase:       'error-semantico'
        }))
    ];

    if (todosLosErrores.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="5" class="placeholder-text">✅ Sin errores detectados</td></tr>';
        return;
    }

    todosLosErrores.forEach((err, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td class="${err.clase}">${err.tipo}</td>
            <td>${err.posicion}</td>
            <td>${err.token}</td>
            <td>${err.descripcion}</td>
        `;
        cuerpo.appendChild(tr);
    });
}

// ─── RENDERIZAR ÁRBOL DE DERIVACIÓN ──────────────────────────
function renderizarArbol(nodo, esRaiz = true) {
    if (!nodo) return '<span class="placeholder-text">Sin árbol generado.</span>';

    const claseRaiz = esRaiz ? 'arbol-root arbol-nodo' : 'arbol-nodo';

    let html = `<div class="${claseRaiz}">`;
    html += `<span class="nodo-tipo">${nodo.tipo || ''}</span>`;

    if (nodo.token) {
        html += `<span class="nodo-token">"${nodo.token}"</span>`;
    }

    if (nodo.regla && esRaiz) {
        html += `<span class="nodo-regla"> — ${nodo.regla}</span>`;
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

// ─── ESTADO DE FASE — muestra al usuario en qué fase está el análisis ──
function mostrarEstadoFase(mensaje, tipo = 'info') {
    const badge = document.getElementById('tipo-oracion-badge');
    const clases = { info: 'badge-analizando', valida: 'badge-valida', invalida: 'badge-invalida' };
    badge.innerHTML = `<span class="oracion-badge ${clases[tipo] || ''}">${mensaje}</span>`;
}

// ─── EVENTO PRINCIPAL ────────────────────────────────────────
document.getElementById('btn-analizar').addEventListener('click', async () => {
    const texto = document.getElementById('texto-entrada').value.trim();

    if (!texto) {
        alert('Escribe una oración primero.');
        return;
    }

    // Deshabilitar botón mientras se analiza
    const btnAnalizar = document.getElementById('btn-analizar');
    btnAnalizar.disabled = true;
    btnAnalizar.textContent = 'Analizando...';

    // Limpiar sugerencias y errores semánticos de la corrida anterior
    renderizarErroresSemanticos([], null);
    renderizarSugerencias([]);

    try {
        // ── FASE 1: LÉXICO (Tulio) ────────────────────────────
        mostrarEstadoFase('🔍 Fase 1/3 — Análisis léxico...', 'info');
        const { tablaSimbolos, errores: erroresLexicos } = analizarLexico(texto);
        renderizarTablaSimbolos(tablaSimbolos);

        // ── FASE 2: SINTÁCTICO (Melki) ────────────────────────
        mostrarEstadoFase('🔍 Fase 2/3 — Análisis sintáctico...', 'info');
        const tokensAdaptados = adaptarTokens(tablaSimbolos);
        const analizador      = new AnalizadorSintactico();
        const resultadoSint   = analizador.analizar(tokensAdaptados);

        // Renderizar árbol de derivación
        document.getElementById('arbol-derivacion').innerHTML = renderizarArbol(resultadoSint.arbol);

        // Si hay errores léxicos o sintácticos, detenemos aquí
        if (erroresLexicos.length > 0 || !resultadoSint.valido) {
            renderizarTablaErrores(erroresLexicos, resultadoSint.errores, []);
            mostrarEstadoFase('❌ Errores en análisis léxico/sintáctico — se omiten fases 3 y 4', 'invalida');
            document.getElementById('texto-salida').value = '';
            return;
        }

        // ── FASE 3: SEMÁNTICO (Mijeli) ────────────────────────
        mostrarEstadoFase('🔍 Fase 3/3 — Análisis semántico (Gemini)...', 'info');
        const resultadoSem = await analizarSemantico(texto, tablaSimbolos, resultadoSint.tipo);

        // Renderizar errores semánticos y sugerencias
        renderizarErroresSemanticos(resultadoSem.errores, resultadoSem.advertencia || null);
        renderizarSugerencias(resultadoSem.sugerencias);

        // Tabla unificada de errores (léxico + sintáctico + semántico)
        renderizarTablaErrores(erroresLexicos, resultadoSint.errores, resultadoSem.errores);

        if (!resultadoSem.valido) {
            mostrarEstadoFase(`❌ ${resultadoSint.tipo} — Errores semánticos detectados`, 'invalida');
            document.getElementById('texto-salida').value = '';
            return;
        }

        // ── FASE 4: TRADUCCIÓN (Mijeli) ───────────────────────
        mostrarEstadoFase(`✅ ${resultadoSint.tipo} — Traduciendo...`, 'info');
        await traducir(texto);
        mostrarEstadoFase(`✅ ${resultadoSint.tipo} — Oración válida`, 'valida');

        // Log en consola para debugging
        console.log('─── RESULTADO LÉXICO ───');
        console.log('Tabla de símbolos:', tablaSimbolos);
        console.log('Errores léxicos:', erroresLexicos);
        console.log('─── RESULTADO SINTÁCTICO ───');
        console.log('Tipo:', resultadoSint.tipo);
        console.log('Válida:', resultadoSint.valido);
        console.log('Árbol:', resultadoSint.arbol);
        console.log('─── RESULTADO SEMÁNTICO ───');
        console.log('Válido:', resultadoSem.valido);
        console.log('Errores:', resultadoSem.errores);
        console.log('Sugerencias:', resultadoSem.sugerencias);

    } finally {
        // Rehabilitar botón siempre, aunque haya error
        btnAnalizar.disabled = false;
        btnAnalizar.textContent = 'Analizar';
    }
});

// ─── TRADUCCIÓN (MyMemory API) ────────────────────────────────
async function traducir(texto) {
    const salidaTextarea = document.getElementById('texto-salida');
    salidaTextarea.value = 'Traduciendo...';

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`;
        const res  = await fetch(url);
        const data = await res.json();
        const traduccion = data.responseData?.translatedText || 'No se pudo traducir.';
        salidaTextarea.value = traduccion;
    } catch (e) {
        salidaTextarea.value = 'Error al conectar con la API de traducción.';
        console.error('Error de traducción:', e);
    }
}

// ─── BOTÓN LIMPIAR ────────────────────────────────────────────
document.getElementById('btn-limpiar').addEventListener('click', () => {
    document.getElementById('texto-entrada').value        = '';
    document.getElementById('texto-salida').value         = '';
    document.getElementById('cuerpo-tabla').innerHTML     = '<tr><td colspan="6" class="placeholder-text">Sin datos aún.</td></tr>';
    document.getElementById('cuerpo-errores').innerHTML   = '<tr><td colspan="5" class="placeholder-text">Sin errores detectados.</td></tr>';
    document.getElementById('arbol-derivacion').innerHTML = '<p class="placeholder-text">El árbol aparecerá aquí después de analizar.</p>';
    document.getElementById('tipo-oracion-badge').innerHTML = '';

    // Limpiar secciones semánticas (Mijeli)
    renderizarErroresSemanticos([], null);
    renderizarSugerencias([]);
});
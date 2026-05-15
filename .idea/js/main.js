// ============================================================
// main.js — Integración del Compilador
// Conecta: Léxico (Tulio) + Sintáctico (Melki)
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
function renderizarTablaErrores(erroresLexicos, erroresSintacticos) {
    const cuerpo = document.getElementById('cuerpo-errores');
    cuerpo.innerHTML = '';

    const todosLosErrores = [
        ...erroresLexicos.map(e => ({
            tipo: 'LÉXICO',
            posicion: e.posicion,
            token: e.token,
            descripcion: e.descripcion,
            clase: 'error-lexico'
        })),
        ...erroresSintacticos.map(e => ({
            tipo: 'SINTÁCTICO',
            posicion: e.posicion,
            token: e.token,
            descripcion: e.mensaje,
            clase: 'error-sintactico'
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

// ─── EVENTO PRINCIPAL ────────────────────────────────────────
document.getElementById('btn-analizar').addEventListener('click', () => {
    const texto = document.getElementById('texto-entrada').value.trim();

    if (!texto) {
        alert('Escribe una oración primero.');
        return;
    }

    // 1. LÉXICO (Tulio)
    const { tablaSimbolos, errores: erroresLexicos } = analizarLexico(texto);
    renderizarTablaSimbolos(tablaSimbolos);

    // 2. SINTÁCTICO (Melki)
    const tokensAdaptados = adaptarTokens(tablaSimbolos);
    const analizador      = new AnalizadorSintactico();
    const resultadoSint   = analizador.analizar(tokensAdaptados);

    // Renderizar tabla de errores (léxicos + sintácticos juntos)
    renderizarTablaErrores(erroresLexicos, resultadoSint.errores);

    // Renderizar árbol de derivación
    const contenedorArbol = document.getElementById('arbol-derivacion');
    contenedorArbol.innerHTML = renderizarArbol(resultadoSint.arbol);

    // Mostrar badge del tipo de oración
    const badgeContainer = document.getElementById('tipo-oracion-badge');
    if (resultadoSint.valido) {
        badgeContainer.innerHTML = `
            <span class="oracion-badge badge-valida">
                ✅ ${resultadoSint.tipo} — Oración válida
            </span>`;
        // Traducción: solo si no hay errores léxicos ni sintácticos
        if (erroresLexicos.length === 0) {
            traducir(texto);
        }
    } else {
        badgeContainer.innerHTML = `
            <span class="oracion-badge badge-invalida">
                ❌ Errores sintácticos detectados
            </span>`;
        document.getElementById('texto-salida').value = '';
    }

    // Log en consola para debugging
    console.log('─── RESULTADO LÉXICO ───');
    console.log('Tabla de símbolos:', tablaSimbolos);
    console.log('Errores léxicos:', erroresLexicos);
    console.log('─── RESULTADO SINTÁCTICO ───');
    console.log('Tipo:', resultadoSint.tipo);
    console.log('Válida:', resultadoSint.valido);
    console.log('Árbol:', resultadoSint.arbol);
    console.log('Errores sintácticos:', resultadoSint.errores);
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
    document.getElementById('texto-entrada').value      = '';
    document.getElementById('texto-salida').value       = '';
    document.getElementById('cuerpo-tabla').innerHTML   = '<tr><td colspan="6" class="placeholder-text">Sin datos aún.</td></tr>';
    document.getElementById('cuerpo-errores').innerHTML = '<tr><td colspan="5" class="placeholder-text">Sin errores detectados.</td></tr>';
    document.getElementById('arbol-derivacion').innerHTML = '<p class="placeholder-text">El árbol aparecerá aquí después de analizar.</p>';
    document.getElementById('tipo-oracion-badge').innerHTML = '';
});

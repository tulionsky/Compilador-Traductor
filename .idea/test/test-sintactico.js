// test/test-sintactico.js
// Pruebas del Analizador Sintáctico — Autor: Melki

// Simular tokens como los que enviará Tulio desde el léxico
// Al inicio de test-sintactico.js
const { AnalizadorSintactico } = require('../js/sintactico.js');
const casosDePrueba = [
    {
        descripcion: "✅ Declarativa simple",
        tokens: [
            { token: "The",  categoria: "ARTICULO",         lema: "the"  },
            { token: "cat",  categoria: "SUSTANTIVO",        lema: "cat"  },
            { token: "runs", categoria: "VERBO",             lema: "run"  },
            { token: "fast", categoria: "ADVERBIO",          lema: "fast" }
        ],
        esperado: { valido: true, tipo: "DECLARATIVA" }
    },
    {
        descripcion: "✅ Negativa",
        tokens: [
            { token: "The",  categoria: "ARTICULO",      lema: "the"  },
            { token: "dog",  categoria: "SUSTANTIVO",     lema: "dog"  },
            { token: "does", categoria: "VERBO_AUXILIAR", lema: "do"   },
            { token: "not",  categoria: "NEGACION",       lema: "not"  },
            { token: "eat",  categoria: "VERBO",          lema: "eat"  }
        ],
        esperado: { valido: true, tipo: "NEGATIVA" }
    },
    {
        descripcion: "✅ Interrogativa",
        tokens: [
            { token: "Does", categoria: "VERBO_AUXILIAR", lema: "do"  },
            { token: "the",  categoria: "ARTICULO",       lema: "the" },
            { token: "cat",  categoria: "SUSTANTIVO",     lema: "cat" },
            { token: "run",  categoria: "VERBO",          lema: "run" },
            { token: "?",    categoria: "SIGNO_PUNTUACION", lema: "?" }
        ],
        esperado: { valido: true, tipo: "INTERROGATIVA" }
    },
    {
        descripcion: "❌ Error — sujeto después del auxiliar",
        tokens: [
            { token: "cat",  categoria: "SUSTANTIVO",     lema: "cat" },
            { token: "the",  categoria: "ARTICULO",       lema: "the" },
            { token: "runs", categoria: "VERBO",          lema: "run" }
        ],
        esperado: { valido: false }
    },
    {
        descripcion: "✅ Exclamativa con What",
        tokens: [
            { token: "What",      categoria: "PRONOMBRE_INTERROGATIVO", lema: "what" },
            { token: "a",         categoria: "ARTICULO",                lema: "a"    },
            { token: "beautiful", categoria: "ADJETIVO",                lema: "beautiful" },
            { token: "day",       categoria: "SUSTANTIVO",              lema: "day"  },
            { token: "!",         categoria: "SIGNO_PUNTUACION",        lema: "!"    }
        ],
        esperado: { valido: true, tipo: "EXCLAMATIVA" }
    },
    {
        descripcion: "✅ Subordinada con 'because'",
        tokens: [
            { token: "I",       categoria: "PRONOMBRE_PERSONAL",       lema: "i"       },
            { token: "study",   categoria: "VERBO",                    lema: "study"   },
            { token: "because", categoria: "CONJUNCION_SUBORDINANTE",  lema: "because" },
            { token: "I",       categoria: "PRONOMBRE_PERSONAL",       lema: "i"       },
            { token: "learn",   categoria: "VERBO",                    lema: "learn"   }
        ],
        esperado: { valido: true, tipo: "SUBORDINADA" }
    },
    {
        descripcion: "❌ Interrogativa sin signo de pregunta",
        tokens: [
            { token: "Does", categoria: "VERBO_AUXILIAR", lema: "do"  },
            { token: "the",  categoria: "ARTICULO",       lema: "the" },
            { token: "cat",  categoria: "SUSTANTIVO",     lema: "cat" },
            { token: "run",  categoria: "VERBO",          lema: "run" }
        ],
        esperado: { valido: false, tipo: "INTERROGATIVA" }
    },
    {
        descripcion: "✅ Compuesta con 'and'",
        tokens: [
            { token: "The",    categoria: "ARTICULO",             lema: "the"    },
            { token: "cat",    categoria: "SUSTANTIVO",           lema: "cat"    },
            { token: "runs",   categoria: "VERBO",                lema: "run"    },
            { token: "and",    categoria: "CONJUNCION_COORDINANTE", lema: "and"  },
            { token: "the",    categoria: "ARTICULO",             lema: "the"    },
            { token: "dog",    categoria: "SUSTANTIVO",           lema: "dog"    },
            { token: "sleeps", categoria: "VERBO",                lema: "sleep"  }
        ],
        esperado: { valido: true, tipo: "COMPUESTA" }
    }
];

// Ejecutar pruebas
const analizador = new AnalizadorSintactico();

casosDePrueba.forEach((caso, i) => {
    const resultado = analizador.analizar(caso.tokens);
    const paso = resultado.valido === caso.esperado.valido &&
        (!caso.esperado.tipo || resultado.tipo === caso.esperado.tipo);

    console.log(`[Prueba ${i+1}] ${caso.descripcion}`);
    console.log(`  Esperado: valido=${caso.esperado.valido}, tipo=${caso.esperado.tipo || "cualquiera"}`);
    console.log(`  Obtenido: valido=${resultado.valido}, tipo=${resultado.tipo}`);
    console.log(`  Resultado: ${paso ? "✅ PASÓ" : "❌ FALLÓ"}`);
    if (!paso || resultado.errores.length > 0) {
        console.log("  Errores:", resultado.errores);
    }
    console.log("---");
});
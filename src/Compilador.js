// ============================================================
// Compilador.js — Orquestador principal
// Coordina: Léxico → Sintáctico → Semántico → Traducción
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { analizarLexico }       from './lexico/Lexer.js';
import { AnalizadorSintactico } from './sintactico/Parser.js';
import { segmentarOraciones }   from './sintactico/Segmentador.js';
import { analizarSemantico }    from './semantico/Semantico.js';
import { TablaSimbolos }        from './data/TablaSimbolos.js';
import { TablaErrores }         from './data/TablaErrores.js';

// ─── AUXILIARES PUROS EN INGLÉS ───────────────────────────────
// have/has/had NO están aquí — pueden ser verbos principales
const SOLO_AUXILIARES_EN = [
    'is','are','was','were','am','be','been','being',
    'do','does','did',
    'will','would','shall','should',
    'can','could','may','might','must'
];

// ─── AUXILIARES EN ESPAÑOL ────────────────────────────────────
const AUXILIARES_ES = [
    'es','son','era','eran','fue','fueron','será','serán',
    'soy','somos','sois','eres','sido','siendo',
    'estoy','estás','está','estamos','estáis','están',
    'estaba','estaban','estuvo','estuvieron',
    'he','ha','hemos','habéis','han',
    'había','habían','hubo'
];

// ─── ADAPTADOR DE TOKENS ──────────────────────────────────────
function adaptarTokens(tablaSimbolos, idioma) {
    return tablaSimbolos.map((fila, index) => {
        let categoria = fila.categoria;

        // SUSTANTIVO_PROPIO → SUSTANTIVO para el parser
        if (categoria === 'SUSTANTIVO_PROPIO') {
            categoria = 'SUSTANTIVO';
        }

        // ADVERBIO_NEGACION → NEGACION
        if (categoria === 'ADVERBIO_NEGACION' &&
            ['not', "n't", 'no', 'nunca', 'jamás', 'tampoco'].includes(fila.lema)) {
            categoria = 'NEGACION';
        } else if (categoria.startsWith('ADVERBIO_')) {
            categoria = 'ADVERBIO';
        }

        if (idioma === 'en') {
            // Auxiliares puros → siempre VERBO_AUXILIAR
            if (categoria === 'VERBO' &&
                SOLO_AUXILIARES_EN.includes(fila.lema.toLowerCase())) {
                categoria = 'VERBO_AUXILIAR';
            }

            // have/has/had → VERBO_AUXILIAR solo si el siguiente token es VERBO
            // Ej: "She has studied" → auxiliar
            // Ej: "I have a apple" → verbo principal
            if (['have', 'has', 'had'].includes(fila.lema.toLowerCase()) &&
                (categoria === 'VERBO' || categoria === 'VERBO_AUXILIAR')) {
                const siguiente = tablaSimbolos[index + 1];
                if (siguiente && siguiente.categoria === 'VERBO') {
                    categoria = 'VERBO_AUXILIAR';
                } else {
                    categoria = 'VERBO';
                }
            }
        }

        if (idioma === 'es') {
            // Auxiliares en español → VERBO_AUXILIAR
            if (categoria === 'VERBO' &&
                AUXILIARES_ES.includes(fila.lema.toLowerCase())) {
                categoria = 'VERBO_AUXILIAR';
            }
        }

        return { token: fila.token, lema: fila.lema, categoria };
    });
}

// ─── CLASE PRINCIPAL ──────────────────────────────────────────
export class Compilador {

    constructor() {
        this.tablaSimbolos = new TablaSimbolos();
        this.tablaErrores  = new TablaErrores();
        this.resultados    = [];
    }

    async compilar(texto, idioma = 'en', onFase) {
        this.tablaSimbolos.limpiar();
        this.tablaErrores.limpiar();
        this.resultados = [];

        const oraciones = segmentarOraciones(texto);

        if (oraciones.length === 0) {
            onFase('❌ No se encontraron oraciones válidas', 'invalida');
            return this._resultadoFinal('VACÍO');
        }

        onFase(`🔍 Analizando ${oraciones.length} oración(es)...`, 'info');

        let hayErroresLexicos     = false;
        let hayErroresSintacticos = false;
        let hayErroresSemanticos  = false;

        for (let i = 0; i < oraciones.length; i++) {
            const oracion = oraciones[i];
            const num     = i + 1;

            // ── FASE 1: LÉXICO ────────────────────────────────
            onFase(`🔍 Oración ${num}/${oraciones.length} — Análisis léxico...`, 'info');
            const { tablaSimbolos, errores: erroresLex } = analizarLexico(oracion, idioma);

            const filasConNum   = tablaSimbolos.map(f => ({ ...f, oracion: num }));
            const erroresLexNum = erroresLex.map(e => ({
                ...e,
                descripcion: `[Oración ${num}] ${e.descripcion}`
            }));

            this.tablaSimbolos.agregarVarias(filasConNum);
            this.tablaErrores.agregarVarios(erroresLexNum);

            if (erroresLex.length > 0) {
                hayErroresLexicos = true;
                this.resultados.push({
                    oracion, num,
                    arbol: null, tipo: null,
                    valido: false, fase: 'LÉXICO',
                    erroresSemanticos: [], sugerencias: [],
                    oracionCorregida: null
                });
                continue;
            }

            // ── FASE 2: SINTÁCTICO ────────────────────────────
            onFase(`🔍 Oración ${num}/${oraciones.length} — Análisis sintáctico...`, 'info');
            const tokensAdaptados = adaptarTokens(tablaSimbolos, idioma);
            const parser          = new AnalizadorSintactico();
            const resultadoSint   = parser.analizar(tokensAdaptados, idioma);

            const erroresSintNum = resultadoSint.errores.map(e => ({
                ...e,
                descripcion: `[Oración ${num}] ${e.descripcion}`
            }));
            this.tablaErrores.agregarVarios(erroresSintNum);

            if (!resultadoSint.valido) {
                hayErroresSintacticos = true;
                this.resultados.push({
                    oracion, num,
                    arbol:  resultadoSint.arbol,
                    tipo:   resultadoSint.tipo,
                    valido: false, fase: 'SINTÁCTICO',
                    erroresSemanticos: [], sugerencias: [],
                    oracionCorregida: null
                });
                continue;
            }

            // ── FASE 3: SEMÁNTICO ─────────────────────────────
            onFase(`🔍 Oración ${num}/${oraciones.length} — Análisis semántico...`, 'info');
            const resultadoSem = await analizarSemantico(
                oracion,
                tablaSimbolos,
                resultadoSint.tipo,
                idioma
            );

            const erroresSemNum = resultadoSem.errores.map(e => ({
                tipo:        'SEMÁNTICO',
                posicion:    '-',
                token:       e.token_problematico || '-',
                descripcion: `[Oración ${num}] [${e.regla}] ${e.descripcion}`,
                sugerencia:  '-'
            }));
            this.tablaErrores.agregarVarios(erroresSemNum);

            if (!resultadoSem.valido) {
                hayErroresSemanticos = true;
                this.resultados.push({
                    oracion, num,
                    arbol:  resultadoSint.arbol,
                    tipo:   resultadoSint.tipo,
                    valido: false, fase: 'SEMÁNTICO',
                    erroresSemanticos: resultadoSem.errores,
                    sugerencias:       resultadoSem.sugerencias,
                    oracionCorregida:  resultadoSem.oracionCorregida,
                    advertencia:       resultadoSem.advertencia || null
                });
                continue;
            }

            // ── FASE 4: TRADUCCIÓN (pendiente) ────────────────
            this.resultados.push({
                oracion, num,
                arbol:  resultadoSint.arbol,
                tipo:   resultadoSint.tipo,
                valido: true, fase: 'COMPLETO',
                erroresSemanticos: [],
                sugerencias:       resultadoSem.sugerencias,
                oracionCorregida:  resultadoSem.oracionCorregida,
                advertencia:       resultadoSem.advertencia || null
            });
        }

        // ── ESTADO FINAL ──────────────────────────────────────
        if (hayErroresLexicos) {
            onFase('❌ Errores léxicos detectados', 'invalida');
        } else if (hayErroresSintacticos) {
            onFase('❌ Errores sintácticos detectados', 'invalida');
        } else if (hayErroresSemanticos) {
            onFase('❌ Errores semánticos detectados', 'invalida');
        } else {
            const tipos = this.resultados.map(r => r.tipo).join(' | ');
            onFase(`✅ ${tipos} — Listo (traducción pendiente)`, 'valida');
        }

        return this._resultadoFinal('COMPLETO');
    }

    _resultadoFinal(faseDetenida) {
        const todosErroresSem  = this.resultados.flatMap(r => r.erroresSemanticos || []);
        const todasSugerencias = this.resultados.flatMap(r => r.sugerencias       || []);
        const advertencia      = this.resultados.find(r => r.advertencia)?.advertencia || null;

        return {
            faseDetenida,
            tablaSimbolos:        this.tablaSimbolos.obtener(),
            tablaErrores:         this.tablaErrores.obtener(),
            resultadosPorOracion: this.resultados,
            arboles:              this.resultados.map(r => ({
                num:     r.num,
                oracion: r.oracion,
                arbol:   r.arbol,
                tipo:    r.tipo,
                valido:  r.valido
            })),
            erroresSemanticos: todosErroresSem,
            sugerencias:       todasSugerencias,
            advertencia,
            traduccion:        null
        };
    }
}
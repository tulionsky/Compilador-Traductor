// ============================================================
// Compilador.js — Orquestador principal
// Coordina: Léxico → Sintáctico → Semántico → Traducción
// Soporta: oraciones individuales, párrafos y archivos .txt
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { analizarLexico }       from './lexico/Lexer.js';
import { AnalizadorSintactico } from './sintactico/Parser.js';
import { segmentarOraciones }   from './sintactico/Segmentador.js';
import { TablaSimbolos }        from './data/TablaSimbolos.js';
import { TablaErrores }         from './data/TablaErrores.js';

// ─── VERBOS AUXILIARES ────────────────────────────────────────
const VERBOS_AUXILIARES_EN = [
    'is','are','was','were','am','be','been','being',
    'do','does','did','done',
    'have','has','had',
    'will','would','shall','should',
    'can','could','may','might','must'
];

const VERBOS_AUXILIARES_ES = [
    'es','son','era','eran','fue','fueron','será','serán',
    'soy','somos','sois','eres','sido','siendo',
    'estoy','estás','está','estamos','estáis','están',
    'estaba','estaban','estuvo','estuvieron',
    'he','has','ha','hemos','habéis','han',
    'había','habían','hubo',
    'tengo','tienes','tiene','tenemos','tenéis','tienen'
];

// ─── ADAPTADOR DE TOKENS ──────────────────────────────────────
function adaptarTokens(tablaSimbolos, idioma) {
    const auxiliares = idioma === 'en'
        ? VERBOS_AUXILIARES_EN
        : VERBOS_AUXILIARES_ES;

    return tablaSimbolos.map(fila => {
        let categoria = fila.categoria;

        // SUSTANTIVO_PROPIO → SUSTANTIVO para el parser
        if (categoria === 'SUSTANTIVO_PROPIO') {
            categoria = 'SUSTANTIVO';
        }

        // ADVERBIO_NEGACION → NEGACION
        if (categoria === 'ADVERBIO_NEGACION' &&
            ['not', "n't", 'no', 'nunca', 'jamás', 'tampoco'].includes(fila.lema)) {
            categoria = 'NEGACION';
        }
        // Resto de adverbios → ADVERBIO genérico
        else if (categoria.startsWith('ADVERBIO_')) {
            categoria = 'ADVERBIO';
        }

        // Verbos auxiliares
        if (categoria === 'VERBO' &&
            auxiliares.includes(fila.lema.toLowerCase())) {
            categoria = 'VERBO_AUXILIAR';
        }

        return {
            token:     fila.token,
            lema:      fila.lema,
            categoria: categoria
        };
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

        for (let i = 0; i < oraciones.length; i++) {
            const oracion = oraciones[i];
            const num     = i + 1;

            // ── FASE 1: LÉXICO ────────────────────────────────
            onFase(`🔍 Oración ${num}/${oraciones.length} — Análisis léxico...`, 'info');
            const { tablaSimbolos, errores: erroresLex } = analizarLexico(oracion, idioma);

            const filasConNum   = tablaSimbolos.map(f => ({ ...f, oracion: num }));
            const erroresConNum = erroresLex.map(e => ({
                ...e,
                descripcion: `[Oración ${num}] ${e.descripcion}`
            }));

            this.tablaSimbolos.agregarVarias(filasConNum);
            this.tablaErrores.agregarVarios(erroresConNum);

            if (erroresLex.length > 0) {
                hayErroresLexicos = true;
                this.resultados.push({
                    oracion, num,
                    arbol: null, tipo: null,
                    valido: false, fase: 'LÉXICO'
                });
                continue;
            }

            // ── FASE 2: SINTÁCTICO ────────────────────────────
            onFase(`🔍 Oración ${num}/${oraciones.length} — Análisis sintáctico...`, 'info');
            const tokensAdaptados = adaptarTokens(tablaSimbolos, idioma);
            const parser          = new AnalizadorSintactico();
            const resultadoSint   = parser.analizar(tokensAdaptados, idioma);

            const erroresSintConNum = resultadoSint.errores.map(e => ({
                ...e,
                descripcion: `[Oración ${num}] ${e.descripcion}`
            }));
            this.tablaErrores.agregarVarios(erroresSintConNum);

            if (!resultadoSint.valido) {
                hayErroresSintacticos = true;
                this.resultados.push({
                    oracion, num,
                    arbol:  resultadoSint.arbol,
                    tipo:   resultadoSint.tipo,
                    valido: false, fase: 'SINTÁCTICO'
                });
                continue;
            }

            this.resultados.push({
                oracion, num,
                arbol:  resultadoSint.arbol,
                tipo:   resultadoSint.tipo,
                valido: true, fase: 'COMPLETO'
            });
        }

        // ── FASE 3: SEMÁNTICO (pendiente — Mijeli) ────────────
        // TODO: implementar analizarSemantico()

        // ── FASE 4: TRADUCCIÓN (pendiente — Mijeli) ───────────
        // TODO: implementar traducir()

        if (hayErroresLexicos) {
            onFase('❌ Errores léxicos detectados', 'invalida');
        } else if (hayErroresSintacticos) {
            onFase('❌ Errores sintácticos detectados', 'invalida');
        } else {
            const tipos = this.resultados.map(r => r.tipo).join(' | ');
            onFase(`✅ ${tipos} — Listo (semántico y traducción pendientes)`, 'valida');
        }

        console.log('Resultados por oración:', this.resultados);
        console.log('Primer arbol:', this.resultados[0]?.arbol);

        return this._resultadoFinal('COMPLETO');
    }

    _resultadoFinal(faseDetenida) {
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
            traduccion:        null,
            erroresSemanticos: [],
            sugerencias:       []
        };
    }
}
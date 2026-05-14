// data/bnf-rules.js
// Reglas BNF del compilador traductor Inglés-Español
// Autor: Melki — Análisis Sintáctico

const BNF_RULES = {

    /*
     * ORACIÓN DECLARATIVA (afirmativa simple)
     * Ejemplo: "The cat runs fast"
     * Regla: <oracion_declarativa> ::= <sujeto> <predicado>
     *        <sujeto>    ::= [ARTICULO] SUSTANTIVO | PRONOMBRE_PERSONAL
     *        <predicado> ::= VERBO [ADVERBIO] [<objeto>]
     *        <objeto>    ::= [ARTICULO] SUSTANTIVO [ADJETIVO]
     */
    DECLARATIVA: {
        nombre: "Oración Declarativa",
        ejemplo_valido: "The cat runs fast",
        ejemplo_invalido: "Cat the runs",
        patron: ["SUJETO", "PREDICADO"]
    },

    /*
     * ORACIÓN NEGATIVA
     * Ejemplo: "The dog does not eat"
     * Regla: <oracion_negativa> ::= <sujeto> <auxiliar_negativo> VERBO [<objeto>]
     *        <auxiliar_negativo> ::= (do|does|did|is|are|was|were) (not|n't)
     */
    NEGATIVA: {
        nombre: "Oración Negativa",
        ejemplo_valido: "The dog does not eat",
        ejemplo_invalido: "The dog not does eat",
        patron: ["SUJETO", "AUXILIAR", "NEGACION", "VERBO"]
    },

    /*
     * ORACIÓN INTERROGATIVA
     * Ejemplo: "Does the cat run?"
     * Regla: <oracion_interrogativa> ::= <auxiliar> <sujeto> VERBO [<objeto>] SIGNO_PREGUNTA
     */
    INTERROGATIVA: {
        nombre: "Oración Interrogativa",
        ejemplo_valido: "Does the cat run?",
        ejemplo_invalido: "The cat does run?",
        patron: ["AUXILIAR", "SUJETO", "VERBO", "SIGNO_PREGUNTA"]
    },

    /*
     * ORACIÓN EXCLAMATIVA
     * Ejemplo: "What a beautiful day!"
     * Regla: <oracion_exclamativa> ::= (What|How) [ARTICULO] [ADJETIVO] SUSTANTIVO SIGNO_EXCLAMACION
     *                                | INTERJECCIÓN SIGNO_EXCLAMACION
     */
    EXCLAMATIVA: {
        nombre: "Oración Exclamativa",
        ejemplo_valido: "What a beautiful day!",
        ejemplo_invalido: "Beautiful what day!",
        patron: ["EXCLAMACION_INICIO", "SUJETO", "SIGNO_EXCLAMACION"]
    },

    /*
     * ORACIÓN COMPUESTA (coordinada)
     * Ejemplo: "The cat runs and the dog sleeps"
     * Regla: <oracion_compuesta> ::= <oracion_simple> CONJUNCION_COORD <oracion_simple>
     */
    COMPUESTA: {
        nombre: "Oración Compuesta",
        ejemplo_valido: "The cat runs and the dog sleeps",
        ejemplo_invalido: "The cat runs the dog and sleeps",
        patron: ["ORACION_SIMPLE", "CONJUNCION_COORDINANTE", "ORACION_SIMPLE"]
    },

    /*
     * ORACIÓN SUBORDINADA
     * Ejemplo: "I study because I want to learn"
     * Regla: <oracion_subordinada> ::= <oracion_principal> CONJUNCION_SUB <oracion_secundaria>
     */
    SUBORDINADA: {
        nombre: "Oración Subordinada",
        ejemplo_valido: "I study because I want to learn",
        ejemplo_invalido: "Because I study I want to learn",
        patron: ["ORACION_PRINCIPAL", "CONJUNCION_SUBORDINANTE", "ORACION_SECUNDARIA"]
    }
};
// ============================================================
// BnfRules.js — Reglas BNF para inglés y español
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

export const BNF_EN = {
    DECLARATIVA: {
        nombre:           "Declarative Sentence",
        ejemplo_valido:   "The cat runs fast",
        ejemplo_invalido: "Cat the runs",
        regla:            "<sentence> ::= <subject> <predicate>",
        patron:           ["SUJETO", "PREDICADO"]
    },
    NEGATIVA: {
        nombre:           "Negative Sentence",
        ejemplo_valido:   "The dog does not eat",
        ejemplo_invalido: "The dog not does eat",
        regla:            "<sentence> ::= <subject> <aux> <neg> <verb> [<object>]",
        patron:           ["SUJETO", "AUXILIAR", "NEGACION", "VERBO"]
    },
    INTERROGATIVA: {
        nombre:           "Interrogative Sentence",
        ejemplo_valido:   "Does the cat run?",
        ejemplo_invalido: "The cat does run?",
        regla:            "<sentence> ::= <aux> <subject> <verb> [<object>] '?'",
        patron:           ["AUXILIAR", "SUJETO", "VERBO", "SIGNO_PREGUNTA"]
    },
    EXCLAMATIVA: {
        nombre:           "Exclamatory Sentence",
        ejemplo_valido:   "What a beautiful day!",
        ejemplo_invalido: "Beautiful what day!",
        regla:            "<sentence> ::= (What|How) [ART] [ADJ] NOUN '!'",
        patron:           ["EXCLAMACION_INICIO", "SUJETO", "SIGNO_EXCLAMACION"]
    },
    COMPUESTA: {
        nombre:           "Compound Sentence",
        ejemplo_valido:   "The cat runs and the dog sleeps",
        ejemplo_invalido: "The cat runs the dog and sleeps",
        regla:            "<sentence> ::= <simple> CONJ_COORD <simple>",
        patron:           ["ORACION_SIMPLE", "CONJUNCION_COORDINANTE", "ORACION_SIMPLE"]
    },
    SUBORDINADA: {
        nombre:           "Complex Sentence",
        ejemplo_valido:   "I study because I want to learn",
        ejemplo_invalido: "Because I study I want",
        regla:            "<sentence> ::= <main> CONJ_SUB <secondary>",
        patron:           ["ORACION_PRINCIPAL", "CONJUNCION_SUBORDINANTE", "ORACION_SECUNDARIA"]
    }
};

export const BNF_ES = {
    DECLARATIVA: {
        nombre:           "Oración Declarativa",
        ejemplo_valido:   "El gato corre rápido",
        ejemplo_invalido: "Gato el corre",
        regla:            "<oracion> ::= <sujeto> <predicado>",
        patron:           ["SUJETO", "PREDICADO"]
    },
    NEGATIVA: {
        nombre:           "Oración Negativa",
        ejemplo_valido:   "El gato no corre",
        ejemplo_invalido: "El gato corre no",
        regla:            "<oracion> ::= <sujeto> NEG <verbo> [<objeto>]",
        patron:           ["SUJETO", "NEGACION", "VERBO"]
    },
    INTERROGATIVA: {
        nombre:           "Oración Interrogativa",
        ejemplo_valido:   "¿Corre el gato?",
        ejemplo_invalido: "El gato corre?",
        regla:            "<oracion> ::= '¿' <verbo> <sujeto> [<objeto>] '?'",
        patron:           ["SIGNO_APERTURA", "VERBO", "SUJETO", "SIGNO_PREGUNTA"]
    },
    EXCLAMATIVA: {
        nombre:           "Oración Exclamativa",
        ejemplo_valido:   "¡Qué hermoso día!",
        ejemplo_invalido: "Hermoso qué día!",
        regla:            "<oracion> ::= '¡' (Qué|Cómo) [ART] [ADJ] SUST '!'",
        patron:           ["SIGNO_APERTURA", "EXCLAMACION_INICIO", "SUJETO", "SIGNO_EXCLAMACION"]
    },
    COMPUESTA: {
        nombre:           "Oración Compuesta",
        ejemplo_valido:   "El gato corre y el perro duerme",
        ejemplo_invalido: "El gato corre el perro y duerme",
        regla:            "<oracion> ::= <simple> CONJ_COORD <simple>",
        patron:           ["ORACION_SIMPLE", "CONJUNCION_COORDINANTE", "ORACION_SIMPLE"]
    },
    SUBORDINADA: {
        nombre:           "Oración Subordinada",
        ejemplo_valido:   "Estudio porque quiero aprender",
        ejemplo_invalido: "Porque estudio quiero aprender",
        regla:            "<oracion> ::= <principal> CONJ_SUB <secundaria>",
        patron:           ["ORACION_PRINCIPAL", "CONJUNCION_SUBORDINANTE", "ORACION_SECUNDARIA"]
    }
};
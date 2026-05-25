// ============================================================
// ArbolDerivacion.js — Gestión del árbol de derivación
// Responsable: Melki
// Compilador Traductor Inglés-Español 2026
// ============================================================

export class ArbolDerivacion {

    constructor() {
        this.raiz = null;
    }

    // Carga el árbol generado por el parser
    cargar(arbol) {
        this.raiz = arbol;
    }

    // Devuelve el árbol completo
    obtener() {
        return this.raiz;
    }

    // Devuelve el tipo de oración detectado
    obtenerTipo() {
        return this.raiz?.tipo || 'DESCONOCIDO';
    }

    // Devuelve la regla BNF de la raíz
    obtenerRegla() {
        return this.raiz?.regla || '-';
    }

    // Limpia el árbol
    limpiar() {
        this.raiz = null;
    }

    // Recorre el árbol en profundidad y ejecuta un callback por cada nodo
    recorrer(callback, nodo = this.raiz, nivel = 0) {
        if (!nodo) return;
        callback(nodo, nivel);
        if (nodo.hijos) {
            nodo.hijos.forEach(hijo => this.recorrer(callback, hijo, nivel + 1));
        }
    }

    // Devuelve todos los nodos hoja (los que tienen token, no hijos intermedios)
    obtenerHojas() {
        const hojas = [];
        this.recorrer(nodo => {
            if (nodo.token && (!nodo.hijos || nodo.hijos.length === 0)) {
                hojas.push(nodo);
            }
        });
        return hojas;
    }
}
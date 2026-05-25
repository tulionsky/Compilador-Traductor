// ============================================================
// TablaSimbolos.js — Gestión de la tabla de símbolos
// Compilador Traductor Inglés-Español 2026
// ============================================================

export class TablaSimbolos {

    constructor() {
        this.filas = [];
    }

    cargar(filas) {
        this.filas = filas;
    }

    // Agrega filas de una oración al total
    agregarVarias(filas) {
        this.filas.push(...filas);
    }

    obtener() {
        return this.filas;
    }

    buscarPorPosicion(posicion) {
        return this.filas.find(f => f.posicion === posicion) || null;
    }

    filtrarPorCategoria(categoria) {
        return this.filas.filter(f => f.categoria === categoria);
    }

    filtrarPorOracion(numOracion) {
        return this.filas.filter(f => f.oracion === numOracion);
    }

    limpiar() {
        this.filas = [];
    }
}
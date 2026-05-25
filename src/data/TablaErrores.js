// ============================================================
// TablaErrores.js — Gestión centralizada de errores
// Compilador Traductor Inglés-Español 2026
// ============================================================

export class TablaErrores {
    constructor() {
        this.errores = [];
    }

    // Agrega un error individual
    agregar({ tipo, posicion, token, descripcion, sugerencia = '-' }) {
        this.errores.push({ tipo, posicion, token, descripcion, sugerencia });
    }

    // Agrega un arreglo de errores (para recibir los del léxico/sintáctico)
    agregarVarios(errores) {
        errores.forEach(e => this.agregar(e));
    }

    // Devuelve todos los errores
    obtener() {
        return this.errores;
    }

    // Filtra por fase: 'LÉXICO', 'SINTÁCTICO', 'SEMÁNTICO'
    filtrarPorTipo(tipo) {
        return this.errores.filter(e => e.tipo === tipo);
    }

    // ¿Hay errores de algún tipo específico o en general?
    tieneErrores(tipo = null) {
        if (tipo) return this.errores.some(e => e.tipo === tipo);
        return this.errores.length > 0;
    }

    // Limpia todos los errores
    limpiar() {
        this.errores = [];
    }
}
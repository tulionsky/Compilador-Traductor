// ============================================================
// Segmentador.js — Divide texto en oraciones individuales
// Compilador Traductor Inglés-Español 2026
// ============================================================

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function segmentarOraciones(texto) {
    // Proteger abreviaciones comunes
    const abreviaciones = [
        'Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Sr.', 'Sra.',
        'St.', 'Ave.', 'Blvd.', 'etc.', 'vs.', 'approx.',
        'Jan.', 'Feb.', 'Mar.', 'Apr.', 'Jun.', 'Jul.', 'Aug.',
        'Sep.', 'Oct.', 'Nov.', 'Dec.'
    ];

    let textoProtegido = texto;
    const marcadores   = {};

    abreviaciones.forEach((abr, i) => {
        const marca = `__ABR${i}__`;
        marcadores[marca] = abr;
        textoProtegido = textoProtegido.replace(
            new RegExp(escapeRegex(abr), 'g'), marca
        );
    });

    // Unir ¡ con la siguiente palabra para que no quede suelto
    // ¡Hola! → se separa correctamente en "¡Hola!"
    // ¿Cómo estás? → se separa correctamente en "¿Cómo estás?"
    // La clave es separar por . ! ? pero conservar ¡ y ¿ pegados a su oración

    // Insertar salto DESPUÉS de cada . ! ? seguido de espacio o fin
    // pero NO separar ¡ o ¿ de lo que sigue
    const partes = textoProtegido
        .replace(/([.!?])\s+(?=[¡¿A-ZÁÉÍÓÚÑÜA-Z])/g, '$1\n')
        .replace(/([.!?])$/g, '$1\n')
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Restaurar abreviaciones
    return partes.map(parte => {
        let restaurada = parte;
        Object.entries(marcadores).forEach(([marca, abr]) => {
            restaurada = restaurada.replace(new RegExp(marca, 'g'), abr);
        });
        return restaurada.trim();
    }).filter(s => s.length > 0);
}
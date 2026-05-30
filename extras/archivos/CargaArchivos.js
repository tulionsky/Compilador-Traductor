(function() {
// ============================================================
// CargaArchivos.js — Carga de archivos .txt
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

    const inputTxt     = document.getElementById('input-txt');
    const btnTxt       = document.getElementById('btn-txt');
    const textoEntrada = document.getElementById('texto-entrada');

    btnTxt.addEventListener('click', () => {
        inputTxt.click();
    });

    function leerArchivoTxt(archivo) {
        if (!archivo) return;

        const esTexto = archivo.type === 'text/plain' ||
            archivo.name.endsWith('.txt');

        if (!esTexto) {
            alert('Por favor selecciona un archivo .txt válido.');
            return;
        }

        const MAX_BYTES = 1 * 1024 * 1024;
        if (archivo.size > MAX_BYTES) {
            alert('El archivo es demasiado grande. Máximo permitido: 1MB.');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const texto = limpiarTextoTxt(e.target.result);

            if (!texto) {
                alert('El archivo está vacío o no contiene texto válido.');
                return;
            }

            textoEntrada.value = texto;

            const textoOriginal = btnTxt.textContent;
            btnTxt.textContent = `✅ ${archivo.name}`;
            setTimeout(() => {
                btnTxt.textContent = textoOriginal;
            }, 3000);
        };

        reader.onerror = () => {
            alert('Error al leer el archivo. Intenta de nuevo.');
        };

        reader.readAsText(archivo, 'UTF-8');
    }

    function limpiarTextoTxt(texto) {
        return texto
            .replace(/\r\n|\r/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    inputTxt.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) leerArchivoTxt(archivo);
        inputTxt.value = '';
    });

})();
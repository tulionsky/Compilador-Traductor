(function() {
// ============================================================
// OcrController.js — Extracción de texto desde imágenes
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

    const inputImagen        = document.getElementById('input-imagen');
    const zonaDrop           = document.getElementById('zona-drop');
    const contenedorProgreso = document.getElementById('contenedor-progreso');
    const barraFill          = document.getElementById('barra-progreso-fill');
    const labelProgreso      = document.getElementById('label-progreso');
    const textoEntrada       = document.getElementById('texto-entrada');

    async function procesarImagenOCR(archivo) {
        if (!archivo || !archivo.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
            return;
        }

        contenedorProgreso.style.display = 'block';
        barraFill.style.width = '0%';
        labelProgreso.textContent = 'Iniciando extracción...';
        zonaDrop.textContent = `📄 Procesando: ${archivo.name}`;

        try {
            const { data: { text } } = await Tesseract.recognize(
                archivo,
                'eng+spa',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            const porcentaje = Math.round(m.progress * 100);
                            barraFill.style.width = porcentaje + '%';
                            labelProgreso.textContent = `Extrayendo texto... ${porcentaje}%`;
                        }
                    }
                }
            );

            const textoLimpio = limpiarTextoOCR(text);

            if (!textoLimpio) {
                labelProgreso.textContent = '⚠️ No se encontró texto en la imagen.';
                zonaDrop.textContent = 'Arrastra una imagen aquí';
                return;
            }

            textoEntrada.value = textoLimpio;
            barraFill.style.width = '100%';
            labelProgreso.textContent = '✅ Texto extraído correctamente';
            zonaDrop.textContent = `✅ ${archivo.name} procesado`;

            setTimeout(() => {
                contenedorProgreso.style.display = 'none';
                zonaDrop.textContent = 'Arrastra una imagen aquí';
            }, 2000);

        } catch (error) {
            console.error('Error OCR:', error);
            labelProgreso.textContent = '❌ Error al procesar la imagen.';
            barraFill.style.width = '0%';
            setTimeout(() => {
                contenedorProgreso.style.display = 'none';
                zonaDrop.textContent = 'Arrastra una imagen aquí';
            }, 2500);
        }
    }

    function limpiarTextoOCR(texto) {
        return texto
            .replace(/\r\n|\r/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[^\x20-\x7E\n\u00C0-\u024F]/g, '')
            .trim();
    }

    inputImagen.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) procesarImagenOCR(archivo);
        inputImagen.value = '';
    });

    zonaDrop.addEventListener('click', () => inputImagen.click());

    zonaDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        zonaDrop.classList.add('drag-over');
    });

    zonaDrop.addEventListener('dragleave', () => {
        zonaDrop.classList.remove('drag-over');
    });

    zonaDrop.addEventListener('drop', (e) => {
        e.preventDefault();
        zonaDrop.classList.remove('drag-over');
        const archivo = e.dataTransfer.files[0];
        if (archivo) procesarImagenOCR(archivo);
    });

})();
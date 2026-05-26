// ocr-voz.js — OCR + Reconocimiento de Voz

// ─── REFERENCIAS AL DOM ──────────────────────────────────────
const inputImagen       = document.getElementById('input-imagen');
const zonaDrop          = document.getElementById('zona-drop');
const contenedorProgreso= document.getElementById('contenedor-progreso');
const barraFill         = document.getElementById('barra-progreso-fill');
const labelProgreso     = document.getElementById('label-progreso');
const btnMicrofono      = document.getElementById('btn-microfono');
const estadoMicrofono   = document.getElementById('estado-microfono');
const textoEntrada      = document.getElementById('texto-entrada');

// ============================================================
// ── MÓDULO OCR (Tesseract.js) ────────────────────────────────
// ============================================================

// ─── PROCESAR IMAGEN → TEXTO ─────────────────────────────────
async function procesarImagenOCR(archivo) {
    // Validar que sea imagen
    if (!archivo || !archivo.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        return;
    }

    // Mostrar barra de progreso
    contenedorProgreso.style.display = 'block';
    barraFill.style.width = '0%';
    labelProgreso.textContent = 'Iniciando extracción...';
    zonaDrop.textContent = `📄 Procesando: ${archivo.name}`;

    try {
        const { data: { text } } = await Tesseract.recognize(
            archivo,
            'eng+spa',   // reconoce inglés y español simultáneamente
            {
                logger: (m) => {
                    // Actualizar barra de progreso con el avance real de Tesseract
                    if (m.status === 'recognizing text') {
                        const porcentaje = Math.round(m.progress * 100);
                        barraFill.style.width = porcentaje + '%';
                        labelProgreso.textContent = `Extrayendo texto... ${porcentaje}%`;
                    }
                }
            }
        );

        // Limpiar y normalizar el texto extraído
        const textoLimpio = limpiarTextoOCR(text);

        if (!textoLimpio) {
            labelProgreso.textContent = '⚠️ No se encontró texto en la imagen.';
            zonaDrop.textContent = 'Arrastra una imagen aquí';
            return;
        }

        // Insertar el texto en el área de entrada
        textoEntrada.value = textoLimpio;
        barraFill.style.width = '100%';
        labelProgreso.textContent = '✅ Texto extraído correctamente';
        zonaDrop.textContent = `✅ ${archivo.name} procesado`;

        // Ocultar barra después de 2 segundos
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

// ─── LIMPIAR TEXTO EXTRAÍDO POR OCR ──────────────────────────
// Tesseract a veces devuelve saltos de línea extraños, espacios dobles,
// caracteres basura. Esta función normaliza el resultado.
function limpiarTextoOCR(texto) {
    return texto
        .replace(/\r\n|\r/g, '\n')          // normalizar saltos de línea
        .replace(/[ \t]+/g, ' ')            // colapsar espacios múltiples
        .replace(/\n{3,}/g, '\n\n')         // máximo 2 saltos de línea seguidos
        .replace(/[^\x20-\x7E\n\u00C0-\u024F]/g, '') // eliminar caracteres no imprimibles
        .trim();
}

// ─── EVENTO: clic en "Cargar imagen" ─────────────────────────
inputImagen.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (archivo) procesarImagenOCR(archivo);
    // Resetear el input para que el mismo archivo pueda volver a seleccionarse
    inputImagen.value = '';
});

// ─── EVENTO: clic en la zona drop también abre el selector ───
zonaDrop.addEventListener('click', () => inputImagen.click());

// ─── EVENTOS DRAG & DROP ─────────────────────────────────────
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

// MÓDULO RECONOCIMIENTO DE VOZ
const OPENAI_API_KEY = 'AQUI VA LA APIKEY SJDIFSDAIFBSBO S (3 VECES INTENTANDO) ';

let mediaRecorder = null;
let audioChunks   = [];
let grabando      = false;

btnMicrofono.addEventListener('click', async () => {
    if (grabando) {
        // ── DETENER grabación ──────────────────────────────
        mediaRecorder.stop();
        return;
    }

    // ── INICIAR grabación ──────────────────────────────────
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstart = () => {
            grabando = true;
            btnMicrofono.textContent = '🔴 Grabando...';
            btnMicrofono.classList.add('escuchando');
            estadoMicrofono.textContent = 'Habla ahora en inglés, presiona de nuevo para detener';
        };

        mediaRecorder.onstop = async () => {
            grabando = false;
            btnMicrofono.textContent  = '🎤 Dictar';
            btnMicrofono.classList.remove('escuchando');
            estadoMicrofono.textContent = '⏳ Procesando audio...';

            // Detener todas las pistas del micrófono
            stream.getTracks().forEach(t => t.stop());

            // Convertir chunks a blob de audio
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

            // Enviar a Whisper
            await transcribirConWhisper(audioBlob);
        };

        mediaRecorder.start();

    } catch (e) {
        estadoMicrofono.textContent = '❌ No se pudo acceder al micrófono';
        console.error('Error micrófono:', e);
    }
});

// ─── ENVIAR AUDIO A WHISPER

async function transcribirConWhisper(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3-turbo');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const err = await response.json();
            console.error('Error Groq:', err);
            estadoMicrofono.textContent = '❌ Error al procesar el audio';
            return;
        }

        const data = await response.json();
        const texto = data.text?.trim();

        if (texto) {
            textoEntrada.value = texto;
            estadoMicrofono.textContent = '✅ Texto capturado';
        } else {
            estadoMicrofono.textContent = '⚠️ No se detectó voz';
        }

    } catch (e) {
        console.error('Error Groq:', e);
        estadoMicrofono.textContent = '❌ Error de conexión';
    }

    setTimeout(() => estadoMicrofono.textContent = '', 4000);
}
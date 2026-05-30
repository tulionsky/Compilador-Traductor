(function() {
// ============================================================
// VozEntrada.js — Reconocimiento de voz con Groq Whisper
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

    const GROQ_API_KEY    = 'API_KEY';
    const btnMicrofono    = document.getElementById('btn-microfono');
    const estadoMicrofono = document.getElementById('estado-microfono');
    const textoEntrada    = document.getElementById('texto-entrada');

    let mediaRecorder = null;
    let audioChunks   = [];
    let grabando      = false;

    btnMicrofono.addEventListener('click', async () => {
        if (grabando) {
            mediaRecorder.stop();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioChunks   = [];
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstart = () => {
                grabando = true;
                btnMicrofono.textContent = '🔴 Grabando...';
                btnMicrofono.classList.add('escuchando');
                estadoMicrofono.textContent = 'Habla ahora, presiona de nuevo para detener';
            };

            mediaRecorder.onstop = async () => {
                grabando = false;
                btnMicrofono.textContent = '🎤 Dictar';
                btnMicrofono.classList.remove('escuchando');
                estadoMicrofono.textContent = '⏳ Procesando audio...';

                stream.getTracks().forEach(t => t.stop());

                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await transcribirConWhisper(audioBlob);
            };

            mediaRecorder.start();

        } catch (e) {
            estadoMicrofono.textContent = '❌ No se pudo acceder al micrófono';
            console.error('Error micrófono:', e);
        }
    });

    async function transcribirConWhisper(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3-turbo');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method:  'POST',
                headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
                body:    formData
            });

            if (!response.ok) {
                const err = await response.json();
                console.error('Error Groq:', err);
                estadoMicrofono.textContent = '❌ Error al procesar el audio';
                return;
            }

            const data  = await response.json();
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

        setTimeout(() => { estadoMicrofono.textContent = ''; }, 4000);
    }

})();
// ============================================================
// MyMemoryClient.js — Cliente de la API MyMemory
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

export async function traducirConMyMemory(texto, idiomaOrigen, idiomaDestino) {
    const langPair = idiomaOrigen === 'en' ? 'en|es' : 'es|en';

    try {
        const url      = `${MYMEMORY_URL}?q=${encodeURIComponent(texto)}&langpair=${langPair}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`MyMemory API error ${response.status}`);
        }

        const data = await response.json();

        if (data.responseStatus !== 200) {
            throw new Error(`MyMemory error: ${data.responseDetails}`);
        }

        const traduccion = data.responseData?.translatedText;

        if (!traduccion) {
            throw new Error('MyMemory no devolvió traducción.');
        }

        return { traduccion, exito: true };

    } catch (e) {
        console.error('Error en MyMemory:', e);
        return { traduccion: null, exito: false, error: e.message };
    }
}
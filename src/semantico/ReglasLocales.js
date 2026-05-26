// ============================================================
// ReglasLocales.js — Validaciones semánticas sin IA
// Responsable: Mijeli
// Compilador Traductor Inglés-Español 2026
// ============================================================

// ─── REGLAS EN INGLÉS ─────────────────────────────────────────
export function validarEN(tablaSimbolos) {
    const errores     = [];
    const sugerencias = [];

    for (let i = 0; i < tablaSimbolos.length - 1; i++) {
        const actual    = tablaSimbolos[i];
        const siguiente = tablaSimbolos[i + 1];

        // REGLA 1 — "a" antes de vocal → debe ser "an"
        if (actual.lema === 'a' && actual.categoria === 'ARTICULO') {
            const primera = siguiente.token[0]?.toLowerCase();
            if (primera && 'aeiou'.includes(primera)) {
                errores.push({
                    regla:              'Artículo indefinido',
                    descripcion:        `Se usó "a" antes de "${siguiente.token}" que empieza con vocal. Debe ser "an ${siguiente.token}".`,
                    token_problematico: actual.token
                });
                sugerencias.push({
                    original:    `a ${siguiente.token}`,
                    correccion:  `an ${siguiente.token}`,
                    explicacion: '"an" se usa antes de palabras que empiezan con sonido vocal.'
                });
            }
        }

        // REGLA 2 — "an" antes de consonante → debe ser "a"
        if (actual.lema === 'an' && actual.categoria === 'ARTICULO') {
            const primera = siguiente.token[0]?.toLowerCase();
            if (primera && !'aeiou'.includes(primera)) {
                errores.push({
                    regla:              'Artículo indefinido',
                    descripcion:        `Se usó "an" antes de "${siguiente.token}" que empieza con consonante. Debe ser "a ${siguiente.token}".`,
                    token_problematico: actual.token
                });
                sugerencias.push({
                    original:    `an ${siguiente.token}`,
                    correccion:  `a ${siguiente.token}`,
                    explicacion: '"a" se usa antes de palabras que empiezan con sonido consonante.'
                });
            }
        }

        // REGLA 6 — Verbo después de do/does/did debe ser infinitivo
        const auxiliaresDo = ['do', 'does', 'did'];
        if (actual.categoria === 'VERBO_AUXILIAR' &&
            auxiliaresDo.includes(actual.lema.toLowerCase())) {

            // Buscar verbo principal saltando "not" si existe
            let posVerbo = i + 1;
            if (tablaSimbolos[posVerbo]?.categoria === 'ADVERBIO_NEGACION' ||
                tablaSimbolos[posVerbo]?.lema === 'not' ||
                tablaSimbolos[posVerbo]?.categoria === 'NEGACION') {
                posVerbo++;
            }

            const verboPrincipal = tablaSimbolos[posVerbo];
            if (verboPrincipal && verboPrincipal.categoria === 'VERBO') {
                const esTerceraPersona = verboPrincipal.token.endsWith('s') &&
                    !verboPrincipal.lema.endsWith('s');
                if (esTerceraPersona) {
                    const yaReportado = errores.some(
                        e => e.token_problematico === verboPrincipal.token &&
                            e.regla === 'Forma verbal con auxiliar'
                    );
                    if (!yaReportado) {
                        errores.push({
                            regla:              'Forma verbal con auxiliar',
                            descripcion:        `Después de "${actual.token}" el verbo debe estar en infinitivo. "${verboPrincipal.token}" debe ser "${verboPrincipal.lema}".`,
                            token_problematico: verboPrincipal.token
                        });
                        sugerencias.push({
                            original:    verboPrincipal.token,
                            correccion:  verboPrincipal.lema,
                            explicacion: `Con "${actual.token}" el verbo va en infinitivo sin "s".`
                        });
                    }
                }
            }
        }
    }

    // REGLA 3 — Concordancia sujeto-verbo en número (inglés)
    for (let i = 0; i < tablaSimbolos.length - 1; i++) {
        const actual = tablaSimbolos[i];

        if (actual.categoria !== 'SUSTANTIVO') continue;

        for (let j = i + 1; j < Math.min(i + 5, tablaSimbolos.length); j++) {
            const candidato = tablaSimbolos[j];

            if (['PUNTUACION', 'CONJUNCION_COORDINANTE',
                'CONJUNCION_SUBORDINANTE'].includes(candidato.categoria)) break;

            if (candidato.categoria === 'VERBO') {
                const tokenSust  = actual.token || '';
                const lemaSust   = actual.lema  || '';
                const tokenVerbo = candidato.token || '';
                const lemaVerbo  = candidato.lema  || '';

                const esPluralPorCampo      = actual.numero === 'plural';
                const esPluralPorMorfologia = tokenSust.toLowerCase() !== lemaSust.toLowerCase()
                    && (tokenSust.endsWith('s') || tokenSust.endsWith('es'))
                    && !lemaSust.endsWith('s');
                const esPlural = esPluralPorCampo || esPluralPorMorfologia;

                const verbEnSingular = tokenVerbo.endsWith('s') && !lemaVerbo.endsWith('s');

                if (esPlural && verbEnSingular) {
                    const yaReportado = errores.some(
                        e => e.token_problematico === candidato.token &&
                            e.regla === 'Concordancia sujeto-verbo'
                    );
                    if (!yaReportado) {
                        errores.push({
                            regla:              'Concordancia sujeto-verbo',
                            descripcion:        `El sujeto "${actual.token}" es plural pero el verbo "${candidato.token}" está en singular. Debe ser "${lemaVerbo}".`,
                            token_problematico: candidato.token
                        });
                        sugerencias.push({
                            original:    candidato.token,
                            correccion:  lemaVerbo,
                            explicacion: 'Con sujeto plural el verbo no lleva "s" en presente simple.'
                        });
                    }
                }
                break;
            }
        }
    }

    // REGLA 4 — Negación sin auxiliar
    const negacion = tablaSimbolos.find(t =>
        t.categoria === 'ADVERBIO_NEGACION' && ['not', "n't"].includes(t.lema)
    );
    const auxiliar = tablaSimbolos.find(t => t.categoria === 'VERBO_AUXILIAR');

    if (negacion && !auxiliar) {
        errores.push({
            regla:              'Negación sin auxiliar',
            descripcion:        `Se usa "${negacion.token}" sin verbo auxiliar (do/does/did/is/are). Ejemplo correcto: "She does not run".`,
            token_problematico: negacion.token
        });
        sugerencias.push({
            original:    negacion.token,
            correccion:  'does not / do not',
            explicacion: 'La negación en inglés requiere un verbo auxiliar antes de "not".'
        });
    }

    // REGLA 5 — Mezcla de tiempos verbales
    const verbos = tablaSimbolos.filter(t => t.categoria === 'VERBO');
    if (verbos.length >= 2) {
        const enPasado   = verbos.filter(v => v.token.endsWith('ed') && !v.lema.endsWith('ed'));
        const enPresente = verbos.filter(v => v.token.endsWith('s')  && !v.lema.endsWith('s'));

        if (enPasado.length > 0 && enPresente.length > 0) {
            errores.push({
                regla:              'Mezcla de tiempos verbales',
                descripcion:        `Se mezclan tiempos: "${enPasado[0].token}" está en pasado y "${enPresente[0].token}" en presente. Deben coincidir.`,
                token_problematico: enPresente[0].token
            });
            sugerencias.push({
                original:    enPresente[0].token,
                correccion:  enPasado[0].token,
                explicacion: `Usar el mismo tiempo verbal. Si la oración está en pasado, cambiar "${enPresente[0].token}" por su forma en pasado.`
            });
        }
    }

    return { errores, sugerencias };
}

// ─── REGLAS EN ESPAÑOL ────────────────────────────────────────
export function validarES(tablaSimbolos) {
    const errores     = [];
    const sugerencias = [];

    for (let i = 0; i < tablaSimbolos.length - 1; i++) {
        const actual    = tablaSimbolos[i];
        const siguiente = tablaSimbolos[i + 1];

        // REGLA 1 — Concordancia género artículo-sustantivo
        if (actual.categoria === 'ARTICULO' && siguiente.categoria === 'SUSTANTIVO') {
            const artMasc = ['el', 'un', 'los', 'unos'];
            const artFem  = ['la', 'una', 'las', 'unas'];
            const articuloEs = artMasc.includes(actual.lema) ? 'masculino'
                : artFem.includes(actual.lema)  ? 'femenino'
                    : null;

            if (articuloEs && siguiente.genero && siguiente.genero !== '-') {
                if (articuloEs !== siguiente.genero) {
                    errores.push({
                        regla:              'Concordancia de género',
                        descripcion:        `El artículo "${actual.token}" es ${articuloEs} pero "${siguiente.token}" es ${siguiente.genero}.`,
                        token_problematico: actual.token
                    });
                    const correccion = siguiente.genero === 'femenino' ? 'la' : 'el';
                    sugerencias.push({
                        original:    actual.token,
                        correccion,
                        explicacion: `El artículo debe concordar en género con el sustantivo "${siguiente.token}".`
                    });
                }
            }
        }

        // REGLA 2 — Concordancia número artículo-sustantivo
        if (actual.categoria === 'ARTICULO' && siguiente.categoria === 'SUSTANTIVO') {
            const artPlural = ['los', 'las', 'unos', 'unas'];
            const artSing   = ['el', 'la', 'un', 'una'];
            const articuloNum = artPlural.includes(actual.lema) ? 'plural'
                : artSing.includes(actual.lema)   ? 'singular'
                    : null;

            if (articuloNum && siguiente.numero && siguiente.numero !== '-') {
                if (articuloNum !== siguiente.numero) {
                    errores.push({
                        regla:              'Concordancia de número',
                        descripcion:        `El artículo "${actual.token}" es ${articuloNum} pero "${siguiente.token}" es ${siguiente.numero}.`,
                        token_problematico: actual.token
                    });
                    const correccion = siguiente.numero === 'plural'
                        ? (actual.lema === 'el' ? 'los' : 'las')
                        : (actual.lema === 'los' ? 'el' : 'la');
                    sugerencias.push({
                        original:    actual.token,
                        correccion,
                        explicacion: `El artículo debe concordar en número con el sustantivo "${siguiente.token}".`
                    });
                }
            }
        }
    }

    // REGLA 3 — Concordancia sujeto-verbo en número (español)
    for (let i = 0; i < tablaSimbolos.length - 1; i++) {
        const actual = tablaSimbolos[i];

        if (actual.categoria !== 'SUSTANTIVO') continue;

        for (let j = i + 1; j < Math.min(i + 5, tablaSimbolos.length); j++) {
            const candidato = tablaSimbolos[j];

            if (['PUNTUACION', 'CONJUNCION_COORDINANTE',
                'CONJUNCION_SUBORDINANTE'].includes(candidato.categoria)) break;

            if (candidato.categoria === 'VERBO') {
                const esPlural  = actual.numero === 'plural';
                const verbToken = candidato.token.toLowerCase();

                // Verbo en 3ra persona singular en español:
                // termina en 'a' o 'e' pero NO en 'an' o 'en'
                const esSingularES =
                    (verbToken.endsWith('a') && !verbToken.endsWith('an')) ||
                    (verbToken.endsWith('e') && !verbToken.endsWith('en'));

                if (esPlural && esSingularES) {
                    const yaReportado = errores.some(
                        e => e.token_problematico === candidato.token &&
                            e.regla === 'Concordancia sujeto-verbo'
                    );
                    if (!yaReportado) {
                        errores.push({
                            regla:              'Concordancia sujeto-verbo',
                            descripcion:        `El sujeto "${actual.token}" es plural pero el verbo "${candidato.token}" está en singular.`,
                            token_problematico: candidato.token
                        });
                        sugerencias.push({
                            original:    candidato.token,
                            correccion:  candidato.token + 'n',
                            explicacion: `Con sujeto plural "${actual.token}" el verbo debe ir en plural.`
                        });
                    }
                }
                break;
            }
        }
    }

    // REGLA 4 — Negación debe ir antes del verbo en español
    const negacion = tablaSimbolos.find(t => t.categoria === 'ADVERBIO_NEGACION');
    const verboES  = tablaSimbolos.find(t => t.categoria === 'VERBO');

    if (negacion && verboES) {
        const posNeg   = tablaSimbolos.indexOf(negacion);
        const posVerbo = tablaSimbolos.indexOf(verboES);

        if (posNeg > posVerbo) {
            errores.push({
                regla:              'Posición de la negación',
                descripcion:        `"${negacion.token}" debe ir antes del verbo, no después.`,
                token_problematico: negacion.token
            });
            sugerencias.push({
                original:    verboES.token + ' ' + negacion.token,
                correccion:  negacion.token + ' ' + verboES.token,
                explicacion: 'En español la negación "no" va inmediatamente antes del verbo.'
            });
        }
    }

    return { errores, sugerencias };
}
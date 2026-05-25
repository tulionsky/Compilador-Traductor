// ============================================================
// LematizadorES.js — Lematización y clasificación en español
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

import { CAT } from './Tokens.js';

// ─── ADJETIVOS COMUNES EN ESPAÑOL ────────────────────────────
// Lista de adjetivos que el lematizador por sufijos no detecta bien
const ADJETIVOS_ES = [
    // Calidad
    'bueno','buena','buenos','buenas','malo','mala','malos','malas',
    'grande','grandes','pequeño','pequeña','pequeños','pequeñas',
    'joven','jóvenes','viejo','vieja','viejos','viejas',
    'nuevo','nueva','nuevos','nuevas','antiguo','antigua','antiguos','antiguas',
    'alto','alta','altos','altas','bajo','baja','bajos','bajas',
    'largo','larga','largos','largas','corto','corta','cortos','cortas',
    'ancho','ancha','anchos','anchas','delgado','delgada','delgados','delgadas',
    'gordo','gorda','gordos','gordas','flaco','flaca','flacos','flacas',
    'fuerte','fuertes','débil','débiles',
    'rápido','rápida','rápidos','rápidas','lento','lenta','lentos','lentas',
    'fácil','fáciles','difícil','difíciles',
    'rico','rica','ricos','ricas','pobre','pobres',
    'feliz','felices','triste','tristes',
    'bonito','bonita','bonitos','bonitas','feo','fea','feos','feas',
    'hermoso','hermosa','hermosos','hermosas','lindo','linda','lindos','lindas',
    'elegante','elegantes','sencillo','sencilla','sencillos','sencillas',
    'limpio','limpia','limpios','limpias','sucio','sucia','sucios','sucias',
    'frío','fría','fríos','frías','caliente','calientes','tibio','tibia',
    'oscuro','oscura','oscuros','oscuras','claro','clara','claros','claras',
    'duro','dura','duros','duras','suave','suaves','blando','blanda',
    'húmedo','húmeda','húmedos','húmedas','seco','seca','secos','secas',
    // Color
    'rojo','roja','rojos','rojas','azul','azules',
    'verde','verdes','amarillo','amarilla','amarillos','amarillas',
    'negro','negra','negros','negras','blanco','blanca','blancos','blancas',
    'gris','grises','café','cafés','morado','morada','morados','moradas',
    'rosado','rosada','rosados','rosadas','naranja','naranjas',
    // Tamaño y forma
    'redondo','redonda','redondos','redondas','cuadrado','cuadrada',
    'plano','plana','planos','planas','curvo','curva','curvos','curvas',
    // Cantidad/intensidad
    'mucho','mucha','muchos','muchas','poco','poca','pocos','pocas',
    'bastante','bastantes','suficiente','suficientes',
    // Tiempo
    'temprano','tarde','pronto',
    // Personalidad
    'inteligente','inteligentes','tonto','tonta','tontos','tontas',
    'amable','amables','simpático','simpática','antipático','antipática',
    'generoso','generosa','generosos','generosas','egoísta','egoístas',
    'honesto','honesta','honestos','honestas','mentiroso','mentirosa',
    'valiente','valientes','cobarde','cobardes',
    'tranquilo','tranquila','tranquilos','tranquilas',
    'nervioso','nerviosa','nerviosos','nerviosas',
    'alegre','alegres','serio','seria','serios','serias',
    'trabajador','trabajadora','trabajadores','trabajadoras',
    'perezoso','perezosa','perezosos','perezosas',
    // Estado
    'enfermo','enferma','enfermos','enfermas','sano','sana','sanos','sanas',
    'cansado','cansada','cansados','cansadas','descansado','descansada',
    'ocupado','ocupada','ocupados','ocupadas','libre','libres',
    'solo','sola','solos','solas','acompañado','acompañada',
    'casado','casada','casados','casadas','soltero','soltera',
    'embarazada','embarazadas',
    // Origen
    'guatemalteco','guatemalteca','guatemaltecos','guatemaltecas',
    'mexicano','mexicana','mexicanos','mexicanas',
    'español','española','españoles','españolas',
    'americano','americana','americanos','americanas',
    'latino','latina','latinos','latinas',
    // Otros comunes
    'especial','especiales','normal','normales','extraño','extraña',
    'diferente','diferentes','igual','iguales','similar','similares',
    'importante','importantes','necesario','necesaria','necesarios','necesarias',
    'posible','posibles','imposible','imposibles',
    'verdadero','verdadera','verdaderos','verdaderas','falso','falsa',
    'real','reales','virtual','virtuales',
    'propio','propia','propios','propias','ajeno','ajena',
    'seguro','segura','seguros','seguras','peligroso','peligrosa',
    'famoso','famosa','famosos','famosas','conocido','conocida',
    'popular','populares','común','comunes',
    'completo','completa','completos','completas','incompleto','incompleta',
    'correcto','correcta','correctos','correctas','incorrecto','incorrecta',
    'perfecto','perfecta','perfectos','perfectas',
    'mejor','mejores','peor','peores',
    'mayor','mayores','menor','menores',
    'primero','primera','primeros','primeras',
    'último','última','últimos','últimas',
    'próximo','próxima','próximos','próximas',
    'siguiente','siguientes','anterior','anteriores',
    'difícil','difíciles','fácil','fáciles',
    'complejo','compleja','complejos','complejas',
    'simple','simples','complicado','complicada',
    'moderno','moderna','modernos','modernas',
    'antiguo','antigua','antiguos','antiguas',
    'digital','digitales','tecnológico','tecnológica',
    'económico','económica','económicos','económicas',
    'político','política','políticos','políticas',
    'social','sociales','cultural','culturales',
    'natural','naturales','artificial','artificiales',
    'nacional','nacionales','internacional','internacionales',
    'local','locales','global','globales',
];

// ─── SUFIJOS VERBALES EN ESPAÑOL ──────────────────────────────
const SUFIJOS_VERBALES = [
    { sufijo: 'ando', reemplazo: 'ar' },
    { sufijo: 'ado',  reemplazo: 'ar' },
    { sufijo: 'aba',  reemplazo: 'ar' },
    { sufijo: 'abas', reemplazo: 'ar' },
    { sufijo: 'aban', reemplazo: 'ar' },
    { sufijo: 'aré',  reemplazo: 'ar' },
    { sufijo: 'arás', reemplazo: 'ar' },
    { sufijo: 'ará',  reemplazo: 'ar' },
    { sufijo: 'amos', reemplazo: 'ar' },
    { sufijo: 'áis',  reemplazo: 'ar' },
    { sufijo: 'aron', reemplazo: 'ar' },
    { sufijo: 'aste', reemplazo: 'ar' },
    { sufijo: 'iendo', reemplazo: 'er' },
    { sufijo: 'ido',   reemplazo: 'er' },
    { sufijo: 'ía',    reemplazo: 'er' },
    { sufijo: 'ías',   reemplazo: 'er' },
    { sufijo: 'ían',   reemplazo: 'er' },
    { sufijo: 'eré',   reemplazo: 'er' },
    { sufijo: 'erás',  reemplazo: 'er' },
    { sufijo: 'erá',   reemplazo: 'er' },
    { sufijo: 'emos',  reemplazo: 'er' },
    { sufijo: 'éis',   reemplazo: 'er' },
    { sufijo: 'ieron', reemplazo: 'er' },
    { sufijo: 'iste',  reemplazo: 'er' },
    { sufijo: 'iré',   reemplazo: 'ir' },
    { sufijo: 'irás',  reemplazo: 'ir' },
    { sufijo: 'irá',   reemplazo: 'ir' },
    { sufijo: 'irán',  reemplazo: 'ir' },
];

const SUFIJOS_PLURAL = ['es', 's'];

function detectarVerboES(token) {
    const t = token.toLowerCase();
    for (const { sufijo, reemplazo } of SUFIJOS_VERBALES) {
        if (t.endsWith(sufijo) && t.length > sufijo.length + 2) {
            const raiz = t.slice(0, t.length - sufijo.length);
            return { esVerbo: true, lema: raiz + reemplazo };
        }
    }
    return { esVerbo: false, lema: t };
}

function detectarNumeroES(token) {
    const t = token.toLowerCase();
    for (const sufijo of SUFIJOS_PLURAL) {
        if (t.endsWith(sufijo) && t.length > sufijo.length + 1) return 'plural';
    }
    return 'singular';
}

function detectarGeneroES(token) {
    const t = token.toLowerCase();
    if (t.endsWith('a') || t.endsWith('as') ||
        t.endsWith('ión') || t.endsWith('iones') ||
        t.endsWith('dad') || t.endsWith('tad') ||
        t.endsWith('tud') || t.endsWith('umbre')) return 'femenino';
    if (t.endsWith('o') || t.endsWith('os') ||
        t.endsWith('or') || t.endsWith('ores') ||
        t.endsWith('ón') || t.endsWith('ones')) return 'masculino';
    return '-';
}

export function clasificarES(token) {
    const t = token.toLowerCase();

    // Capa 1 — Lista de adjetivos conocidos
    if (ADJETIVOS_ES.includes(t)) {
        const numero = detectarNumeroES(t);
        const genero = detectarGeneroES(t);
        return { categoria: CAT.ADJETIVO, lema: t, numero, genero };
    }

    // Capa 2 — Detección por sufijos verbales
    const { esVerbo, lema: lemaVerbo } = detectarVerboES(t);
    if (esVerbo) {
        return { categoria: CAT.VERBO, lema: lemaVerbo, numero: '-', genero: '-' };
    }

    // Capa 3 — Sufijos adjetivales
    if (t.endsWith('oso') || t.endsWith('osa') ||
        t.endsWith('ble')  ||
        t.endsWith('ivo')  || t.endsWith('iva') ||
        t.endsWith('ico')  || t.endsWith('ica') ||
        t.endsWith('ivo')  || t.endsWith('iva') ||
        t.endsWith('ero')  || t.endsWith('era') ||
        t.endsWith('ista') ||
        t.endsWith('ante') || t.endsWith('ente')) {
        const numero = detectarNumeroES(t);
        const genero = detectarGeneroES(t);
        return { categoria: CAT.ADJETIVO, lema: t, numero, genero };
    }

    // Capa 4 — Sustantivo por defecto
    const numero = detectarNumeroES(t);
    const genero = detectarGeneroES(t);
    let lema = t;
    if (numero === 'plural') {
        if (t.endsWith('es')) lema = t.slice(0, -2);
        else if (t.endsWith('s')) lema = t.slice(0, -1);
    }

    return { categoria: CAT.SUSTANTIVO, lema, numero, genero };
}
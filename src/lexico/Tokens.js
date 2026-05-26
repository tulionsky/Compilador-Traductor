// ============================================================
// Tokens.js — Categorías gramaticales y expresiones regulares
// Responsable: Tulio
// Compilador Traductor Inglés-Español 2026
// ============================================================

export const REGEX = {
    puntuacion:      /^[.,;:!?¡¿()\-"'…]$/,
    numero_cardinal: /^\d+$/,
    numero_ordinal:  /^\d+(st|nd|rd|th|ro|mo|to|vo|°)$/i,
    contraccion_en:  /^(n't|'s|'re|'ve|'ll|'d|'m)$/i,
    contraccion_es:  /^(al|del)$/i,
};

export const CAT = {
    SUSTANTIVO:              'SUSTANTIVO',
    SUSTANTIVO_PROPIO:       'SUSTANTIVO_PROPIO',
    ADJETIVO:                'ADJETIVO',
    ARTICULO:                'ARTICULO',
    POSESIVO:                'POSESIVO',
    DEMOSTRATIVO:            'DEMOSTRATIVO',
    INDEFINIDO:              'INDEFINIDO',
    NUMERAL_CARDINAL:        'NUMERAL_CARDINAL',
    NUMERAL_ORDINAL:         'NUMERAL_ORDINAL',
    PRONOMBRE_PERSONAL:      'PRONOMBRE_PERSONAL',
    PRONOMBRE_INTERROGATIVO: 'PRONOMBRE_INTERROGATIVO',
    PRONOMBRE_DEMOSTRATIVO:  'PRONOMBRE_DEMOSTRATIVO',
    PRONOMBRE_INDEFINIDO:    'PRONOMBRE_INDEFINIDO',
    PRONOMBRE_NUMERAL:       'PRONOMBRE_NUMERAL',
    VERBO:                   'VERBO',
    VERBO_AUXILIAR:          'VERBO_AUXILIAR',
    ADVERBIO_TIEMPO:         'ADVERBIO_TIEMPO',
    ADVERBIO_LUGAR:          'ADVERBIO_LUGAR',
    ADVERBIO_CANTIDAD:       'ADVERBIO_CANTIDAD',
    ADVERBIO_MODO:           'ADVERBIO_MODO',
    ADVERBIO_AFIRMACION:     'ADVERBIO_AFIRMACION',
    ADVERBIO_NEGACION:       'ADVERBIO_NEGACION',
    ADVERBIO_DUDA:           'ADVERBIO_DUDA',
    PREPOSICION:             'PREPOSICION',
    CONJUNCION_COORDINANTE:  'CONJUNCION_COORDINANTE',
    CONJUNCION_SUBORDINANTE: 'CONJUNCION_SUBORDINANTE',
    INTERJECCION:            'INTERJECCION',
    CONTRACCION:             'CONTRACCION',
    PUNTUACION:              'PUNTUACION',
    DESCONOCIDO:             'DESCONOCIDO',
};

// ─── LISTAS INGLÉS ────────────────────────────────────────────
export const LISTAS_EN = {
    articulos:           ['the', 'a', 'an'],
    posesivos:           ['my', 'your', 'his', 'her', 'its', 'our', 'their'],
    demostrativos:       ['this', 'that', 'these', 'those'],
    indefinidos:         ['some', 'any', 'few', 'many', 'much', 'several',
        'all', 'both', 'each', 'every', 'other', 'another',
        'enough', 'either', 'neither'],
    pron_personales:     ['i', 'you', 'he', 'she', 'it', 'we', 'they',
        'me', 'him', 'her', 'us', 'them'],
    pron_interrogativos: ['who', 'whom', 'whose', 'which', 'what', 'when',
        'where', 'why', 'how'],
    pron_demostrativos:  ['this', 'that', 'these', 'those'],
    verbos_auxiliares:   ['is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
        'do', 'does', 'did', 'done',
        'will', 'would', 'shall', 'should',
        'can', 'could', 'may', 'might', 'must'],
    preposiciones:       ['in', 'on', 'at', 'by', 'for', 'with', 'about',
        'against', 'between', 'through', 'during', 'before',
        'after', 'above', 'below', 'to', 'from', 'up', 'down',
        'of', 'off', 'over', 'under', 'into', 'onto', 'upon',
        'within', 'without', 'along', 'among', 'around',
        'behind', 'beside', 'beyond', 'except', 'inside',
        'near', 'outside', 'since', 'toward', 'underneath'],
    conj_coord:          ['and', 'but', 'or', 'nor', 'for', 'yet', 'so'],
    conj_subord:         ['if', 'because', 'although', 'though', 'while',
        'when', 'since', 'unless', 'until', 'after', 'before',
        'as', 'than', 'that', 'whether', 'even', 'once',
        'provided', 'suppose', 'wherever', 'whenever'],
    adv_tiempo:          ['now', 'then', 'today', 'yesterday', 'tomorrow',
        'soon', 'already', 'still', 'yet', 'always', 'never',
        'often', 'recently', 'lately', 'early', 'late',
        'finally', 'eventually', 'immediately', 'suddenly',
        'formerly', 'previously', 'afterwards', 'meanwhile'],
    adv_lugar:           ['here', 'there', 'everywhere', 'somewhere', 'nowhere',
        'inside', 'outside', 'above', 'below', 'nearby',
        'away', 'abroad', 'ahead', 'behind', 'elsewhere'],
    adv_cantidad:        ['very', 'too', 'enough', 'almost', 'quite', 'rather',
        'just', 'only', 'more', 'less', 'most', 'least',
        'nearly', 'hardly', 'barely', 'scarcely', 'extremely',
        'highly', 'completely', 'totally', 'absolutely',
        'approximately', 'roughly'],
    adv_modo:            ['quickly', 'slowly', 'carefully', 'easily', 'hard',
        'fast', 'well', 'badly', 'clearly', 'deeply',
        'strongly', 'softly', 'loudly', 'quietly', 'happily',
        'sadly', 'suddenly', 'gently', 'roughly', 'freely',
        'together', 'alone', 'otherwise', 'instead'],
    adv_afirmacion:      ['yes', 'certainly', 'definitely', 'absolutely',
        'indeed', 'sure', 'exactly', 'right', 'correct',
        'obviously', 'clearly', 'truly', 'really'],
    adv_negacion:        ['no', 'not', 'never', 'neither', 'nor', "n't",
        'nobody', 'nothing', 'nowhere', 'none'],
    adv_duda:            ['maybe', 'perhaps', 'probably', 'possibly',
        'apparently', 'presumably', 'supposedly', 'likely',
        'unlikely', 'doubtfully'],
    interjecciones:      ['oh', 'ah', 'wow', 'hey', 'oops', 'ouch', 'hi',
        'hello', 'bye', 'goodbye', 'thanks', 'please',
        'sorry', 'excuse', 'well', 'indeed', 'really'],
    sustantivos_forzados: ['garden', 'fish', 'water', 'light', 'plant',
        'park', 'house', 'home', 'room', 'book',
        'hand', 'head', 'face', 'place', 'word',
        'music', 'food', 'city', 'country', 'road',
        'door', 'window', 'table', 'chair', 'bed',
        'car', 'bus', 'train', 'plane', 'ship',
        'street', 'river', 'mountain', 'forest', 'beach',
        'time', 'mind', 'life', 'death', 'fire',
        'air', 'earth', 'space', 'night', 'day',
        'morning', 'evening', 'summer', 'winter',
        'spring', 'fall', 'year', 'month', 'week',
        'hour', 'minute', 'second'],
    numerales_letras_en: [
        'one','two','three','four','five','six','seven','eight','nine','ten',
        'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
        'eighteen','nineteen','twenty','thirty','forty','fifty','sixty',
        'seventy','eighty','ninety','hundred','thousand','million','billion',
        'first','second','third','fourth','fifth','sixth','seventh','eighth',
        'ninth','tenth','last','next','half','quarter',],
};

// ─── LISTAS ESPAÑOL ───────────────────────────────────────────
export const LISTAS_ES = {
    articulos:           ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo'],
    posesivos:           ['mi', 'mis', 'tu', 'tus', 'su', 'sus', 'nuestro',
        'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra',
        'vuestros', 'vuestras'],
    demostrativos:       ['este', 'esta', 'estos', 'estas', 'ese', 'esa',
        'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas'],
    indefinidos:         ['algún', 'alguna', 'algunos', 'algunas', 'ningún',
        'ninguna', 'todo', 'toda', 'todos', 'todas', 'mucho',
        'mucha', 'muchos', 'muchas', 'poco', 'poca', 'pocos',
        'pocas', 'varios', 'varias', 'otro', 'otra', 'otros',
        'otras', 'cualquier', 'cualquiera', 'cada', 'ambos',
        'ambas', 'bastante', 'bastantes', 'demasiado', 'demasiada'],
    pron_personales:     ['yo', 'tú', 'él', 'ella', 'nosotros', 'nosotras',
        'vosotros', 'vosotras', 'ellos', 'ellas', 'usted',
        'ustedes', 'me', 'te', 'se', 'nos', 'os', 'le',
        'les', 'lo', 'la', 'los', 'las'],
    pron_interrogativos: ['qué', 'quién', 'quiénes', 'cuál', 'cuáles',
        'cuánto', 'cuánta', 'cuántos', 'cuántas', 'cómo',
        'dónde', 'cuándo'],
    pron_demostrativos:  ['este', 'esta', 'esto', 'estos', 'estas', 'ese',
        'esa', 'eso', 'esos', 'esas', 'aquel', 'aquella',
        'aquello', 'aquellos', 'aquellas'],
    verbos_auxiliares:   ['es', 'son', 'era', 'eran', 'fue', 'fueron', 'será',
        'serán', 'soy', 'somos', 'sois', 'eres', 'sido', 'siendo',
        'estoy', 'estás', 'está', 'estamos', 'estáis', 'están',
        'estaba', 'estaban', 'estuvo', 'estuvieron',
        'haber', 'he', 'has', 'ha', 'hemos', 'habéis', 'han',
        'había', 'habían', 'hubo',
        'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen',
        'tenía', 'tenían'],
    preposiciones:       ['a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de',
        'desde', 'durante', 'en', 'entre', 'hacia', 'hasta',
        'mediante', 'para', 'por', 'según', 'sin', 'so',
        'sobre', 'tras', 'versus', 'vía'],
    conj_coord:          ['y', 'e', 'ni', 'o', 'u', 'pero', 'mas', 'sino',
        'aunque', 'sin embargo', 'no obstante', 'es decir',
        'o sea', 'así que', 'por tanto', 'por consiguiente'],
    conj_subord:         ['que', 'si', 'porque', 'cuando', 'como', 'donde',
        'mientras', 'aunque', 'para que', 'a que', 'de que',
        'con que', 'sin que', 'antes de que', 'después de que',
        'tan pronto como', 'a menos que', 'a no ser que',
        'puesto que', 'dado que', 'ya que', 'siempre que'],
    adv_tiempo:          ['ahora', 'entonces', 'hoy', 'ayer', 'mañana', 'pronto',
        'ya', 'todavía', 'aún', 'siempre', 'nunca', 'jamás',
        'a veces', 'frecuentemente', 'recientemente', 'tarde',
        'temprano', 'antes', 'después', 'luego', 'mientras',
        'cuando', 'finalmente', 'enseguida'],
    adv_lugar:           ['aquí', 'allí', 'allá', 'acá', 'arriba', 'abajo',
        'dentro', 'fuera', 'cerca', 'lejos', 'encima', 'debajo',
        'delante', 'detrás', 'enfrente', 'alrededor'],
    adv_cantidad:        ['muy', 'bastante', 'demasiado', 'poco', 'mucho', 'más',
        'menos', 'casi', 'apenas', 'suficiente', 'tan', 'tanto',
        'cuanto', 'aproximadamente', 'exactamente', 'totalmente',
        'completamente', 'absolutamente', 'nada', 'algo'],
    adv_modo:            ['bien', 'mal', 'así', 'rápido', 'rápidamente',
        'lentamente', 'claramente', 'fácilmente', 'difícilmente',
        'fuerte', 'suave', 'suavemente', 'tranquilamente',
        'felizmente', 'tristemente', 'cuidadosamente',
        'libremente', 'juntos', 'solo', 'solamente'],
    adv_afirmacion:      ['sí', 'claro', 'cierto', 'exacto', 'correcto',
        'efectivamente', 'ciertamente', 'definitivamente',
        'obviamente', 'por supuesto', 'desde luego',
        'sin duda', 'verdaderamente'],
    adv_negacion:        ['no', 'nunca', 'jamás', 'tampoco', 'ni', 'nada',
        'nadie', 'ninguno', 'ninguna'],
    adv_duda:            ['quizás', 'quizá', 'tal vez', 'acaso', 'probablemente',
        'posiblemente', 'seguramente', 'aparentemente',
        'supuestamente'],
    interjecciones:      ['hola', 'adiós', 'oye', 'ay', 'oh', 'ah', 'eh', 'uy',
        'vaya', 'caramba', 'gracias', 'perdón', 'disculpa',
        'por favor', 'buenas', 'buen'],
    sustantivos_forzados: [
        'estudiante','estudiantes','paciente','pacientes',
        'presidente','presidentes','gerente','gerentes',
        'cliente','clientes','agente','agentes',
        'participante','participantes','representante','representantes',
        'integrante','integrantes','cantante','cantantes',
        'comerciante','comerciantes','habitante','habitantes',
        'carrera','carreras','tarea','tareas','idea','ideas',
        'área','áreas','hora','horas','forma','formas',
        'persona','personas','cosa','cosas','vez','veces',
        'manera','maneras','parte','partes','caso','casos',],
    numerales_letras_es: [
        'uno','una','dos','tres','cuatro','cinco','seis','siete','ocho',
        'nueve','diez','once','doce','trece','catorce','quince','dieciséis',
        'diecisiete','dieciocho','diecinueve','veinte','veintiuno','treinta',
        'cuarenta','cincuenta','sesenta','setenta','ochenta','noventa',
        'cien','ciento','mil','millón','millones','primero','primera',
        'segundo','segunda','tercero','tercera','cuarto','cuarta','quinto',
        'quinta','último','última','siguiente','mitad','cuarto',],
};

// ─── VERBOS ESPAÑOLES CONJUGADOS ─────────────────────────────
export const VERBOS_ES_COMUNES = [
    // correr
    'corro','corres','corre','corremos','corréis','corren',
    'corría','corrías','corríamos','corríais','corrían',
    'corrí','corriste','corrió','corrimos','corristeis','corrieron',
    'correré','correrás','correrá','correremos','correréis','correrán',
    // dormir
    'duermo','duermes','duerme','dormimos','dormís','duermen',
    'dormía','dormías','dormíamos','dormíais','dormían',
    'dormí','dormiste','durmió','dormimos','dormisteis','durmieron',
    'dormiré','dormirás','dormirá','dormiremos','dormiréis','dormirán',
    // comer
    'como','comes','come','comemos','coméis','comen',
    'comía','comías','comíamos','comíais','comían',
    'comí','comiste','comió','comimos','comisteis','comieron',
    'comeré','comerás','comerá','comeremos','comeréis','comerán',
    // hablar
    'hablo','hablas','habla','hablamos','habláis','hablan',
    'hablaba','hablabas','hablábamos','hablabais','hablaban',
    'hablé','hablaste','habló','hablamos','hablasteis','hablaron',
    'hablaré','hablarás','hablará','hablaremos','hablaréis','hablarán',
    // vivir
    'vivo','vives','vive','vivimos','vivís','viven',
    'vivía','vivías','vivíamos','vivíais','vivían',
    'viví','viviste','vivió','vivimos','vivisteis','vivieron',
    'viviré','vivirás','vivirá','viviremos','viviréis','vivirán',
    // ir
    'voy','vas','va','vamos','vais','van',
    'iba','ibas','íbamos','ibais','iban',
    'fui','fuiste','fue','fuimos','fuisteis','fueron',
    'iré','irás','irá','iremos','iréis','irán',
    // hacer
    'hago','haces','hace','hacemos','hacéis','hacen',
    'hacía','hacías','hacíamos','hacíais','hacían',
    'hice','hiciste','hizo','hicimos','hicisteis','hicieron',
    'haré','harás','hará','haremos','haréis','harán',
    // decir
    'digo','dices','dice','decimos','decís','dicen',
    'decía','decías','decíamos','decíais','decían',
    'dije','dijiste','dijo','dijimos','dijisteis','dijeron',
    'diré','dirás','dirá','diremos','diréis','dirán',
    // saber
    'sé','sabes','sabe','sabemos','sabéis','saben',
    'sabía','sabías','sabíamos','sabíais','sabían',
    'supe','supiste','supo','supimos','supisteis','supieron',
    // poder
    'puedo','puedes','puede','podemos','podéis','pueden',
    'podía','podías','podíamos','podíais','podían',
    'pude','pudiste','pudo','pudimos','pudisteis','pudieron',
    // querer
    'quiero','quieres','quiere','queremos','queréis','quieren',
    'quería','querías','queríamos','queríais','querían',
    'quise','quisiste','quiso','quisimos','quisisteis','quisieron',
    // venir
    'vengo','vienes','viene','venimos','venís','vienen',
    'venía','venías','veníamos','veníais','venían',
    'vine','viniste','vino','vinimos','vinisteis','vinieron',
    // poner
    'pongo','pones','pone','ponemos','ponéis','ponen',
    'ponía','ponías','poníamos','poníais','ponían',
    'puse','pusiste','puso','pusimos','pusisteis','pusieron',
    // traer
    'traigo','traes','trae','traemos','traéis','traen',
    'traía','traías','traíamos','traíais','traían',
    'traje','trajiste','trajo','trajimos','trajisteis','trajeron',
    // leer
    'leo','lees','lee','leemos','leéis','leen',
    'leía','leías','leíamos','leíais','leían',
    'leí','leíste','leyó','leímos','leísteis','leyeron',
    // escribir
    'escribo','escribes','escribe','escribimos','escribís','escriben',
    'escribía','escribías','escribíamos','escribíais','escribían',
    'escribí','escribiste','escribió','escribimos','escribisteis','escribieron',
    // ver
    'veo','ves','ve','vemos','veis','ven',
    'veía','veías','veíamos','veíais','veían',
    'vi','viste','vio','vimos','visteis','vieron',
    // oír
    'oigo','oyes','oye','oímos','oís','oyen',
    'oía','oías','oíamos','oíais','oían',
    'oí','oíste','oyó','oímos','oísteis','oyeron',
    // sentir
    'siento','sientes','siente','sentimos','sentís','sienten',
    'sentía','sentías','sentíamos','sentíais','sentían',
    'sentí','sentiste','sintió','sentimos','sentisteis','sintieron',
    // pensar
    'pienso','piensas','piensa','pensamos','pensáis','piensan',
    'pensaba','pensabas','pensábamos','pensabais','pensaban',
    'pensé','pensaste','pensó','pensamos','pensasteis','pensaron',
    // creer
    'creo','crees','cree','creemos','creéis','creen',
    'creía','creías','creíamos','creíais','creían',
    'creí','creíste','creyó','creímos','creísteis','creyeron',
    // llamar
    'llamo','llamas','llama','llamamos','llamáis','llaman',
    'llamaba','llamabas','llamábamos','llamabais','llamaban',
    'llamé','llamaste','llamó','llamamos','llamasteis','llamaron',
    // llevar
    'llevo','llevas','lleva','llevamos','lleváis','llevan',
    'llevaba','llevabas','llevábamos','llevabais','llevaban',
    'llevé','llevaste','llevó','llevamos','llevasteis','llevaron',
    // tomar
    'tomo','tomas','toma','tomamos','tomáis','toman',
    'tomaba','tomabas','tomábamos','tomabais','tomaban',
    'tomé','tomaste','tomó','tomamos','tomasteis','tomaron',
    // trabajar
    'trabajo','trabajas','trabaja','trabajamos','trabajáis','trabajan',
    'trabajaba','trabajabas','trabajábamos','trabajabais','trabajaban',
    'trabajé','trabajaste','trabajó','trabajamos','trabajasteis','trabajaron',
    // estudiar
    'estudio','estudias','estudia','estudiamos','estudiáis','estudian',
    'estudiaba','estudiabas','estudiábamos','estudiabais','estudiaban',
    'estudié','estudiaste','estudió','estudiamos','estudiasteis','estudiaron',
    // aprender
    'aprendo','aprendes','aprende','aprendemos','aprendéis','aprenden',
    'aprendía','aprendías','aprendíamos','aprendíais','aprendían',
    'aprendí','aprendiste','aprendió','aprendimos','aprendisteis','aprendieron',
    // comprar
    'compro','compras','compra','compramos','compráis','compran',
    'compraba','comprabas','comprábamos','comprabais','compraban',
    'compré','compraste','compró','compramos','comprasteis','compraron',
    // volver
    'vuelvo','vuelves','vuelve','volvemos','volvéis','vuelven',
    'volvía','volvías','volvíamos','volvíais','volvían',
    'volví','volviste','volvió','volvimos','volvisteis','volvieron',
    // empezar
    'empiezo','empiezas','empieza','empezamos','empezáis','empiezan',
    'empezaba','empezabas','empezábamos','empezabais','empezaban',
    'empecé','empezaste','empezó','empezamos','empezasteis','empezaron',
    // terminar
    'termino','terminas','termina','terminamos','termináis','terminan',
    'terminaba','terminabas','terminábamos','terminabais','terminaban',
    'terminé','terminaste','terminó','terminamos','terminasteis','terminaron',
    // buscar
    'busco','buscas','busca','buscamos','buscáis','buscan',
    'buscaba','buscabas','buscábamos','buscabais','buscaban',
    'busqué','buscaste','buscó','buscamos','buscasteis','buscaron',
    // encontrar
    'encuentro','encuentras','encuentra','encontramos','encontráis','encuentran',
    'encontraba','encontrabas','encontrábamos','encontrabais','encontraban',
    'encontré','encontraste','encontró','encontramos','encontrasteis','encontraron',
    // jugar
    'juego','juegas','juega','jugamos','jugáis','juegan',
    'jugaba','jugabas','jugábamos','jugabais','jugaban',
    'jugué','jugaste','jugó','jugamos','jugasteis','jugaron',
    // salir
    'salgo','sales','sale','salimos','salís','salen',
    'salía','salías','salíamos','salíais','salían',
    'salí','saliste','salió','salimos','salisteis','salieron',
    // entrar
    'entro','entras','entra','entramos','entráis','entran',
    'entraba','entrabas','entrábamos','entrabais','entraban',
    'entré','entraste','entró','entramos','entrasteis','entraron',
    // llegar
    'llego','llegas','llega','llegamos','llegáis','llegan',
    'llegaba','llegabas','llegábamos','llegabais','llegaban',
    'llegué','llegaste','llegó','llegamos','llegasteis','llegaron',
    // pasar
    'paso','pasas','pasa','pasamos','pasáis','pasan',
    'pasaba','pasabas','pasábamos','pasabais','pasaban',
    'pasé','pasaste','pasó','pasamos','pasasteis','pasaron',
    // seguir
    'sigo','sigues','sigue','seguimos','seguís','siguen',
    'seguía','seguías','seguíamos','seguíais','seguían',
    'seguí','seguiste','siguió','seguimos','seguisteis','siguieron',
    // abrir
    'abro','abres','abre','abrimos','abrís','abren',
    'abría','abrías','abríamos','abríais','abrían',
    'abrí','abriste','abrió','abrimos','abristeis','abrieron',
    // cerrar
    'cierro','cierras','cierra','cerramos','cerráis','cierran',
    'cerraba','cerrabas','cerrábamos','cerrabais','cerraban',
    'cerré','cerraste','cerró','cerramos','cerrasteis','cerraron',
    // amar
    'amo','amas','ama','amamos','amáis','aman',
    'amaba','amabas','amábamos','amabais','amaban',
    'amé','amaste','amó','amamos','amasteis','amaron',
    // caminar
    'camino','caminas','camina','caminamos','camináis','caminan',
    'caminaba','caminabas','caminábamos','caminabais','caminaban',
    'caminé','caminaste','caminó','caminamos','caminasteis','caminaron',
    // cantar
    'canto','cantas','canta','cantamos','cantáis','cantan',
    'cantaba','cantabas','cantábamos','cantabais','cantaban',
    'canté','cantaste','cantó','cantamos','cantasteis','cantaron',
    // bailar
    'bailo','bailas','baila','bailamos','bailáis','bailan',
    'bailaba','bailabas','bailábamos','bailabais','bailaban',
    'bailé','bailaste','bailó','bailamos','bailasteis','bailaron',
    // nadar
    'nado','nadas','nada','nadamos','nadáis','nadan',
    'nadaba','nadabas','nadábamos','nadabais','nadaban',
    'nadé','nadaste','nadó','nadamos','nadasteis','nadaron',
    // limpiar
    'limpio','limpias','limpia','limpiamos','limpiáis','limpian',
    'limpiaba','limpiabas','limpiábamos','limpiabais','limpiaban',
    'limpié','limpiaste','limpió','limpiamos','limpiasteis','limpiaron',
    // cocinar
    'cocino','cocinas','cocina','cocinamos','cocináis','cocinan',
    'cocinaba','cocinabas','cocinábamos','cocinabais','cocinaban',
    'cociné','cocinaste','cocinó','cocinamos','cocinasteis','cocinaron',
    // manejar
    'manejo','manejas','maneja','manejamos','manejáis','manejan',
    'manejaba','manejabas','manejábamos','manejabais','manejaban',
    'manejé','manejaste','manejó','manejamos','manejasteis','manejaron',
    // vender
    'vendo','vendes','vende','vendemos','vendéis','venden',
    'vendía','vendías','vendíamos','vendíais','vendían',
    'vendí','vendiste','vendió','vendimos','vendisteis','vendieron',
    // conocer
    'conozco','conoces','conoce','conocemos','conocéis','conocen',
    'conocía','conocías','conocíamos','conocíais','conocían',
    'conocí','conociste','conoció','conocimos','conocisteis','conocieron',
    // dar
    'doy','das','da','damos','dais','dan',
    'daba','dabas','dábamos','dabais','daban',
    'di','diste','dio','dimos','disteis','dieron',
    // pedir
    'pido','pides','pide','pedimos','pedís','piden',
    'pedía','pedías','pedíamos','pedíais','pedían',
    'pedí','pediste','pidió','pedimos','pedisteis','pidieron',
    // recibir
    'recibo','recibes','recibe','recibimos','recibís','reciben',
    'recibía','recibías','recibíamos','recibíais','recibían',
    'recibí','recibiste','recibió','recibimos','recibisteis','recibieron',
    // permitir
    'permito','permites','permite','permitimos','permitís','permiten',
    'permitía','permitías','permitíamos','permitíais','permitían',
    'permití','permitiste','permitió','permitimos','permitisteis','permitieron',
    // necesitar
    'necesito','necesitas','necesita','necesitamos','necesitáis','necesitan',
    'necesitaba','necesitabas','necesitábamos','necesitabais','necesitaban',
    'necesité','necesitaste','necesitó','necesitamos','necesitasteis','necesitaron',
    // usar
    'uso','usas','usa','usamos','usáis','usan',
    'usaba','usabas','usábamos','usabais','usaban',
    'usé','usaste','usó','usamos','usasteis','usaron',
    // ganar
    'gano','ganas','gana','ganamos','ganáis','ganan',
    'ganaba','ganabas','ganábamos','ganabais','ganaban',
    'gané','ganaste','ganó','ganamos','ganasteis','ganaron',
    // perder
    'pierdo','pierdes','pierde','perdemos','perdéis','pierden',
    'perdía','perdías','perdíamos','perdíais','perdían',
    'perdí','perdiste','perdió','perdimos','perdisteis','perdieron',
    // esperar
    'espero','esperas','espera','esperamos','esperáis','esperan',
    'esperaba','esperabas','esperábamos','esperabais','esperaban',
    'esperé','esperaste','esperó','esperamos','esperasteis','esperaron',
    // ayudar
    'ayudo','ayudas','ayuda','ayudamos','ayudáis','ayudan',
    'ayudaba','ayudabas','ayudábamos','ayudabais','ayudaban',
    'ayudé','ayudaste','ayudó','ayudamos','ayudasteis','ayudaron',
    // preguntar
    'pregunto','preguntas','pregunta','preguntamos','preguntáis','preguntan',
    'preguntaba','preguntabas','preguntábamos','preguntabais','preguntaban',
    'pregunté','preguntaste','preguntó','preguntamos','preguntasteis','preguntaron',
    // responder
    'respondo','respondes','responde','respondemos','respondéis','responden',
    'respondía','respondías','respondíamos','respondíais','respondían',
    'respondí','respondiste','respondió','respondimos','respondisteis','respondieron',
    // entender
    'entiendo','entiendes','entiende','entendemos','entendéis','entienden',
    'entendía','entendías','entendíamos','entendíais','entendían',
    'entendí','entendiste','entendió','entendimos','entendisteis','entendieron',
    // explicar
    'explico','explicas','explica','explicamos','explicáis','explican',
    'explicaba','explicabas','explicábamos','explicabais','explicaban',
    'expliqué','explicaste','explicó','explicamos','explicasteis','explicaron',
    // mostrar
    'muestro','muestras','muestra','mostramos','mostráis','muestran',
    'mostraba','mostrabas','mostrábamos','mostrabais','mostraban',
    'mostré','mostraste','mostró','mostramos','mostrasteis','mostraron',
    // cambiar
    'cambio','cambias','cambia','cambiamos','cambiáis','cambian',
    'cambiaba','cambiabas','cambiábamos','cambiabais','cambiaban',
    'cambié','cambiaste','cambió','cambiamos','cambiasteis','cambiaron',
    // subir
    'subo','subes','sube','subimos','subís','suben',
    'subía','subías','subíamos','subíais','subían',
    'subí','subiste','subió','subimos','subisteis','subieron',
    // bajar
    'bajo','bajas','baja','bajamos','bajáis','bajan',
    'bajaba','bajabas','bajábamos','bajabais','bajaban',
    'bajé','bajaste','bajó','bajamos','bajasteis','bajaron',
    // caer
    'caigo','caes','cae','caemos','caéis','caen',
    'caía','caías','caíamos','caíais','caían',
    'caí','caíste','cayó','caímos','caísteis','cayeron',
    // meter
    'meto','metes','mete','metemos','metéis','meten',
    'metía','metías','metíamos','metíais','metían',
    'metí','metiste','metió','metimos','metisteis','metieron',
    // sacar
    'saco','sacas','saca','sacamos','sacáis','sacan',
    'sacaba','sacabas','sacábamos','sacabais','sacaban',
    'saqué','sacaste','sacó','sacamos','sacasteis','sacaron',
    // guardar
    'guardo','guardas','guarda','guardamos','guardáis','guardan',
    'guardaba','guardabas','guardábamos','guardabais','guardaban',
    'guardé','guardaste','guardó','guardamos','guardasteis','guardaron',
    // dejar
    'dejo','dejas','deja','dejamos','dejáis','dejan',
    'dejaba','dejabas','dejábamos','dejabais','dejaban',
    'dejé','dejaste','dejó','dejamos','dejasteis','dejaron',
    // pagar
    'pago','pagas','paga','pagamos','pagáis','pagan',
    'pagaba','pagabas','pagábamos','pagabais','pagaban',
    'pagué','pagaste','pagó','pagamos','pagasteis','pagaron',
    // presentar
    'presento','presentas','presenta','presentamos','presentáis','presentan',
    'presentaba','presentabas','presentábamos','presentabais','presentaban',
    'presenté','presentaste','presentó','presentamos','presentasteis','presentaron',
    // crear
    'creo','creas','crea','creamos','creáis','crean',
    'creaba','creabas','creábamos','creabais','creaban',
    'creé','creaste','creó','creamos','creasteis','crearon',
    // compartir
    'comparto','compartes','comparte','compartimos','compartís','comparten',
    'compartía','compartías','compartíamos','compartíais','compartían',
    'compartí','compartiste','compartió','compartimos','compartisteis','compartieron',
    // animar
    'animo','animas','anima','animamos','animáis','animan',
    'animaba','animabas','animábamos','animabais','animaban',
    'animé','animaste','animó','animamos','animasteis','animaron',
    // apoyar
    'apoyo','apoyas','apoya','apoyamos','apoyáis','apoyan',
    'apoyaba','apoyabas','apoyábamos','apoyabais','apoyaban',
    'apoyé','apoyaste','apoyó','apoyamos','apoyasteis','apoyaron',
    // ser (formas adicionales no cubiertas por verbos_auxiliares)
    'seré','serás','será','seremos','seréis','serán',
    'sería','serías','seríamos','seríais','serían',
    // despertar
    'despierto','despiertas','despierta','despertamos','despertáis','despiertan',
    'despertaba','despertabas','despertábamos','despertabais','despertaban',
    'desperté','despertaste','despertó','despertamos','despertasteis','despertaron',
    // morir
    'muero','mueres','muere','morimos','morís','mueren',
    'moría','morías','moríamos','moríais','morían',
    'morí','moriste','murió','morimos','moristeis','murieron',
    // nacer
    'nazco','naces','nace','nacemos','nacéis','nacen',
    'nacía','nacías','nacíamos','nacíais','nacían',
    'nací','naciste','nació','nacimos','nacisteis','nacieron',
    // crecer
    'crezco','creces','crece','crecemos','crecéis','crecen',
    'crecía','crecías','crecíamos','crecíais','crecían',
    'crecí','creciste','creció','crecimos','crecisteis','crecieron',
    // mover
    'muevo','mueves','mueve','movemos','movéis','mueven',
    'movía','movías','movíamos','movíais','movían',
    'moví','moviste','movió','movimos','movisteis','movieron',
    // elegir
    'elijo','eliges','elige','elegimos','elegís','eligen',
    'elegía','elegías','elegíamos','elegíais','elegían',
    'elegí','elegiste','eligió','elegimos','elegisteis','eligieron',
    // desperdiciar
    'desperdicio','desperdicias','desperdicia','desperdiciamos','desperdiciais','desperdician',
    'desperdiciaba','desperdiciabas','desperdiciábamos','desperdiciabais','desperdiciaban',
    'desperdicié','desperdiciaste','desperdició','desperdiciamos','desperdiciaron',
    // perder (formas adicionales)
    'pierde','pierden','perdía','perdieron',
    // ganar (formas adicionales)
    'gana','ganan','ganaba','ganaron',
    // seguir (formas adicionales)
    'sigue','siguen','seguía','siguieron',
    // llegar (formas adicionales)
    'llega','llegan','llegaba','llegaron',
    // pasar (formas adicionales)
    'pasa','pasan','pasaba','pasaron',
    // entrar (formas adicionales)
    'entra','entran','entraba','entraron',
    // salir (formas adicionales)
    'sale','salen','salía','salieron',
    // volver (formas adicionales)
    'vuelve','vuelven','volvía','volvieron',
    // caer (formas adicionales)
    'cae','caen','caía','cayeron',
    // traer (formas adicionales)
    'trae','traen','traía','trajeron',
    // hacer (formas adicionales)
    'hace','hacen','hacía','hicieron',
    // decir (formas adicionales)
    'dice','dicen','decía','dijeron',
    // pedir (formas adicionales)
    'pide','piden','pedía','pidieron',
    // sentir (formas adicionales)
    'siente','sienten','sentía','sintieron',
    // pensar (formas adicionales)
    'piensa','piensan','pensaba','pensaron',
    // empezar (formas adicionales)
    'empieza','empiezan','empezaba','empezaron',
    // cerrar (formas adicionales)
    'cierra','cierran','cerraba','cerraron',
    // abrir (formas adicionales)
    'abre','abren','abría','abrieron',
    // mover (formas adicionales)
    'mueve','mueven','movía','movieron',
    // elegir (formas adicionales)
    'elige','eligen','elegía','eligieron',
    // recibir (formas adicionales)
    'recibe','reciben','recibía','recibieron',
    // permitir (formas adicionales)
    'permite','permiten','permitía','permitieron',
    // necesitar (formas adicionales)
    'necesita','necesitan','necesitaba','necesitaron',
    // usar (formas adicionales)
    'usa','usan','usaba','usaron',
    // buscar (formas adicionales)
    'busca','buscan','buscaba','buscaron',
    // encontrar (formas adicionales)
    'encuentra','encuentran','encontraba','encontraron',
    // aprender (formas adicionales)
    'aprende','aprenden','aprendía','aprendieron',
    // enseñar
    'enseño','enseñas','enseña','enseñamos','enseñáis','enseñan',
    'enseñaba','enseñabas','enseñábamos','enseñabais','enseñaban',
    'enseñé','enseñaste','enseñó','enseñamos','enseñasteis','enseñaron',
    // comprar (formas adicionales)
    'compra','compran','compraba','compraron',
    // vender (formas adicionales)
    'vende','venden','vendía','vendieron',
    // cocinar (formas adicionales)
    'cocina','cocinan','cocinaba','cocinaron',
    // limpiar (formas adicionales)
    'limpia','limpian','limpiaba','limpiaron',
    // manejar (formas adicionales)
    'maneja','manejan','manejaba','manejaron',
    // caminar (formas adicionales)
    'camina','caminan','caminaba','caminaron',
    // cantar (formas adicionales)
    'canta','cantan','cantaba','cantaron',
    // bailar (formas adicionales)
    'baila','bailan','bailaba','bailaron',
    // nadar (formas adicionales)
    'nada','nadan','nadaba','nadaron',
    // jugar (formas adicionales)
    'juega','juegan','jugaba','jugaron',
    // trabajar (formas adicionales)
    'trabaja','trabajan','trabajaba','trabajaron',
    // llamar (formas adicionales)
    'llama','llaman','llamaba','llamaron',
    // llevar (formas adicionales)
    'lleva','llevan','llevaba','llevaron',
    // tomar (formas adicionales)
    'toma','toman','tomaba','tomaron',
    // dejar (formas adicionales)
    'deja','dejan','dejaba','dejaron',
    // pagar (formas adicionales)
    'paga','pagan','pagaba','pagaron',
    // presentar (formas adicionales)
    'presenta','presentan','presentaba','presentaron',
    // cambiar (formas adicionales)
    'cambia','cambian','cambiaba','cambiaron',
    // subir (formas adicionales)
    'sube','suben','subía','subieron',
    // bajar (formas adicionales)
    'baja','bajan','bajaba','bajaron',
    // meter (formas adicionales)
    'mete','meten','metía','metieron',
    // sacar (formas adicionales)
    'saca','sacan','sacaba','sacaron',
    // guardar (formas adicionales)
    'guarda','guardan','guardaba','guardaron',
    // compartir (formas adicionales)
    'comparte','comparten','compartía','compartieron',
    // responder (formas adicionales)
    'responde','responden','respondía','respondieron',
    // explicar (formas adicionales)
    'explica','explican','explicaba','explicaron',
    // mostrar (formas adicionales)
    'muestra','muestran','mostraba','mostraron',
    // entender (formas adicionales)
    'entiende','entienden','entendía','entendieron',
    // conocer (formas adicionales)
    'conoce','conocen','conocía','conocieron',
    // ayudar (formas adicionales)
    'ayuda','ayudan','ayudaba','ayudaron',
    // esperar (formas adicionales)
    'espera','esperan','esperaba','esperaron',
    // preguntar (formas adicionales)
    'pregunta','preguntan','preguntaba','preguntaron',
    // terminar (formas adicionales)
    'termina','terminan','terminaba','terminaron',
    // animar (formas adicionales)
    'anima','animan','animaba','animaron',
    // apoyar (formas adicionales)
    'apoya','apoyan','apoyaba','apoyaron',
    // despertar (formas adicionales)
    'despierta','despiertan','despertaba','despertaron',
    // morir (formas adicionales)
    'muere','mueren','moría','murieron',
    // nacer (formas adicionales)
    'nace','nacen','nacía','nacieron',
    // crecer (formas adicionales)
    'crece','crecen','crecía','crecieron',
];
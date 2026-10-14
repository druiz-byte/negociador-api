/**
 * Catálogo de casos.
 *
 * IMPORTANTE: este fichero vive SOLO en el servidor. Nunca se sirve al navegador.
 * El cliente recibe:
 *   - de cada caso: título, tipo, dificultad, resumen, contexto común y variables
 *   - del rol del participante: su briefing (sus propios límites)
 *   - de la contraparte: solo su nombre y cargo
 * La ficha de la contraparte, sus secretos y el mapa de ZOPA no salen nunca
 * del servidor, salvo dentro del informe que redacta el evaluador.
 *
 * Campos propios de un caso "cerrado" (como el de Tecnobit):
 *   - rolParticipante: el único papel que puede jugar el participante.
 *   - configFija: dureza, modo y perfil con los que juega SIEMPRE la
 *     contraparte, digan lo que digan el navegador o el usuario.
 *   - apertura: primera intervención literal de la contraparte.
 *   - instruccionesPersonaje: comportamiento específico del personaje
 *     (revelación progresiva de secretos, escenarios, cierre).
 *   - rubrica: competencias con peso propio para el evaluador.
 *   - guiaResultado: cómo medir el valor capturado en este caso.
 *   - reflexion: preguntas para después del feedback.
 */

export const CASOS = [
  {
    id: 'tecnobit-punto-critico',
    titulo: 'Operación Punto Crítico',
    subtitulo: 'Tecnobit vs DEFENSYS · el cliente estratégico que exige más por menos',
    tipo: 'proyectos',
    dificultad: 'avanzada (3/4)',
    duracion: '10 min de preparación + 20–25 min de negociación',
    resumen:
      'DEFENSYS, uno de vuestros principales clientes en defensa, exige adelantar cuatro semanas la entrega de un subsistema de comunicaciones tácticas, añadir dos funcionalidades nuevas sin coste y asumir nuevas penalizaciones. Tienes que proteger la relación sin comprometer la rentabilidad ni asumir riesgos técnicos inaceptables.',
    contexto:
      'Tecnobit desarrolla para DEFENSYS un **subsistema de comunicaciones tácticas de nueva generación** que se incorporará a una nueva plataforma militar. El contrato inicial asciende a **2.400.000 €** y contempla el desarrollo, la integración y la validación del subsistema, con una entrega completa dentro de **diez semanas**.\n\nEl proyecto está en una fase avanzada y la relación con el cliente es buena, aunque en las últimas semanas han aparecido tensiones. Ayer el Director de Programa de DEFENSYS pidió una reunión urgente para renegociar cuatro condiciones:\n\n| Exigencia | Petición |\n|---|---|\n| Plazo | Adelantar la entrega completa cuatro semanas |\n| Alcance | Incorporar dos funcionalidades nuevas no contempladas inicialmente |\n| Precio | Asumir las modificaciones sin incremento económico |\n| Garantías | Comprometerse a una penalización adicional si se incumple el nuevo calendario |\n\nEl cliente argumenta que Tecnobit debe hacer un esfuerzo especial para proteger la continuidad del programa, y ha insinuado que está revisando su estrategia de proveedores para futuros proyectos.\n\n*Todos los programas, cifras, personajes y circunstancias son ficticios. No representa información contractual real.*',
    variables: [
      'Plazo de entrega',
      'Alcance (funcionalidades A y B)',
      'Precio de las modificaciones',
      'Penalizaciones y garantías',
      'Colaboración técnica de DEFENSYS',
    ],
    rolParticipante: 'tecnobit',
    configFija: { dureza: 3, modo: 'contraparte', color: 'rojo' },
    roles: [
      {
        id: 'tecnobit',
        nombre: 'Responsable de Programa de Tecnobit',
        descripcion: 'Proteges la relación con DEFENSYS sin comprometer la rentabilidad ni asumir riesgos técnicos inaceptables.',
        briefing: `Eres responsable de un programa estratégico de Tecnobit. Ayer recibiste el correo del Director de Programa de DEFENSYS pidiendo una reunión urgente. **Tu reto es encontrar una solución que proteja la relación comercial sin comprometer la rentabilidad ni asumir riesgos técnicos inaceptables.**

### Lo que sabes (reunión interna con Ingeniería, Producción y Finanzas)

**Calendario**

- La entrega completa en diez semanas es técnicamente viable.
- Adelantarla cuatro semanas es **inviable manteniendo todo el alcance**.
- Existe una alternativa: **entregar una configuración operativa básica en seis semanas**, manteniendo la entrega completa en la semana diez. Permitiría adelantar algunas pruebas de integración.
- Para conseguirlo necesitas que DEFENSYS: confirme las funcionalidades prioritarias en 48 horas como máximo, facilite acceso al entorno de integración, asigne un interlocutor técnico con capacidad de decisión y acepte formalmente un calendario de entregas por fases.

**Nuevas funcionalidades** (no estaban en el contrato original)

| Concepto | Coste adicional |
|---|---|
| Funcionalidad A | 75.000 € |
| Funcionalidad B | 65.000 € |
| **Total** | **140.000 €** |

Ambas requieren trabajo adicional de ingeniería y validación. Podrían incorporarse en una entrega posterior, sin afectar al calendario principal, siempre que se formalice el cambio de alcance.

**Margen económico**

- El contrato original tiene un margen previsto del **18 %**. Finanzas te ha dicho que cualquier reducción significativa del margen deberá justificarse.
- Puedes **asumir internamente hasta 25.000 €** de costes adicionales.
- Puedes negociar descuentos o compensaciones, siempre que tengan una **contrapartida verificable**.
- **No puedes aceptar gratuitamente los 140.000 €** de las nuevas funcionalidades.

**Penalizaciones**

- El contrato original ya contempla penalizaciones por incumplimiento de hitos.
- **No tienes autorización para aceptar nuevas penalizaciones** asociadas a un calendario acelerado.
- Sí puedes negociar hitos intermedios, mecanismos de seguimiento y criterios objetivos de aceptación.

### Tu objetivo

Conseguir un acuerdo que permita avanzar en el programa y preservar la relación con DEFENSYS. Tus prioridades:

1. Evitar comprometer una entrega completa técnicamente inviable.
2. Conseguir que las nuevas funcionalidades se reconozcan como modificaciones contractuales.
3. Proteger la rentabilidad del proyecto.
4. Mantener la confianza del cliente.
5. Conseguir compromisos concretos de colaboración por parte de DEFENSYS.

No necesitas conseguir todas tus condiciones iniciales, pero sí debes evitar un acuerdo que comprometa la capacidad real de Tecnobit para cumplir.

### Antes de entrar (10 minutos)

1. ¿Qué necesita realmente DEFENSYS?
2. ¿Qué información desconoces y deberías investigar?
3. ¿Qué alternativas podrías ofrecer?
4. ¿Qué concesiones estás dispuesto a realizar?
5. ¿Qué pedirías a cambio?
6. ¿Cuál sería tu límite?
7. ¿Qué harías si no alcanzáis un acuerdo?`,
      },
      {
        id: 'defensys',
        nombre: 'Enrique Salas · Director de Programa de DEFENSYS',
        descripcion: 'Director de Programa de un cliente estratégico del sector defensa.',
        briefing: `IDENTIDAD
Eres Enrique Salas, Director de Programa de DEFENSYS, cliente estratégico de Tecnobit. 18 años en programas tecnológicos de defensa. Exigente, analítico, competitivo y orientado a resultados. No eres agresivo por naturaleza, pero tienes una elevada orientación al cumplimiento de objetivos y estás sometido a una fuerte presión interna: tu dirección te exige garantizar un hito crítico del programa y reducir los costes adicionales. Puedes negociar determinadas condiciones, pero no puedes modificar unilateralmente todas las obligaciones contractuales.

TU OBJETIVO
Que Tecnobit adelante la entrega del subsistema de comunicaciones tácticas, incorpore las dos funcionalidades adicionales y minimice el incremento económico.

POSICIÓN INICIAL (lo que exiges al empezar)
- Entrega completa en seis semanas.
- Las dos funcionalidades adicionales incluidas.
- Ningún incremento de precio.
- Garantías adicionales de cumplimiento (una penalización nueva ligada al nuevo calendario).

INFORMACIÓN CONFIDENCIAL (no la reveles espontáneamente)

Secreto 1 · La fecha no afecta a todo el sistema. Lo que DEFENSYS necesita de verdad es una configuración operativa básica dentro de seis semanas para empezar las pruebas de integración. No necesitas las dos funcionalidades adicionales para esas pruebas iniciales. Has decidido exigir la entrega completa como posición de partida. Solo lo revelas cuando el participante investigue las necesidades concretas de las pruebas, las funcionalidades imprescindibles o las consecuencias reales del retraso.

Secreto 2 · Las funcionalidades adicionales son negociables. Responden a necesidades detectadas recientemente. Una es importante para una fase posterior del programa; la otra podría posponerse varios meses. Preferirías conseguir ambas sin coste, pero sabes que no formaban parte del contrato inicial. Al principio defiendes que son "adaptaciones necesarias". Si Tecnobit distingue razonadamente entre correcciones y cambios de alcance, aceptas discutir su contratación.

Secreto 3 · Existe presupuesto adicional. DEFENSYS tiene una partida extraordinaria de 100.000 € para modificaciones del programa. Tú puedes autorizar directamente hasta 70.000 €; para superar esa cifra necesitas autorización de tu director, y podrías conseguir los 100.000 € si justificas que las modificaciones son imprescindibles. No reveles la disponibilidad presupuestaria de inmediato: si el participante plantea alternativas fundamentadas y pregunta por los mecanismos de aprobación, explica tus posibilidades progresivamente. Nunca pases de 100.000 €.

Secreto 4 · El proveedor alternativo no es una solución inmediata. Sustituir a Tecnobit en esta fase supondría retrasos y costes importantes: la amenaza es una táctica de presión, no una alternativa operativa. Menciona otros proveedores UNA vez, sobre todo si percibes poca flexibilidad. No insistas artificialmente si el participante responde con serenidad y argumentos sólidos.

Secreto 5 · Existe una oportunidad comercial futura. DEFENSYS estudia una posible ampliación del programa por unos 1,5 millones de euros y consideras que Tecnobit podría ser un proveedor adecuado, pero no puedes garantizar esa adjudicación. Puedes mencionarla si el participante explora la relación a largo plazo, pero nunca la ofreces como contrato firme ni como contrapartida.

LÍMITES Y ZONA DE POSIBLE ACUERDO (confidencial)
| Variable | Tu posición inicial | Hasta dónde puedes llegar |
|---|---|---|
| Entrega | Sistema completo en 6 semanas | Configuración básica en 6 semanas y completa en 10 |
| Funcionalidades | Ambas incluidas sin coste | Contratación adicional y entrega posterior |
| Presupuesto adicional | 0 € | Hasta 100.000 € (70.000 € con tu firma; el resto con autorización de tu director) |
| Penalizaciones | Garantía contractual adicional | Seguimiento reforzado sin nuevas penalizaciones |
| Colaboración técnica | No ofrecida inicialmente | Acceso al entorno de integración y recursos técnicos |
| Futuro contrato | Lo usas como argumento | Posibilidad comercial no vinculante |`,
      },
    ],
    apertura:
      'Gracias por conectarte. Voy a ser muy claro porque tenemos poco tiempo. La dirección nos ha pedido adelantar cuatro semanas la entrega y necesitamos incorporar las dos funcionalidades adicionales.\n\nConsideramos que Tecnobit debe asumir este esfuerzo sin incrementar el precio. Además, necesitamos garantías de que el nuevo calendario se cumplirá.\n\nEstamos hablando de un programa estratégico y esperamos que nuestros proveedores estén a la altura. ¿Podemos contar con vosotros?',
    instruccionesPersonaje: `Adapta tu comportamiento a la estrategia del participante:

A · Si acepta demasiado rápido (adelantar la entrega completa o asumir los cambios sin coste): muestra satisfacción, pero exige concretar el compromiso. Por ejemplo: "Perfecto. Entonces confirmamos que podéis entregar el sistema completo en seis semanas, incluyendo las nuevas funcionalidades y sin coste adicional. ¿Lo dejamos cerrado?". No le facilites gratuitamente una salida: el objetivo pedagógico es comprobar si reconoce compromisos que exceden sus límites y es capaz de rectificarlos antes de cerrar.

B · Si se niega sin explorar (dice que es imposible o que está fuera de contrato): aumenta moderadamente la presión. "Entiendo lo que dices, pero necesito soluciones, no una explicación de por qué no podéis hacerlo. ¿Qué alternativa concreta me propones?"

C · Si pregunta y escucha (investiga tus prioridades reales): empieza a dar información. "Lo que realmente nos preocupa es que necesitamos empezar las pruebas de integración dentro de seis semanas." Si profundiza: "Para esa primera fase no necesitamos necesariamente todas las funcionalidades."

D · Si propone alternativas (por ejemplo, entrega por fases): muestra interés, pero plantea condiciones. "Podría ser una posibilidad, siempre que la primera entrega nos permita realizar las pruebas previstas. ¿Cómo garantizaríais que funciona?"

E · Si ofrece asumir parte de los costes: intenta mejorar la oferta. "Valoro el esfuerzo, pero necesito algo más para defenderlo internamente." Si exige una contrapartida concreta, estás dispuesto a negociar recursos, validaciones rápidas o compromisos de aprobación.

F · Si gestiona bien la presión (mencionas otros proveedores y responde con profesionalidad): reduce la presión. "No quiero cambiar de proveedor. Lo que necesito es tener garantías de que el programa seguirá adelante."

REGLAS DEL PERSONAJE
- Revela la información confidencial de forma progresiva y SOLO como consecuencia de buenas preguntas del participante, nunca porque haya pasado un número de turnos.
- Control de coherencia económica: no aceptes acuerdos que contradigan tus límites presupuestarios (nunca más de 100.000 €; por encima de 70.000 € queda pendiente de la autorización de tu director, y lo dices).
- No aceptes soluciones técnicamente contradictorias. No inventes nuevos datos contractuales. No prometas adjudicaciones futuras. No aceptes un acuerdo ambiguo.
- Antes de cerrar, exige claridad sobre: qué se entregará, cuándo, qué funcionalidades se incluyen, cuál será el precio, qué aportará cada parte, qué autorizaciones quedan pendientes y cómo se formalizará el acuerdo.
- Habla como un director de programa real: intervenciones breves y naturales. No expliques técnicas de negociación, no actúes como profesor ni como evaluador, no felicites al participante durante la negociación.
- Eres exigente pero colaborativo cuando el participante demuestra competencia: no facilites artificialmente el acuerdo, pero tampoco bloquees propuestas razonables. Adapta tus respuestas a la calidad de la negociación.`,
    zopa: `MAPA DE ZOPA (solo para el evaluador, nunca durante la negociación):
- Entrega: lo viable es configuración operativa básica en 6 semanas + entrega completa en la semana 10. Comprometer el sistema completo en 6 semanas es técnicamente inviable para Tecnobit.
- Funcionalidades (140.000 € en total: A 75.000 €, B 65.000 €): DEFENSYS acepta reconocerlas como cambio de alcance y contratarlas con entrega posterior. Una de ellas puede posponerse varios meses.
- Precio: DEFENSYS tiene hasta 100.000 € (70.000 € con firma de Enrique; el resto con autorización de su director). Tecnobit puede absorber hasta 25.000 €. Quedan 15.000 € por cubrir con reducción de alcance, ejecución posterior o una modificación adicional aprobada.
- Penalizaciones: el acuerdo viable es seguimiento reforzado (hitos intermedios, criterios objetivos de aceptación) sin penalizaciones nuevas. Tecnobit no está autorizado a aceptar penalizaciones nuevas.
- Colaboración: DEFENSYS puede confirmar prioridades en 48 h, dar acceso al entorno de integración y asignar interlocutor técnico con capacidad de decisión.
- Futuro: ampliación de ~1,5 M€ posible pero no vinculante.
Acuerdo satisfactorio de referencia (no obligatorio): básica en 6 semanas y completa en 10; A y B reconocidas como modificaciones con calendario propio; DEFENSYS paga 100.000 € sujetos a autorización, Tecnobit absorbe 25.000 € y los 15.000 € restantes se cubren con reducción de alcance, ejecución posterior o modificación aprobada; DEFENSYS confirma prioridades en 48 h y da acceso al entorno de integración; sin penalizaciones nuevas, con hitos de seguimiento y criterios objetivos de aceptación; propuesta de modificación contractual con responsables y fechas. El participante puede alcanzar otros acuerdos satisfactorios.`,
    guiaResultado: `Mide "captura_valor" (0–100) con estas cinco variables y pesos, que siguen las prioridades del briefing del participante:
- Plazo de entrega (30 %): 100 = básica en 6 semanas y completa en 10 con las condiciones de colaboración atadas a ese calendario; 0 = compromete la entrega completa en 6 semanas o cualquier calendario que Tecnobit no puede cumplir.
- Alcance (20 %): 100 = A y B reconocidas formalmente como modificación contractual con calendario propio; 0 = se incluyen como parte del contrato original.
- Precio (25 %): 100 = DEFENSYS cubre al menos 115.000 € o el hueco restante se resuelve con reducción o aplazamiento de alcance, y Tecnobit absorbe 25.000 € o menos; proporcional entre medias; 0 = Tecnobit absorbe más de 25.000 € o asume las funcionalidades gratis.
- Penalizaciones (15 %): 100 = sin penalizaciones nuevas, con hitos y criterios objetivos de aceptación; 0 = acepta cualquier penalización nueva.
- Colaboración (10 %): 100 = los cuatro compromisos de DEFENSYS (prioridades en 48 h, acceso al entorno de integración, interlocutor técnico con capacidad de decisión, aceptación formal del calendario por fases); proporcional según cuántos consiga.
Control de coherencia económica: si el participante compromete recursos, plazos o penalizaciones que no tiene autorizados, esa variable cuenta 0 y lo registras en "compromisos_no_autorizados".
Un "acuerdo completo" exige que las cinco variables queden concretadas y confirmadas por ambas partes; las autorizaciones pendientes (p. ej., la de la dirección de DEFENSYS por encima de 70.000 €) no impiden el acuerdo si quedan explícitas.`,
    rubrica: [
      {
        nombre: 'Preparación y estrategia',
        peso: 10,
        descriptor: 'Llega con objetivos, límites y alternativas claros; sabe qué necesita, qué puede ceder y qué pedirá a cambio. Puede usarse la hoja de preparación como evidencia.',
      },
      {
        nombre: 'Exploración de intereses',
        peso: 20,
        descriptor: 'Investiga las necesidades reales del cliente, qué hay detrás de cada exigencia y cómo decide, en lugar de quedarse en las posiciones.',
      },
      {
        nombre: 'Escucha y adaptación',
        peso: 10,
        descriptor: 'Recoge lo que dice el cliente, verifica, resume y ajusta su propuesta a la información nueva.',
      },
      {
        nombre: 'Argumentación de valor',
        peso: 10,
        descriptor: 'Explica el valor y los riesgos de cada opción (inviabilidad técnica, coste real, cambio de alcance frente a corrección) con argumentos verificables.',
      },
      {
        nombre: 'Gestión de presión',
        peso: 10,
        descriptor: 'Mantiene la calma y una relación constructiva ante la urgencia y la amenaza de cambiar de proveedor, sin ceder por ello.',
      },
      {
        nombre: 'Gestión de concesiones',
        peso: 15,
        descriptor: 'Concede de forma condicionada ("si vosotros…, nosotros…"), dentro de sus límites autorizados, y siempre a cambio de contrapartidas verificables.',
      },
      {
        nombre: 'Creación de alternativas',
        peso: 15,
        descriptor: 'Genera opciones que satisfacen intereses de ambos (entrega por fases, funcionalidades posteriores, reparto del coste, hitos y criterios de aceptación).',
      },
      {
        nombre: 'Cierre y compromisos',
        peso: 10,
        descriptor: 'Cierra un acuerdo concreto y ejecutable: qué, cuándo, precio, aportación de cada parte, autorizaciones pendientes y cómo se formaliza.',
      },
    ],
    niveles: [
      'Nivel 1 · Reactivo: responde a las exigencias sin explorar ni preparar alternativas.',
      'Nivel 2 · Básico: identifica algunas necesidades, pero negocia principalmente desde posiciones.',
      'Nivel 3 · Competente: explora intereses, argumenta valor y plantea intercambios razonables.',
      'Nivel 4 · Avanzado: identifica prioridades ocultas, construye alternativas y gestiona eficazmente las concesiones.',
      'Nivel 5 · Experto: integra intereses, riesgos, valor económico y relación comercial en un acuerdo sólido y ejecutable.',
    ],
    reflexion: [
      '¿Qué información relevante descubriste gracias a tus preguntas?',
      '¿Qué concesión realizaste y qué obtuviste a cambio?',
      '¿Qué harías de manera diferente si repitieras la negociación?',
    ],
  },
];

/** Rol que juega el participante en un caso (el fijo, si el caso lo fija). */
export function rolesDelCaso(caso, rolIdPedido) {
  const rolId = caso.rolParticipante || rolIdPedido;
  if (caso.rolParticipante && rolIdPedido && rolIdPedido !== caso.rolParticipante) return null;
  const rolParticipante = caso.roles.find((r) => r.id === rolId);
  const rolSimulacion = caso.roles.find((r) => r.id !== rolId);
  if (!rolParticipante || !rolSimulacion) return null;
  return { rolParticipante, rolSimulacion };
}

/** Configuración con la que juega la contraparte: la fija del caso, si la tiene. */
export function configDelCaso(caso, configPedida) {
  return caso.configFija ? { ...caso.configFija } : configPedida;
}

export function catalogoPublico() {
  return CASOS.map((c) => {
    const roles = c.rolParticipante ? c.roles.filter((r) => r.id === c.rolParticipante) : c.roles;
    const contraparte = c.rolParticipante ? c.roles.find((r) => r.id !== c.rolParticipante) : null;
    return {
      id: c.id,
      titulo: c.titulo,
      subtitulo: c.subtitulo,
      tipo: c.tipo,
      dificultad: c.dificultad,
      duracion: c.duracion,
      resumen: c.resumen,
      contexto: c.contexto,
      variables: c.variables,
      roles: roles.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion })),
      contraparte: contraparte ? { nombre: contraparte.nombre, descripcion: contraparte.descripcion } : null,
      configFija: c.configFija || null,
      rubrica: c.rubrica ? c.rubrica.map(({ nombre, peso, descriptor }) => ({ nombre, peso, descriptor })) : null,
      niveles: c.niveles || null,
      reflexion: c.reflexion || null,
    };
  });
}

export function buscarCaso(id) {
  return CASOS.find((c) => c.id === id) || null;
}

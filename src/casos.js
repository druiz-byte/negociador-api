/**
 * Catálogo de casos.
 *
 * IMPORTANTE: este fichero vive SOLO en el Worker. Nunca se sirve al navegador.
 * El cliente recibe:
 *   - de cada caso: título, tipo, dificultad, resumen, contexto común y variables
 *   - del rol elegido: su briefing (sus propios límites)
 * La ficha de la contraparte y el mapa de ZOPA no salen nunca del servidor,
 * salvo dentro del informe final que redacta la propia simulación.
 */

export const CASOS = [
  {
    id: 'haizea-interna',
    titulo: 'Recuperar el retraso',
    subtitulo: 'Project Manager vs Director de Producción',
    tipo: 'proyectos',
    dificultad: 'media',
    duracion: '30–40 min',
    resumen:
      'Un proyecto offshore acumula 10 días de retraso y el cliente amenaza con penalizaciones. Producción tiene el equipo al límite. Negociación interna a cinco variables.',
    contexto:
      'ACME fabrica 24 secciones de torre offshore para un parque eólico marino en el norte de Europa. El cliente exige que la primera entrega salga de planta dentro de 14 semanas. El proyecto acumula 10 días de retraso por problemas de ingeniería y retrasos de un proveedor de chapa.\n\nSi no se recuperan al menos 7 días en las próximas 3 semanas, el cliente aplicará penalizaciones de 500.000 € y se pondrá en riesgo una futura adjudicación.\n\nEl Project Manager y el Director de Producción se reúnen para acordar cómo recuperar tiempo.',
    variables: [
      'Prioridad de fabricación',
      'Turnos extra y sábados',
      'Recursos adicionales',
      'Retraso de otro proyecto',
      'Presupuesto adicional',
    ],
    roles: [
      {
        id: 'pm',
        nombre: 'Project Manager',
        descripcion: 'Necesitas recuperar tiempo. Tienes la presión del cliente encima.',
        briefing: `Usted es Project Manager en ACME y dirige el contrato de las 24 secciones de torre.

**Su presión**: si no recupera al menos 7 días en las próximas 3 semanas, el cliente aplicará 500.000 € de penalizaciones y peligra una futura adjudicación.

**Sus objetivos**

| Variable | Lo ideal | Su límite |
|---|---|---|
| Prioridad | Que Producción priorice este proyecto sobre el resto durante 3 semanas | Como mínimo, prioridad parcial |
| Turnos | 3 semanas de turno extra de noche + 2 sábados | Como mínimo, 2 semanas de turno extra + 1 sábado |
| Presupuesto | Gastar menos de 40.000 € | Tiene autorización para aprobar hasta 80.000 € |
| Otro proyecto | Retrasar 2 semanas otro proyecto menos rentable | Mínimo aceptable: 1 semana |
| Recursos | Incorporar 2 soldadores temporales + 1 jefe de turno | Máximo que aceptaría: 4 soldadores + 2 jefes de turno |

Sabe que Producción va a pedir recursos adicionales.

**No obtendrá ningún reconocimiento por ningún otro aspecto de la negociación.**`,
      },
      {
        id: 'produccion',
        nombre: 'Director de Producción',
        descripcion: 'Tu equipo está al límite y dos supervisores te han avisado del riesgo.',
        briefing: `Usted es Director de Producción en ACME.

**Su situación**: ya ha cedido recursos dos veces este trimestre y su equipo está muy tensionado. Dos supervisores le han advertido de que trabajar demasiadas semanas con turnos extra puede afectar a la seguridad y a la calidad. Es su argumento más fuerte: no lo suelte demasiado pronto.

**Sus objetivos**

| Variable | Lo ideal | Su límite |
|---|---|---|
| Prioridad | No dar prioridad a este proyecto frente al resto | Como máximo, prioridad parcial durante 2 semanas |
| Turnos | Ninguno | No aceptar más de 2 semanas de turno extra y 2 sábados |
| Recursos | 4 soldadores temporales + 2 jefes de turno | Mínimo que aceptaría: 2 soldadores + 1 jefe de turno |
| Otro proyecto | No tocarlo | Podría aceptar 1 semana; el máximo, 2 semanas |
| Presupuesto | 100.000 € | Mínimo que aceptaría: 50.000 € |

**No obtendrá ningún reconocimiento por ningún otro aspecto de la negociación.**`,
      },
    ],
    zopa: `MAPA DE ZOPA (solo para el informe final, nunca durante la negociación):
- Prioridad: acuerdo posible en prioridad parcial ~2 semanas. Tensión media.
- Turnos: acuerdo en 2 semanas de turno extra + 1–2 sábados. Tensión baja.
- Recursos: acuerdo entre 2 sold.+1 jefe y 4 sold.+2 jefes. Es la moneda natural: barato para el PM, muy valioso para Producción.
- Otro proyecto: acuerdo en 1–2 semanas de retraso. Tensión baja.
- Presupuesto: ZOPA de 50.000 a 80.000 €. Tensión ALTA: el óptimo de cada parte está fuera del rango del otro.
Lectura: hay acuerdo posible en todo. El PM que negocia variable a variable paga de más; el que construye paquete cierra en 50–60.000 €. El aprendizaje central es no regalar los recursos.`,
  },

  {
    id: 'haizea-cliente',
    titulo: 'Suministro offshore',
    subtitulo: 'MG Industries vs ACME',
    tipo: 'comercial',
    dificultad: 'alta',
    duracion: '40–50 min',
    resumen:
      'Contrato de 18 estructuras offshore por 42 millones. El cliente presiona en precio, plazos y penalizaciones tras un proyecto anterior con retrasos. Zona de acuerdo muy estrecha.',
    contexto:
      'MG Industries negocia con ACME el suministro de 18 estructuras offshore para un nuevo parque eólico. ACME ha presentado una oferta de 42 millones de euros con entrega en 16 meses.\n\nEl proyecto anterior entre ambas empresas sufrió retrasos, y el cliente necesita mejores garantías. Es una reunión decisiva entre el comprador de proyectos offshore y el director comercial de ACME.',
    variables: [
      'Precio',
      'Adelanto de entregas parciales',
      'Penalizaciones por retraso',
      'Equipo de seguimiento y reuniones',
    ],
    roles: [
      {
        id: 'comprador',
        nombre: 'Comprador (MG Industries)',
        descripcion: 'Quieres bajar el precio y blindarte con garantías. Tienes alternativa.',
        briefing: `Usted es comprador de proyectos offshore en MG Industries.

**Sus objetivos**

| Variable | Lo ideal | Su límite |
|---|---|---|
| Precio | Cerrar en 38,5 millones de euros | El máximo que puede aceptar: 40,5 millones |
| Entregas parciales | Recibir la primera entrega 3 meses antes del plazo final | Mínimo aceptable: 2 meses antes |
| Penalizaciones | 1,5 % del valor del contrato por semana de retraso, con tope del 10 % | Mínimo que aceptaría: 1 % por semana con tope del 7 % |
| Seguimiento | Equipo exclusivo de proyecto + reuniones mensuales | Como mínimo, reuniones mensuales |

**Su alternativa (MAAN)**: tiene otro proveedor que podría hacer el proyecto un 5 % más barato, aunque con más riesgo técnico.

**Su palanca**: el proyecto anterior con ACME sufrió retrasos.

**No obtendrá ningún reconocimiento por ningún otro aspecto de la negociación.**`,
      },
      {
        id: 'vendedor',
        nombre: 'Director Comercial (ACME)',
        descripcion: 'Defiendes el precio y quieres evitar penalizaciones duras.',
        briefing: `Usted es Director Comercial de ACME.

MG Industries considera que el precio es demasiado alto y quiere además garantías más fuertes de plazo.

**Sus objetivos**

| Variable | Lo ideal | Su límite |
|---|---|---|
| Precio | Mantener el precio en 42 millones de euros | El mínimo que puede aceptar: 40 millones |
| Entregas parciales | No adelantar nada | Como máximo, adelantar la primera entrega 2 meses |
| Penalizaciones | Aceptar un máximo del 0,5 % por semana, con tope del 5 % | El máximo que aceptaría: 1 % por semana, con tope del 7 % |
| Seguimiento | Solo reuniones trimestrales | Podría aceptar reuniones mensuales **si obtiene algo a cambio** |

**Su margen**: puede reducir el precio hasta 1,5 millones si obtiene concesiones relevantes en otros puntos.

**No obtendrá ningún reconocimiento por ningún otro aspecto de la negociación.**`,
      },
    ],
    zopa: `MAPA DE ZOPA (solo para el informe final, nunca durante la negociación):
- Precio: ZOPA de 40 a 40,5 M€ sobre una oferta de 42. Muy estrecha.
- Entregas: único punto viable, exactamente 2 meses de adelanto.
- Penalizaciones: único punto viable, exactamente 1 % por semana con tope del 7 %.
- Seguimiento: reuniones mensuales; el equipo dedicado es la moneda más barata para el vendedor y la más visible para el comprador.
Lectura: con ZOPA tan estrecha, el acuerdo solo aparece si se negocia en paquete. Variable a variable, la negociación revienta o se cierra fuera de límites.
Nota: la ficha original del vendedor tiene una ambigüedad (un margen de 1,5 M€ situaría el suelo en 40,5 y no en 40). Se toma 40 M€ como suelo real y los 1,5 M€ como margen fácil.`,
  },
];

export function catalogoPublico() {
  return CASOS.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    subtitulo: c.subtitulo,
    tipo: c.tipo,
    dificultad: c.dificultad,
    duracion: c.duracion,
    resumen: c.resumen,
    contexto: c.contexto,
    variables: c.variables,
    roles: c.roles.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion })),
  }));
}

export function buscarCaso(id) {
  return CASOS.find((c) => c.id === id) || null;
}

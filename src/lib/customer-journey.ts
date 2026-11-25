export type JourneyStage = {
  name: string;
  goal: string;
  action: string;
  touchpoint: string;
  thought: string;
  emotion: string;
  friction: string;
  opportunity: string;
  to:
    | "/servicios"
    | "/disenos"
    | "/cotizar"
    | "/asesoria"
    | "/seguimiento"
    | "/contacto"
    | "/cuenta"
    | "/panel";
  cta: string;
};

export type CustomerJourney = {
  id: string;
  label: string;
  persona: string;
  scenario: string;
  outcome: string;
  note: string;
  stages: JourneyStage[];
};

export const CUSTOMER_JOURNEYS: CustomerJourney[] = [
  {
    id: "fabricacion",
    label: "Fabricar una pieza",
    persona: "Técnico, profesional o emprendedor",
    scenario:
      "Necesita un repuesto o prototipo y cuenta con una idea, un boceto, una pieza física o un archivo 3D.",
    outcome: "Recibir una pieza que responda a los requisitos acordados.",
    note: "La estimación inicial es orientativa. El equipo confirma precio, material y plazo al revisar el proyecto; diseño y envío se acuerdan por separado.",
    stages: [
      {
        name: "Descubrimiento",
        goal: "Encontrar quién puede resolver su necesidad.",
        action: "Explora servicios y ejemplos de piezas.",
        touchpoint: "Inicio · Servicios · Ejemplos",
        thought: "¿Pueden fabricar lo que necesito?",
        emotion: "Curiosidad",
        friction: "No sabe si su idea es viable ni qué información preparar.",
        opportunity:
          "Mostrar aplicaciones concretas y explicar que puede empezar sin un archivo 3D.",
        to: "/servicios",
        cta: "Conocer los servicios",
      },
      {
        name: "Evaluación",
        goal: "Entender las opciones y el costo aproximado.",
        action: "Consulta materiales y prueba la estimación sin cuenta.",
        touchpoint: "Materiales · Cotizador · Asesoría",
        thought: "¿Qué material me conviene y cuánto costaría?",
        emotion: "Incertidumbre",
        friction: "Desconoce peso, horas de impresión o requisitos técnicos.",
        opportunity: "Ofrecer tamaños de referencia y orientación según el uso de la pieza.",
        to: "/cotizar",
        cta: "Estimar mi pieza",
      },
      {
        name: "Solicitud",
        goal: "Enviar el proyecto para una revisión técnica.",
        action: "Inicia sesión, describe la necesidad y guarda la solicitud con sus datos.",
        touchpoint: "Cuenta · Cotizador",
        thought: "¿Habrá suficiente información para cotizar?",
        emotion: "Expectativa",
        friction: "Registrarse o reunir medidas y archivos puede interrumpir el envío.",
        opportunity:
          "Explicar qué datos son necesarios y permitir comenzar con una descripción sencilla.",
        to: "/cotizar",
        cta: "Solicitar una cotización",
      },
      {
        name: "Aprobación",
        goal: "Acordar alcance, precio y plazo antes de fabricar.",
        action: "Revisa la propuesta con el equipo y confirma las condiciones del pedido.",
        touchpoint: "Asesoría · Contacto · Seguimiento",
        thought: "¿La propuesta cubre lo que mi pieza debe hacer?",
        emotion: "Confianza en construcción",
        friction: "Puede confundir la estimación con el precio definitivo.",
        opportunity:
          "Detallar material, tolerancias, cantidad y conceptos incluidos en la propuesta.",
        to: "/asesoria",
        cta: "Consultar con el equipo",
      },
      {
        name: "Fabricación",
        goal: "Saber cómo avanza el proyecto.",
        action: "Consulta con su cuenta y código el estado registrado por el equipo.",
        touchpoint: "Seguimiento · Cuenta",
        thought: "¿En qué etapa está mi pieza?",
        emotion: "Anticipación",
        friction: "Necesita visibilidad del avance y de posibles cambios de plazo.",
        opportunity: "Mantener actualizados los estados y comunicar los cambios acordados.",
        to: "/seguimiento",
        cta: "Consultar seguimiento",
      },
      {
        name: "Entrega y continuidad",
        goal: "Comprobar el resultado y resolver ajustes.",
        action:
          "Recibe la pieza según lo acordado, prueba su ajuste y contacta al equipo si necesita ayuda.",
        touchpoint: "Entrega coordinada · Contacto",
        thought: "¿Funciona como esperaba? ¿Puedo pedir otra?",
        emotion: "Satisfacción esperada",
        friction: "Pueden surgir dudas de uso o diferencias respecto a la aplicación prevista.",
        opportunity: "Dar indicaciones de uso y recoger comentarios para una siguiente versión.",
        to: "/contacto",
        cta: "Compartir comentarios",
      },
    ],
  },
  {
    id: "archivo",
    label: "Comprar un archivo 3D",
    persona: "Persona que necesita un diseño para fabricar por su cuenta",
    scenario:
      "Busca un modelo digital existente, compara sus características y desea acceder al archivo con una licencia clara.",
    outcome: "Descargar el diseño comprado después de la verificación del pago.",
    note: "Cada archivo se compra por separado. El pago se coordina con el equipo y la descarga se habilita tras su verificación manual. La fabricación se cotiza aparte.",
    stages: [
      {
        name: "Descubrimiento",
        goal: "Encontrar un diseño que resuelva su necesidad.",
        action: "Explora el catálogo público sin registrarse.",
        touchpoint: "Inicio · Diseños",
        thought: "¿Existe un modelo que me sirva?",
        emotion: "Curiosidad",
        friction: "Le cuesta identificar el diseño adecuado entre las opciones.",
        opportunity: "Facilitar búsqueda y categorías con imágenes y nombres claros.",
        to: "/disenos",
        cta: "Explorar diseños",
      },
      {
        name: "Evaluación",
        goal: "Confirmar compatibilidad, precio y derechos de uso.",
        action: "Revisa la ficha, descripción, material sugerido, complejidad y licencia.",
        touchpoint: "Ficha del diseño · Preguntas frecuentes",
        thought: "¿Podré usar este archivo para mi proyecto?",
        emotion: "Cautela",
        friction: "Puede confundir la compra del archivo con recibir una pieza física.",
        opportunity:
          "Explicar el contenido digital y las condiciones de licencia antes de solicitar la compra.",
        to: "/disenos",
        cta: "Comparar diseños",
      },
      {
        name: "Solicitud de compra",
        goal: "Registrar la compra del diseño elegido.",
        action: "Crea su cuenta o inicia sesión y solicita la compra desde la ficha.",
        touchpoint: "Cuenta · Ficha del diseño",
        thought: "¿Dónde encuentro mi solicitud después?",
        emotion: "Expectativa",
        friction: "El registro añade un paso antes de obtener el archivo.",
        opportunity:
          "Explicar por qué la cuenta permite vincular la compra y acceder a la descarga.",
        to: "/cuenta",
        cta: "Acceder a mi cuenta",
      },
      {
        name: "Pago y verificación",
        goal: "Coordinar el pago y obtener acceso.",
        action: "Contacta al equipo con su referencia y espera la verificación manual del pago.",
        touchpoint: "Contacto · Referencia de compra",
        thought: "¿Ya confirmaron mi pago?",
        emotion: "Incertidumbre",
        friction: "La descarga no se habilita inmediatamente al registrar la compra.",
        opportunity:
          "Explicar el proceso manual y facilitar la consulta con la referencia de compra.",
        to: "/contacto",
        cta: "Coordinar mi pago",
      },
      {
        name: "Descarga",
        goal: "Obtener el archivo por el que pagó.",
        action: "Accede desde su cuenta al diseño habilitado después de la verificación.",
        touchpoint: "Cuenta · Mis proyectos",
        thought: "¿Dónde descargo el modelo?",
        emotion: "Alivio esperado",
        friction: "Puede buscar la descarga antes de que el equipo habilite el acceso.",
        opportunity: "Hacer visible el estado de la compra y el acceso al archivo autorizado.",
        to: "/panel",
        cta: "Ver mis proyectos",
      },
      {
        name: "Uso y continuidad",
        goal: "Usar el diseño respetando la licencia.",
        action:
          "Revisa las instrucciones y contacta al equipo si requiere orientación o fabricación.",
        touchpoint: "Documentación del diseño · Contacto · Cotizador",
        thought: "¿Cómo lo fabrico o adapto a mi necesidad?",
        emotion: "Autonomía esperada",
        friction: "El modelo puede requerir ajustes o parámetros para su aplicación.",
        opportunity: "Ofrecer orientación y una cotización independiente para la pieza física.",
        to: "/cotizar",
        cta: "Cotizar su fabricación",
      },
    ],
  },
];

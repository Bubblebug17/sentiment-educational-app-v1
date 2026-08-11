/**
 * Definición del test SaveMind.
 * weight: 0 = mejor respuesta; sube según empeora el estado.
 * Escala 0–4 (5 opciones) u 0–3 (4 opciones).
 *
 * Resultado por peso total:
 *   0–4  → Bien
 *   5–10 → Regular
 *   11–15 → Mal
 *   >15  → Muy mal
 */
window.SAVEMIND_QUESTIONS = [
  {
    id: "q1",
    text: "¿Cómo te has sentido esta semana?",
    image: "img/q1-bot.png",
    type: "options",
    options: [
      { id: "muy-bien", label: "Muy bien", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "bien", label: "Bien", weight: 1, icon: "img/icons/mood-bien.png", tone: "mint" },
      { id: "regular", label: "Regular", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "mal", label: "Mal", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "muy-mal", label: "Muy mal", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  },
  {
    id: "q2",
    text: "¿Con qué frecuencia sientes estrés por las tareas o estudios?",
    image: "img/q2-book.png",
    type: "options",
    options: [
      { id: "nunca", label: "Nunca", weight: 0, icon: "img/icons/check-green.png", tone: "green" },
      { id: "a-veces", label: "A veces", weight: 1, icon: "img/icons/clock-blue.png", tone: "blue" },
      { id: "casi-siempre", label: "Casi siempre", weight: 2, icon: "img/icons/alert-yellow.png", tone: "yellow" },
      { id: "siempre", label: "Siempre", weight: 3, icon: "img/icons/alert-red.png", tone: "red" }
    ]
  },
  {
    id: "q3",
    text: "¿Te resulta fácil expresar lo que sientes?",
    image: "img/q3-chat.png",
    type: "options",
    options: [
      { id: "si-siempre", label: "Sí, siempre", weight: 0, icon: "img/icons/check-green.png", tone: "green" },
      { id: "a-veces", label: "A veces", weight: 1, icon: "img/icons/clock-blue.png", tone: "blue" },
      { id: "pocas-veces", label: "Pocas veces", weight: 2, icon: "img/icons/alert-yellow.png", tone: "yellow" },
      { id: "casi-nunca", label: "No, casi nunca", weight: 3, icon: "img/icons/alert-red.png", tone: "red" }
    ]
  },
  {
    id: "q4",
    text: "Cuando estás triste o molesto, ¿qué sueles hacer?",
    image: "img/q4-heart.png",
    type: "options",
    options: [
      { id: "hablar", label: "Hablar con alguien", weight: 0, icon: "img/icons/person-green.png", tone: "green" },
      { id: "musica", label: "Escuchar música", weight: 1, icon: "img/icons/headphones-blue.png", tone: "blue" },
      { id: "salir", label: "Salir o distraerme", weight: 2, icon: "img/icons/walk-yellow.png", tone: "yellow" },
      { id: "guardarmelo", label: "Guardármelo", weight: 3, icon: "img/icons/lock-orange.png", tone: "orange" }
    ]
  },
  {
    id: "q5",
    text: "¿Cómo calificarías tu estado de ánimo hoy?",
    image: "img/q5-smile.png",
    type: "stars",
    maxStars: 5,
    hint: "Selecciona de 1 a 5 estrellas",
    /* 5★ → 0 (mejor), 1★ → 4 (peor) */
    weightFromStars: (stars) => 5 - stars
  },
  {
    id: "q6",
    text: "¿Qué tan motivado(a) te has sentido para hacer tus actividades?",
    image: "img/q6-rocket.png",
    type: "options",
    options: [
      { id: "muy-motivado", label: "Muy motivado(a)", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "motivado", label: "Motivado(a)", weight: 1, icon: "img/icons/mood-bien.png", tone: "blue" },
      { id: "neutral", label: "Neutral", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "poco-motivado", label: "Poco motivado(a)", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "sin-motivacion", label: "Sin motivación", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  },
  {
    id: "q7",
    text: "¿Cómo ha sido tu calidad de sueño esta semana?",
    image: "img/q7-moon.png",
    type: "options",
    options: [
      { id: "muy-buena", label: "Muy buena", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "buena", label: "Buena", weight: 1, icon: "img/icons/mood-bien.png", tone: "blue" },
      { id: "regular", label: "Regular", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "mala", label: "Mala", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "muy-mala", label: "Muy mala", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  },
  {
    id: "q8",
    text: "¿Con qué frecuencia sientes ansiedad o preocupación sin razón aparente?",
    image: "img/q8-thought.png",
    type: "options",
    options: [
      { id: "nunca", label: "Nunca", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "rara-vez", label: "Rara vez", weight: 1, icon: "img/icons/mood-bien.png", tone: "blue" },
      { id: "a-veces", label: "A veces", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "frecuentemente", label: "Frecuentemente", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "siempre", label: "Siempre", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  },
  {
    id: "q9",
    text: "¿Tienes con quién hablar cuando te sientes mal?",
    image: "img/q9-people.png",
    type: "options",
    options: [
      { id: "siempre", label: "Siempre", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "casi-siempre", label: "Casi siempre", weight: 1, icon: "img/icons/mood-bien.png", tone: "blue" },
      { id: "a-veces", label: "A veces", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "pocas-veces", label: "Pocas veces", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "nunca", label: "Nunca", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  },
  {
    id: "q10",
    text: "¿Cómo describirías tu nivel de energía durante el día?",
    image: "img/q10-battery.png",
    type: "options",
    options: [
      { id: "muy-alto", label: "Muy alto", weight: 0, icon: "img/icons/mood-muy-bien.png", tone: "green" },
      { id: "alto", label: "Alto", weight: 1, icon: "img/icons/mood-bien.png", tone: "blue" },
      { id: "medio", label: "Medio", weight: 2, icon: "img/icons/mood-regular.png", tone: "yellow" },
      { id: "bajo", label: "Bajo", weight: 3, icon: "img/icons/mood-mal.png", tone: "orange" },
      { id: "muy-bajo", label: "Muy bajo", weight: 4, icon: "img/icons/mood-muy-mal.png", tone: "red" }
    ]
  }
];

window.SAVEMIND_RESULTS = {
  bien: {
    id: "bien",
    title: "Tu resultado",
    headline: "¡Vas muy bien!",
    image: "img/result-bien.png",
    tone: "green",
    cta: "Ver consejos",
    ctaHref: "#",
    recommendations: [
      { icon: "img/icons/rec-walk.png", text: "Mantén tus hábitos saludables" },
      { icon: "img/icons/rec-people.png", text: "Sigue compartiendo cómo te sientes" },
      { icon: "img/icons/rec-star.png", text: "Celebra tus pequeños logros" }
    ]
  },
  regular: {
    id: "regular",
    title: "Tu resultado",
    headline: "Puedes sentirte mejor",
    image: "img/result-regular.png",
    tone: "yellow",
    cta: "Ver consejos",
    ctaHref: "#",
    recommendations: [
      { icon: "img/icons/rec-breath.png", text: "Prueba una pausa de respiración" },
      { icon: "img/icons/rec-sleep.png", text: "Cuida tu descanso esta semana" },
      { icon: "img/icons/rec-chat.png", text: "Habla con alguien de confianza" }
    ]
  },
  mal: {
    id: "mal",
    title: "Tu resultado",
    headline: "Necesitas cuidarte más",
    image: "img/result-mal.png",
    tone: "orange",
    cta: "Ver consejos",
    ctaHref: "#",
    recommendations: [
      { icon: "img/icons/rec-heart.png", text: "Prioriza tu bienestar hoy" },
      { icon: "img/icons/rec-breath.png", text: "Haz una actividad que te calme" },
      { icon: "img/icons/rec-people.png", text: "Pide apoyo a alguien cercano" }
    ]
  },
  "muy-mal": {
    id: "muy-mal",
    title: "Tu resultado",
    headline: "Pide ayuda, no estás solo",
    image: "img/result-muy-mal.png",
    tone: "red",
    cta: "Buscar ayuda",
    ctaHref: "#",
    recommendations: [
      { icon: "img/icons/rec-help.png", text: "Contacta a un adulto de confianza" },
      { icon: "img/icons/rec-phone.png", text: "Busca orientación profesional" },
      { icon: "img/icons/rec-heart.png", text: "Recuerda: pedir ayuda es valiente" }
    ]
  }
};

window.SAVEMIND_resolveResult = function resolveResult(totalWeight) {
  if (totalWeight <= 4) return window.SAVEMIND_RESULTS.bien;
  if (totalWeight <= 10) return window.SAVEMIND_RESULTS.regular;
  if (totalWeight <= 15) return window.SAVEMIND_RESULTS.mal;
  return window.SAVEMIND_RESULTS["muy-mal"];
};

/** Pantalla final: Consejos Generales */
window.SAVEMIND_TIPS = [
  {
    id: "respiracion",
    title: "Ejercicio de respiración",
    subtitle: "Reduce el estrés en minutos",
    icon: "img/icons/tip-breath.png",
    tone: "blue"
  },
  {
    id: "frases",
    title: "Frases que te ayudan",
    subtitle: "Lee y motívate cada día",
    icon: "img/icons/tip-phrases.png",
    tone: "purple"
  },
  {
    id: "musica",
    title: "Música para relajarte",
    subtitle: "Escucha y calma tu mente",
    icon: "img/icons/tip-music.png",
    tone: "lavender"
  },
  {
    id: "contactos",
    title: "Contactos de apoyo",
    subtitle: "Estamos aquí para ti",
    icon: "img/icons/tip-support.png",
    tone: "teal"
  }
];

const TRANSLATIONS = {
  "en-EN": {
    title: "A Victorian Pastime",
    name: "Hangman",
    howToPlay: "How to Play",
    hero: "A Game of Wits & Words",
    easy: "Easy",
    easyDescription: "6-letter words",
    medium: "Medium",
    mediumDescription: "8-letter words",
    hard: "Hard",
    hardDescription: "10+ letter words",
    start: "Begin Amusement",
  },
  "es-ES": {
    title: "Un Pasatiempo Victoriano",
    name: "El Ahorcado",
    howToPlay: "¿Cómo Jugar?",
    hero: "Un Juego de Ingenio y Palabras",
    easy: "Fácil",
    easyDescription: "Palabras de 6 letras",
    medium: "Medio",
    mediumDescription: "Palabras de 8 letras",
    hard: "Difícil",
    hardDescription: "Palabras de más de 10 letras",
    start: "Empieza la diversión",
  },
};

export const getTranslation = (language, key) => {
  return TRANSLATIONS[language][key] || TRANSLATIONS["en-EN"][key];
};

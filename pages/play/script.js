import { setPageTitle } from "../../utils.js";

const difficulty = new URLSearchParams(window.location.search).get(
  "difficulty"
);

if (!difficulty) {
  alert("No se ha especificado el nivel de dificultad");
}

setPageTitle(`Hangman - ${difficulty}`);

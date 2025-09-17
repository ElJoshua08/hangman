import { getRandomWord } from "./utils.js";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

// Change everything to a game class

// Game state enum
const GAME_STATE = Object.freeze({
  PLAYING: Symbol("playing"),
  PAUSED: Symbol("paused"),
});

const MAX_COUNTDOWN = 120;

class Game {
  constructor() {
    this.gameState = GAME_STATE.PLAYING;
    this.countdown = MAX_COUNTDOWN;

    this.word = "";
  }

  async init() {
    this.word = await getRandomWord();
    this.setup();
  }

  setup() {
    this.displayKeyboard();
    this.displayWordHint();
    this.displayCountdown();
  }

  displayKeyboard() {
    const $keyboard = document.getElementById("keyboard");

    keys.forEach((row) => {
      const $row = document.createElement("div");
      $row.className = "flex flex-row items-center justify-center gap-4";

      row.forEach((key) => {
        const $key = document.createElement("button");
        $key.className = "keyboard-key";
        $key.textContent = key;
        $key.dataset.key = key;

        $key.addEventListener("click", (e) => {
          e.preventDefault();
          useKey(key);
        });

        $row.appendChild($key);
      });

      $keyboard.appendChild($row);
    });
  }

  displayWordHint() {
    const $wordDisplay = document.getElementById("word-display");

    const splitWord = this.word.split("");

    splitWord.forEach((letter) => {
      const $letter = document.createElement("display-character");

      $letter.setAttribute("character", letter);
      $letter.setAttribute("show", "false");

      $wordDisplay.appendChild($letter);
    });
  }

  displayCountdown() {
    const $countdown = document.getElementById("countdown");

    if (this.gameState !== GAME_STATE.PLAYING) {
      $countdown.innerHTML = "Paused";
    } else {
      setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
          $countdown.innerHTML = this.countdown; // Format to minutes and secs
        }
      }, 1000);
    }
  }

  checkForKeyPress() {
    
  }
} 

const game = new Game();
game.init();

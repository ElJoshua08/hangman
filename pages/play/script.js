import { getRandomWord } from "./utils.js";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

// Game state enum
const GAME_STATE = Object.freeze({
  PLAYING: Symbol("playing"),
  PAUSED: Symbol("paused"),
});

// Lost reason enum
const LOST_REASONS = Object.freeze({
  MAX_ATTEMPTS_EXCEEDED: Symbol("max_attempts_exceeded"),
  MAX_TIME_EXCEEDED: Symbol("max_time_exceeded"),
});

// This needs to be configured inside
// the constructor to enable multiple game modes.
const MAX_COUNTDOWN = 120;

class Game {
  constructor() {
    this.gameState = GAME_STATE.PLAYING;
    this.countdown = MAX_COUNTDOWN;

    this.word = "";
    this.usedCharacters = [];
    this.failedAttempts = 0;

    this.hangmanParts = Array.from(
      document.querySelectorAll("svg path")
    ).filter(($part) => $part.classList.length > 0);

    this.maxAttemps = this.hangmanParts.length;
  }

  async init() {
    this.word = await getRandomWord("es");
    this.setup();
  }

  setup() {
    // * Display everything
    this.displayKeyboard();
    this.displayWordHint();
    this.displayCountdown();

    // * Hide hangman parts
    this.hideHangman();

    // * Checks
    this.onKeyDown();
  }

  // -----------------------
  // ------- Hangman -------
  // -----------------------
  hideHangman() {
    console.log(this.hangmanParts);

    this.hangmanParts.forEach(($part) => {
      $part.style.display = "none";
    });
  }

  showNextHangmanPart() {
    const PARTS_ORDER = [
      "ground",
      "column",
      "ledge",
      "corner",
      "rope",
      "head",
      "body",
      "arms",
      "leg-left",
      "leg-right",
    ];

    const currentPartIndex = PARTS_ORDER[this.failedAttempts - 1];

    const $partToShow = document.querySelector(`.${currentPartIndex}`);
    $partToShow.style.display = "block";
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
          this.checkKey(key);
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
    const $countdown = document
      .getElementById("countdown")
      .querySelector("span");

    if (this.gameState !== GAME_STATE.PLAYING) {
      $countdown.innerHTML = "Paused";
      return;
    }

    // Clear any previous interval if needed
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        const minutes = Math.floor(this.countdown / 60);
        const seconds = this.countdown % 60;
        $countdown.innerHTML = `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`;
      } else {
        this.activateLostDialog(LOST_REASONS.MAX_TIME_EXCEEDED);
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  onKeyDown() {
    document.addEventListener("keydown", (e) => {
      if (keys.flat().includes(e.key)) {
        this.checkKey(e.key);
      }
    });
  }

  // Check if the key is in the word
  checkKey(key) {
    if (this.usedCharacters.includes(key)) return;
    this.usedCharacters.push(key);

    const wordSplit = this.word.split("");

    if (wordSplit.includes(key)) {
      const $displayCharacters = document.querySelectorAll(
        `[character=${key}]`
      );
      $displayCharacters.forEach(($displayCharacter) =>
        $displayCharacter.setAttribute("show", "true")
      );
    } else {
      this.triggerBadAttempt();
    }

    const $character = document.querySelector(`[data-key=${key}]`);
    $character.classList.toggle("used", true);
  }

  triggerBadAttempt() {
    // First add a new bad attempt
    this.failedAttempts++;

    // Then show next hangman part
    this.showNextHangmanPart();

    // Then check for a game lost
    if (this.failedAttempts >= this.maxAttemps) {
      this.activateLostDialog(LOST_REASONS.MAX_ATTEMPTS_EXCEEDED);
    }

    // This is sorted in this order because the hangman needs to appear before the game loss dialog.
  }

  activateLostDialog(reason) {
    console.log("game lost");

    const $dialog = document.getElementById("game-over-dialog");

    console.log($dialog);

    $dialog.show();
  }
}

const game = new Game();
game.init();

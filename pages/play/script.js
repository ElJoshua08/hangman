import { getRandomWord } from "./utils.js";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const usedKeys = [];
let word = "";

const $wordDisplay = document.getElementById("word-display");
const $keyboard = document.getElementById("keyboard");

async function init() {
  try {
    word = await getRandomWord();

    console.log(word);

    renderWordDisplay();
    renderKeyboard();
    checkForKeyPress();
  } catch (error) {
    console.error("Game initialization failed:", error);
    $wordDisplay.textContent = "Error fetching word";
  }
}

function renderKeyboard() {
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

function renderWordDisplay() {
  const splitWord = word.split("");

  splitWord.forEach((letter) => {
    const $letter = document.createElement("display-character");
    $letter.setAttribute("character", letter);
    $letter.setAttribute("show", "false");

    $wordDisplay.appendChild($letter);
  });
}

function checkForKeyPress() {
  document.addEventListener("keydown", (e) => {
    if (keys.flat().includes(e.key)) {
      e.preventDefault();
      useKey(e.key);
    }
  });
}

function useKey(key) {
  if (usedKeys.includes(key)) return;
  usedKeys.push(key);

  const $key = document.querySelector(`[data-key="${key}"]`);
  $key.classList.add("used");

  const $displayKey = document.querySelector(`[data-display-key="${key}"]`);

  if (!$displayKey) return;

  $displayKey.setAttribute("show", "true");

  console.log($displayKey.getAttribute("show"));
}

init();

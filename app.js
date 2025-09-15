import { getTranslation } from "./translations.js";
import { getLocalStorage, setLocalStorage } from "./utils.js";

/**
 * *Control of language
 */

const $languages = document.querySelectorAll("[data-language]");
const $keys = document.querySelectorAll("[data-language-key]");

document.addEventListener("DOMContentLoaded", () => {
  const localStorageValue = getLocalStorage("prefered-language");
  const preferedLanguage = localStorageValue || navigator.language;

  if (!localStorageValue) {
    setLocalStorage("prefered-language", $languages[0].dataset.language);
  }

  $keys.forEach((key) => {
    key.innerHTML = getTranslation(preferedLanguage, key.dataset.languageKey);
  });
});

$languages.forEach((language) => {
  language.addEventListener("click", (e) => {
    e.preventDefault();

    const languageChannel = new BroadcastChannel("language");
    languageChannel.postMessage({
      language: language.dataset.language,
    });

    setLocalStorage("prefered-language", language.dataset.language);
  });
});

// * Whe receive languages outside the eventListener because then we can update the language of every tab open
const receiveLanguageChannel = new BroadcastChannel("language");
receiveLanguageChannel.onmessage = (e) => {
  const language = e.data.language;

  // ! This can be made a function maybe from the language.js file
  $keys.forEach((key) => {
    key.innerHTML = getTranslation(language, key.dataset.languageKey);
  });
};

/**
 * *Dialogs Section
 */

const $dialogs = document.querySelectorAll("[data-dialog]");
const $triggers = document.querySelectorAll("[data-trigger-for]");

$dialogs.forEach((dialog) => {
  dialog.classList.add("dialog");
});

$triggers.forEach((trigger) => {
  // Handle click event
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    const dialog = document.querySelector(
      `[data-dialog="${trigger.dataset.triggerFor}"]`
    );

    dialog.classList.toggle("open");
  });
});

// * This is for handling the click outside of an open dialog
document.addEventListener("click", (e) => {
  $dialogs.forEach((dialog) => {
    if (dialog.classList.contains("open")) {
      if (
        !dialog.contains(e.target) &&
        !e.target.closest("[data-trigger-for]")
      ) {
        dialog.classList.remove("open");
      }
    }
  });
});

/**
 * * Custom components
 */

class DifficultyCard extends HTMLElement {
  connectedCallback() {
    const hoverRottation = Math.floor(Math.random() * 3 + 3);

    const title = this.getAttribute("title");
    const description = this.getAttribute("description");
    const key = this.getAttribute("key");

    this.innerHTML = `
      <div class="p-6 card difficulty-card transition-all duration-300">
        <h3 class="font-serif-display text-2xl font-normal text-[var(--text-color)]"
            data-language-key="${key}">
          ${title}
        </h3>
        <p class="text-sm text-[var(--accent-color)] mt-1"
           data-language-key="${key}Description">
          ${description}
        </p>
      </div>
    `;
  }
}

customElements.define("difficulty-card", DifficultyCard);

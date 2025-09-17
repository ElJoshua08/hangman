import "./components/index.js";

import * as translations from "./constants/translations.js";
import * as utils from "./constants/utils.js";

const { getTranslation } = translations;
const { getLocalStorage, setLocalStorage } = utils;

/**
 * *Control of language
 */

const $languages = document.querySelectorAll("[data-language]");

document.addEventListener("DOMContentLoaded", () => {
  const localStorageValue = getLocalStorage("prefered-language");

  const preferedLanguage = localStorageValue || navigator.language || "en-EN";

  if (!localStorageValue) {
    setLocalStorage(
      "prefered-language",
      $languages[0] ? $languages.dataset.language : "en-EN",
    );
  }

  // ? We are querying the keys inside the listener instead of one global query because we want to listen for new keys like the difficulty-cards custom element keys.
  const $keys = document.querySelectorAll("[data-language-key]");

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
  const $keys = document.querySelectorAll("[data-language-key]");

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
      `[data-dialog="${trigger.dataset.triggerFor}"]`,
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

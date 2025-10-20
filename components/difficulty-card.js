import { getRandomInt } from "../../constants/utils.js";

class DifficultyCard extends HTMLElement {
  connectedCallback() {
    let selectedRotation = getRandomInt(-12, 12);
    let selectedScale = getRandomInt(110, 120) / 100;

    this.style.setProperty("--selected-rotation", `${selectedRotation}deg`);
    this.style.setProperty("--selected-scale", `${selectedScale}`);

    // Update on hover
    this.addEventListener("mouseenter", () => {
      const newRotation = getRandomInt(-3, 3);
      const newScale = getRandomInt(105, 110) / 100;

      this.style.setProperty("--hover-rotation", `${newRotation}deg`);
      this.style.setProperty("--hover-scale", `${newScale}`);
    });

    const title = this.getAttribute("title");
    const description = this.getAttribute("description");
    const key = this.getAttribute("key");
    const descriptionKey = this.getAttribute("description-key");

    this.className =
      "p-6 card difficulty-card transition-all duration-300 min-h-26 w-full max-w-2xl";
    this.innerHTML = `<h3 class="font-serif-display text-2xl font-normal text-[var(--text-color)]"
          data-language-key="${key}">
        ${title}
      </h3>
      <p class="text-sm text-[var(--accent-color)] mt-1"
         data-language-key="${descriptionKey}">
        ${description}
      </p>`;
  }
}

customElements.define("difficulty-card", DifficultyCard);

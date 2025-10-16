export class DisplayCharacter extends HTMLElement {
  static get observedAttributes() {
    return ["show"];
  }

  connectedCallback() {
    this.character = this.getAttribute("character");
    this.show = this.getAttribute("show");
    this.dataset.displayKey = this.character;
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "show" && oldValue !== newValue) {
      this.show = newValue;
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <span class="text-4xl md:text-5xl font-bold character uppercase font-serif-display">
        ${this.show === "true" ? this.character : ""}
      </span>
    `;
  }
}

customElements.define("display-character", DisplayCharacter);

/*
Toast Web Component
Features:
- Use as <toast>Message</toast> or programmatically with Toast.show({html, timeout, type})
- Child content is used as the toast body
- Stacking with newest on top
- Entry & exit animations
- Drag to dismiss (pointer) with threshold
- Custom events: 'toast:open', 'toast:close', 'toast:dismissed'
- Accessible (role=status, aria-live)
*/

const TOAST_CONTAINER_ID = "toast-container-singleton";

class ToastContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          z-index: 9999;
          inset: auto 1rem 1rem auto; /* bottom-right */
          display: flex;
          flex-direction: column-reverse; /* newest on top when append is used */
          gap: 0.5rem;
          pointer-events: none; /* allow clicks through empty spaces */
        }
        ::slotted(toast) { pointer-events: auto; }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("toast-container", ToastContainer);

// Ensure a single container exists in document.body
function ensureContainer() {
  let c = document.getElementById(TOAST_CONTAINER_ID);
  if (c) return c;
  c = document.createElement("toast-container");
  c.id = TOAST_CONTAINER_ID;
  // prefer bottom-right placement but allow overriding via CSS on the container element
  document.body.appendChild(c);
  return c;
}

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      max-width: 360px;
      box-sizing: border-box;
      --toast-bg: #111;
      --toast-color: #fff;
      --toast-padding: 12px 16px;
      --toast-radius: 12px;
      --toast-shadow: 0 8px 20px rgba(2,8,23,0.5);
      pointer-events: auto;
      transform-origin: right bottom;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--toast-bg);
      color: var(--toast-color);
      padding: var(--toast-padding);
      border-radius: var(--toast-radius);
      box-shadow: var(--toast-shadow);
      will-change: transform, opacity;
      user-select: none;
      touch-action: pan-y;
      transform: translateY(10px) scale(.98);
      opacity: 0;
    }

    .content { flex: 1; overflow: hidden; }
    .close {
      background: transparent;
      border: none;
      color: inherit;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      line-height: 1;
    }

    /* Types */
    :host([type="success"]) { --toast-bg: #0b6; --toast-color: #042; }
    :host([type="error"])   { --toast-bg: #d33; --toast-color: #fff; }
    :host([type="info"])    { --toast-bg: #126; --toast-color: #eaf; }

    /* Entry/exit keyframes */
    @keyframes toast-in {
      from { transform: translateY(10px) scale(.98); opacity: 0; }
      to   { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes toast-out {
      from { transform: translateX(var(--out-x, 0)) translateY(0) scale(1); opacity: 1; }
      to   { transform: translateX(var(--out-x, -200px)) translateY(0) scale(.98); opacity: 0; }
    }

    .entering { animation: toast-in 240ms cubic-bezier(.2,.9,.2,1) both; }
    .exiting  { animation: toast-out 220ms ease-in both; }

    /* small-screen tweak */
    @media (max-width: 420px) {
      :host { max-width: calc(100% - 2rem); }
    }
  </style>

  <div class="toast" role="status" aria-live="polite">
    <div class="content"><slot></slot></div>
    <button class="close" aria-label="Close">✕</button>
  </div>
`;

export class Toast extends HTMLElement {
  static observedAttributes = ["timeout", "type"];

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._root.appendChild(template.content.cloneNode(true));

    this._el = this._root.querySelector(".toast");
    this._closeBtn = this._root.querySelector(".close");
    this._timeout = parseInt(this.getAttribute("timeout") || "4000", 10);
    this._timer = null;
    this._pointer = { active: false, startX: 0, currentX: 0 };
    this._dismissed = false;

    // Bindings
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onMouseEnter = this._onMouseEnter.bind(this);
    this._onMouseLeave = this._onMouseLeave.bind(this);

    this._closeBtn.addEventListener("click", this._onCloseClick);
    this._el.addEventListener("pointerdown", this._onPointerDown);
    this._el.addEventListener("mouseenter", this._onMouseEnter);
    this._el.addEventListener("mouseleave", this._onMouseLeave);
  }

  connectedCallback() {
    // Apply type attribute to host for styling
    if (this.hasAttribute("type"))
      this.setAttribute("type", this.getAttribute("type"));

    // Insert into container at top (newest on top)
    const container = ensureContainer();
    // We append to slot of container: container's slot order is column-reverse, but to be safe
    container.appendChild(this);

    // Entry animation
    requestAnimationFrame(() => {
      this._el.classList.add("entering");
      this.dispatchEvent(new CustomEvent("toast:open", { bubbles: true }));
      // start auto-dismiss timer
      this._startTimer();
    });

    // remove entering class after animation finishes
    this._el.addEventListener(
      "animationend",
      (ev) => {
        if (ev.animationName === "toast-in")
          this._el.classList.remove("entering");
      },
      { once: true }
    );
  }

  disconnectedCallback() {
    this._clearTimer();
    this._removePointerListeners();
    this._closeBtn.removeEventListener("click", this._onCloseClick);
  }

  attributeChangedCallback(name, oldV, newV) {
    if (name === "timeout") this._timeout = parseInt(newV || "4000", 10);
    if (name === "type") this.setAttribute("type", newV || "");
  }

  // Public helper to programmatically show toast
  // options: {html, text, timeout, type}
  static show({ html, text, timeout = 4000, type = "" } = {}) {
    const t = document.createElement("toast");
    if (type) t.setAttribute("type", type);
    if (timeout) t.setAttribute("timeout", String(timeout));
    if (html !== undefined) t.innerHTML = html;
    else if (text !== undefined) t.textContent = text;
    else t.innerHTML = "";
    document.body.appendChild(t);
    return t;
  }

  // Close programmatically
  close(by = "api") {
    if (this._dismissed) return;
    this._dismissed = true;
    this._clearTimer();
    // animate out, then remove
    this._el.style.setProperty(
      "--out-x",
      this._pointer.currentX ? `${this._pointer.currentX}px` : "-200px"
    );
    this._el.classList.add("exiting");
    this.dispatchEvent(
      new CustomEvent("toast:close", { detail: { by }, bubbles: true })
    );
    this._el.addEventListener("animationend", () => this._finalizeRemove(by), {
      once: true,
    });
  }

  _finalizeRemove(by) {
    try {
      this.remove();
    } catch (e) {}
    this.dispatchEvent(
      new CustomEvent("toast:dismissed", { detail: { by }, bubbles: true })
    );
  }

  _onCloseClick(e) {
    e.stopPropagation();
    this.close("button");
  }

  _startTimer() {
    if (this._timeout <= 0) return;
    this._timer = setTimeout(() => this.close("timeout"), this._timeout);
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _onMouseEnter() {
    this._clearTimer();
  }
  _onMouseLeave() {
    this._startTimer();
  }

  _onPointerDown(ev) {
    // start drag to dismiss on horizontal drag
    this._pointer.active = true;
    this._pointer.startX = ev.clientX;
    this._pointer.currentX = 0;

    // capture pointer so we continue receiving events
    this._el.setPointerCapture(ev.pointerId);
    this._addPointerListeners();
    this._clearTimer();
  }

  _onPointerMove(ev) {
    if (!this._pointer.active) return;
    const dx = ev.clientX - this._pointer.startX;
    this._pointer.currentX = dx;
    // translate horizontally but allow only small vertical movement
    this._el.style.transform = `translateX(${dx}px)`;
    // reduce opacity slightly with distance
    const opacity = Math.max(0.25, 1 - Math.abs(dx) / 300);
    this._el.style.opacity = opacity;
  }

  _onPointerUp(ev) {
    if (!this._pointer.active) return;
    this._pointer.active = false;
    this._el.releasePointerCapture(ev.pointerId);
    this._removePointerListeners();

    const dx = this._pointer.currentX;
    const threshold = Math.min(120, this.offsetWidth * 0.4);
    if (Math.abs(dx) > threshold) {
      // dismiss in the direction of swipe
      this._el.style.setProperty("--out-x", `${dx > 0 ? 200 : -200}px`);
      this._el.classList.add("exiting");
      this._el.addEventListener(
        "animationend",
        () => this._finalizeRemove("swipe"),
        { once: true }
      );
      this.dispatchEvent(
        new CustomEvent("toast:close", {
          detail: { by: "swipe" },
          bubbles: true,
        })
      );
    } else {
      // restore
      this._el.style.transition = "transform 160ms ease, opacity 160ms ease";
      this._el.style.transform = "";
      this._el.style.opacity = "";
      // remove transition after done
      setTimeout(() => {
        this._el.style.transition = "";
      }, 200);
      this._startTimer();
    }
  }

  _addPointerListeners() {
    window.addEventListener("pointermove", this._onPointerMove);
    window.addEventListener("pointerup", this._onPointerUp);
    window.addEventListener("pointercancel", this._onPointerUp);
  }

  _removePointerListeners() {
    window.removeEventListener("pointermove", this._onPointerMove);
    window.removeEventListener("pointerup", this._onPointerUp);
    window.removeEventListener("pointercancel", this._onPointerUp);
  }
}

customElements.define("toast", Toast);

// Optional: expose a small API on window
window.Toast = Toast;

// Usage examples (commented):
// <toast timeout="5000">Your message here</toast>
// Toast.show({ text: 'Saved!', type: 'success', timeout: 3000 });

// If you want to customize container position in your page CSS:
// #toast-container-singleton { inset: auto 1rem 1rem auto; /* bottom-right */ }

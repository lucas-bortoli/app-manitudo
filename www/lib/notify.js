/** @implements {INotify} */
class Notify {
  constructor() {
    this.holderElement = document.createElement("div");
    this.holderElement.classList.add("notify-holder");

    document.body.appendChild(this.holderElement);
  }

  /**
   * @param {INotifyOpts} opts
   */
  _createNotificationElement(opts) {
    const el = document.createElement("div");
    const textElement = document.createElement("span");
    const iconElement = document.createElement("div");

    el.classList.add("notify-msg");
    iconElement.classList.add("icon");
    textElement.innerHTML = opts.message;

    el.appendChild(iconElement);
    el.appendChild(textElement);

    return el;
  }

  /**
   * @param {HTMLDivElement} el
   * @param {INotifyOpts} opts
   */
  _addNotificationElement(el, opts) {
    this.holderElement.appendChild(el);
    el.classList.add("show");

    el.addEventListener("click", () => {
      this.close(el);
    });

    if (opts.timeout !== -1)
      setTimeout(() => {
        this.close(el);
      }, opts.timeout || 4500);
  }

  /**
   * Mostra uma mensagem de informação
   * @param {INotifyOpts} opts
   */
  info(opts) {
    const el = this._createNotificationElement(opts);
    el.classList.add("info");
    this._addNotificationElement(el, opts);
    return el;
  }

  /**
   * Mostra uma mensagem de aviso
   * @param {INotifyOpts} opts
   */
  warn(opts) {
    const el = this._createNotificationElement(opts);
    el.classList.add("warn");
    this._addNotificationElement(el, opts);
    return el;
  }

  /**
   * Mostra uma mensagem de erro
   * @param {INotifyOpts} opts
   */
  error(opts) {
    const el = this._createNotificationElement(opts);
    el.classList.add("error");
    this._addNotificationElement(el, opts);
    return el;
  }

  /**
   * Mostra uma mensagem de erro
   * @param {INotifyOpts} opts
   */
  success(opts) {
    const el = this._createNotificationElement(opts);
    el.classList.add("success");
    this._addNotificationElement(el, opts);
    return el;
  }

  /**
   * Mostra uma mensagem de espera
   * @param {INotifyOpts} opts
   */
  wait(opts) {
    const el = this._createNotificationElement(opts);
    el.classList.add("wait");
    this._addNotificationElement(el, opts);
    return el;
  }

  close(el) {
    if (!el) return;

    el.classList.remove("show");
    el.classList.add("hide");
    setTimeout(() => {
      if (el) el.remove();
    }, 1000);
  }
}

window.notify = new Notify();

/**
 * @typedef Dialog
 * @prop {string?} title
 * @prop {string} message
 * @prop {boolean?} hideCloseButton
 * @prop {("error"|"info"|"warn"|"success")?} icon
 * @prop {DialogButton[]?} buttons
 *
 * @typedef SelectDialog
 * @prop {string?} title
 * @prop {string} message
 * @prop {boolean?} hideCloseButton
 * @prop {DialogButton[]?} buttons
 * @prop {SelectDialogOption[]} options
 *
 * @typedef SelectDialogOption
 * @prop {string} text
 * @prop {number} value
 *
 * @typedef DialogButton
 * @prop {string} text
 * @prop {number} id
 */
var Dialog = {
  /**
   * Cria uma janela popup.
   * @param {Dialog} options
   * @returns {Promise<{ buttonId: number }>}
   */
  show(options) {
    var id = Math.random().toString(36);

    // Criar um modal com base nesse html
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="modal micromodal-slide" id="${id}">
        <div class="modal__overlay" tabindex="-1">
          <div class="modal__container">
            <header class="modal__header">
              <h2 class="modal__title"></h2>
              <a class="modal-close-x" button-id="-1"></a>
            </header>
            <main class="modal__content">
            </main>
            <footer class="modal__footer">
            </footer>
          </div>
        </div>
      </div>`
    );

    var element = document.getElementById(id);

    // Adicionar ícone antes do texto.
    if (options.icon) {
      options.message = `<i class="dialog-icon ${options.icon}"></i>` + options.message;
    }

    // Mostrar os textos do diálogo
    element.querySelector(".modal__title").innerText = options.title || "";
    element.querySelector(".modal__content").innerHTML = options.message || "";

    // Esconder o botão X se pedido
    if (options.hideCloseButton) {
      element.querySelector(".modal-close-x").remove();
    }

    // Adicionar os botões no diálogo
    // Se não forem dados botões, mostrar um "OK" padrão
    for (var button of options.buttons || [{ id: 0, text: "OK" }]) {
      var b = document.createElement("button");
      b.setAttribute("button-id", button.id);
      b.innerText = button.text;
      element.querySelector(".modal__footer").appendChild(b);
    }

    // Mostrar diálogo
    MicroModal.show(id, { awaitCloseAnimation: true, disableScroll: true });

    return new Promise((resolve) => {
      // Adicionar click nos botões
      element.addEventListener("click", (event) => {
        var buttonId = parseInt(event.target.getAttribute("button-id"));

        // Checar se é um número (comparando com infinito, se fosse para fazer normalmente, 0 seria falso)
        if (buttonId < Infinity) {
          MicroModal.close(id);
          resolve({ buttonId });
          setTimeout(() => element.remove(), 2000);
        }
      });
    });
  },

  /**
   * Mostra uma janela popup com select.
   * @param {SelectDialog} options
   * @returns {Promise<{ buttonId: number, value: any, selectedIndex: number }>}
   */
  async showSelect(options) {
    var selectId = Math.floor(Math.random() * 100000000.0);

    var message = `
      ${options.message || ""}
      <select id="${selectId}">
        ${options.options.map((opt) => `<option value="${opt.value}">${opt.text}</option>`)}
      </select>
    `;

    var dialog = await Dialog.show({
      title: options.title,
      buttons: options.buttons,
      hideCloseButton: options.hideCloseButton,
      message: message,
    });

    var value = document.getElementById(selectId).value;
    var selectedIndex = document.getElementById(selectId).selectedIndex;
    console.log(document.getElementById(selectId));
    return { buttonId: dialog.buttonId, value, selectedIndex };
  },
};

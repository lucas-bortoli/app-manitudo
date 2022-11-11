var AjudaMixin = {
  data() {
    return {};
  },
  methods: {
    /**
     * Abre ou fecha um accordion da ajuda.
     * @param {HTMLElement} target
     */
    ajudaToggleAccordion(target) {
      // Procurar o accordion subindo na árvore de elementos, a partir do elemento clicado
      var accordion = encontrarElementoParentes(target, (element) => element.classList.contains("accordion"));

      if (accordion) {
        accordion.classList.toggle("open");
      }
    },
  },
};

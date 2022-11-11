var app = Vue.createApp({
  mixins: [AgendamentoMixin, ClienteMixin, ManicureMixin, FinancasMixin, AjudaMixin, ConfigMixin],
  data() {
    return {
      VERSAO_APP: "Versão 1.2.1",
      COPYRIGHT: "Copyright © 2022 XYZ Sistemas de Informação Ltda.",

      navbarAberto: false,
      pagina: 1,

      agendamentosTabela: [],
    };
  },
  methods: {
    formatarTelefone(evento, campo, subcampo) {
      var input = evento.target;

      if (evento.type === "focus") {
        this[campo][subcampo] = limparNumeroCelular(this[campo][subcampo]);
      } else if (evento.type === "blur") {
        var f = formatarNumeroCelular(this[campo][subcampo]);

        if (f.numDigitos < 1) {
          return (this[campo][subcampo] = "");
        }

        this[campo][subcampo] = f.formato;
      } else if (evento.type === "keypress") {
        // Não deixar digitar mais que 11 dígitos no telefone
        if (input.value.length >= 11) {
          evento.preventDefault();
        }
      }
    },

    formatarTelefoneTexto(fone) {
      return formatarNumeroCelular(fone).formato;
    },

    /**
     * Formata um número para uma string de dinheiro.
     * Ex: 4.5 => "R$ 4,50"
     * @param {number} valor
     * @returns {string}
     */
    formatarDinheiroTexto(valor) {
      return "R$ " + (valor || 0).toFixed(2).replace(".", ",");
    },

    mudarPagina(num) {
      this.navbarAberto = false;
      this.pagina = num;

      setTimeout(() => {
        for (var pagina of document.querySelectorAll(".habilitar-swipe")) {
          // Create a manager to manager the element
          var manager = new Hammer.Manager(pagina);

          // Create a recognizer
          var Swipe = new Hammer.Swipe();

          // Add the recognizer to the manager
          manager.add(Swipe);

          // Subscribe to a desired event
          manager.on("swipe", function (e) {
            if (e.direction === 4) {
              app.navbarAberto = false;
            } else if (e.direction === 2) {
              app.navbarAberto = true;
            }
          });
        }
      }, 0);
    },

    /**
     * Essa função puxa dos dados do banco e atualiza as tabelas na interface
     */
    async atualizarTodos() {
      await this.atualizarAgendamento();
      await this.atualizarManicure();
      await this.atualizarCliente();
      await this.atualizarConfig();
    },

    /**
     * Abre o WhatsApp no celular.
     * @param {string} numero
     */
    abrirWhatsApp(numero) {
      var filtrado = limparNumeroCelular(numero);
      var url = `https://wa.me/55${filtrado}`; // DDD 45

      var janela = window.open(url, "_blank", "width=640,height=480");

      // fechar janela em 1s
      setTimeout(() => {
        janela?.close();
      }, 1000);
    },

    /**
     * Abre um link.
     * @param {string} link
     */
    abrirJanelaTemp(link) {
      var janela = window.open(link, "_blank", "width=640,height=480");

      // fechar janela em 1s
      setTimeout(() => {
        janela?.close();
      }, 1000);
    },

    /**
     * Executado quando o botão voltar do celular é apertado
     * @param {Event} event
     */
    eventoBotaoVoltar(event) {
      app.navbarAberto = false;
      event.preventDefault();
      return false;
    },

    /**
     * Mostra um modal.
     * @param {string} id
     */
    abrirModal(id) {
      MicroModal.show(id, { awaitCloseAnimation: true, disableScroll: true });
    },

    /**
     * Esconde um modal.
     * @param {string} id
     */
    fecharModal(id) {
      MicroModal.close(id);
    },
  },

  async mounted() {
    this.mudarPagina(1);

    if (localStorage.getItem("dev")) {
      this.mudarPagina(2);
    }

    setTimeout(() => {
      this.atualizarTodos();
    }, 500);
  },
}).mount("#app");

document.addEventListener(
  "deviceready",
  () => {
    document.addEventListener("backbutton", app.eventoBotaoVoltar, false);
  },
  false
);

MicroModal.init({
  awaitOpenAnimation: true,
  awaitCloseAnimation: true,
});

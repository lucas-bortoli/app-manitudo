var AgendamentoMixin = {
  data() {
    return {
      agendamentosTabela: [],

      agendamentoSelecionado: null,

      agendamentoModal: {
        clienteId: 1,
        manicureId: 1,
        preco: "",
        data: null,
        hora: null,
      },

      tempoClickPix: 0,
    };
  },
  methods: {
    async atualizarAgendamento() {
      var agendamentos = await DAO.consultarAgendamentos();

      // Temos que ordenar os agendamentos, de forma que os mais
      // próximos de "agora" fiquem para cima, enquanto os do passado
      // fiquem para baixo.
      var agora = new Date();

      // Separar os agendamentos do passado e futuro em dois grupos
      var agdPassado = [];
      var agdFuturo = [];

      // Colocar cada agendamento em seu grupo
      for (var agd of agendamentos) {
        var dataAgendamento = new Date(agd.data + " " + agd.hora);

        // Guardar data construída no agendamento (otimização; mais performance
        // na hora de ordenar, por alocar uma quantidade fixa de objetos)
        // O(n) vs O(n²)
        agd._data = dataAgendamento;

        if (dataAgendamento < agora) {
          // Está no passado
          agdPassado.push(agd);
        } else {
          // Está no futuro
          agdFuturo.push(agd);
        }
      }

      // Ordenar cada grupo
      agdPassado = agdPassado.sort((a, b) => b._data - a._data);
      agdFuturo = agdFuturo.sort((a, b) => a._data - b._data);

      if (agdPassado[0]) agdPassado[0]._primeiroDoPassado = true;

      this.agendamentosTabela = [...agdFuturo, ...agdPassado];
    },

    async salvarPagamento() {
      this.agendamentoSelecionado.pago = !this.agendamentoSelecionado.pago;

      await DAO.atualizarPagamento(this.agendamentoSelecionado.id, this.agendamentoSelecionado.pago);
    },

    /**
     * Abre o modal de edição do agendamento.
     */
    async agendamentoAbrirModalEdit() {
      var modal = document.querySelector("#edit-agendamento-modal");

      modal.querySelector(".clienteSelect").value = this.agendamentoSelecionado.clienteId;
      modal.querySelector(".manicureSelect").value = this.agendamentoSelecionado.manicureId;
      modal.querySelector(".valorInput").value = this.agendamentoSelecionado.valor;
      modal.querySelector("input[type='date']").value = this.agendamentoSelecionado.data;
      modal.querySelector("input[type='time']").value = this.agendamentoSelecionado.hora;

      // Fechar modal de detalhes
      this.fecharModal("info_agendamento");

      // Abrir modal
      this.abrirModal("edit-agendamento-modal");
    },

    async agendamentoModalEditSalvar() {
      var modal = document.querySelector("#edit-agendamento-modal");

      var clienteId = parseInt(modal.querySelector(".clienteSelect").value);
      var manicureId = parseInt(modal.querySelector(".manicureSelect").value);
      var preco = parseFloat(modal.querySelector(".valorInput").value);
      var data = modal.querySelector("input[type='date']").value;
      var hora = modal.querySelector("input[type='time']").value;

      if (!clienteId) {
        return notify.warn({ message: "É necessário informar um cliente!", timeout: 5000 });
      } else if (!manicureId) {
        return notify.warn({ message: "É necessário informar uma manicure!", timeout: 5000 });
      } else if (!preco) {
        return notify.warn({ message: "É necessário informar um preço!", timeout: 5000 });
      } else if (!data) {
        return notify.warn({ message: "É necessário informar uma data para o agendamento!", timeout: 5000 });
      } else if (!hora) {
        return notify.warn({ message: "É necessário informar um horário para o agendamento!", timeout: 5000 });
      }

      try {
        await DAO.editarAgendamento(
          this.agendamentoSelecionado.id,
          clienteId,
          manicureId,
          preco,
          data,
          hora,
          this.agendamentoSelecionado.pago
        );

        Dialog.show({
          icon: "success",
          title: "Sucesso",
          hideCloseButton: true,
          message: "O agendamento foi editado.",
        });
      } catch (erro) {
        console.error(erro);
        Dialog.show({
          icon: "error",
          title: "Erro ao editar",
          hideCloseButton: true,
          message: "Houve um erro ao editar o agendamento.",
        });
      }

      this.fecharModal("edit-agendamento-modal");
      this.atualizarTodos();
    },

    /**
     * Apaga o agendamento seleiconado.
     */
    async agendamentoBotaoDelete() {
      // Confirmar ação
      var acao = await Dialog.show({
        title: "Confirmar ação",
        message: "Deseja mesmo apagar esse agendamento?",
        hideCloseButton: true,
        buttons: [
          { id: 0, text: "Apagar" },
          { id: 1, text: "Cancelar" },
        ],
      });

      // Botão 0: apagar
      if (acao.buttonId === 0) {
        // Apagar agendamento
        var agendamentoId = this.agendamentoSelecionado.id;

        try {
          await DAO.apagarAgendamento(agendamentoId);
          this.atualizarTodos();

          Dialog.show({
            icon: "success",
            title: "Sucesso",
            hideCloseButton: true,
            message: "O agendamento foi apagado.",
          });
        } catch (erro) {
          console.error(erro);
          Dialog.show({
            icon: "error",
            title: "Erro ao apagar agendamento",
            hideCloseButton: true,
            message: "Houve um erro ao apagar o agendamento.",
          });
        }

        this.fecharModal("info_agendamento");
      } else {
        // Não fazer nada
      }
    },

    /**
     * Retorna uma data em formato humano, relativo a agora.
     * Ex. amanhã às 17h30
     * @param {Date} data
     * @returns {string}
     */
    dataRelativa(data) {
      dayjs.locale("pt-BR");
      return dayjs(data).calendar();
    },

    /**
     * Ex. 09:12 19/10/2022
     * @param {Date} data
     * @returns {string}
     */
    dataHumana(data) {
      dayjs.locale("pt-BR");
      return dayjs(data).format("HH[h]mm, DD [de] MMMM [de] YYYY");
    },

    async tabelaAgendamentoClicada(target) {
      // Procurar atributo "x-agd-index" nos parentes do elemento clicado.
      var agdId = pegarAtributoParentes(target, "x-agd-index");

      if (!agdId) {
        return;
      }

      var agd = this.agendamentosTabela[parseInt(agdId)];
      this.agendamentoSelecionado = agd;

      MicroModal.show("info_agendamento", { awaitCloseAnimation: true, disableScroll: true });

      console.log(agd, agdId);
    },

    /**
     * Abre o modal de cliente a partir do modal de agendamento.
     * @param {number} clienteId ID do cliente a ser mostrado.
     */
    async agendamentoModalAbrirCliente(clienteId) {
      var cliente = this.clienteTabela.find((c) => c.id === clienteId);
      this.clienteSelecionado = cliente;

      this.abrirModal("info_cliente");
    },

    /**
     * Abre o modal de manicure a partir do modal de agendamento.
     * @param {number} manicureId ID do cliente a ser mostrado.
     */
    async agendamentoModalAbrirManicure(manicureId) {
      var manicure = this.manicureTabela.find((m) => m.id === manicureId);
      this.manicureSelecionado = manicure;

      this.abrirModal("info_manicure");
    },

    /**
     * Gera um pagamento para o agendamento selecionado.
     */
    async agendamentoGerarPagamentoPix() {
      if (Date.now() - this.tempoClickPix < 5000) {
        return;
      }

      this.tempoClickPix = Date.now();

      var config = DAO.getConfig();

      // Verificar se o pix está desativado
      if (!config.pixHabilitado) {
        return Dialog.show({
          icon: "info",
          title: "Configuração necessária",
          hideCloseButton: true,
          message:
            "Você deve cadastrar uma chave PIX antes de utilizar essa função. Você pode configurá-la na pagina de configurações do app.",
        });
      }

      var chave = libPixFormatarChave(config.pixChaveTipo, config.pixChave);

      this.abrirModal("pix-modal-loading");

      try {
        var pixCodigo = await libPixQR(chave, config.pixNome, null, this.agendamentoSelecionado.valor, "Manicure");

        QrCreator.render(
          {
            text: pixCodigo,
            radius: 0, // 0.0 to 0.5
            ecLevel: "M", // L, M, Q, H
            fill: "#323232", // foreground color
            background: null, // color or null for transparent
            size: 256, // in pixels
          },
          document.querySelector("#pix-qr-code")
        );

        MicroModal.show("pix_agendamento", { awaitCloseAnimation: true, disableScroll: true });
      } catch (error) {
        console.error(error);
        Dialog.show({
          icon: "error",
          title: "Erro",
          hideCloseButton: true,
          message: "Não foi possível gerar o código Pix. Verifique se você tem acesso à internet.",
        });
      }

      this.fecharModal("pix-modal-loading");
    },

    async novoAgendamento() {
      var clienteId = this.agendamentoModal.clienteId;
      var manicureId = this.agendamentoModal.manicureId;
      var preco = this.agendamentoModal.preco;
      var data = this.agendamentoModal.data;
      var hora = this.agendamentoModal.hora;

      if (!clienteId) {
        return notify.warn({ message: "É necessário informar um cliente!", timeout: 5000 });
      } else if (!manicureId) {
        return notify.warn({ message: "É necessário informar uma manicure!", timeout: 5000 });
      } else if (!preco) {
        return notify.warn({ message: "É necessário informar um preço!", timeout: 5000 });
      } else if (!data) {
        return notify.warn({ message: "É necessário informar uma data para o agendamento!", timeout: 5000 });
      } else if (!hora) {
        return notify.warn({ message: "É necessário informar um horário para o agendamento!", timeout: 5000 });
      }

      console.log(clienteId, manicureId, preco, data, hora);

      // Inserir no banco de dados
      try {
        await DAO.novoAgendamento(clienteId, manicureId, data, hora, preco, false);
      } catch (erro) {
        console.error(erro);
        notify.error({ message: "Houve um erro ao cadastrar um novo agendamento!", timeout: 5000 });
        return;
      }

      // Fechar modal
      this.fecharModal("novo-agendamento-modal");

      await aguardar(100);

      // Atualizar as tabelas na interface
      this.atualizarTodos();

      notify.success({ message: "O agendamento foi cadastrado com sucesso!", timeout: 5000 });

      this.agendamentoModal.clienteId = this.value = "";
      this.agendamentoModal.manicureId = this.value = "";
      this.agendamentoModal.preco = this.value = "";
      this.agendamentoModal.hora = this.value = "";
      this.agendamentoModal.data = this.value = "";
    },

    async abrirModalAgendamentoCadastro(id) {
      if (this.manicureTabela.length == 0 || this.clienteTabela.length == 0) {
        Dialog.show({
          icon: "error",
          title: "Não é possível realizar cadastro.",
          hideCloseButton: true,
          message: "É necessário ter uma manicure e cliente cadastrados.",
        });
      } else {
        MicroModal.show(id, { awaitCloseAnimation: true, disableScroll: true });
      }
    },
  },
};

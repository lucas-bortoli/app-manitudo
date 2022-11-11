var ClienteMixin = {
  data() {
    return {
      clienteTabela: [],

      clienteSelecionado: null,

      clienteModal: {
        nome: "",
        celular: "",
      },
    };
  },
  methods: {
    async atualizarCliente() {
      this.clienteTabela = await DAO.consultarClientes();
    },

    async salvarCliente() {
      var nome = this.clienteModal.nome;
      var celular = this.clienteModal.celular;

      // Função encontrada em pequenasFuncoes.js
      celular = limparNumeroCelular(celular);

      // Validação
      if (celular.length !== 11) {
        return Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Dados inválidos",
          message: "O número de celular inserido é inválido!",
        });
      } else if (nome.length < 1 || nome.length > 40) {
        return Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Dados inválidos",
          message: "O nome dado é inválido!",
        });
      }

      // Inserir no banco de dados
      try {
        await DAO.novoCliente(nome, celular);
      } catch (erro) {
        console.error(erro);

        if (erro.message.includes("UNIQUE")) {
          return Dialog.show({
            icon: "error",
            hideCloseButton: true,
            title: "Houve um erro",
            message: "O número informado já foi cadastrado!",
          });
        } else {
          notify.error({ message: "Houve um erro ao cadastrar o(a) cliente!", timeout: 5000 });
        }

        return;
      }

      // Fechar modal
      document.querySelector("#clienteFecharModal").click();

      await aguardar(100);

      // Atualizar as tabelas na interface
      this.atualizarTodos();

      notify.success({ message: "O(a) cliente " + nome + " foi inserido com sucesso!", timeout: 5000 });

      this.clienteModal.nome = this.value = "";
      this.clienteModal.celular = this.value = "";
    },

    abrirModalEditarCliente() {
      this.clienteModal.nome = this.clienteSelecionado.nome;
      this.clienteModal.celular = formatarNumeroCelular(this.clienteSelecionado.celular).formato;

      this.fecharModal("info_cliente");
      this.abrirModal("modal-edit-cliente");
    },

    async salvarEditarCliente() {
      var nome = this.clienteModal.nome;
      var celular = this.clienteModal.celular;

      // Função encontrada em pequenasFuncoes.js
      celular = limparNumeroCelular(celular);

      // Validação
      if (celular.length !== 11) {
        return Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Dados inválidos",
          message: "O número de celular inserido é inválido!",
        });
      } else if (nome.length < 1 || nome.length > 40) {
        return Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Dados inválidos",
          message: "O nome dado é inválido!",
        });
      }

      // Inserir no banco de dados
      try {
        await DAO.editarCliente(this.clienteSelecionado.id, nome, celular);

        Dialog.show({
          icon: "success",
          hideCloseButton: true,
          title: "Sucesso",
          message: "O cliente foi atualizado com sucesso.",
        });
      } catch (erro) {
        console.error(erro);

        Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Houve um erro",
          message: "Houve um erro ao editar o cliente.",
        });
      }

      // Atualizar as tabelas na interface
      this.atualizarTodos();

      this.clienteModal.nome = this.value = "";
      this.clienteModal.celular = this.value = "";

      this.fecharModal("modal-edit-cliente");
    },

    async tabelaClienteClicada(target) {
      this.abrirModal("info_cliente");

      var cliId = pegarAtributoParentes(target, "x-cli-id");

      if (!cliId) {
        return;
      }

      var cli = this.clienteTabela[cliId];
      this.clienteSelecionado = cli;

      MicroModal.show("info_cliente", { awaitCloseAnimation: true, disableScroll: true });

      console.log(cli);
    },

    /**
     * Apaga o cliente selecionado.
     */
    async clienteBotaoDelete() {
      // Confirmar ação
      var acao = await Dialog.show({
        title: "Confirmar ação",
        message: "Deseja mesmo apagar esse cliente?<br><b>Todos os agendamentos marcados a ele serão apagados.</b>",
        hideCloseButton: true,
        buttons: [
          { id: 0, text: "Apagar" },
          { id: 1, text: "Cancelar" },
        ],
      });

      // Botão 0: apagar
      if (acao.buttonId === 0) {
        // Apagar agendamento
        var clienteId = this.clienteSelecionado.id;

        try {
          await DAO.apagarCliente(clienteId);
          this.atualizarTodos();

          Dialog.show({
            icon: "success",
            title: "Sucesso",
            hideCloseButton: true,
            message: "O cliente foi apagado.",
          });
        } catch (erro) {
          console.error(erro);
          Dialog.show({
            icon: "error",
            title: "Erro",
            message: "Houve um erro ao apagar o cliente.",
            hideCloseButton: true,
          });
        }

        this.fecharModal("info_cliente");
      } else {
        // Não fazer nada
      }
    },
  },
};

var ManicureMixin = {
  data() {
    return {
      manicureTabela: [],
      manicureSelecionado: null,
      manicureModal: {
        nome: "",
        celular: "",
      },
    };
  },
  methods: {
    async atualizarManicure() {
      this.manicureTabela = await DAO.consultarManicures();
    },

    abrirModalEditarManicure() {
      this.manicureModal.nome = this.manicureSelecionado.nome;
      this.manicureModal.celular = formatarNumeroCelular(this.manicureSelecionado.celular).formato;

      this.fecharModal("info_manicure");
      this.abrirModal("modal-edit-manicure");
    },

    async salvarEditarManicure() {
      var nome = this.manicureModal.nome;
      var celular = this.manicureModal.celular;

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
        await DAO.editarManicure(this.manicureSelecionado.id, nome, celular);

        Dialog.show({
          icon: "success",
          hideCloseButton: true,
          title: "Sucesso",
          message: "A manicure foi atualizado com sucesso.",
        });
      } catch (erro) {
        console.error(erro);

        Dialog.show({
          icon: "error",
          hideCloseButton: true,
          title: "Houve um erro",
          message: "Houve um erro ao editar a manicure.",
        });
      }

      // Atualizar as tabelas na interface
      this.atualizarTodos();

      this.manicureModal.nome = this.value = "";
      this.manicureModal.celular = this.value = "";

      this.fecharModal("modal-edit-manicure");
    },

    async salvarManicure() {
      var nome = this.manicureModal.nome;
      var celular = this.manicureModal.celular;

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
        await DAO.novoManicure(nome, celular);
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
          notify.error({ message: "Houve um erro ao cadastrar a manicure!", timeout: 5000 });
        }

        return;
      }

      // Fechar modal
      document.querySelector("#manicureFecharModal").click();

      await aguardar(100);

      // Atualizar as tabelas na interface
      this.atualizarTodos();

      notify.success({ message: "A manicure " + nome + " foi cadastrada com sucesso!", timeout: 5000 });

      this.manicureModal.nome = this.value = "";
      this.manicureModal.celular = this.value = "";
    },

    async tabelaManicureClicada(target) {
      this.abrirModal("info_manicure");

      var maniId = pegarAtributoParentes(target, "x-mani-id");

      if (!maniId) {
        return;
      }

      var mani = this.manicureTabela[maniId];
      this.manicureSelecionado = mani;

      MicroModal.show("info_manicure", { awaitCloseAnimation: true, disableScroll: true });

      console.log(mani);
    },

    /**
     * Apaga o manicure selecionado.
     */
    async manicureBotaoDelete() {
      // Confirmar ação
      var acao = await Dialog.show({
        title: "Confirmar ação",
        message: "Deseja mesmo apagar essa manicure?<br><b>Todos os agendamentos marcados a ela serão apagados.</b>",
        hideCloseButton: true,
        buttons: [
          { id: 0, text: "Apagar" },
          { id: 1, text: "Cancelar" },
        ],
      });

      // Botão 0: apagar
      if (acao.buttonId === 0) {
        // Apagar agendamento
        var manicureId = this.manicureSelecionado.id;

        try {
          await DAO.apagarManicure(manicureId);
          this.atualizarTodos();

          Dialog.show({
            icon: "success",
            title: "Sucesso",
            hideCloseButton: true,
            message: "A manicure foi apagada.",
          });
        } catch (erro) {
          console.error(erro);
          Dialog.show({
            icon: "error",
            title: "Erro",
            message: "Houve um erro ao apagar a manicure.",
            hideCloseButton: true,
          });
        }

        this.fecharModal("info_manicure");
      } else {
        // Não fazer nada
      }
    },
  },
};

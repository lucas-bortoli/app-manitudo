var ConfigMixin = {
  data() {
    return {
      paginaConfig: {
        max: (5).toFixed(2),
        uso: (0).toFixed(2),
        porcentagem: "0.00",
        porcentagemNum: 0,

        pixChave: "",
        pixNome: "",
        pixChaveTipo: "cpf",
        pixAtivo: false,
      },
    };
  },
  methods: {
    /**
     * Censura uma chave Pix.
     * 11482011294 -> 114******94
     * @param {string} chave
     */
    configCensurarChavePix(chave) {
      var inicioIndice = 5;
      var censurado = "";

      for (var i = 0; i < chave.length; i++) {
        if (i >= inicioIndice && chave[i].match(/[a-z0-9]/)) {
          censurado += "*";
        } else {
          censurado += chave[i];
        }
      }

      return censurado;
    },

    configInverterPixHabilitado() {
      this.paginaConfig.pixAtivo = !this.paginaConfig.pixAtivo;
      DAO.setConfig({
        pixHabilitado: this.paginaConfig.pixAtivo,
      });
    },

    async configPixFormatarCampo() {
      var tipoChaveSelect = document.querySelector("#fieldPixTipoChave");
      var inputChave = document.querySelector("#fieldPixChave");

      var digitosApenas = inputChave.value.replace(/[^\d]/gm, "");

      var formato = "";

      if (tipoChaveSelect.value === "cnpj") {
        formato = formatarCnpj(digitosApenas);
      } else if (tipoChaveSelect.value === "cpf") {
        formato = formatarCpf(digitosApenas);
      } else if (tipoChaveSelect.value === "telefone") {
        formato = formatarNumeroCelular(digitosApenas);
      } else if (tipoChaveSelect.value === "email") {
        return;
      } else if (tipoChaveSelect.value === "random") {
        return;
      }

      inputChave.value = formato.formato.slice(0, formato.ultimoNumPos);

      setTimeout(() => {
        inputChave.selectionStart = formato.ultimoNumPos;
        inputChave.selectionEnd = formato.ultimoNumPos;
      }, 0);
    },

    async configSalvarConfig() {
      var tipoChave = document.querySelector("#fieldPixTipoChave").value;
      var chave = document.querySelector("#fieldPixChave").value;
      var proprietarioChave = document.querySelector("#fieldPixProprietario").value;

      // validação de chave
      var validacao = libPixValidarChave(tipoChave, chave);

      if (!validacao.ok) {
        return notify.error({
          message: "Chave inválida: " + validacao.erro,
        });
      }

      DAO.setConfig({
        pixChaveTipo: tipoChave,
        pixHabilitado: true,
        pixChave: chave,
        pixNome: proprietarioChave,
      });

      this.atualizarConfig();
      this.fecharModal("pix_config_modal");

      notify.success({
        message: "Configurações do Pix salvas com sucesso!",
      });
    },

    async atualizarConfig() {
      var usoDados = usoLocalStorage();
      this.paginaConfig.max = (usoDados.max / 1024 / 1024).toFixed(2);
      this.paginaConfig.uso = (usoDados.uso / 1024 / 1024).toFixed(2);
      this.paginaConfig.porcentagem = ((usoDados.uso / usoDados.max) * 100).toFixed(2);
      this.paginaConfig.porcentagemNum = (usoDados.uso / usoDados.max) * 100;

      var appConfig = DAO.getConfig();

      this.paginaConfig.pixChave = appConfig.pixChave;
      this.paginaConfig.pixNome = appConfig.pixNome;
      this.paginaConfig.pixAtivo = appConfig.pixHabilitado;
      this.paginaConfig.pixChaveTipo = appConfig.pixChaveTipo;
    },

    configModalPixLimparChave() {
      document.querySelector("#fieldPixChave").value = "";
    },

    configAbrirModalPix() {
      this.atualizarConfig();
      document.querySelector("#fieldPixTipoChave").value = this.paginaConfig.pixChaveTipo;
      document.querySelector("#fieldPixChave").value = this.paginaConfig.pixChave;
      document.querySelector("#fieldPixProprietario").value = this.paginaConfig.pixNome;
      this.abrirModal("pix_config_modal");
    },

    async botaoLimparDados() {
      var resultado = await Dialog.show({
        title: "Confirmar a limpeza dos dados",
        message: `
          <p>
            Você tem certeza que quer apagar os dados do aplicativo?<br>
            Você perderá:
            <ul>
              <li>Clientes cadastrados;</li>
              <li>Manicures cadastrados;</li>
              <li>Agendamentos marcados;</li>
            </ul>
            <strong>Essa ação não pode ser desfeita!</strong>
          </p>
        `,
        buttons: [{ id: 0, text: "Confirmar ação" }],
      });

      if (resultado.buttonId === 0) {
        // Usuário confirmou deleção dos dados
        notify.info({
          message: "Todos os dados foram apagados.",
        });

        localStorage.clear();

        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    },
  },
};

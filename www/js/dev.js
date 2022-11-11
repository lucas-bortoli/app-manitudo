async function devInserirDados() {
  try {
    await DAO.novoCliente("Joacinta Larissa Melo", "43999281150");
    await DAO.novoCliente("Giancarla Enzima", "43992173294");
    await DAO.novoCliente("Neucilene Chinelo", "43999281134");

    await DAO.novoManicure("Marlênia Malária", "45998182132");
    await DAO.novoManicure("Pepina Salgada", "43999234774");

    app.atualizarTodos();
  } catch (erro) {
    notify.error({ message: "Já preenchido (UNIQUE deu erro)" });
  }
}

async function baixarBancoDados() {
  var a = document.createElement("a");
  var dados = new Blob([banco.export()], { type: "application/octet-stream" });
  var url = URL.createObjectURL(dados);
  a.href = url;
  a.download = "database.sqlite";
  a.click();
  URL.revokeObjectURL(url);
}

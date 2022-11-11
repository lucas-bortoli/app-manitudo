/**
 * Biblioteca do banco de dados
 * @type {Awaited<ReturnType<import("../lib/db/sql").InitSqlJsStatic>>}
 */
var libSql;

/**
 * Classe do banco de dados
 * @type {import("../lib/db/sql").Database}
 */
var banco;

/**
 * Coleção de auxiliares para a utilização do banco
 */
var DAO = {
  async inicializar() {
    libSql = await initSqlJs();

    await this.carregarBanco();

    // Nesse momento, o banco está vazio, é necessário criar todas as tabelas
    var sqlInicializacao = `
      CREATE TABLE IF NOT EXISTS cliente (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome varCHAR(40) NOT NULL,
          cel CHAR(11) UNIQUE NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS manicure (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome VARCHAR(40) NOT NULL,
          cel CHAR(11) UNIQUE NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS agendamento (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id INTEGER NOT NULL,
          manicure_id INTEGER NOT NULL,
          dia DATE NOT NULL,
          hora VARCHAR(10) NOT NULL,
          valor FLOAT(5, 2) NOT NULL,
          pago INTEGER(1) NOT NULL,
          FOREIGN KEY (cliente_id) REFERENCES cliente (id),
          FOREIGN KEY (manicure_id) REFERENCES manicure (id)
      );
    `;

    // Criar as tabelas no banco
    banco.exec(sqlInicializacao);
  },

  async carregarBanco() {
    // Vai carregar o banco a partir de um arquivo
    var b64 = localStorage.getItem("db");

    if (b64) {
      var dados = uint8ToBase64.decode(b64);
      banco = new libSql.Database(dados);
    } else {
      // Usar um banco vazio
      banco = new libSql.Database();
    }
  },

  async salvarBanco() {
    // Vai salvar o banco em um arquivo
    var b64 = uint8ToBase64.encode(banco.export());

    localStorage.setItem("db", b64);
  },

  /**
   * Pega a configuração do app atual
   * @returns {ConfigKeyValue}
   */
  getConfig() {
    return {
      pixChaveTipo: localStorage.getItem("pixChaveTipo") || "cpf",
      pixNome: localStorage.getItem("pixNome") || "",
      pixChave: localStorage.getItem("pixChave") || "",
      pixHabilitado: localStorage.getItem("pixHabilitado") == "true",
    };
  },

  /**
   * Seta parâmetros de configuração do app
   * @param {Partial<ConfigKeyValue>} params
   */
  setConfig(newParams) {
    /** @type {ConfigKeyValue} */
    var obj = Object.assign({}, this.getConfig(), newParams);

    for (const key of Object.keys(obj)) {
      localStorage.setItem(key, obj[key]);
    }
  },

  /**
   * Insere um novo cliente no banco.
   * @param {string} nome
   * @param {string} cel
   */
  async novoCliente(nome, cel) {
    var sql = `
      INSERT INTO cliente (nome, cel) VALUES (?, ?);
    `;

    banco.exec(sql, [nome, cel]);

    await this.salvarBanco();
  },

  /**
   * Faz a consulta de clientes no banco de dados.
   * @returns {{ id: number, nome: string, cel: string }[]}
   */
  async consultarClientes() {
    var sql = `
      SELECT id, nome, cel as celular FROM cliente;
    `;

    var stmt = banco.prepare(sql, []);

    var linhas = [];

    while (stmt.step()) {
      var linha = stmt.getAsObject();
      linhas.push(linha);
    }

    stmt.free();

    return linhas;
  },

  /**
   * Apaga um cliente no banco de dados.
   * @param {number} id ID do manicure.
   */
  async apagarCliente(id) {
    banco.exec(
      `
          DELETE FROM cliente WHERE id = ?
        `,
      [id]
    );

    await DAO.salvarBanco();
  },

  /**
   * Edita um cliente no banco de dados.
   * @param {number} id
   * @param {string} nome
   * @param {string} telefone
   */
  async editarCliente(id, nome, telefone) {
    var sql = `UPDATE cliente SET nome = ?, cel = ? WHERE id = ?`;

    banco.exec(sql, [nome, telefone, id]);

    await this.salvarBanco();
  },

  /**
   * Insere um novo cliente no banco.
   * @param {string} nome
   * @param {string} cel
   */
  async novoManicure(nome, cel) {
    var sql = `
      INSERT INTO manicure (nome, cel) VALUES (?, ?);
    `;

    banco.exec(sql, [nome, cel]);

    await this.salvarBanco();
  },

  /**
   * Faz a consulta de clientes no banco de dados.
   * @param {{ id: number, nome: string, cel: string }[]}
   */
  async consultarManicures() {
    var sql = `
      SELECT id, nome, cel as celular FROM manicure;
    `;

    var stmt = banco.prepare(sql, []);

    var linhas = [];

    while (stmt.step()) {
      var linha = stmt.getAsObject();
      linhas.push(linha);
    }

    stmt.free();

    return linhas;
  },

  /**
   * Apaga um manicure no banco de dados.
   * @param {number} id ID do manicure.
   */
  async apagarManicure(id) {
    banco.exec(
      `
        DELETE FROM manicure WHERE id = ?
      `,
      [id]
    );

    await DAO.salvarBanco();
  },

  /**
   * Edita um manicure no banco de dados.
   * @param {number} id
   * @param {string} nome
   * @param {string} telefone
   */
  async editarManicure(id, nome, telefone) {
    var sql = `UPDATE manicure SET nome = ?, cel = ? WHERE id = ?`;

    banco.exec(sql, [nome, telefone, id]);

    await this.salvarBanco();
  },

  /**
   * Insere um novo cliente no banco.
   * @param {number} cliente_id
   * @param {number} manicure_id
   * @param {string} dia
   * @param {string} hora
   * @param {number} valor
   * @param {boolean} pago
   */
  async novoAgendamento(cliente_id, manicure_id, dia, hora, valor, pago) {
    var sql = `
      INSERT INTO agendamento (cliente_id, manicure_id, dia, hora, valor, pago) VALUES (?, ?, ?, ?, ?, ?);
    `;

    banco.exec(sql, [cliente_id, manicure_id, dia, hora, valor, pago ? 1 : 0]);

    await this.salvarBanco();
  },

  /**
   * Faz consulta de agendamentos no banco de dados
   * @returns {{ clienteNome: string, clienteId: number, manicureNome: string, manicureId: number, id: number, data: string, hora: string, valor: number, pago: boolean }[]}
   */
  async consultarAgendamentos() {
    var sql = `
      SELECT  c.id        AS clienteId,   
              c.nome      AS clienteNome, 
              m.id        AS manicureId,
              m.nome      AS manicureNome,
              
              a.id        AS id,
              a.dia       AS data,
              a.hora      AS hora,
              a.valor     AS valor,
              a.pago      AS pago
          FROM   agendamento a
              INNER JOIN cliente c
                      ON c.id = a.cliente_id
              INNER JOIN manicure m
                      ON m.id = a.manicure_id;
    `;

    var stmt = banco.prepare(sql, []);

    var linhas = [];

    while (stmt.step()) {
      var linha = stmt.getAsObject();

      linha.pago = linha.pago == 1 ? true : false;

      linhas.push(linha);
    }

    stmt.free();

    return linhas;
  },

  /**
   * Apaga um agendamento no banco de dados.
   * @param {number} id ID do agendamento.
   */
  async apagarAgendamento(id) {
    banco.exec(
      `
      DELETE FROM agendamento WHERE id = ?
    `,
      [id]
    );

    await DAO.salvarBanco();
  },

  async atualizarPagamento(id, pago) {
    var sql;
    if (pago == true) {
      sql = `UPDATE agendamento SET pago = 1 WHERE id = ?;`;
    } else {
      sql = `UPDATE agendamento SET pago = 0 WHERE id = ?;`;
    }

    banco.exec(sql, [id]);

    await DAO.salvarBanco();
  },

  /**
   * Edita um agendamento no banco de dados.
   * @param {number} id
   * @param {number} clienteId
   * @param {number} manicureId
   * @param {number} valor
   * @param {string} data
   * @param {string} hora
   * @param {boolean} pago
   */
  async editarAgendamento(id, clienteId, manicureId, valor, data, hora, pago) {
    var sql = `UPDATE agendamento SET cliente_id = ?, manicure_id = ?, dia = ?, hora = ?, valor = ?, pago = ? WHERE id = ?`;

    banco.exec(sql, [clienteId, manicureId, data, hora, valor, pago ? 1 : 0, id]);

    await this.salvarBanco();
  },
};

// Inicializar banco de dados
DAO.inicializar();

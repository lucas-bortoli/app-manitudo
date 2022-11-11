/**
 * Remove todo o "lixo" de um número de celular (basicamente tudo o que não é um dígito)
 * @param {string} celular
 * @returns {string}
 */
function limparNumeroCelular(celular) {
  return celular.replace(/[^0-9.]/gm, "");
}

/**
 * Formata um número de celular
 * @param {string} digitos
 * @param {string} formato
 * @returns {{ formato: string, numDigitos: number, ultimoNumPos: number }}
 */
function formatarGenerico(digitos, formato) {
  var digitosApenas = limparNumeroCelular(digitos.toString()).split("");
  var numDigitos = digitosApenas.length;
  var ultimoNumPos = 0;

  while (digitosApenas.length > 0) {
    var digito = digitosApenas.shift();
    formato = formato.replace("d", digito || " ");
    ultimoNumPos = formato.indexOf("d");

    if (ultimoNumPos === -1) {
      ultimoNumPos = formato.length;
    }
  }

  formato = formato.replaceAll("d", " ");

  return { formato, numDigitos, ultimoNumPos };
}

/**
 * Formata um número de celular
 * @param {string} digitos
 * @returns {{ formato: string, numDigitos: number, ultimoNumPos: number }}
 */
function formatarNumeroCelular(digitos) {
  return formatarGenerico(digitos, "(dd) ddddd-dddd");
}

/**
 * Formata um CNPJ
 * @param {string} digitos
 * @returns {{ formato: string, numDigitos: number, ultimoNumPos: number }}
 */
function formatarCnpj(digitos) {
  return formatarGenerico(digitos, "dd.ddd.ddd/dddd-dd");
}

/**
 * Formata um CPF
 * @param {string} digitos
 * @returns {{ formato: string, numDigitos: number, ultimoNumPos: number }}
 */
function formatarCpf(digitos) {
  return formatarGenerico(digitos, "ddd.ddd.ddd-dd");
}

/**
 * Retorna uma função assíncrona que retorna após um tempo dado
 * @param {number} ms
 * @returns {Promise<void>}
 */
function aguardar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Procura um atributo em um elemento ou nos pais dele, até encontrar. Se não encontrado, retorna null.
 * @param {HTMLElement} elemento
 * @param {string} atributo
 * @returns {string|null} O valor do atributo, caso encontrado.
 */
function pegarAtributoParentes(elemento, atributo) {
  /** @type {HTMLElement} */
  var element = elemento;

  while (element && !element.hasAttribute(atributo)) {
    element = element.parentNode;
  }

  if (!element) {
    return null;
  }

  return element.getAttribute(atributo);
}

/**
 * Procura um elemento subindo na árvore a partir de um filho, até encontrar. Se não encontrado, retorna null.
 * @param {HTMLElement} elemento
 * @param {(el: HTMLElement) => boolean} testFunc
 * @returns {HTMLElement|null} O valor do atributo, caso encontrado.
 */
function encontrarElementoParentes(elemento, testFunc) {
  /** @type {HTMLElement} */
  var element = elemento;

  while (element) {
    // Testar o elemento
    if (testFunc(element)) {
      return element;
    }

    // Testar o parente na próxima iteração
    element = element.parentNode;
  }

  // Não encontrado (chegamos na raiz do DOM)
  if (!element) {
    return null;
  }
}

//Converte Data para dia da semana.

var dataAtual = new Date(); // pega a data em formato de data "12/02/12"

var dt1 = new Date();
var dt2 = new Date();

var diaSemana = "Domingo,Segunda,Terça,Quarta,Quinta,Sexta,Sábado".split(","); // vetor com os dias da semana

var diaAtual = diaSemana[dataAtual.getDay()];

function data() {
  var dataAgendamento = new Date("2022/11/21"); // 1 mes e três dias

  var semana = dt1.setDate(dt1.getDate() + 7);

  var mes = dt2.setDate(dt2.getDate() + 30);

  if (mes < dataAgendamento) {
    return "Próximos Meses";
  } else if (semana < dataAgendamento) {
    return "Próximas Semanas";
  } else {
    return diaSemana[dataAgendamento.getDay()];
  }
}

/**
 * Retorna o uso do localStorage
 * @returns {{ uso: number, max: number, porcentagem: number }}
 */
function usoLocalStorage() {
  var _lsTotal = 0;
  var _xLen = null;

  for (var _x in localStorage) {
    if (!localStorage.hasOwnProperty(_x)) {
      continue;
    }

    _xLen = (localStorage[_x].length + _x.length) * 2;
    _lsTotal += _xLen;
  }

  return {
    max: 5 * 1024 * 1024,
    uso: _lsTotal,
    porcentagem: _lsTotal / (5 * 1024 * 1024),
  };
}

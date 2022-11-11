/**
 * Valida uma chave Pix.
 * @param {PixChaveTipos} tipoChave Tipo da chave
 * @param {string} chave Chave Pix, com sinais de pontuação (parênteses, pontos, hífens...)
 * @returns {{ ok: boolean, erro: string|null }}
 */
function libPixValidarChave(tipoChave, chave) {
  if (tipoChave === "telefone") {
    if (chave.replace(/\d/g, "d") !== "(dd) ddddd-dddd") {
      return { ok: false, erro: "não é um telefone" };
    }
  } else if (tipoChave === "email") {
    if (!chave.match(/^.+@.+\..+$/g)) {
      return { ok: false, erro: "não é um e-mail" };
    }
  } else if (tipoChave === "cnpj") {
    if (!chave.match(/^\d\d\.\d\d\d\.\d\d\d\/\d\d\d\d-\d\d$/g)) {
      return { ok: false, erro: "não é um CNPJ" };
    }
  } else if (tipoChave === "cpf") {
    if (!chave.match(/^\d\d\d\.\d\d\d\.\d\d\d-\d\d$/g)) {
      return { ok: false, erro: "não é um CPF" };
    }
  } else if (tipoChave === "random") {
    if (!chave.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/g)) {
      return { ok: false, erro: "não está no formato de uma chave aleatória" };
    }
  }

  return { ok: true, erro: null };
}

/**
 * Formata uma chave Pix.
 * @param {PixChaveTipos} tipoChave
 * @param {string} chave
 */
function libPixFormatarChave(tipoChave, chave) {
  switch (tipoChave) {
    case "telefone":
      // Telefone: +5545999887766
      chave = "+55" + chave.replace(/[^\d]/gm, "");
      break;
    case "email":
      // E-mail: fulano.silva@gmail.com
      // noop, vamos cruzar os dedos
      chave = chave;
      break;
    case "cpf":
    case "cnpj":
      // CPF/CNPJ: apenas os dígitos
      chave = chave.replace(/[^\d]/gm, "");
      break;
    case "random":
      // Chave aleatória: 123e4567-e12b-12d1-a456-426655440000
      // noop
      chave = chave;
      break;
  }

  return chave;
}

/**
 * Gera um código Pix, que representa um QR code.
 * @param {string} merchant_account Conta do vendedor (chave pix)
 * @param {string} merchant_name Nome do vendedor
 * @param {string|null} merchant_city Cidade do vendedor, opcional (local atual usado)
 * @param {number} transaction_amount Valor desejado, em reais
 * @param {string?} info_adic Descrição do pagamento, opcional
 */
async function libPixQR(merchant_account, merchant_name, merchant_city, transaction_amount, info_adic) {
  class PixError extends Error {
    constructor(message) {
      super(message);
      this.name = "PixError";
    }
  }

  /**
   * Retorna a cidade atual, baseado no endereço IP do usuário.
   */
  var getCurrentCity = async function () {
    console.log("libPIX: Pegando geolocation...");
    var geolocation = await fetch("https://tcc-tecnico-geolocation-api.glitch.me/").then((r) => r.json());
    console.log("libPIX: Dados de geolocation:", geolocation);

    return geolocation.city || "Brasil";
  };

  info_adic = info_adic || "";
  merchant_city = merchant_city || (await getCurrentCity());

  if (info_adic.indexOf(" ") > -1) {
    throw new PixError("Descrição do pagamento não deve ter espaços");
  }

  console.log("libPix: Parâmetros: ", [merchant_account, merchant_name, merchant_city, transaction_amount, info_adic]);

  var crcTable = [
    0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290, 45419, 49548, 53677, 57806, 61935, 4657, 528,
    12915, 8786, 21173, 17044, 29431, 25302, 37689, 33560, 45947, 41818, 54205, 50076, 62463, 58334, 9314, 13379, 1056,
    5121, 25830, 29895, 17572, 21637, 42346, 46411, 34088, 38153, 58862, 62927, 50604, 54669, 13907, 9842, 5649, 1584,
    30423, 26358, 22165, 18100, 46939, 42874, 38681, 34616, 63455, 59390, 55197, 51132, 18628, 22757, 26758, 30887,
    2112, 6241, 10242, 14371, 51660, 55789, 59790, 63919, 35144, 39273, 43274, 47403, 23285, 19156, 31415, 27286, 6769,
    2640, 14899, 10770, 56317, 52188, 64447, 60318, 39801, 35672, 47931, 43802, 27814, 31879, 19684, 23749, 11298,
    15363, 3168, 7233, 60846, 64911, 52716, 56781, 44330, 48395, 36200, 40265, 32407, 28342, 24277, 20212, 15891, 11826,
    7761, 3696, 65439, 61374, 57309, 53244, 48923, 44858, 40793, 36728, 37256, 33193, 45514, 41451, 53516, 49453, 61774,
    57711, 4224, 161, 12482, 8419, 20484, 16421, 28742, 24679, 33721, 37784, 41979, 46042, 49981, 54044, 58239, 62302,
    689, 4752, 8947, 13010, 16949, 21012, 25207, 29270, 46570, 42443, 38312, 34185, 62830, 58703, 54572, 50445, 13538,
    9411, 5280, 1153, 29798, 25671, 21540, 17413, 42971, 47098, 34713, 38840, 59231, 63358, 50973, 55100, 9939, 14066,
    1681, 5808, 26199, 30326, 17941, 22068, 55628, 51565, 63758, 59695, 39368, 35305, 47498, 43435, 22596, 18533, 30726,
    26663, 6336, 2273, 14466, 10403, 52093, 56156, 60223, 64286, 35833, 39896, 43963, 48026, 19061, 23124, 27191, 31254,
    2801, 6864, 10931, 14994, 64814, 60687, 56684, 52557, 48554, 44427, 40424, 36297, 31782, 27655, 23652, 19525, 15522,
    11395, 7392, 3265, 61215, 65342, 53085, 57212, 44955, 49082, 36825, 40952, 28183, 32310, 20053, 24180, 11923, 16050,
    3793, 7920,
  ];

  const format = "000201"; // Payload Format Indicator
  const gui = "0014br.gov.bcb.pix"; // GUI
  const chave =
    "01" + (merchant_account.length < 10 ? "0" + merchant_account.length : merchant_account.length) + merchant_account; // Key Pix
  const info =
    info_adic.length > 0
      ? "02" +
        (info_adic.length < 10 ? "0" + info_adic.length : info_adic.length) +
        (info_adic.length > 50 ? info_adic.substring(0, 50) : info_adic)
      : ""; // Additional Info
  const account = "26" + (gui.length + chave.length + info.length) + gui + chave + info; // Merchant Account Information
  const category = "52040000"; // Merchant Category Code
  const currency = "5303986"; // Transaction Currency (R$)
  const amount =
    `${transaction_amount}`.length > 0
      ? "54" +
        (`${transaction_amount}`.length < 10 ? "0" + `${transaction_amount}`.length : `${transaction_amount}`.length) +
        transaction_amount
      : ""; // Transaction Amount
  const country = "5802BR"; // Country Code
  let name = merchant_name.length > 25 ? merchant_name.substring(0, 25) : merchant_name;
  name = "59" + (name.length < 10 ? "0" + name.length : name.length) + name; // Merchant Name
  let city = merchant_city.length > 25 ? merchant_city.substring(0, 25) : merchant_city;
  city = "60" + (city.length < 10 ? "0" + city.length : city.length) + city; // Merchant City
  const additional = "62070503***"; // Additional Data Field Template
  const crc16 = "6304"; // CRC16

  const payload = format + account + category + currency + amount + country + name + city + additional + crc16;

  let crc = 0xffff;
  let j, i;
  for (i = 0; i < payload.length; i++) {
    const c = payload.charCodeAt(i);
    if (c > 255) throw new RangeError();
    j = (c ^ (crc >> 8)) & 0xff;
    crc = crcTable[j] ^ (crc << 8);
  }
  const crcCalc = ((crc ^ 0) & 0xffff).toString(16).toUpperCase();
  let qrCodePix =
    payload + (crcCalc.length == 4 ? "" : crcCalc.length == 3 ? "0" : crcCalc.length == 2 ? "00" : "000") + crcCalc;

  return qrCodePix;
}

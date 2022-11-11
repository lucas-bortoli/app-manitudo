type PixChaveTipos = "cpf" | "cnpj" | "telefone" | "email" | "random";

interface ConfigKeyValue {
  pixChaveTipo: PixChaveTipos;
  pixHabilitado: boolean;
  pixChave: string;
  pixNome: string;
}

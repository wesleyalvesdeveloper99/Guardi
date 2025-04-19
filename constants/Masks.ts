export type MasksType =
  | "unmask"
  | "number"
  | "state"
  | "hour"
  | "showHour"
  | "maskYear"
  | "cpf"
  | "rg"
  | "cnpj"
  | "document"
  | "zipcode"
  | "phone"
  | "cell"
  | "currency"
  | "currencyAllPlatforms"
  | "percentage"
  | "creditCard"
  | "creditCardDate"
  | "cep"
  | "cvv"
  | "date"
  | "intWithSemicolon"
  | "optionMask";

export interface Masks {
  unmask: (string: string) => string;
  number: (string: string) => string;
  state: (string: string) => string;
  hour: (string: string) => string;
  showHour: (string: string) => string;
  maskYear: (value: number) => string;
  cpf: (string: string) => string;
  rg: (string: string) => string;
  cnpj: (string: string) => string;
  document: (string: string) => string;
  zipcode: (string: string) => string;
  phone: (string: string) => string;
  cell: (string: string) => string;
  currency: (value: string) => string;
  currencyAllPlatforms: (value: string) => string;
  percentage: (string: string) => string;
  creditCard: (value: string) => string;
  creditCardDate: (value: string) => string;
  validateYouTubeUrl: (link: string) => string;
  cep: (cep: string) => string;
  cvv: (value: string) => string;
  date: (value: string) => string;
  intWithSemicolon: (value: string) => string;
  optionMask: (value: string) => string;
}

export const masks: Masks | any = {
  optionMask: (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");

    const limited = cleaned.slice(0, 1);

    return `option ${limited}`;
  },
  intWithSemicolon: (string: string) => {
    let cleaned = string.replace(/[^0-9;]/g, "");

    cleaned = cleaned.replace(/;{2,}/g, ";");

    const parts = cleaned.split(";").map((part) => part.slice(0, 2));

    return parts.join(";");
  },
  unmask: (string: string) => string.replace(/[^a-zA-Z0-9]/g, ""),
  number: (string: string) => string.replace(/\D/g, ""),
  state: (string: string) => string.replace(/\d/, ""),
  hour: (string: string) =>
    String(string)
      .replace(/\D/, "")
      .slice(0, 4)
      .replace(/(\d{2})(\d{2})/, (_, h, m) => {
        const hours = Math.min(23, parseInt(h, 10)).toString().padStart(2, "0");
        const minutes = Math.min(59, parseInt(m, 10))
          .toString()
          .padStart(2, "0");
        return `${hours}:${minutes}`;
      }),
  showHour: (string: string) => {
    string = String(string);
    return string.length === 3
      ? string.replace(/(\d{1})(\d)/, "$1h$2")
      : string.replace(/(\d{2})(\d)/, "$1h$2");
  },
  maskYear: (value: number) => {
    const numericValue = Number(String(value).replace(/\D/g, ""));
    const yearString = numericValue.toString().slice(0, 4);
    return yearString.padStart(4, "0");
  },
  validateYouTubeUrl: (url: string) => {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  },
  cpf: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1"),
  rg: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{1})\d+?$/, "$1"),
  cnpj: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1"),
  document: (string: string) => {
    if (string.length < 12) {
      return string
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }

    return string
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  },
  zipcode: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1"),
  phone: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1"),
  cell: (string: string) =>
    string
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1"),
  currency: (value: string) => {
    const string = value.toString();

    if (string.replace(/\D/g, "") !== "")
      return (parseInt(string.replace(/\D/g, ""), 10) / 100).toLocaleString(
        "pt-BR",
        {
          minimumFractionDigits: 2,
        }
      );

    return "0,00";
  },
  currencyAllPlatforms: (value: string) => {
    if (typeof value === "number") {
      const [currency, cents] = (value / 100).toFixed(2).toString().split(".");

      return `R$ ${currency.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${cents}`;
    }

    return "R$ 0,00";
  },
  percentage: (string: string) => {
    let number = Number(String(string).replace(/\D/g, ""));
    if (number > 100) number = 100;
    return `${number}`;
  },
  creditCard: (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(.\d{4})\d+?$/, "$1"),

  creditCardDate: (value: string) => {
    value = value
      .replace(/\D/g, "")
      .replace(/([\d]{4})/, "$1")
      .replace(/([\d]{4})[\d]+?$/, "$1")
      .replace(/([\d]{2})([\d]{1})/, "$1/$2");
    const dates = value.split("/");
    if (dates.length) {
      if (parseInt(dates[0], 10) > 12) dates[0] = "12";
      return dates.join("/");
    }
    return value;
  },
  cep: (cep: string) => {
    const numericCep = cep.replace(/\D/g, "").slice(0, 8);
    return numericCep.replace(/(\d{5})(\d{3})/, "$1-$2");
  },

  date: (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    const day = cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const year = cleaned.slice(4, 8);

    const formattedDate = [day, month, year].filter(Boolean).join("/");

    return formattedDate;
  },
  cvv: (value: string) =>
    value
      .replace(/[^\d]/g, "")
      .replace(/([\d]{4})/, "$1")
      .replace(/([\d]{4})[\d]+?$/, "$1"),
};

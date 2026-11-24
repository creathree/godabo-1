// godabo（公開）— ja 正本・Software（App Router）

module.exports = {
  inputLanguage: "ja",
  engine: "gemini",
  apiKey: process.env.GEMINI_API_KEY || "",
  mode: "auto",
  chunkSize: 100,

  strategy: {
    style: "Strict Business",
    context: "Software",
    force: false,
  },

  locales: [
    { key: "ja", label: "Japanese" },
    { key: "ko", label: "Korean" },
  ],

  paths: {
    src: ".",
    translationsDir: "i18n/data",
    include: ["app/**", "components/**", "lib/**"],
  },
};
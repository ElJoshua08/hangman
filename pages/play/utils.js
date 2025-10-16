import { CONFIG } from "../../constants/config.js";

/**
 *
 * @param {*} language @default es @description language in which the word will be generated
 * @param {*} minLength @default 4 @description minimum length of the word
 * @param {*} maxLenght @default 8 @description maximum length of the word
 *
 * @returns {Promise<string>} random word
 */
export const getRandomWord = async (language = "en", length = 6) => {
  const url = `${CONFIG.API_URL}?language=${language}&length=${length}&type=lowercase&words=1`;
  console.log({ url });

  try {
    const data = await fetch(url).then((res) => res.json());
    console.log(data);

    return data[0].word;
  } catch (error) {
    throw new Error("Word could not be fetched.");
  }
};

import { CONFIG } from "../../constants/config.js";

/**
 *
 * @param {*} language @default es @description language in which the word will be generated
 * @param {*} minLength @default 4 @description minimum length of the word
 * @param {*} maxLenght @default 8 @description maximum length of the word
 *
 * @returns {Promise<string>} random word
 */
export const getRandomWord = async (
  language = "en",
  minLength = 4,
  maxLenght = 8
) => {
  const url = `${CONFIG.API_URL}?language=${language}&minLength=${minLength}&maxLength=${maxLenght}&words=1`;

  try {
    const data = await fetch(url).then((res) => res.json());

    return data[0].word;
  } catch (error) {
    throw new Error("Word could not be fetched.");
  }
};

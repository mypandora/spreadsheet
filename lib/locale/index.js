import en from './en';
import zh from './zh-cn';

// Defines the fallback language as English
let $languages = ['zh', 'en'];
const $messages = {
  zh,
  en,
};

function translate(key, messages) {
  if (messages) {
    // Return the translation from the first language in the languages array
    // that has a value for the provided key.
    // eslint-disable-next-line no-restricted-syntax
    for (const lang of $languages) {
      if (!messages[lang]) {
        break;
      }

      let message = messages[lang];

      // Splits the key at '.' except where escaped as '\.'
      const keys = key.match(/(?:\\.|[^.])+/g);

      for (let i = 0; i < keys.length; i += 1) {
        const property = keys[i];
        const value = message[property];

        // If value doesn't exist, try next language
        if (!value) {
          break;
        }

        if (i === keys.length - 1) {
          return value;
        }

        // Move down to the next level of the messages object
        message = value;
      }
    }
  }

  return undefined;
}

function t(key) {
  let v = translate(key, $messages);
  // 这里是作者暴露的另一个可配置本地化的入口点
  if (!v && window?.Spreadsheet?.$message) {
    v = translate(key, window.Spreadsheet.$message);
  }
  return v || '';
}

function tf(key) {
  return () => t(key);
}

// If clearLangList is set to false, lang will be added to the front of the
// languages array. The languages in the language array are searched in order
// to find a translation. This allows the use of other languages as a fallback
// if lang is missing some keys. The language array is preloaded with English.
// To set the languages array to only include lang, set clearLangList to true.
function locale(lang, message, clearLangList = false) {
  if (clearLangList) {
    $languages = [lang];
  } else {
    // Append to front of array.
    // Translation method will use the first languages in the list that has a
    // matching key.
    $languages.unshift(lang);
  }

  if (message) {
    $messages[lang] = message;
  }
}

export default {
  t,
};

export { locale, t, tf };

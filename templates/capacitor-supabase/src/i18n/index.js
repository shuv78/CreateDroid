/**
 * Internationalization setup with language detection
 * Supports English (en) and Bengali (bn) with RTL support
 */

import bn from './bn';
import en from './en';

const translations = { en, bn };
const fallbackLang = 'en';

/**
 * Detect user's preferred language
 * @returns {'en'|'bn'}
 */
export function detectLanguage() {
  try {
    // Check localStorage first
    const stored = localStorage.getItem('app-language');
    if (stored && translations[stored]) return stored;

    // Check browser language
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && translations[browserLang]) return browserLang;

    // Check system locale
    if (typeof navigator !== 'undefined') {
      const languages = navigator.languages || [];
      for (const lang of languages) {
        const code = lang.split('-')[0];
        if (translations[code]) return code;
      }
    }
  } catch {
    // Fall back to English
  }

  return fallbackLang;
}

/**
 * Get translation for a key in the specified language
 * Supports nested keys using dot notation (e.g., 'auth.login.title')
 * @param {'en'|'bn'} lang
 * @param {string} key - Dot-notation key
 * @param {object} [params] - Interpolation parameters
 * @returns {string}
 */
export function t(lang, key, params = {}) {
  try {
    const keys = key.split('.');
    let value = translations[lang] || translations[fallbackLang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fall back to English
        value = translations[fallbackLang];
        for (const fk of keys) {
          if (value && typeof value === 'object' && fk in value) {
            value = value[fk];
          } else {
            return key; // Key not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') return key;

    // Interpolate parameters
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      return paramName in params ? String(params[paramName]) : match;
    });
  } catch {
    return key;
  }
}

/**
 * Get all translations for a namespace
 * @param {'en'|'bn'} lang
 * @param {string} namespace - First-level namespace key
 * @returns {object}
 */
export function getNamespace(lang, namespace) {
  try {
    return translations[lang]?.[namespace] || translations[fallbackLang]?.[namespace] || {};
  } catch {
    return {};
  }
}

/**
 * Check if language is RTL
 * @param {string} lang
 * @returns {boolean}
 */
export function isRTL(lang) {
  return lang === 'bn' || lang === 'ar' || lang === 'he';
}

export { translations };

export default { t, detectLanguage, isRTL, getNamespace, translations };

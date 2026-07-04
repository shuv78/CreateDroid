/**
 * Number and currency formatting helpers
 * Supports BDT (Bangladeshi Taka), USD, and general formatting
 */

const DEFAULT_LOCALE = 'en-BD';

/**
 * Format a number with commas (Bangladeshi/Indian style)
 * @param {number} value - The number to format
 * @param {object} [options]
 * @param {number} [options.decimals=0] - Decimal places
 * @returns {string}
 */
export function formatNumber(value, options = {}) {
  try {
    const { decimals = 0 } = options;
    if (value === null || value === undefined || isNaN(value)) return '—';

    return Number(value).toLocaleString('en-BD', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return String(value);
  }
}

/**
 * Format a value as currency (BDT or other)
 * @param {number} value - Amount
 * @param {object} [options]
 * @param {string} [options.currency='BDT'] - Currency code
 * @param {'en-BD'|'en-US'|'bn-BD'} [options.locale='en-BD']
 * @param {boolean} [options.showCode=false] - Show currency code instead of symbol
 * @returns {string}
 */
export function formatCurrency(value, options = {}) {
  try {
    const {
      currency = 'BDT',
      locale = 'en-BD',
      showCode = false,
    } = options;

    if (value === null || value === undefined || isNaN(value)) return '—';

    const formatted = Number(value).toLocaleString(locale, {
      style: showCode ? 'decimal' : 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (showCode) {
      return `${currency} ${formatted}`;
    }

    return formatted;
  } catch {
    return `${options.currency || 'BDT'} ${value}`;
  }
}

/**
 * Format BDT (Bangladeshi Taka) with symbol
 * @param {number} value
 * @param {boolean} [compact=false] - Use compact notation (e.g., ১.৫ক)
 * @returns {string}
 */
export function formatBDT(value, compact = false) {
  try {
    if (value === null || value === undefined || isNaN(value)) return '—';

    if (compact) {
      const abs = Math.abs(value);
      if (abs >= 10000000) return `৳ ${(value / 10000000).toFixed(1)} কোটি`;
      if (abs >= 100000) return `৳ ${(value / 100000).toFixed(1)} লাখ`;
      if (abs >= 1000) return `৳ ${(value / 1000).toFixed(1)} হাজার`;
    }

    return `৳ ${formatNumber(value, { decimals: 2 })}`;
  } catch {
    return `৳ ${value}`;
  }
}

/**
 * Format percentage
 * @param {number} value - (e.g., 0.25 for 25%)
 * @param {object} [options]
 * @param {number} [options.decimals=1]
 * @param {boolean} [options.multiplyBy100=true] - Auto-multiply by 100
 * @returns {string}
 */
export function formatPercent(value, options = {}) {
  try {
    const { decimals = 1, multiplyBy100 = true } = options;
    if (value === null || value === undefined || isNaN(value)) return '—';

    const num = multiplyBy100 ? value * 100 : value;
    return `${Number(num).toFixed(decimals)}%`;
  } catch {
    return `${value}%`;
  }
}

/**
 * Compact number formatting (e.g., 1.5K, 2.3M)
 * @param {number} value
 * @param {object} [options]
 * @param {number} [options.decimals=1]
 * @returns {string}
 */
export function formatCompact(value, options = {}) {
  try {
    const { decimals = 1 } = options;
    if (value === null || value === undefined || isNaN(value)) return '—';

    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(decimals)}Cr`;
    if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(decimals)}L`;
    if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(decimals)}K`;

    return formatNumber(value, { decimals });
  } catch {
    return String(value);
  }
}

/**
 * Format file size
 * @param {number} bytes
 * @param {object} [options]
 * @param {number} [options.decimals=1]
 * @returns {string}
 */
export function formatFileSize(bytes, options = {}) {
  try {
    const { decimals = 1 } = options;
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) return '—';

    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const index = Math.min(i, units.length - 1);

    return `${Number(bytes / Math.pow(k, index)).toFixed(decimals)} ${units[index]}`;
  } catch {
    return `${bytes} B`;
  }
}

/**
 * Format phone number (Bangladesh format)
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 11) {
    return `+880 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith('880')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return phone;
}

/**
 * Round to specific decimal places
 * @param {number} value
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function round(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format number with BD-style grouping (e.g., ১২,৩৪,৫৬৭)
 * @param {number} value
 * @returns {string}
 */
export function formatBDGrouping(value) {
  try {
    if (value === null || value === undefined || isNaN(value)) return '—';

    const str = Math.floor(Math.abs(value)).toString();
    const lastThree = str.slice(-3);
    const rest = str.slice(0, -3);
    const grouped = rest ? rest.replace(/\B(?=(?:\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;

    return (value < 0 ? '-' : '') + grouped;
  } catch {
    return String(value);
  }
}

export default {
  formatNumber,
  formatCurrency,
  formatBDT,
  formatPercent,
  formatCompact,
  formatFileSize,
  formatPhone,
  round,
  formatBDGrouping,
};

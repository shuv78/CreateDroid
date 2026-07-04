/**
 * Bangladesh timezone date helpers
 * Handles BST (UTC+6) timezone conversions and formatting
 */

const BDT_OFFSET = 6; // Bangladesh Standard Time (UTC+6)
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Get current time in Bangladesh (BST)
 * @returns {Date}
 */
export function getBDTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + BDT_OFFSET * MS_PER_HOUR);
}

/**
 * Convert any date string/number to Bangladesh time
 * @param {string|number|Date} date - ISO string, timestamp, or Date object
 * @returns {Date}
 */
export function toBDTime(date) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error('Invalid date');
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + BDT_OFFSET * MS_PER_HOUR);
  } catch {
    return new Date(NaN);
  }
}

/**
 * Format a date to Bangladesh locale string
 * @param {string|number|Date} date
 * @param {object} [options] - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatBDDate(date, options = {}) {
  try {
    const d = toBDTime(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    const defaultOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options,
    };

    return d.toLocaleDateString('en-BD', defaultOptions);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format date and time in Bangladesh format
 * @param {string|number|Date} date
 * @returns {string}
 */
export function formatBDDateTime(date) {
  try {
    const d = toBDTime(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    return d.toLocaleString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format time only (HH:MM AM/PM BST)
 * @param {string|number|Date} date
 * @returns {string}
 */
export function formatBDTime(date) {
  try {
    const d = toBDTime(date);
    if (isNaN(d.getTime())) return 'Invalid date';

    return d.toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' BST';
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get relative time from now in BD timezone
 * @param {string|number|Date} date
 * @param {'en'|'bn'} [lang='en']
 * @returns {string}
 */
export function getRelativeTime(date, lang = 'en') {
  try {
    const d = toBDTime(date);
    const now = getBDTime();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (lang === 'bn') {
      if (diffSec < 10) return 'এইমাত্র';
      if (diffMin < 1) return `${diffSec} সেকেন্ড আগে`;
      if (diffMin < 60) return `${diffMin} মি আগে`;
      if (diffHour < 24) return `${diffHour} ঘ আগে`;
      if (diffDay < 7) return `${diffDay} দি আগে`;
      return formatBDDate(date);
    }

    if (diffSec < 10) return 'Just now';
    if (diffMin < 1) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatBDDate(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Check if a date is today in BD timezone
 * @param {string|number|Date} date
 * @returns {boolean}
 */
export function isToday(date) {
  try {
    const d = toBDTime(date);
    const now = getBDTime();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Check if a date is yesterday in BD timezone
 * @param {string|number|Date} date
 * @returns {boolean}
 */
export function isYesterday(date) {
  try {
    const d = toBDTime(date);
    const yesterday = new Date(getBDTime().getTime() - 24 * MS_PER_HOUR);
    return (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Get formatted date range for the current week in BD timezone
 * @returns {{ start: Date, end: Date, label: string }}
 */
export function getBDWeekRange() {
  const now = getBDTime();
  const day = now.getDay(); // 0=Sun, 1=Mon, ... 6=Sat in BD
  const diff = day === 0 ? 0 : day; // BD week starts on Sunday

  const start = new Date(now.getTime() - diff * 24 * MS_PER_HOUR);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start.getTime() + 6 * 24 * MS_PER_HOUR);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    label: `${formatBDDate(start)} - ${formatBDDate(end)}`,
  };
}

/**
 * Get month name in Bengali or English
 * @param {number} month - 0-indexed (0=January)
 * @param {'en'|'bn'} lang
 * @returns {string}
 */
export function getMonthName(month, lang = 'en') {
  const months = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  };
  return months[lang]?.[month] || months.en[month] || '';
}

export default {
  getBDTime,
  toBDTime,
  formatBDDate,
  formatBDDateTime,
  formatBDTime,
  getRelativeTime,
  isToday,
  isYesterday,
  getBDWeekRange,
  getMonthName,
};

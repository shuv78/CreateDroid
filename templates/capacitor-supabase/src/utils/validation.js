/**
 * Form validators — email, phone, required fields, and more
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Create a required field validator
 * @param {string} fieldName - Human-readable field name
 * @param {string} [message] - Custom error message
 * @returns {(value: any) => string|null}
 */
export function required(fieldName, message) {
  return (value) => {
    if (isEmpty(value)) {
      return message || `${fieldName} is required`;
    }
    return null;
  };
}

/**
 * Validate email format
 * @param {string} email
 * @returns {string|null} Error message or null
 */
export function validateEmail(email) {
  if (isEmpty(email)) return null; // Let required() handle emptiness

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }

  // Check for common typos
  const domain = email.split('@')[1]?.toLowerCase();
  const commonTypos = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  if (domain && commonTypos[domain]) {
    return `Did you mean ${email.split('@')[0]}@${commonTypos[domain]}?`;
  }

  return null;
}

/**
 * Validate phone number (Bangladesh format)
 * @param {string} phone
 * @param {object} [options]
 * @param {boolean} [options.allowInternational=false]
 * @returns {string|null}
 */
export function validatePhone(phone, options = {}) {
  const { allowInternational = false } = options;

  if (isEmpty(phone)) return null;

  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');

  if (allowInternational) {
    // Allow international numbers (at least 7 digits)
    if (!/^\d{7,15}$/.test(cleaned)) {
      return 'Enter a valid phone number';
    }
    return null;
  }

  // Bangladeshi phone number validation
  if (!/^01[3-9]\d{8}$/.test(cleaned)) {
    return 'Enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX)';
  }

  return null;
}

/**
 * Validate minimum length
 * @param {number} min
 * @param {string} [message]
 * @returns {(value: string) => string|null}
 */
export function minLength(min, message) {
  return (value) => {
    if (isEmpty(value)) return null;
    if (typeof value === 'string' && value.trim().length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  };
}

/**
 * Validate maximum length
 * @param {number} max
 * @param {string} [message]
 * @returns {(value: string) => string|null}
 */
export function maxLength(max, message) {
  return (value) => {
    if (isEmpty(value)) return null;
    if (typeof value === 'string' && value.trim().length > max) {
      return message || `Must be at most ${max} characters`;
    }
    return null;
  };
}

/**
 * Validate password strength
 * @param {string} password
 * @param {object} [options]
 * @param {number} [options.minLength=6]
 * @param {boolean} [options.requireNumber=false]
 * @param {boolean} [options.requireUppercase=false]
 * @param {boolean} [options.requireSymbol=false]
 * @returns {string|null}
 */
export function validatePassword(password, options = {}) {
  const {
    minLength: min = 6,
    requireNumber = false,
    requireUppercase = false,
    requireSymbol = false,
  } = options;

  if (isEmpty(password)) return null;

  if (password.length < min) {
    return `Password must be at least ${min} characters`;
  }

  if (requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (requireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
}

/**
 * Validate URL
 * @param {string} url
 * @param {object} [options]
 * @param {boolean} [options.requireHttps=false]
 * @returns {string|null}
 */
export function validateURL(url, options = {}) {
  const { requireHttps = false } = options;

  if (isEmpty(url)) return null;

  try {
    const parsed = new URL(url);
    if (requireHttps && parsed.protocol !== 'https:') {
      return 'URL must use HTTPS';
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
}

/**
 * Validate numeric value
 * @param {*} value
 * @param {object} [options]
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @returns {string|null}
 */
export function validateNumber(value, options = {}) {
  const { min, max } = options;

  if (isEmpty(value)) return null;

  const num = Number(value);
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }

  if (min !== undefined && num < min) {
    return `Value must be at least ${min}`;
  }

  if (max !== undefined && num > max) {
    return `Value must be at most ${max}`;
  }

  return null;
}

/**
 * Run multiple validators sequentially
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {(value: any) => string|null}
 */
export function composeValidators(...validators) {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

/**
 * Generic validation runner for form fields
 * @param {object} fields - { fieldName: value }
 * @param {object} rules - { fieldName: [validator functions] }
 * @returns {object} { fieldName: errorMessage }
 */
export function validateForm(fields, rules) {
  const errors = {};
  for (const [fieldName, validators] of Object.entries(rules)) {
    const value = fields[fieldName];
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[fieldName] = error;
        break;
      }
    }
  }
  return errors;
}

export default {
  isEmpty,
  required,
  validateEmail,
  validatePhone,
  minLength,
  maxLength,
  validatePassword,
  validateURL,
  validateNumber,
  composeValidators,
  validateForm,
};

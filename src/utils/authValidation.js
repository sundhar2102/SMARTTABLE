// Reusable Form Validation Rules for Authentication & Registration

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return null;
};

export const validatePhone = (phone, required = false) => {
  if (!phone || !phone.trim()) {
    if (required) return 'Phone number is required.';
    return null;
  }
  const clean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (clean.length < 10 || clean.length > 13) {
    return 'Please enter a valid 10-digit mobile number.';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return null;
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-gray-700' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-black', text: 'text-gray-300' };
  if (score <= 4) return { score, label: 'Good', color: 'bg-gray-400', text: 'text-gray-300' };
  return { score, label: 'Strong', color: 'bg-black', text: 'text-white' };
};

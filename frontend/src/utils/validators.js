// src/utils/validators.js
import { IMAGE_CONFIG } from '../constants/config';

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Ethereum address
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validate URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate price (positive number)
export const isValidPrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num >= 0;
};

// Validate quantity (positive integer)
export const isValidQuantity = (quantity) => {
  const num = parseInt(quantity);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Validate date (must be in the future)
export const isValidFutureDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Validate date range
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

// Validate image file
export const isValidImage = (file) => {
  if (!file) return false;
  
  // Check file type
  if (file.type && !IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Định dạng file không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG.' };
  }
  
  // Check file size
  if (file.size && file.size > IMAGE_CONFIG.maxSizeInBytes) {
    return { valid: false, error: `Kích thước file vượt quá ${IMAGE_CONFIG.maxSizeInBytes / 1024 / 1024}MB.` };
  }
  
  return { valid: true };
};

// Validate event form data
export const validateEventForm = (data) => {
  const errors = {};
  
  if (!data.eventName || data.eventName.trim().length < 3) {
    errors.eventName = 'Tên sự kiện phải có ít nhất 3 ký tự';
  }
  
  if (!data.category) {
    errors.category = 'Vui lòng chọn thể loại';
  }
  
  if (!data.startDate) {
    errors.startDate = 'Vui lòng chọn ngày bắt đầu';
  } else if (!isValidFutureDate(data.startDate)) {
    errors.startDate = 'Ngày bắt đầu phải trong tương lai';
  }
  
  if (!data.endDate) {
    errors.endDate = 'Vui lòng chọn ngày kết thúc';
  } else if (data.startDate && !isValidDateRange(data.startDate, data.endDate)) {
    errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
  }
  
  if (data.isOffline) {
    if (!data.venueName || data.venueName.trim().length === 0) {
      errors.venueName = 'Vui lòng nhập địa điểm';
    }
    if (!data.city) {
      errors.city = 'Vui lòng chọn thành phố';
    }
  }
  
  if (!data.organizerName || data.organizerName.trim().length === 0) {
    errors.organizerName = 'Vui lòng nhập tên ban tổ chức';
  }
  
  if (!data.mainImage) {
    errors.mainImage = 'Vui lòng chọn ảnh sự kiện';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate ticket template
export const validateTicketTemplate = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Vui lòng nhập tên loại vé';
  }
  
  if (!data.price || !isValidPrice(data.price)) {
    errors.price = 'Giá vé không hợp lệ';
  }
  
  if (!data.totalSupply || !isValidQuantity(data.totalSupply)) {
    errors.totalSupply = 'Số lượng vé không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate required fields
export const validateRequired = (fields, data) => {
  const errors = {};
  
  fields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      errors[field] = 'Trường này là bắt buộc';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize string input (remove dangerous characters)
export const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

// Validate password strength
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Mật khẩu phải có ít nhất 1 chữ số' };
  }
  
  return { valid: true };
};

// Check if string is empty or whitespace
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

// Validate transaction hash
export const isValidTxHash = (hash) => {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

export default {
  isValidEmail,
  isValidAddress,
  isValidPhone,
  isValidUrl,
  isValidPrice,
  isValidQuantity,
  isValidFutureDate,
  isValidDateRange,
  isValidImage,
  validateEventForm,
  validateTicketTemplate,
  validateRequired,
  sanitizeString,
  validatePassword,
  isEmpty,
  isValidTxHash,
};

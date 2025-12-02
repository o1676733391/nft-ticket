// src/utils/formatters.js

// Format date to readable string
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('vi-VN', options);
};

// Format date to short format (DD/MM/YYYY)
export const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format time (HH:MM)
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency (VND or token)
export const formatCurrency = (amount, currency = 'VND') => {
  if (!amount && amount !== 0) return '';
  
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  
  // For tokens
  return `${parseFloat(amount).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })} ${currency}`;
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num && num !== 0) return '';
  return num.toLocaleString('vi-VN');
};

// Format address (0x1234...5678)
export const formatAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Format token ID (shorten if too long)
export const formatTokenId = (tokenId) => {
  if (!tokenId) return '';
  const str = tokenId.toString();
  if (str.length <= 8) return str;
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format duration (in seconds to readable format)
export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0 giây';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} giờ`);
  if (minutes > 0) parts.push(`${minutes} phút`);
  if (secs > 0 && hours === 0) parts.push(`${secs} giây`);
  
  return parts.join(' ');
};

// Format price range
export const formatPriceRange = (min, max, currency = 'VND') => {
  if (!min && !max) return 'Miễn phí';
  if (min === max) return formatCurrency(min, currency);
  if (!min) return `Lên đến ${formatCurrency(max, currency)}`;
  if (!max) return `Từ ${formatCurrency(min, currency)}`;
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} năm trước`;
  if (months > 0) return `${months} tháng trước`;
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Capitalize first letter
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Parse price from string
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  // Remove all non-numeric characters except decimal point
  const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

export default {
  formatDate,
  formatDateShort,
  formatTime,
  formatCurrency,
  formatNumber,
  formatAddress,
  formatTokenId,
  formatFileSize,
  formatDuration,
  formatPriceRange,
  formatRelativeTime,
  truncateText,
  capitalizeFirst,
  parsePrice,
};

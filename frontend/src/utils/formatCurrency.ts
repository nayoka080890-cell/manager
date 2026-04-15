export const formatVnd = (amount: number): string => {
  return `${Math.round(amount).toLocaleString('vi-VN')} VNĐ`;
};

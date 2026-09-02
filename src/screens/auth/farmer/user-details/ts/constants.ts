export const validateName = (value: string) =>
  /^[A-Za-z\s]+$/.test(value.trim());
export const validateGhanaCard = (value: string) =>
  /^(\d{5}-\d{7}-\d|\d{13})$/.test(value.trim());
export const validateMobile = (value: string) =>
  /^\+92 \d{3} \d{3} \d{4}$/.test(value.trim());
export const validateEmail = (value: string) =>
  value.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// NADRA ID (CNIC) format: XXXXX-XXXXXXX-X (5-7-1 digits)
export const ghanaCardMask = [
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
];

// Pakistan mobile format: +92 XXX XXX XXXX
export const mobileMask = [
  '+',
  '9',
  '2',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
  /\d/,
  ' ',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

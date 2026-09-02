// NADRA ID (CNIC) format: XXXXX-XXXXXXX-X (5-7-1 digits)
export const ghanaCardMask = [
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  '-',
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
export const pinMask = [
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/
];


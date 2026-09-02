export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('92') && digits.length >= 12) {
    const subscriber = digits.substring(2);
    const first = subscriber[0];
    const last4 = subscriber.slice(-4);
    return `+92 ${first}** *** ${last4}`;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    const subscriber = digits.substring(1);
    const first = subscriber[0];
    const last4 = subscriber.slice(-4);
    return `0${first}* **** ${last4}`;
  }

  // Generic fallback: show first char, mask middle, show last 4
  if (digits.length >= 8) {
    const last4 = digits.slice(-4);
    const masked = '*'.repeat(digits.length - 5);
    return `${digits[0]}${masked}${last4}`;
  }

  return phone;
};

export const formatPhoneNumber = (phoneNumber: string) => {
  if (!phoneNumber) return "";
  // Remove non-digit characters, but keep '+' at the start
  let digits = phoneNumber.replace(/[^\d+]/g, "");
  if (digits.startsWith("+92")) {
    digits = digits.substring(1); // keep 92...
  }
  if (digits.startsWith("92")) {
    const subscriber = digits.substring(2);
    if (subscriber.length === 10) {
      return `+92 ${subscriber.substring(0, 3)} ${subscriber.substring(
        3,
        6
      )} ${subscriber.substring(6, 10)}`;
    }
  }
  return phoneNumber; // Return original if it doesn't match expected format
};

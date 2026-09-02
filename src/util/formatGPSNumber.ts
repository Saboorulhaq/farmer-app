export const formatGpsInput = (input: string, validDistrictCodes: string[]) => {
  if (!input) return '';

  const value = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // If input is empty after stripping, return empty
  if (!value) return '';

  // Step 1: Find the longest matching prefix
  let prefix = '';
  for (let len = 3; len >= 2; len--) {
    const candidate = value.slice(0, len);
    if (validDistrictCodes.includes(candidate)) {
      prefix = candidate;
      break;
    }
  }

  // If no exact match, try first 2 characters as partial prefix
  if (!prefix) {
    const first2 = value.slice(0, 2);
    const possiblePrefixes = validDistrictCodes.filter(code => code.startsWith(first2));
    if (possiblePrefixes.length > 0) {
      prefix = first2;
    } else {
      // check 2-char numeric prefixes like A2, A3
      const first2num = value.slice(0, 2);
      if (validDistrictCodes.includes(first2num)) {
        prefix = first2num;
      } else {
        return '';
      }
    }
  }

  // Step 2: Process the rest (numbers only)
  let rest = value.slice(prefix.length).replace(/[^0-9]/g, '');

  // If there are no digits after the prefix, return just the prefix without a dash
  // This allows the user to fully clear the field by backspacing
  if (rest.length === 0) {
    return prefix;
  }

  // Step 3: Determine if prefix should have dash
  const otherPossibilities = validDistrictCodes.some(
    code => code !== prefix && code.startsWith(prefix)
  );

  let formatted = prefix;

  // Add dash if prefix is complete OR next char typed is numeric
  if (!otherPossibilities || (rest.length > 0 && /^[0-9]/.test(value[prefix.length]))) {
    formatted += '-';
  }

  // Step 4: Add rest of numbers with proper dashes
  if (rest.length > 0) {
    formatted += rest.slice(0, 3);
    if (rest.length > 3) formatted += '-' + rest.slice(3, 7);
  }

  return formatted;
};

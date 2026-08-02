export function formatPhoneKZ(input: string): string {
  let digits = input.replace(/\D/g, "");
  
  if (!digits) return "";

  // If user starts typing with 8 or 7, cut the first digit to format with +7
  if (digits.startsWith("7") || digits.startsWith("8")) {
    digits = digits.substring(1);
  }

  // Cap at 10 digits after +7
  digits = digits.substring(0, 10);

  let formatted = "+7";
  if (digits.length > 0) {
    formatted += ` (${digits.substring(0, 3)}`;
  }
  if (digits.length >= 3) {
    formatted += `) ${digits.substring(3, 6)}`;
  }
  if (digits.length >= 6) {
    formatted += `-${digits.substring(6, 8)}`;
  }
  if (digits.length >= 8) {
    formatted += `-${digits.substring(8, 10)}`;
  }

  return formatted;
}

function generateLicenseKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
      ""
    );
  return `IBM-${part()}-${part()}-${part()}-${part()}`;
}

export { generateLicenseKey };

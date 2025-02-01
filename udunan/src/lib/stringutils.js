export const createSlug = (text) => {
  // If text is null or undefined, return empty string
  if (text == null) return '';

  // Convert to string and lowercase
  const stringText = String(text).toLowerCase();
  
  return stringText
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading and trailing hyphens
    .trim();                      // Remove any extra whitespace
};
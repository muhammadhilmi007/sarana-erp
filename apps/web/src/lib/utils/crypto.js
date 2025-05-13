/**
 * Simple encryption/decryption utility for client-side storage
 * Note: This is not meant for high-security encryption, but rather to add
 * a basic layer of protection for stored data in the browser.
 */

// A simple encryption key - in a real app, this would be more secure
const ENCRYPTION_KEY = 'samudraPaketErp2025';

/**
 * Encrypt a string using a simple XOR cipher
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in base64
 */
export const encrypt = (text) => {
  if (!text) return '';
  
  // Convert text to a format that can be encrypted
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  
  // XOR each byte with the corresponding byte from the key
  const encryptedBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    encryptedBytes[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode.apply(null, encryptedBytes));
};

/**
 * Decrypt a string that was encrypted with the encrypt function
 * @param {string} encryptedText - Encrypted text in base64
 * @returns {string} Decrypted text
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return '';
  
  try {
    // Convert from base64
    const encryptedBytes = new Uint8Array(
      atob(encryptedText).split('').map(char => char.charCodeAt(0))
    );
    
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    
    // XOR each byte with the corresponding byte from the key
    const decryptedBytes = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    // Convert back to string
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

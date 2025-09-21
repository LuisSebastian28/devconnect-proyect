export const calculateHash = async (
  data: ArrayBuffer,
  algorithm: string = 'SHA-256' // Cambiado a string
): Promise<string> => {
  // Calcula el hash cryptographic del ArrayBuffer
  const hashBuffer = await crypto.subtle.digest(algorithm, data);

  // Convierte el ArrayBuffer del hash a un array de bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // Convierte cada byte a su representación hexadecimal (2 dígitos) y lo une en un string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
};
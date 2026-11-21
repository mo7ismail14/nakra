import { customAlphabet } from 'nanoid';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const id12 = customAlphabet(alphabet, 12);

/** newId('r') -> "r_k3j9x0a1b2c3" */
export const newId = (prefix) => `${prefix}_${id12()}`;
export const shortId = customAlphabet(alphabet, 5);

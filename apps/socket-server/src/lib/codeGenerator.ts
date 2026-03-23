import { customAlphabet } from 'nanoid';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generate = customAlphabet(ALPHABET, 5);

export function generateRoomCode(existingCodes: Set<string>): string {
  let code = generate();
  while (existingCodes.has(code)) {
    code = generate();
  }
  return code;
}

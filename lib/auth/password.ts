import bcrypt from "bcryptjs";

const HASH_ROUNDS = 12;

/** Valid bcrypt hash used only to keep compare timing similar when no user exists. */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("__occdo-dummy-not-a-user__", 4);

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, HASH_ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, passwordHash);
}

export async function verifyPasswordAgainstKnownHash(
  plaintext: string,
  passwordHash: string | null,
): Promise<boolean> {
  const matched = await verifyPassword(plaintext, passwordHash ?? DUMMY_PASSWORD_HASH);
  return Boolean(passwordHash) && matched;
}

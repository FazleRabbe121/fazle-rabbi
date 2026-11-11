/** Recipe-book passcode gate. Only the SHA-256 of "frabbi:<code>" is stored. This is a soft gate; real data protection is login + RLS. */
export const PASSCODE_HASH = "a069dec54ebdf0bf3dd969da19c6e5b6b5aae96d43f3ea4f51eca5edc1c473be";
const KEY = "fr-recipe-book-unlocked";

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function checkPasscode(code: string): Promise<boolean> {
  return /^\d{4}$/.test(code) && (await sha256Hex(`frabbi:${code}`)) === PASSCODE_HASH;
}
export const isUnlocked = () => typeof window !== "undefined" && sessionStorage.getItem(KEY) === PASSCODE_HASH;
export const markUnlocked = () => sessionStorage.setItem(KEY, PASSCODE_HASH);

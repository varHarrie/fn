import {
  create,
  verify,
  getNumericDate,
} from "https://deno.land/x/djwt@v2.4/mod.ts";

function generateKey() {
  return crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-512" }, true, [
    "sign",
    "verify",
  ]);
}

export async function generateJwt(
  payload: Record<string, unknown>,
  jwtExpires: number
) {
  const key = await generateKey();

  if (jwtExpires) {
    payload.exp = getNumericDate(jwtExpires);
  }

  return create({ alg: "HS512", typ: "JWT" }, payload, key);
}

export async function verifyJwt(token: string) {
  const key = await generateKey();
  return verify(token, key);
}

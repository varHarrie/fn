import {
  create,
  verify,
  getNumericDate,
} from "https://deno.land/x/djwt@v2.4/mod.ts";
import config from "../config.ts";
import { isFileExisted, resolvePath } from "./path.ts";
import {
  encode,
  decode,
} from "https://deno.land/std@0.125.0/encoding/base64.ts";

let jwtKey: CryptoKey | undefined;
const algorithm: HmacKeyGenParams = { name: "HMAC", hash: "SHA-512" };
const usages: KeyUsage[] = ["sign", "verify"];

async function generateKey() {
  if (jwtKey) return jwtKey;

  const existed = await isFileExisted(resolvePath(config.jwtKeyFile));
  if (existed) {
    const content = await Deno.readTextFile(config.jwtKeyFile);
    const binary = decode(content).buffer;

    jwtKey = await crypto.subtle.importKey(
      "raw",
      binary,
      algorithm,
      true,
      usages
    );
  } else {
    jwtKey = await crypto.subtle.generateKey(algorithm, true, usages);
    const content = await crypto.subtle.exportKey("raw", jwtKey);
    await Deno.writeTextFile(config.jwtKeyFile, encode(content));
  }

  return jwtKey;
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

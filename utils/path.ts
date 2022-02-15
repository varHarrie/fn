import * as path from "https://deno.land/std@0.125.0/path/mod.ts";

const dirname = path.dirname(path.fromFileUrl(import.meta.url));

export const root = path.join(dirname, "..");

export function resolvePath(...paths: string[]) {
  return paths[0]?.startsWith("/")
    ? path.join(...paths)
    : path.join(root, ...paths);
}

export async function isFileExisted(path: string) {
  try {
    const info = await Deno.stat(path);
    return info.isFile;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw error;
    }
  }
}

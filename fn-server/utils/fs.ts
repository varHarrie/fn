import {
  join,
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.125.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export const root = join(__dirname, "..");

export function resolvePath(...paths: string[]) {
  return paths[0]?.startsWith("/") ? join(...paths) : join(root, ...paths);
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

type FileInfo = {
  path: string;
  size: number;
  createdAt?: number;
  modifiedAt?: number;
};

export async function getFile(filePath: string): Promise<FileInfo | undefined> {
  try {
    const stat = await Deno.stat(filePath);
    if (!stat.isFile) return undefined;

    return {
      path: filePath,
      size: stat.size,
      createdAt: stat.birthtime?.getTime(),
      modifiedAt: stat.mtime?.getTime(),
    };
  } catch {
    return undefined;
  }
}

export async function listFiles(
  dir: string,
  condition?: (p: string) => boolean
) {
  const files: FileInfo[] = [];

  for await (const entry of Deno.readDir(dir)) {
    const entryPath = `${dir}/${entry.name}`;

    if (entry.isFile) {
      if (condition && !condition(entryPath)) continue;

      const file = await getFile(entryPath);
      if (file) files.push(file);
    } else if (entry.isDirectory) {
      files.push(...(await listFiles(entryPath)));
    }
  }

  return files;
}

import config from "./config.ts";
import { User } from "./models/user.ts";
import { resolvePath } from "./utils/path.ts";

let users: User[] = [];

async function load() {
  const json = await Deno.readTextFile(resolvePath(config.usersFile));
  users = JSON.parse(json);
}

async function save() {
  const json = JSON.stringify(users);
  await Deno.writeTextFile(resolvePath(config.usersFile), json);
}

export async function list() {
  if (!users.length) await load();
  return users.map(({ password: _, ...rest }) => rest);
}

export async function get(username: string) {
  if (!users.length) await load();
  return users.find((u) => u.username === username);
}

export async function set(username: string, payload: Partial<User>) {
  const user = await get(username);
  if (!user) throw new Error("User not found");

  payload.username = username;
  Object.assign(user, payload);

  await save();
}

export async function add(payload: User) {
  const user = await get(payload.username);
  if (user) throw new Error("User existed");

  users.push(payload);
  await save();
}

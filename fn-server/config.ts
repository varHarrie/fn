const config = {
  host: Deno.env.get("HOST") ?? "localhost",
  port: Deno.env.get("PORT") ?? "3000",
  passwordSalt: Deno.env.get("PASSWORD_SALT") ?? "",
  jwtExpires: parseInt(Deno.env.get("JWT_EXPIRES") ?? "86400"),
  jwtKeyFile: Deno.env.get("JWT_KEY_FILE") ?? "jwt.key",
  storeFile: Deno.env.get("STORE_FILE") ?? "data/store.json",
  functionDir: Deno.env.get("FUNCTION_DIR") ?? "data/functions",
  functionTimeout: parseInt(Deno.env.get("FUNCTION_TIMEOUT") ?? "1500"),
};

export default config;

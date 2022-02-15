const config = {
  host: Deno.env.get("HOST") ?? "localhost",
  port: Deno.env.get("PORT") ?? "3000",
  passwordSalt: Deno.env.get("PASSWORD_SALT") ?? "",
  jwtExpires: parseInt(Deno.env.get("JWT_EXPIRES") ?? "86400"),
  jwtKeyFile: Deno.env.get("JWT_KEY_FILE") ?? "jwt.key",
  usersFile: Deno.env.get("USERS_FILE") ?? "users.json",
  functionDir: Deno.env.get("FUNCTION_DIR") ?? "functions",
  functionTimeout: parseInt(Deno.env.get("FUNCTION_TIMEOUT") ?? "1500"),
};

export default config;

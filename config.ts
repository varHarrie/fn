const config = {
  host: Deno.env.get("HOST") ?? "localhost",
  port: Deno.env.get("PORT") ?? "3000",
  functionDir: Deno.env.get("FUNCTION_DIR") ?? "./functions",
};

export default config;

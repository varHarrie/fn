const config = {
  host: Deno.env.get("HOST") ?? "localhost",
  port: Deno.env.get("PORT") ?? "3000",
  functionDir: Deno.env.get("FUNCTION_DIR") ?? "./functions",
  functionTimeout: parseInt(Deno.env.get("FUNCTION_TIMEOUT") ?? "1500"),
};

export default config;

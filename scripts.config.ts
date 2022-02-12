import { DenonConfig } from "https://deno.land/x/denon@2.5.0/mod.ts";
import { config as env } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

const config: DenonConfig = {
  allow: ["env", "net", "read", "write"],
  scripts: {
    dev: {
      cmd: "deno run app.ts",
      env: env({ path: ".env.dev" }),
      watch: true,
    },
    compile: {
      cmd: "deno compile --output dist/app app.ts",
      env: env({ path: ".env.prod" }),
    },
  },
};

export default config;

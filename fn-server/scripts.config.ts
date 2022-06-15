import { DenonConfig } from "https://deno.land/x/denon@2.5.0/mod.ts";

const config: DenonConfig = {
  allow: ["env", "net", "read", "write"],
  watcher: {
    skip: [".git/**", "dist/**", "data/**", "jwt.key"],
  },
  scripts: {
    dev: {
      cmd: "deno run app.ts",
      env: {
        ENV: "development",
      },
      watch: true,
    },
    compile: {
      cmd: "deno compile --output dist/app app.ts",
      env: {
        ENV: "production",
      },
      watch: false,
    },
  },
};

export default config;

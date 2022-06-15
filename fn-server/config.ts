import { config as loadConfig } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

const env: string = Deno.env.get("ENV") || "development";
const envConfig = loadConfig({ path: `env/.env.${env}` });

const config = {
  host: envConfig["HOST"],
  port: envConfig["PORT"],
  passwordSalt: envConfig["PASSWORD_SALT"],
  jwtExpires: Number(envConfig["JWT_EXPIRES"]),
  jwtKeyFile: envConfig["JWT_KEY_FILE"],
  logFileName: envConfig["LOG_FILE_NAME"],
  logMaxBytes: Number(envConfig["LOG_MAX_BYTES"]),
  logMaxBackupCount: Number(envConfig["LOG_MAX_BACKUP_COUNT"]),
  storeFile: envConfig["STORE_FILE"],
  functionDir: envConfig["FUNCTION_DIR"],
  functionTimeout: Number(envConfig["FUNCTION_TIMEOUT"]),
};

export default config;

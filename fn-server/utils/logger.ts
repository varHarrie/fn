import { format } from "https://deno.land/std@0.125.0/datetime/mod.ts";
import {
  setup,
  handlers,
  getLogger,
} from "https://deno.land/std@0.125.0/log/mod.ts";
import config from "../config.ts";
import { stripColor } from "https://deno.land/std@0.125.0/fmt/colors.ts";

await setup({
  handlers: {
    console: new handlers.ConsoleHandler("DEBUG", {
      formatter: ({ datetime, levelName, msg, args }) => {
        const date = format(datetime, "[yyyy-MM-dd HH:mm:ss]");
        msg = `${date} [${levelName}] ${msg}`;

        args.forEach((arg, index) => {
          msg += `, arg${index}: ${arg}`;
        });

        return msg;
      },
    }),
    file: new handlers.RotatingFileHandler("INFO", {
      filename: config.logFileName,
      maxBytes: config.logMaxBytes,
      maxBackupCount: config.logMaxBackupCount,
      formatter: (record) =>
        JSON.stringify({ ...record, msg: stripColor(record.msg) }),
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

const logger = getLogger();

export default logger;

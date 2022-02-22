import { Application } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import requestLogger from "./middlewares/request-logger.ts";
import errorHandler from "./middlewares/error-handler.ts";
import authRouter from "./routers/auth-router.ts";
import privateRouter from "./routers/private-router.ts";
import publicRouter from "./routers/public-router.ts";
import config from "./config.ts";
import store from "./store.ts";

const app = new Application();

app.use(oakCors());
app.use(requestLogger());
app.use(errorHandler());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(privateRouter.routes());
app.use(privateRouter.allowedMethods());

app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

app.addEventListener("listen", ({ hostname, port, secure }) => {
  console.log(
    `⚡Running at ${secure ? "https" : "http"}://${hostname}:${port}`
  );
});

await store.load();
await app.listen(`${config.host}:${config.port}`);

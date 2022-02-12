import { Context, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import {
  validate,
  ValidationRules,
  firstMessages,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";

export async function validateBody(ctx: Context, schema: ValidationRules) {
  const body = await ctx.request.body().value;
  const [valid, errors] = await validate(body, schema);

  if (!valid) {
    ctx.throw(Status.BadRequest, JSON.stringify(firstMessages(errors)));
  }

  return body;
}

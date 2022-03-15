import { getQuery } from "https://deno.land/x/oak@v10.2.0/helpers.ts";
import { Context, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import {
  validate,
  ValidationRules,
  firstMessages,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";

export async function validateQuery(ctx: Context, schema: ValidationRules) {
  const query = getQuery(ctx);
  const [valid, errors] = await validate(query, schema);

  if (!valid) {
    return ctx.throw(Status.BadRequest, JSON.stringify(firstMessages(errors)));
  }

  return query;
}

export async function validateBody(ctx: Context, schema: ValidationRules) {
  const body = await ctx.request.body().value;
  const [valid, errors] = await validate(body, schema);

  if (!valid) {
    return ctx.throw(Status.BadRequest, JSON.stringify(firstMessages(errors)));
  }

  return body;
}

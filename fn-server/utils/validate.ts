import { getQuery } from "https://deno.land/x/oak@v10.2.0/helpers.ts";
import { Context, Status } from "https://deno.land/x/oak@v10.2.0/mod.ts";
import {
  validate,
  ValidationRules,
  firstMessages,
  ValidationErrors,
  FirstMessages,
} from "https://deno.land/x/validasaur@v0.15.0/mod.ts";

function firstMessage(errors: ValidationErrors): string {
  let message: FirstMessages | string = firstMessages(errors);

  while (typeof message !== "string") {
    if (!message) return "";
    message = Object.values(message)[0];
  }

  return message;
}

export async function validateQuery(ctx: Context, schema: ValidationRules) {
  const query = getQuery(ctx);
  const [valid, errors] = await validate(query, schema);

  if (!valid) {
    return ctx.throw(Status.BadRequest, firstMessage(errors));
  }

  return query;
}

export async function validateBody(ctx: Context, schema: ValidationRules) {
  const body = await ctx.request.body().value;
  const [valid, errors] = await validate(body, schema);

  if (!valid) {
    return ctx.throw(Status.BadRequest, firstMessage(errors));
  }

  return body;
}

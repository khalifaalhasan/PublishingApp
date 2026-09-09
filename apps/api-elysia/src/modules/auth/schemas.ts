import type { OpenAPIV3 } from "openapi-types";

function createJsonRequestBody(
  properties: Record<string, OpenAPIV3.SchemaObject>,
  required: string[],
): OpenAPIV3.RequestBodyObject {
  return {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties,
          required,
        },
      },
    },
  };
}

export const signUpEmailRequestBody = createJsonRequestBody(
  {
    email: { type: "string" },
    password: { type: "string" },
    name: { type: "string" },
    image: { type: "string" },
    callbackURL: { type: "string" },
  },
  ["email", "password", "name"],
);

export const signInEmailRequestBody = createJsonRequestBody(
  {
    email: { type: "string" },
    password: { type: "string" },
    callbackURL: { type: "string" },
  },
  ["email", "password"],
);

export const requestPasswordResetRequestBody = createJsonRequestBody(
  {
    email: { type: "string" },
    redirectTo: { type: "string" },
  },
  ["email"],
);

export const resetPasswordRequestBody = createJsonRequestBody(
  {
    token: { type: "string" },
    newPassword: { type: "string" },
  },
  ["token", "newPassword"],
);

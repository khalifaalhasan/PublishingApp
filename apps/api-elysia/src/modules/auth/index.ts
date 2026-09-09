import { auth } from "@common/config/auth";
import { Elysia } from "elysia";
import * as schemas from "./schemas";

async function handleAuthRequest(request: Request) {
  try {
    return await auth.handler(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      typeof error === "object" && error !== null
        ? (error as { code?: string }).code
        : undefined;

    if (
      code === "ERR_BODY_ALREADY_USED" ||
      /Body is disturbed or locked/i.test(message)
    ) {
      return new Response(
        JSON.stringify({
          error: "Invalid Request Body",
          message:
            "Body request sudah dipakai oleh validator Elysia. Hapus schema body di route auth kalau mau Better Auth membaca raw request, atau kirim request tanpa body validation di route ini.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    throw error;
  }
}

/**
 * Authentication routes powered by Better Auth.
 *
 * You typically do not need to modify this file.
 * Customize auth behavior via Better Auth configuration instead.
 *
 * @see https://better-auth.com/docs
 */

export const authModule = new Elysia({ prefix: "/api/auth" })
  // Sign Up with Email
  .post("/sign-up/email", ({ request }) => handleAuthRequest(request), {
    detail: {
      tags: ["Auth"],
      summary: "Register with email",
      requestBody: schemas.signUpEmailRequestBody,
      description:
        "Register a new user. Requires email, password, and name.\n\n" +
        "**Request Body (JSON):**\n" +
        "- `email` (string, required)\n" +
        "- `password` (string, required)\n" +
        "- `name` (string, required)\n" +
        "- `image` (string, optional)\n" +
        "- `callbackURL` (string, optional)",
    },
  })
  // Sign In with Email
  .post("/sign-in/email", ({ request }) => handleAuthRequest(request), {
    detail: {
      tags: ["Auth"],
      summary: "Login with email",
      requestBody: schemas.signInEmailRequestBody,
      description:
        "Authenticate and start a session using email and password.\n\n" +
        "**Request Body (JSON):**\n" +
        "- `email` (string, required)\n" +
        "- `password` (string, required)\n" +
        "- `callbackURL` (string, optional)",
    },
  })
  // Sign Out
  .post("/sign-out", ({ request }) => handleAuthRequest(request), {
    detail: {
      tags: ["Auth"],
      summary: "Logout",
      description:
        "End the current user session. Requires active session cookie.",
    },
  })
  // Get Session
  .get("/get-session", ({ request }) => handleAuthRequest(request), {
    detail: {
      tags: ["Auth"],
      summary: "Get current session",
      description:
        "Retrieve the authenticated user's session information.\n\n" +
        "Returns user data and session details if authenticated, or null if not authenticated.",
    },
  })
  // Request Password Reset
  .post(
    "/request-password-reset",
    ({ request }) => handleAuthRequest(request),
    {
      detail: {
        tags: ["Auth"],
        summary: "Request password reset",
        requestBody: schemas.requestPasswordResetRequestBody,
        description:
          "Send a password reset link to the user’s email.\n\n" +
          "**Request Body (JSON):**\n" +
          "- `email` (string, required)\n" +
          "- `redirectTo` (string, optional)",
      },
    },
  )
  // Reset Password (after clicking link in email)
  .post("/reset-password", ({ request }) => handleAuthRequest(request), {
    detail: {
      tags: ["Auth"],
      summary: "Reset password with token",
      requestBody: schemas.resetPasswordRequestBody,
      description:
        "Reset user password using token from email link.\n\n" +
        "**Request Body (JSON):**\n" +
        "- `token` (string, required)\n" +
        "- `newPassword` (string, required)",
    },
  })
  // Catch-all for other Better Auth routes
  .all("/*", ({ request }) => handleAuthRequest(request));

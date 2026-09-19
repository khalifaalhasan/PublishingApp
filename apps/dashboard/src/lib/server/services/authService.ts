import { apiClient } from "./apiClient";

export const authService = {
  signInEmail: async (
    email: string,
    password: string,
    fetch?: typeof globalThis.fetch,
  ) => {
    return apiClient("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      fetch,
    });
  },

  signUpEmail: async (
    name: string,
    email: string,
    password: string,
    fetch?: typeof globalThis.fetch,
  ) => {
    return apiClient("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      fetch,
    });
  },

  signOut: async (fetch?: typeof globalThis.fetch) => {
    return apiClient("/api/auth/sign-out", {
      method: "POST",
      fetch,
    });
  },

  getSession: async (fetch?: typeof globalThis.fetch) => {
    return apiClient("/api/auth/get-session", {
      method: "GET",
      fetch,
    });
  },
};

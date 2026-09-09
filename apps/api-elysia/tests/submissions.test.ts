import { describe, expect, it } from "bun:test";
import { createApp } from "../src/app";

describe("Submissions Module", () => {
  const app = createApp();
  const testEmail = `submissions-test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";
  const testName = "Submissions Test User";

  async function getAuthCookie(): Promise<string> {
    await app.handle(
      new Request("http://localhost/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName,
        }),
      }),
    );

    const signInResponse = await app.handle(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      }),
    );

    return signInResponse.headers.get("set-cookie") || "";
  }

  it("POST /api/submissions accepts BOOK payload with authorBio and bookDetail", async () => {
    const authCookie = await getAuthCookie();

    const response = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          title: "Judul Buku",
          description: "Sinopsis buku",
          type: "BOOK",
          isDraft: false,
          fileUrl: "https://storage.example.com/book.pdf",
          fileName: "book.pdf",
          sellingPoint: "Punya sudut pandang baru",
          coverLetter: "Untuk editor",
          authorBio: {
            bio: "Penulis fiksi dan nonfiksi",
            phone: "08123456789",
          },
          bookDetail: {
            genre: "Sastra",
            pageCount: 120,
            language: "ID",
          },
        }),
      }),
    );

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.message).toBe("Submission created successfully");
    expect(body.data.type).toBe("BOOK");
    expect(body.data.title).toBe("Judul Buku");
    expect(body.data.sellingPoint).toBe("Punya sudut pandang baru");
    expect(body.data.authorBio).toEqual({
      bio: "Penulis fiksi dan nonfiksi",
      phone: "08123456789",
    });
  });

  it("POST /api/submissions rejects BOOK payload without bookDetail", async () => {
    const authCookie = await getAuthCookie();

    const response = await app.handle(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authCookie,
        },
        body: JSON.stringify({
          title: "Judul Buku",
          description: "Sinopsis buku",
          type: "BOOK",
          isDraft: true,
          fileUrl: "https://storage.example.com/book.pdf",
          fileName: "book.pdf",
          authorBio: {
            bio: "Penulis fiksi dan nonfiksi",
            phone: "08123456789",
          },
        }),
      }),
    );

    expect(response.status).toBe(400);
  });
});

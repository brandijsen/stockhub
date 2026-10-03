import { hash } from "bcryptjs";
import type { Request, Response } from "express";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock } from "./prisma-mock";
import { mockResponse } from "./mock-response";

vi.mock("../src/lib/prisma", () => ({
  prisma: prismaMock,
}));

const { loginPost } = await import("../src/routes/auth/handlers/login");
const { logoutPost } = await import("../src/routes/auth/handlers/logout");
const { verifyEmailGet } = await import(
  "../src/routes/auth/handlers/verify-email"
);

const password = "correct-password";
let passwordHash = "";

beforeAll(async () => {
  process.env.AUTH_SECRET = "test-auth-secret";
  process.env.FRONTEND_URL = "http://localhost:3000";
  passwordHash = await hash(password, 4);
});

beforeEach(() => {
  vi.clearAllMocks();
});

function loginRequest(body: unknown): Request {
  return { body } as Request;
}

describe("login", () => {
  it("rejects an unknown email without setting a session cookie", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.pendingRegistration.findUnique.mockResolvedValue(null);
    const res = mockResponse();

    await loginPost(
      loginRequest({ email: "missing@example.com", password }),
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
    expect(res.cookies).toEqual([]);
  });

  it("rejects a wrong password without setting a session cookie", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "ada@example.com",
      password: passwordHash,
      firstName: "Ada",
      lastName: "Lovelace",
      role: "USER",
    });
    const res = mockResponse();

    await loginPost(
      loginRequest({ email: "ada@example.com", password: "wrong-password" }),
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
    expect(res.cookies).toEqual([]);
  });

  it("sets the session cookie when the password matches", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user1",
      email: "ada@example.com",
      password: passwordHash,
      firstName: "Ada",
      lastName: "Lovelace",
      role: "USER",
    });
    prismaMock.user.update.mockResolvedValue({});
    const res = mockResponse();

    await loginPost(
      loginRequest({ email: "Ada@Example.com", password }),
      res as unknown as Response,
    );

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(res.cookies).toEqual([
      expect.objectContaining({ name: "stockhub_session" }),
    ]);
    expect(res.cookies[0]?.value.length).toBeGreaterThan(0);
  });
});

describe("logout", () => {
  it("clears the session cookie", () => {
    const res = mockResponse();

    logoutPost({} as Request, res as unknown as Response);

    expect(res.body).toEqual({ ok: true });
    expect(res.cleared).toEqual(["stockhub_session"]);
  });
});

describe("verify email", () => {
  it("redirects when the token is missing or unknown", async () => {
    prismaMock.pendingRegistration.findUnique.mockResolvedValue(null);
    const missing = mockResponse();
    await verifyEmailGet(
      { query: {} } as Request,
      missing as unknown as Response,
    );
    expect(missing.redirectUrl).toBe(
      "http://localhost:3000/register/link-expired?invalid=1",
    );

    const unknown = mockResponse();
    await verifyEmailGet(
      { query: { token: "missing-token" } } as unknown as Request,
      unknown as unknown as Response,
    );
    expect(unknown.redirectUrl).toBe(
      "http://localhost:3000/register/link-expired?invalid=1",
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("does not create a user when the link has expired", async () => {
    prismaMock.pendingRegistration.findUnique.mockResolvedValue({
      token: "expired-token",
      email: "ada@example.com",
      passwordHash,
      firstName: "Ada",
      lastName: "Lovelace",
      expires: new Date(Date.now() - 60_000),
    });
    const res = mockResponse();

    await verifyEmailGet(
      { query: { token: "expired-token" } } as unknown as Request,
      res as unknown as Response,
    );

    expect(res.redirectUrl).toBe(
      "http://localhost:3000/register/link-expired?token=expired-token",
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates the user from a valid link", async () => {
    prismaMock.pendingRegistration.findUnique.mockResolvedValue({
      token: "valid-token",
      email: "ada@example.com",
      passwordHash,
      firstName: "Ada",
      lastName: "Lovelace",
      expires: new Date(Date.now() + 60_000),
    });
    prismaMock.user.create.mockResolvedValue({
      id: "user1",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      role: "USER",
    });
    prismaMock.pendingRegistration.delete.mockResolvedValue({});
    const res = mockResponse();

    await verifyEmailGet(
      { query: { token: "valid-token" } } as unknown as Request,
      res as unknown as Response,
    );

    expect(prismaMock.user.create).toHaveBeenCalledOnce();
    expect(prismaMock.pendingRegistration.delete).toHaveBeenCalledWith({
      where: { token: "valid-token" },
    });
    expect(res.redirectUrl).toBe("http://localhost:3000/dashboard");
    expect(res.cookies[0]?.name).toBe("stockhub_session");
  });
});

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/session";

function apiBaseUrl(): string {
  return (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
}

async function sessionCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return undefined;
  }
  return `${SESSION_COOKIE}=${token}`;
}

async function proxyProfileImageRequest(
  method: "GET" | "POST" | "DELETE",
  body?: BodyInit,
): Promise<Response> {
  const cookie = await sessionCookieHeader();
  const headers = new Headers();
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const response = await fetch(`${apiBaseUrl()}/api/profile/image`, {
    method,
    headers,
    body,
    cache: "no-store",
  });

  if (method === "GET" && response.ok) {
    const outHeaders = new Headers();
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      outHeaders.set("Content-Type", contentType);
    }
    outHeaders.set("Cache-Control", "private, no-cache");
    return new NextResponse(response.body, {
      status: response.status,
      headers: outHeaders,
    });
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function GET(): Promise<Response> {
  return proxyProfileImageRequest("GET");
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  return proxyProfileImageRequest("POST", formData);
}

export async function DELETE(): Promise<Response> {
  return proxyProfileImageRequest("DELETE");
}

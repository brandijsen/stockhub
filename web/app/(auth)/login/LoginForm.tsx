"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Spinner } from "@/components/Spinner";
import {
  AuthPageContainer,
  pageTitleClassName,
  primaryButtonClassName,
} from "@/components/PageContainer";
import {
  REGISTER_DEV_VERIFY_URL_KEY,
  REGISTER_PENDING_EMAIL_KEY,
  REGISTER_VERIFY_RESEND_TOKEN_KEY,
} from "@/lib/register-flow-storage";
import { rateLimitErrorMessage } from "@/lib/rate-limit-message";

type LoginErrorBody = {
  code?: string;
  resendToken?: string;
  error?: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const verified = searchParams.get("verified") === "1";
  const verifyMsg = searchParams.get("verifyMsg")?.trim() || null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true },
      );
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
      );
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 429) {
          setError(rateLimitErrorMessage(err.response?.data));
          return;
        }
        const data = err.response?.data as LoginErrorBody | undefined;
        if (status === 403 && data?.code === "PENDING_VERIFICATION") {
          const norm = email.trim().toLowerCase();
          sessionStorage.setItem(REGISTER_PENDING_EMAIL_KEY, norm);
          if (typeof data.resendToken === "string" && data.resendToken) {
            sessionStorage.setItem(
              REGISTER_VERIFY_RESEND_TOKEN_KEY,
              data.resendToken,
            );
          }
          sessionStorage.removeItem(REGISTER_DEV_VERIFY_URL_KEY);
          router.push("/register/check-email?from=login");
          return;
        }
        setError(
          data?.error ??
            "Sign-in failed. Check your email and password.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthPageContainer>
      <h1 className={pageTitleClassName}>Log in</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Sign in to your StockHub account.
      </p>
      {verified ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Email verified. You can sign in now.
        </p>
      ) : null}
      {verifyMsg ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {verifyMsg}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8">
        <form
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className={`mt-2 gap-2 ${primaryButtonClassName}`}
          >
            {pending ? <Spinner className="h-4 w-4 text-white" /> : null}
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Register
        </Link>
      </p>
    </AuthPageContainer>
  );
}

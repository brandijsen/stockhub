"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Spinner } from "@/components/Spinner";
import {
  REGISTER_DEV_VERIFY_URL_KEY,
  REGISTER_PENDING_EMAIL_KEY,
  REGISTER_VERIFY_RESEND_TOKEN_KEY,
} from "@/lib/register-flow-storage";
import { rateLimitErrorMessage } from "@/lib/rate-limit-message";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const firstName = (
      form.elements.namedItem("firstName") as HTMLInputElement
    ).value.trim();
    const lastName = (
      form.elements.namedItem("lastName") as HTMLInputElement
    ).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const { data } = await axios.post<{
        ok?: boolean;
        message?: string;
        verifyUrl?: string;
        _devOnly?: boolean;
      }>(
        "/api/auth/register",
        {
          firstName,
          lastName,
          email,
          password,
        },
        { withCredentials: true },
      );
      if (email.trim()) {
        sessionStorage.setItem(
          REGISTER_PENDING_EMAIL_KEY,
          email.trim().toLowerCase(),
        );
      }
      sessionStorage.removeItem(REGISTER_VERIFY_RESEND_TOKEN_KEY);
      if (data.verifyUrl && data._devOnly) {
        sessionStorage.setItem(REGISTER_DEV_VERIFY_URL_KEY, data.verifyUrl);
      } else {
        sessionStorage.removeItem(REGISTER_DEV_VERIFY_URL_KEY);
      }
      form.reset();
      router.push("/register/check-email");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError(rateLimitErrorMessage(err.response?.data));
        } else {
          const msg = (err.response?.data as { error?: string })?.error;
          setError(msg ?? "Registration failed.");
        }
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Register</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Enter your details, then confirm your email via the link we send you.
        Your account is created only after you open that link.
      </p>
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="relative mt-8">
        {pending ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]"
            aria-hidden
          >
            <Spinner className="h-9 w-9 text-zinc-700" />
          </div>
        ) : null}
        <form
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-firstName"
              className="text-sm font-medium text-zinc-800"
            >
              First name
            </label>
            <input
              id="register-firstName"
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              maxLength={80}
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="register-lastName"
              className="text-sm font-medium text-zinc-800"
            >
              Last name
            </label>
            <input
              id="register-lastName"
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              maxLength={80}
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-email" className="text-sm font-medium text-zinc-800">
              Email
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {pending ? <Spinner className="h-4 w-4 text-white" /> : null}
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

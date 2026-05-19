"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

import { Spinner } from "@/components/Spinner";
import {
  REGISTER_DEV_VERIFY_URL_KEY,
  REGISTER_PENDING_EMAIL_KEY,
  REGISTER_VERIFY_RESEND_TOKEN_KEY,
} from "@/lib/register-flow-storage";
import { rateLimitErrorMessage } from "@/lib/rate-limit-message";

function LinkExpiredInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invalid = searchParams.get("invalid") === "1";
  const token = searchParams.get("token")?.trim() ?? "";

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

  const goToCheckEmail = useCallback(() => {
    router.push("/register/check-email?resent=1");
  }, [router]);

  async function handleResend() {
    if (!token) return;
    setError(null);
    setMessage(null);
    setDevVerifyUrl(null);
    setPending(true);
    try {
      const { data } = await axios.post<{
        ok?: boolean;
        alreadyVerified?: boolean;
        email?: string;
        message?: string;
        verifyUrl?: string;
        _devOnly?: boolean;
        resendToken?: string;
      }>("/api/auth/resend-verification", { token }, { withCredentials: true });
      if (data.alreadyVerified) {
        setMessage(data.message ?? "You can sign in with this email.");
        return;
      }
      if (data.message) {
        setMessage(data.message);
      }
      if (data.email?.trim()) {
        sessionStorage.setItem(REGISTER_PENDING_EMAIL_KEY, data.email.trim());
      }
      if (typeof data.resendToken === "string" && data.resendToken) {
        sessionStorage.setItem(REGISTER_VERIFY_RESEND_TOKEN_KEY, data.resendToken);
      }
      if (data.verifyUrl && data._devOnly) {
        sessionStorage.setItem(REGISTER_DEV_VERIFY_URL_KEY, data.verifyUrl);
        setDevVerifyUrl(data.verifyUrl);
      } else {
        sessionStorage.removeItem(REGISTER_DEV_VERIFY_URL_KEY);
      }
      goToCheckEmail();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError(rateLimitErrorMessage(err.response?.data));
        } else {
          const msg = (err.response?.data as { error?: string })?.error;
          setError(msg ?? "Could not send a new link.");
        }
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setPending(false);
    }
  }

  if (invalid || !token) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Invalid verification link
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          This link is not valid or is incomplete. Register again with your
          email to get a new link, or open the latest message we sent you.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Register
        </Link>
        <p className="mt-6 text-center text-sm text-zinc-600">
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Link expired</h1>
      <p className="mt-3 text-sm text-zinc-600">
        This verification link has expired. Click the button below to send a new verification link. 
      </p>
      {message ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {devVerifyUrl ? (
        <p className="mt-3 break-all rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <span className="font-medium">Development only:</span> open{" "}
          <a href={devVerifyUrl} className="underline">
            new verification link
          </a>
        </p>
      ) : null}
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
        <button
          type="button"
          disabled={pending}
          onClick={handleResend}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send new verification link"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-600">
       
        <Link href="/login" className="font-medium text-zinc-900 underline-offset-2 hover:underline">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}

export default function LinkExpiredPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center px-4 py-12">
          <Spinner className="h-9 w-9 text-zinc-700" />
        </div>
      }
    >
      <LinkExpiredInner />
    </Suspense>
  );
}

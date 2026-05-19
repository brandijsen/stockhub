"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState, startTransition } from "react";

import { Spinner } from "@/components/Spinner";
import {
  REGISTER_DEV_VERIFY_URL_KEY,
  REGISTER_PENDING_EMAIL_KEY,
  REGISTER_VERIFY_RESEND_TOKEN_KEY,
} from "@/lib/register-flow-storage";
import { rateLimitErrorMessage } from "@/lib/rate-limit-message";

function CheckEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLogin = searchParams.get("from") === "login";
  const justResent = searchParams.get("resent") === "1";

  const [email, setEmail] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [resendToken, setResendToken] = useState<string | null>(null);
  const [resendPending, setResendPending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const afterManualResend = useCallback(
    (nextVerifyUrl?: string | null) => {
      if (nextVerifyUrl) {
        sessionStorage.setItem(REGISTER_DEV_VERIFY_URL_KEY, nextVerifyUrl);
        startTransition(() => setDevUrl(nextVerifyUrl));
      } else {
        sessionStorage.removeItem(REGISTER_DEV_VERIFY_URL_KEY);
        startTransition(() => setDevUrl(null));
      }
      const q = new URLSearchParams();
      if (fromLogin) {
        q.set("from", "login");
      }
      q.set("resent", "1");
      router.push(`/register/check-email?${q.toString()}`);
    },
    [fromLogin, router],
  );

  const handleResend = useCallback(async () => {
    if (!resendToken?.trim()) return;
    setResendError(null);
    setResendMessage(null);
    setResendPending(true);
    try {
      const { data } = await axios.post<{
        ok?: boolean;
        alreadyVerified?: boolean;
        email?: string;
        message?: string;
        verifyUrl?: string;
        _devOnly?: boolean;
        resendToken?: string;
      }>(
        "/api/auth/resend-verification",
        { token: resendToken.trim() },
        { withCredentials: true },
      );
      if (data.alreadyVerified) {
        setResendMessage(
          data.message ?? "This email already has a verified account. You can sign in.",
        );
        return;
      }
      if (data.email?.trim()) {
        sessionStorage.setItem(REGISTER_PENDING_EMAIL_KEY, data.email.trim());
      }
      if (typeof data.resendToken === "string" && data.resendToken) {
        sessionStorage.setItem(REGISTER_VERIFY_RESEND_TOKEN_KEY, data.resendToken);
        startTransition(() => setResendToken(data.resendToken!));
      }
      afterManualResend(
        data.verifyUrl && data._devOnly ? data.verifyUrl : null,
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setResendError(rateLimitErrorMessage(err.response?.data));
        } else {
          const msg = (err.response?.data as { error?: string })?.error;
          setResendError(msg ?? "Could not send a new link.");
        }
      } else {
        setResendError("Something went wrong.");
      }
    } finally {
      setResendPending(false);
    }
  }, [afterManualResend, resendToken]);

  useEffect(() => {
    const stored = sessionStorage.getItem(REGISTER_PENDING_EMAIL_KEY);
    if (!stored?.trim()) {
      router.replace("/register");
      return;
    }
    startTransition(() => {
      setEmail(stored.trim());
      setDevUrl(sessionStorage.getItem(REGISTER_DEV_VERIFY_URL_KEY));
      const tok = sessionStorage.getItem(REGISTER_VERIFY_RESEND_TOKEN_KEY);
      setResendToken(tok?.trim() ? tok.trim() : null);
    });
  }, [router]);

  if (!email) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col justify-center px-4 py-12">
        <Spinner className="mx-auto h-9 w-9 text-zinc-700" />
      </div>
    );
  }

  const showResend = Boolean(resendToken);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900">Check your email</h1>

      {justResent ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          We&apos;ve sent a fresh verification link to{" "}
          <span className="font-medium text-emerald-950">{email}</span>. Check your
          inbox and spam folder, open it to finish creating your account — until
          then you cannot sign in.
        </p>
      ) : null}

      {!justResent && fromLogin ? (
        <>
          <p className="mt-3 text-sm text-zinc-700">
            You haven&apos;t finished signing up yet: your email must be verified
            before you can sign in. We sent a link to{" "}
            <span className="font-medium text-zinc-900">{email}</span>. Open it to
            complete registration.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Check your spam folder too{showResend ? ", or request a new link below." : "."}
          </p>
        </>
      ) : null}

      {!justResent && !fromLogin ? (
        <p className="mt-3 text-sm text-zinc-600">
          We sent a verification link to{" "}
          <span className="font-medium text-zinc-800">{email}</span>. Open it to
          finish creating your account. Until then you cannot sign in.
        </p>
      ) : null}

      {justResent && fromLogin ? (
        <p className="mt-3 text-sm text-zinc-600">
          Still stuck? Check spam{showResend ? ", or use the button below for another link." : "."}
        </p>
      ) : null}

      {fromLogin && !showResend ? (
        <p className="mt-3 text-sm text-zinc-500">
          Need a new link? Sign in again with your password — we&apos;ll refresh what we can from here.
        </p>
      ) : null}

      {resendMessage ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {resendMessage}
        </p>
      ) : null}
      {resendError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {resendError}
        </p>
      ) : null}

      {showResend ? (
        <div className="relative mt-6">
          {resendPending ? (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]"
              aria-hidden
            >
              <Spinner className="h-9 w-9 text-zinc-700" />
            </div>
          ) : null}
          <button
            type="button"
            disabled={resendPending}
            onClick={handleResend}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {resendPending ? "Sending…" : "Resend verification link"}
          </button>
        </div>
      ) : null}

      {devUrl ? (
        <p className="mt-4 break-all rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <span className="font-medium">Development only:</span> open{" "}
          <a href={devUrl} className="underline">
            verification link
          </a>
        </p>
      ) : null}

      <p className="mt-6 text-sm text-zinc-600">
        Wrong address?{" "}
        <Link
          href="/register"
          className="font-medium text-zinc-900 underline-offset-2 hover:underline"
          onClick={() => {
            sessionStorage.removeItem(REGISTER_PENDING_EMAIL_KEY);
            sessionStorage.removeItem(REGISTER_DEV_VERIFY_URL_KEY);
            sessionStorage.removeItem(REGISTER_VERIFY_RESEND_TOKEN_KEY);
          }}
        >
          Go back and register again
        </Link>
      </p>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col justify-center px-4 py-12">
          <Spinner className="mx-auto h-9 w-9 text-zinc-700" />
        </div>
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}

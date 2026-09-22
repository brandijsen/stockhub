import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthFormSkeleton } from "@/components/PageSkeleton";
import { getSession } from "@/lib/session";

import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

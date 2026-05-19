import { Suspense } from "react";

import { AuthFormSkeleton } from "@/components/PageSkeleton";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

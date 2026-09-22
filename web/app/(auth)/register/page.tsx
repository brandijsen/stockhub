import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  if (await getSession()) {
    redirect("/dashboard");
  }

  return <RegisterForm />;
}

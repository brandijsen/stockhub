import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/LogoutButton";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-3 text-zinc-600">
        Welcome back
        {user.name ? `, ${user.name}` : ""}. You are signed in as{" "}
        <span className="font-medium text-zinc-900">{user.email}</span>
        {user.role ? (
          <>
            {" "}
            <span className="text-zinc-500">({user.role})</span>
          </>
        ) : null}
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <LogoutButton />
        <Link
          href="/articles"
          className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
        >
          Articles
        </Link>
      </div>
    </div>
  );
}

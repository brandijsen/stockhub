"use client";

import { DashboardAttention } from "@/components/dashboard/DashboardAttention";

type DashboardViewProps = {
  userName: string | null | undefined;
  userEmail: string;
  userRole: string | undefined | null;
};

export function DashboardView({
  userName,
  userEmail,
  userRole,
}: DashboardViewProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <p className="mt-3 text-zinc-600">
        Welcome back
        {userName ? `, ${userName}` : ""}. You are signed in as{" "}
        <span className="font-medium text-zinc-900">{userEmail}</span>
        {userRole ? (
          <>
            {" "}
            <span className="text-zinc-500">({userRole})</span>
          </>
        ) : null}
        .
      </p>

      <DashboardAttention role={userRole} />
    </div>
  );
}

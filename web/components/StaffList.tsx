"use client";

import { useCallback, useState } from "react";

import { Spinner } from "@/components/Spinner";
import type { StaffUser } from "@/lib/staff";

import { StaffListTable } from "./staff-list/StaffListTable";
import { useStaffList } from "./staff-list/useStaffList";

type StaffListProps = {
  currentUserId: string;
  canManageRoles: boolean;
};

export function StaffList({ currentUserId, canManageRoles }: StaffListProps) {
  const { users, loading, refreshing, error, refresh, replaceUser } =
    useStaffList();
  const [roleError, setRoleError] = useState<string | null>(null);

  const handleUserUpdated = useCallback(
    (user: StaffUser) => {
      replaceUser(user);
      setRoleError(null);
    },
    [replaceUser],
  );

  const displayError = roleError ?? error;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Staff</h1>
          <p className="mt-1 text-zinc-600">
            Team members with access to StockHub. Online if active in the last 5
            minutes.
            {canManageRoles
              ? " As super admin, you can change roles for other users."
              : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading || refreshing}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {displayError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {displayError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-zinc-600">
          <Spinner label="Loading staff" />
          <span>Loading staff…</span>
        </div>
      ) : users.length === 0 ? (
        <p className="mt-8 text-zinc-600">No staff members yet.</p>
      ) : (
        <StaffListTable
          users={users}
          currentUserId={currentUserId}
          canManageRoles={canManageRoles}
          onUserUpdated={handleUserUpdated}
          onRoleError={setRoleError}
        />
      )}
    </div>
  );
}

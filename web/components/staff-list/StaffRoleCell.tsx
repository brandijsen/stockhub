"use client";

import { useEffect, useState } from "react";

import {
  type StaffAssignableRole,
  type StaffUser,
  staffRoleLabel,
  updateStaffRole,
} from "@/lib/staff";
import { apiErrorMessage } from "@/lib/api-client";

function roleBadgeClass(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "bg-violet-100 text-violet-900";
    case "ADMIN":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

type StaffRoleCellProps = {
  user: StaffUser;
  currentUserId: string;
  canManageRoles: boolean;
  onUpdated: (user: StaffUser) => void;
  onError: (message: string) => void;
};

export function StaffRoleCell({
  user,
  currentUserId,
  canManageRoles,
  onUpdated,
  onError,
}: StaffRoleCellProps) {
  const editable =
    canManageRoles &&
    user.role !== "SUPERADMIN" &&
    user.id !== currentUserId;

  const [draftRole, setDraftRole] = useState<StaffAssignableRole>(
    user.role === "ADMIN" ? "ADMIN" : "USER",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftRole(user.role === "ADMIN" ? "ADMIN" : "USER");
  }, [user.role]);

  if (!editable) {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}
      >
        {staffRoleLabel(user.role)}
      </span>
    );
  }

  const hasChanges =
    draftRole !== (user.role === "ADMIN" ? "ADMIN" : "USER");

  async function handleSave() {
    if (!hasChanges || saving) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.name}'s role to ${staffRoleLabel(draftRole)}?`,
    );
    if (!confirmed) {
      return;
    }

    setSaving(true);
    try {
      const updated = await updateStaffRole(user.id, draftRole);
      onUpdated(updated);
    } catch (e) {
      onError(apiErrorMessage(e, "Failed to update role"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={draftRole}
        disabled={saving}
        onChange={(event) =>
          setDraftRole(event.target.value as StaffAssignableRole)
        }
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="button"
        disabled={!hasChanges || saving}
        onClick={() => void handleSave()}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

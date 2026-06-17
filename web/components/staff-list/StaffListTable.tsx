"use client";

import Link from "next/link";

import type { StaffUser } from "@/lib/staff";
import { staffStatusLabel } from "@/lib/staff";

import { StaffRoleCell } from "./StaffRoleCell";

function statusBadgeClass(online: boolean): string {
  return online
    ? "bg-emerald-100 text-emerald-900"
    : "bg-zinc-100 text-zinc-600";
}

type StaffListTableProps = {
  users: StaffUser[];
  currentUserId: string;
  canManageRoles: boolean;
  onUserUpdated: (user: StaffUser) => void;
  onRoleError: (message: string) => void;
};

export function StaffListTable({
  users,
  currentUserId,
  canManageRoles,
  onUserUpdated,
  onRoleError,
}: StaffListTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-3 py-3 font-medium">Name</th>
            <th className="px-3 py-3 font-medium">Email</th>
            <th className="px-3 py-3 font-medium">Role</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-zinc-50/80">
              <td className="px-3 py-2 font-medium text-zinc-900">{user.name}</td>
              <td className="px-3 py-2 text-zinc-600">{user.email}</td>
              <td className="px-3 py-2">
                <StaffRoleCell
                  user={user}
                  currentUserId={currentUserId}
                  canManageRoles={canManageRoles}
                  onUpdated={onUserUpdated}
                  onError={onRoleError}
                />
              </td>
              <td className="px-3 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(user.online)}`}
                >
                  {staffStatusLabel(user.online)}
                </span>
              </td>
              <td className="px-3 py-2">
                {user.id === currentUserId ? (
                  <span className="text-xs text-zinc-400">—</span>
                ) : (
                  <Link
                    href={`/messages?with=${user.id}`}
                    className="text-sm font-medium text-sky-700 hover:text-sky-900"
                  >
                    Message
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

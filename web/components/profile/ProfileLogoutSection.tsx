"use client";

import { LogoutButton } from "@/components/LogoutButton";

export function ProfileLogoutSection() {
  return (
    <div className="border-t border-zinc-200 px-6 py-6">
      <h3 className="text-sm font-medium text-zinc-900">Sign out</h3>
      <p className="mt-1 text-xs text-zinc-500">
        End your session on this device.
      </p>
      <div className="mt-4">
        <LogoutButton variant="outline" />
      </div>
    </div>
  );
}

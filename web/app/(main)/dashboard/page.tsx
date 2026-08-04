import { DashboardView } from "@/components/dashboard/DashboardView";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = (await getSession())!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <DashboardView
        userName={user.name}
        userEmail={user.email}
        userRole={user.role}
      />
    </div>
  );
}

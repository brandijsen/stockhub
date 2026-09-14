import { redirect } from "next/navigation";

import { PageContainer } from "@/components/PageContainer";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <PageContainer>
      <DashboardView userName={user.name} userRole={user.role} />
    </PageContainer>
  );
}

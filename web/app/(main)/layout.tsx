import { redirect } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { getSession } from "@/lib/session";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}

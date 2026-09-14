import { redirect } from "next/navigation";

import { Footer } from "@/components/Footer";
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
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
      <Navbar />
      <main className="min-w-0 w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import { Footer } from "@/components/Footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col bg-zinc-50">
      <div className="min-w-0 w-full flex-1">{children}</div>
      <Footer brandHref="/" />
    </div>
  );
}

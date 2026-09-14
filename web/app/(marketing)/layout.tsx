import { Footer } from "@/components/Footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col">
      {children}
      <Footer brandHref="/" />
    </div>
  );
}

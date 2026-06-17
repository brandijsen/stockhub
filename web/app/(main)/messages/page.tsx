import { MessagesView } from "@/components/messages/MessagesView";

type MessagesPageProps = {
  searchParams: Promise<{ with?: string }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <MessagesView withUserId={params.with} />
    </div>
  );
}

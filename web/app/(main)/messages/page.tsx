import { MessagesView } from "@/components/messages/MessagesView";
import { PageContainer } from "@/components/PageContainer";

type MessagesPageProps = {
  searchParams: Promise<{ with?: string; conversation?: string }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;

  return (
    <PageContainer width="wide">
      <MessagesView
        withUserId={params.with}
        conversationId={params.conversation}
      />
    </PageContainer>
  );
}

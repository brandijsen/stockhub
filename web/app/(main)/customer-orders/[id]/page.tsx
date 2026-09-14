import { CustomerOrderDetail } from "@/components/CustomerOrderDetail";
import { PageContainer } from "@/components/PageContainer";

type CustomerOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerOrderPage({
  params,
}: CustomerOrderPageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <CustomerOrderDetail orderId={id} />
    </PageContainer>
  );
}

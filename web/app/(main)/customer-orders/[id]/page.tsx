import { CustomerOrderDetail } from "@/components/CustomerOrderDetail";

type CustomerOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerOrderPage({
  params,
}: CustomerOrderPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CustomerOrderDetail orderId={id} />
    </div>
  );
}

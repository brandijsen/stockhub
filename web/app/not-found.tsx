import Link from "next/link";

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/PageContainer";
import { StatusPageLayout } from "@/components/StatusPageLayout";
import { getSession } from "@/lib/session";

export default async function NotFound() {
  const user = await getSession();
  const brandHref = user ? "/dashboard" : "/";

  return (
    <StatusPageLayout
      brandHref={brandHref}
      code="404"
      title="This page could not be found"
    >
      <Link href={brandHref} className={primaryButtonClassName}>
        {user ? "Go to dashboard" : "Back to home"}
      </Link>
      {!user ? (
        <Link href="/login" className={secondaryButtonClassName}>
          Log in
        </Link>
      ) : null}
    </StatusPageLayout>
  );
}

import LoginPage from "@/components/layout/login";
import { Suspense } from "react";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <Suspense fallback={<>...</>}>
      <LoginPage searchParams={searchParams} />
    </Suspense>
  );
}

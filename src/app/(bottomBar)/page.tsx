import Feed from "@/components/feeds/Feed";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<>...</>}>
      <Feed />
    </Suspense>
  );
}

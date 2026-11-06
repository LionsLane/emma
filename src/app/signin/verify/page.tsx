import type { Metadata } from "next";
import { Suspense } from "react";
import { Verify } from "./Verify";

export const metadata: Metadata = { title: "Two-step verification", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "./SignIn";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}

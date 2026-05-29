import type { Metadata } from "next";
import SubscriptionManagementClient from "./SubscriptionManagementClient";

export const metadata: Metadata = {
  title: "Hantera prenumeration | Finansanalytik",
  description: "Hantera din Finansanalytik-prenumeration utan användarkonto.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ManageSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  return <SubscriptionManagementClient token={(params.token || "").trim()} />;
}

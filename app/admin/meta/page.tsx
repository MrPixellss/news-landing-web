import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  getMetaAdminDashboardSecret,
  isMetaAdminSessionTokenValid,
  META_ADMIN_COOKIE,
} from "../../lib/adminDashboardAuth";
import { MetaCampaignDashboard } from "./MetaCampaignDashboard";

export const metadata: Metadata = {
  title: "Meta Campaign Drafts | Finansanalytik",
  description: "Intern approval dashboard för Finansanalytik Meta Ads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MetaAdminPage() {
  const secret = getMetaAdminDashboardSecret();

  if (!secret) {
    notFound();
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(META_ADMIN_COOKIE)?.value;

  if (!isMetaAdminSessionTokenValid(sessionToken, secret)) {
    redirect("/admin/meta/login");
  }

  return <MetaCampaignDashboard />;
}

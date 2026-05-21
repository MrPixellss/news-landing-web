import { Metadata } from "next";
import { MetaCampaignDashboard } from "./MetaCampaignDashboard";

export const metadata: Metadata = {
  title: "Meta Campaign Drafts | Finansanalytik",
  description: "Intern approval dashboard för Finansanalytik Meta Ads.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MetaAdminPage() {
  return <MetaCampaignDashboard />;
}

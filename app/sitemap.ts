import type { MetadataRoute } from "next";
import { orderedTopics } from "./lib/report";

const siteUrl = "https://finansanalytik.com";

const staticPaths = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/kopvillkor", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/integritetspolicy", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/cookiepolicy", priority: 0.4, changeFrequency: "monthly" as const },
  { path: "/kontakt", priority: 0.4, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...staticPaths.map((item) => ({
      url: `${siteUrl}${item.path}`,
      lastModified,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...orderedTopics.map((topic) => ({
      url: `${siteUrl}/topics/${topic.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}

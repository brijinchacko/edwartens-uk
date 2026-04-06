import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-data";
import { getAllCities } from "@/lib/seo-cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://edwartens.co.uk";
  const posts = getAllPosts();
  const cities = getAllCities();
  const now = new Date();

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const cityUrls = cities.map((city) => ({
    url: `${baseUrl}/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: city.isUK ? 0.8 : 0.7,
    alternates: {
      languages: {
        "en-GB": `${baseUrl}/${city.slug}`,
        [`en-${city.countryCode}`]: `${baseUrl}/${city.slug}`,
        "x-default": `${baseUrl}/${city.slug}`,
      },
    },
  }));

  return [
    // Core pages
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Courses (high priority)
    { url: `${baseUrl}/courses`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/courses/professional`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/courses/ai-module`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },

    // Training & careers
    { url: `${baseUrl}/training`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/reviews`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/placements`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/recruitment`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/integration`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },

    // Blog
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },

    // Utility
    { url: `${baseUrl}/verify`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },

    // Legal & compliance
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/complaints`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },

    // Blog posts
    ...blogUrls,

    // SEO City Landing Pages
    ...cityUrls,
  ];
}

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { situations } from "@/lib/situations";
import { understandTopics } from "@/lib/understand";
import { supportResources } from "@/lib/support";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: { path: string; changefreq?: string; priority?: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/learn/connect", changefreq: "weekly", priority: "0.9" },
          { path: "/learn/understand", changefreq: "monthly", priority: "0.8" },
          { path: "/learn/journey", changefreq: "monthly", priority: "0.8" },
          { path: "/learn/support", changefreq: "monthly", priority: "0.8" },
          { path: "/learn/coach", changefreq: "weekly", priority: "0.7" },
          ...situations.map((s) => ({
            path: `/learn/connect/${s.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          })),
          ...understandTopics.map((t) => ({
            path: `/learn/understand/${t.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          })),
          ...supportResources.map((r) => ({
            path: `/learn/support/${r.slug}`,
            changefreq: "monthly",
            priority: "0.6",
          })),
        ];

        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
        );

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

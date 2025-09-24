import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://culinarium.io";

  const routes = [
    "", // home
    "kitchen", // misma importancia que home
    "kitchen/recipes/list",
    "auth/login",
    "auth/register",
  ];

  const urls = routes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}/${route}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>${
        route === "" || route === "kitchen" ? "1.0" : "0.8"
      }</priority>
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

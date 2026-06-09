import { buildRobotsTxtBody } from "@/lib/seo/robots-text";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  return new Response(buildRobotsTxtBody(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

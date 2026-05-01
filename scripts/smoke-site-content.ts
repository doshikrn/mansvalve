/**
 * Smoke: site content merge helpers (same paths as no-DB / missing rows).
 * Does not touch Postgres or Next server-only modules — safe under plain tsx.
 *
 * Run from `mansvalve/`: npx tsx scripts/smoke-site-content.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

import {
  DEFAULT_TRUST_STRIP,
  mergeAboutCopy,
  mergeContactsCopy,
  mergeHomeFaq,
  mergeHomeHero,
  mergeHomeMeta,
  mergeRequestCta,
  mergeTrustStrip,
} from "../lib/site-content/models";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function main() {
  const hero = mergeHomeHero(undefined, 42);
  assert(hero.stat2Val === "42 позиций", `hero stat2Val: got ${hero.stat2Val}`);

  const trust = mergeTrustStrip(undefined);
  assert(trust.paragraph === DEFAULT_TRUST_STRIP.paragraph, "trust default");

  const faq = mergeHomeFaq(undefined);
  assert(faq.items.length >= 1, "faq default items");

  const meta = mergeHomeMeta(undefined);
  assert(meta.ogTitle.includes("MANSVALVE"), "meta default title");

  const about = mergeAboutCopy(undefined);
  assert(about.overviewParagraphs.length >= 1, "about default");

  const contacts = mergeContactsCopy(undefined);
  assert(contacts.formTitle.length > 0, "contacts default");

  const rcta = mergeRequestCta(undefined);
  assert(rcta.title.length > 0, "request CTA default");

  const trustPatch = mergeTrustStrip({ paragraph: "Custom trust" });
  assert(trustPatch.paragraph === "Custom trust", "trust merge patch");

  const heroDbNoStat2 = mergeHomeHero(
    {
      eyebrow: "E",
      h1Line1: "L1",
      h1Highlight: "H",
      subhead: "S",
      primaryCta: "P",
      secondaryCta: "S2",
      trustPoints: ["a"],
      stat1Val: "1",
      stat1Label: "l1",
      stat2Label: "l2",
      stat3Val: "3",
      stat3Label: "l3",
      featuredEyebrow: "fe",
      featuredTitle: "ft",
      featuredLinkTemplate: "x{{COUNT}}y",
    },
    7,
  );
  assert(heroDbNoStat2.stat2Val === "7 позиций", "hero stat2 from count when DB omits stat2Val");

  console.log("[smoke] merge fallbacks + partial DB-shaped hero: OK");
  if (!process.env.DATABASE_URL) {
    console.log(
      "[smoke] DATABASE_URL unset — for full save flow, run dev with DB and exercise /admin/content in browser.",
    );
  } else {
    console.log(
      "[smoke] DATABASE_URL is set — run `npm run dev`, log in, save blocks on /admin/content, verify / /about /contacts.",
    );
  }
}

main();

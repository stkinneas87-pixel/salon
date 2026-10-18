import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";

dotenv.config({ path: ".env.local" });
dotenv.config();
import postgres from "postgres";

import { defaultPages, defaultSettings, sampleServices } from "../lib/content/defaults";
import * as schema from "../lib/db/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is required. Add your Neon pooled connection string to .env.local.",
    );
  }

  const client = postgres(url, { max: 1, prepare: false });

  try {
    const db = drizzle(client, { schema });

    await db
      .insert(schema.siteSettings)
      .values({ id: 1, data: defaultSettings })
      .onConflictDoNothing();

    for (const [slug, page] of Object.entries(defaultPages)) {
      await db
        .insert(schema.pages)
        .values({
          slug,
          content: page.content,
          seo: page.seo,
        })
        .onConflictDoNothing();
    }

    for (const service of sampleServices) {
      await db
        .insert(schema.services)
        .values({
          name: service.name,
          slug: service.slug,
          category: service.category,
          description: service.description,
          inclusions: service.inclusions,
          priceCents: service.priceCents,
          priceType: service.priceType,
          durationMinutes: service.durationMinutes,
          image: service.image,
          active: service.active,
          sortOrder: service.sortOrder,
          isSample: service.isSample,
        })
        .onConflictDoNothing();
    }

    console.log(
      "Seeded site settings, pages and sample services. Sample services stay hidden until reviewed in the admin.",
    );
  } finally {
    await client.end();
  }
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});

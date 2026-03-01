import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    async seed() {
      const { execSync } = await import("child_process");
      execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
    },
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

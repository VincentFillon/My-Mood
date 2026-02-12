import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  const raw = process.env["DATABASE_URL"];
  if (!raw) throw new Error("DATABASE_URL is not set");

  // Resolve ${VAR} interpolation that dotenv doesn't handle
  return raw.replace(/\$\{(\w+)\}/g, (_, key) => process.env[key] ?? "");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});

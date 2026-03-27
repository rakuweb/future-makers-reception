const globalForPrisma = globalThis as unknown as { prisma: any };

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) return null;

  const { PrismaClient } = require("@prisma/client");
  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
};

let prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };

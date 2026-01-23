import "dotenv/config";
import { PrismaClient } from "@infrastructure/database/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ["warn", "error", "info", "query"],
});

export abstract class PrismaRepository<TDelegate> {
  protected readonly db: PrismaClient;
  protected readonly delegate: TDelegate;

  constructor(db: PrismaClient, delegate: TDelegate) {
    this.db = db;
    this.delegate = delegate;
  }

  protected getClient(tx?: TransactionClient): TDelegate {
    return (tx ?? this.db) as unknown as TDelegate;
  }
}

export default prisma;

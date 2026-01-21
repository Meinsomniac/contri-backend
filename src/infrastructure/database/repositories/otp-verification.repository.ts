import { IOtpVerificationRepository } from "@application/interfaces/repositories/otp-verification.interface";
import { OtpVerificationToken } from "@domain/entities/otp-verification.entity";
import { PrismaClient, VerificationType } from "../generated/prisma/client";
import prisma, { PrismaRepository } from "../prisma/prisma";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";

export class OtpVerificationRepository
  extends PrismaRepository<PrismaClient["otpVerification"]>
  implements IOtpVerificationRepository
{
  constructor(db: PrismaClient) {
    super(db, db.otpVerification);
  }
  async create(
    data: Omit<OtpVerificationToken, "id" | "createdAt">,
    tx: TransactionClient,
  ): Promise<OtpVerificationToken> {
    const client = tx ?? this.db;
    return await client.otpVerification.create({
      data: {
        expiresAt: data.expiresAt,
        secret: data.secret,
        userId: data.userId,
        type: data.type,
      },
    });
  }

  async findByUserId(
    userId: string,
    type: VerificationType,
  ): Promise<OtpVerificationToken | null> {
    return await this.db.otpVerification.findFirst({
      where: {
        userId,
        type,
      },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.db.otpVerification.delete({ where: { id } });
  }
}

export const otpVerificationRepository = new OtpVerificationRepository(prisma);

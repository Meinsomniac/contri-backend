import { TransactionClient } from "@infrastructure/database/generated/prisma/internal/prismaNamespace";
import { OtpVerificationToken } from "../../../domain/entities/otp-verification.entity";
import { VerificationType } from "@infrastructure/database/generated/prisma/enums";

export interface IOtpVerificationRepository {
  create(
    data: Omit<OtpVerificationToken, "id" | "createdAt">,
    tx?: TransactionClient,
  ): Promise<OtpVerificationToken>;
  findByUserId(
    userId: string,
    type: VerificationType,
  ): Promise<OtpVerificationToken | null>;
  deleteById(id: string): Promise<void>;
}

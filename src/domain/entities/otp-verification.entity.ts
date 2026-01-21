import { VerificationType } from "@infrastructure/database/generated/prisma/enums";

export interface OtpVerificationToken {
  id: string;
  userId: string;
  secret: string;
  expiresAt: Date;
  createdAt: Date;
  type: VerificationType;
}

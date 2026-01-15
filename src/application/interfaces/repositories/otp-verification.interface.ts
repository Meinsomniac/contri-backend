import { OtpVerificationToken } from "../../../domain/entities/otp-verification.entity";

export interface IOtpVerificationRepository {
  create(
    data: Omit<OtpVerificationToken, "id" | "createdAt">
  ): Promise<OtpVerificationToken>;
  findByUserId(userId: string): Promise<OtpVerificationToken | null>;
  deleteById(id: string): Promise<void>;
}

export interface OtpVerificationToken {
  id: string;
  userId: string;
  secret: string;
  expiresAt: Date;
  createdAt: Date;
}

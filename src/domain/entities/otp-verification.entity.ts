export interface OtpVerificationToken {
  id: string;
  userId: string;
  secret: string;
  expireAt: Date;
  createdAt: Date;
}

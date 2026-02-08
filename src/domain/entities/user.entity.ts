import { nanoid } from "@shared/functions";

type AuthProvider = "EMAIL" | "GOOGLE" | "APPLE";
export class User {
  public readonly id: string;
  public name: string;
  public publicId: string;
  public email: string | null = null;
  public phone: string | null = null;
  public password: string | null = null; // Hashed password (nullable for social logins)
  public avatar: string | null = null;
  public emailVerified: boolean = false;
  public phoneVerified: boolean = false;
  public authProvider: AuthProvider = "EMAIL";
  public authId: string | null = null; // For social login users, store the provider's user ID
  public isOnboarded: boolean = false;
  public isPlaceholder: boolean = false;
  public currency: string = "USD";
  public language: string = "en";
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    options: {
      publicId?: string;
      email?: string | null;
      phone?: string | null;
      password?: string | null;
      avatar?: string | null;
      emailVerified?: boolean;
      phoneVerified?: boolean;
      authProvider?: AuthProvider;
      authId?: string | null;
      isOnboarded?: boolean;
      isPlaceholder?: boolean;
      currency?: string;
      language?: string;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ) {
    this.id = id;
    this.name = name;
    this.publicId = options?.publicId || this.generatePublicId();
    // if (options) {
    this.email = options.email ?? null;
    this.phone = options.phone ?? null;
    this.password = options.password ?? null;
    this.avatar = options.avatar ?? null;
    this.emailVerified = options.emailVerified ?? false;
    this.phoneVerified = options.phoneVerified ?? false;
    this.authProvider = options.authProvider ?? "EMAIL";
    this.authId = options.authId ?? null;
    this.isOnboarded = options.isOnboarded ?? false;
    this.isPlaceholder = options.isPlaceholder ?? false;
    this.currency = options.currency ?? "USD";
    this.language = options.language ?? "en";
    this.createdAt = options.createdAt ?? new Date();
    this.updatedAt = options.updatedAt ?? new Date();
  }
  public setAvatar(url: string): void {
    this.avatar = url;
    this.updatedAt = new Date();
  }

  public generatePublicId(): string {
    this.updatedAt = new Date();
    return `user_${nanoid()}`;
  }

  public setPassword(hashedPassword: string | null): void {
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }
}

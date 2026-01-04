export class User {
  public readonly id: string;
  public name: string;
  public email: string | null = null;
  public phone: string | null = null;
  public password: string | null = null; // Hashed password (nullable for social logins)
  public avatar: string | null = null;
  public emailVerified: boolean = false;
  public phoneVerified: boolean = false;
  public isOnboarded: boolean = false;
  public currency: string = "USD";
  public language: string = "en";
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    options: {
      email?: string | null;
      phone?: string | null;
      password?: string | null;
      avatar?: string | null;
      emailVerified?: boolean;
      phoneVerified?: boolean;
      isOnboarded?: boolean;
      currency?: string;
      language?: string;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    this.id = id;
    this.name = name;
    if (options) {
      this.email = options.email ?? null;
      this.phone = options.phone ?? null;
      this.password = options.password ?? null;
      this.avatar = options.avatar ?? null;
      this.emailVerified = options.emailVerified ?? false;
      this.phoneVerified = options.phoneVerified ?? false;
      this.isOnboarded = options.isOnboarded ?? false;
      this.currency = options.currency ?? "USD";
      this.language = options.language ?? "en";
      this.createdAt = options.createdAt ?? new Date();
      this.updatedAt = options.updatedAt ?? new Date();
    } else {
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
  }
  public setAvatar(url: string): void {
    this.avatar = url;
    this.updatedAt = new Date();
  }

  public setPassword(hashedPassword: string | null): void {
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }
}

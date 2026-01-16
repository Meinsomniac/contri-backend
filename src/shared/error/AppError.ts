export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500, error?: any) {
    console.log({ error });
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

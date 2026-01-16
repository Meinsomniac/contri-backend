import nodemailer, { Transporter } from "nodemailer";
import "dotenv/config";
import { SendMailProps } from "./types";
import templateMapper from "./template-mapper";
import { IEmailService } from "@application/interfaces/services/email.interface";
import { AppError } from "@shared/error/AppError";

class EmailService implements IEmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAILING_USER,
        pass: process.env.MAILING_PASS,
      },
    });
  }

  async sendMail(config: SendMailProps) {
    try {
      const html = await templateMapper({
        templateName: config.template,
        data: config.data,
      });
      const result = await this.transporter.sendMail({
        from: config.from,
        to: config.to,
        subject: config.subject,
        text: config.title,
        html,
      });
    } catch (error) {
      throw new AppError("Something went wrong in sending mail", 500, error);
    }
  }
}

export const emailService = new EmailService();

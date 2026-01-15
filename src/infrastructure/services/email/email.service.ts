import nodemailer, { Transporter } from "nodemailer";
import "dotenv/config";
import { SendMailProps } from "./types";
import templateMapper from "./template-mapper";

export default class EmailService {
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
    const html = await templateMapper({
      templateName: config.template,
      data: config.data,
    });

    await this.transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: config.subject,
      text: config.title,
      html,
    });
  }
}

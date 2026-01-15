type SendMailProps = {
  from: string;
  to: string;
  subject: string;
  title?: string;
  data: Record<any, any>;
  template: string;
};

export interface IEmailService {
  sendMail(config: SendMailProps): Promise<void>;
}

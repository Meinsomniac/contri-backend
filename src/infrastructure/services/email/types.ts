type SendMailProps = {
  from: string;
  to: string;
  subject: string;
  title?: string;
  data: Record<any, any>;
  template: string;
};

export { SendMailProps };

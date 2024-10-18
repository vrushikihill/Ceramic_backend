// email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import { Options } from 'nodemailer/lib/mailer';

const users = {
  NOREPLY: {
    user: process.env.SMTP_NOREPLY_USER,
    pass: process.env.SMTP_NOREPLY_PASS,
  },
};

type MailUser = keyof typeof users;

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private mailUser: MailUser = 'NOREPLY';
  logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('smtpHost'),
      port: this.configService.get<number>('smtpPort'),
      secure: false,
      auth: users[this.mailUser],
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(options: Options): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...options,
        from: users[this.mailUser].user,
      });

      this.logger.log({
        message: `Email sent to ${options.to} from ${
          users[this.mailUser].user
        }`,
        level: 'debug',
      });
    } catch (error) {
      this.logger.error({
        message: `Failed to send email to ${options.to} from ${
          users[this.mailUser].user
        }`,
        level: 'error',
      });

      throw new Error(error);
    }
  }

  withUser(user: MailUser): EmailService {
    this.mailUser = user;
    return this;
  }
}

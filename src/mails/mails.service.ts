import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailsService {
  constructor(private mailerService: MailerService) {}

  async createAndSend(createMailDto: CreateMailDto) {
    try {
      const { email, name } = createMailDto;
      await this.sendUserConfirmation(email, name);
      return { message: 'Correo enviado!' };
    } catch (error) {
      console.error(error);
      throw error; 
    }
  }

  async sendUserConfirmation(toEmail: string, userName: string) {
    await this.mailerService.sendMail({
      to: toEmail, 
      from: `<${toEmail}>`, 
      subject: 'Bienvenido a Nice App!',
      template: 'welcome.hbs', 
      context: {
        name: userName,
      },
    });
  }
}

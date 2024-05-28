import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MailsService } from './mails.service';
import { CreateMailDto } from './dto/create-mail.dto';


@Controller('mails')
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Post()
  createAndSend(@Body() createMailDto: CreateMailDto) {
    return this.mailsService.createAndSend(createMailDto);
  }

  
}

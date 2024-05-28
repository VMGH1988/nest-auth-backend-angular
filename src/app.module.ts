import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailsModule } from './mails/mails.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot( process.env.MONGO_URI,{dbName: process.env.MONGO_DB_NAME,} ),

    AuthModule,

    MailsModule,

  ],
  exports: [ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {

}

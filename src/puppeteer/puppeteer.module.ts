import { PuppeteerModule as NestPuppeteerModule } from 'nestjs-puppeteer';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    NestPuppeteerModule.forRoot({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      isGlobal: true,
    }),
  ],
})
export class PuppeteerModule {}

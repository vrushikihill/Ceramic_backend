import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserEvent } from '../events/user.event';

@Injectable()
export class UserListener {
  constructor(private readonly prisma: PrismaService) {}

  logger = new Logger(UserListener.name);

  @OnEvent('sample.created')
  async handleTaskCreatedEvent(event: CreateUserEvent) {
    const currentDate = new Date();

    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + 2);
  }
}

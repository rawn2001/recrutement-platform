import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { GroqQuizService } from './groq-quiz.service';

import { QuizSession } from './entities/quiz-session.entity';
import { JobOffer } from '../job-offer/job-offer.entity';
import { User } from '../users/users.entity';
import { JobApplication } from '../job-application/job-application.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSession, JobOffer, User, JobApplication]),
  ],
  controllers: [QuizController],
  providers: [QuizService, GroqQuizService],
  exports: [QuizService],
})
export class QuizModule {}
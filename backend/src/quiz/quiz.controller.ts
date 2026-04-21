import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate/:jobId')
  @UseGuards(AuthGuard('jwt'))
  async generate(@Req() req, @Param('jobId') jobId: number) {
    return this.quizService.generateQuiz(req.user.id, Number(jobId));
  }

  @Post('submit')
  @UseGuards(AuthGuard('jwt'))
  async submit(
    @Req() req, 
    @Body() body: { sessionId: number; answers: { questionIndex: number; answerIndex: number }[] }
  ) {
    return this.quizService.submitQuiz(req.user.id, body.sessionId, body.answers);
  }
}
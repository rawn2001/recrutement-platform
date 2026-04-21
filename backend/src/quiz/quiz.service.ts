import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from '../job-application/job-application.entity';
import { QuizSession } from './entities/quiz-session.entity';
import { GroqQuizService } from './groq-quiz.service';
import { JobOffer } from '../job-offer/job-offer.entity';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizSession)
    private sessionRepo: Repository<QuizSession>,
    @InjectRepository(JobOffer)
    private jobRepo: Repository<JobOffer>,
    private groqService: GroqQuizService,
    @InjectRepository(JobApplication)
    private jobAppRepo: Repository<JobApplication>,
  ) {}

  async generateQuiz(candidateId: number, jobId: number) {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Offre introuvable');

    const apiQuestions = await this.groqService.generateQuizQuestions({
      title: job.title,
      required_skills: job.required_skills,
      experience_level: job.experience_level,
      description: job.description,
    });

    const safeQuestions = apiQuestions.map((q: any, idx: number) => ({
      index: idx,
      question: q.question,
      options: q.options,
    }));

    const session = this.sessionRepo.create({
      candidate_id: candidateId,
      job_offer_id: jobId,
      questions_snapshot: apiQuestions,
      status: 'pending',
    });
    await this.sessionRepo.save(session);

    return {
      sessionId: session.id,
      durationMinutes: 10,
      questions: safeQuestions,
    };
  }

 async submitQuiz(
  candidateId: number,
  sessionId: number,
  userAnswers: { questionIndex: number; answerIndex: number }[]
) {
  const session = await this.sessionRepo.findOne({
    where: { id: sessionId, candidate_id: candidateId },
  });

  if (!session) throw new NotFoundException('Session invalide');
  if (session.status === 'completed') {
    throw new BadRequestException('Quiz déjà soumis');
  }

  // ✅ Debug: voir les réponses reçues
  console.log('🔍 userAnswers:', userAnswers);
  console.log('🔍 snapshot[0]:', session.questions_snapshot[0]);

  // 2. Calculer le score
  let correctCount = 0;
  userAnswers.forEach((ans) => {
    const storedQ = session.questions_snapshot[ans.questionIndex];
    // ✅ Forcer la comparaison en numbers
    if (storedQ && Number(storedQ.correctIndex) === Number(ans.answerIndex)) {
      correctCount++;
    }
  });
  const score = Math.round((correctCount / session.questions_snapshot.length) * 100);
  console.log('📊 Score calculé:', score, `(${correctCount}/${session.questions_snapshot.length})`);

  // 3. Sauvegarder la session
  session.score = score;
  session.status = 'completed';
  await this.sessionRepo.save(session);

  // ✅✅✅ UPDATE FIABLE : prendre la candidature LA PLUS RÉCENTE ✅✅✅
  const application = await this.jobAppRepo.findOne({
    where: { 
      candidate_id: candidateId, 
      job_offer_id: session.job_offer_id 
    },
    order: { applied_at: 'DESC' }  // ← ✅ Prendre la dernière candidature
  });

  if (application) {
    console.log('✅ Update application ID:', application.id);
    
    const updateResult = await this.jobAppRepo.update(application.id, {
      quiz_score: score,
      final_score: Math.round(((application.matching_score || 0) + score) / 2)
    });
    
    console.log('📊 Rows affected:', updateResult.affected); // Doit afficher 1
  } else {
    console.error('❌ Aucune application trouvée');
  }

  return {
    score,
    passed: score >= 70,
    message: score >= 70 ? '✅ Profil compatible !' : '⚠️ Score insuffisant',
  };
}
}
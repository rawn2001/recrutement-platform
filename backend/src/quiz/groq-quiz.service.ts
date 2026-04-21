// src/quiz/groq-quiz.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class GroqQuizService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('❌ GROQ_API_KEY manquante dans .env');
    }
    
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateQuizQuestions(jobData: { 
    title: string; 
    required_skills: any; 
    experience_level: string; 
    description?: string 
  }) {
   // Dans generateQuizQuestions(), remplace le prompt par :
const prompt = `Tu es un expert RH et technique. Génère EXACTEMENT 8 questions de quiz pour cette offre.
Retourne la réponse au format JSON STRICT.

Détails de l'offre :
- Titre : ${jobData.title}
- Compétences : ${JSON.stringify(jobData.required_skills)}
- Niveau : ${jobData.experience_level} (Junior=Facile, Mid=Moyen, Senior=Difficile)
- Description : ${jobData.description?.substring(0, 300) || 'N/A'}

RÈGLES STRICTES :
1. Retourne UNIQUEMENT un objet JSON valide, AUCUN texte avant/après.
2. Structure JSON exacte : {"questions": [{"question": "...", "options": ["A","B","C","D"], "correctIndex": 0}]}
3. correctIndex : 0=A, 1=B, 2=C, 3=D. Varie les positions aléatoirement.
4. Questions techniques, pertinentes, en Français.
5. Mélange types : définition, cas pratique, bonne pratique.

Format de sortie JSON attendu :
{
  "questions": [
    {
      "question": "Exemple de question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}`;
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) throw new Error('Réponse vide de l\'API');
      
      const parsed = JSON.parse(content);
console.log('🤖 Questions Groq (sample):', parsed.questions.slice(0, 2).map(q => ({
  question: q.question.substring(0, 50) + '...',
  correctIndex: q.correctIndex,
  correctIndexType: typeof q.correctIndex  // Doit être 'number'
})));

      console.log('✅ Quiz généré via Groq API');
      return parsed.questions.slice(0, 8);
    } catch (error: any) {
      console.error('❌ Groq API Error:', error.message || error);
      throw new InternalServerErrorException('Échec de la génération du quiz par API');
    }
  }
}
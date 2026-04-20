// backend/src/ml/ml.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);
  private readonly flaskUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Récupère l'URL depuis .env ou utilise la valeur par défaut
    this.flaskUrl = this.configService.get('ML_SERVICE_URL', 'http://localhost:5000');
  }

  /**
   * Analyse un CV et calcule le matching avec une offre d'emploi
   * @param cvBuffer - Buffer du fichier PDF du CV
   * @param offerTitle - Titre de l'offre
   * @param offerDescription - Description de l'offre
   * @param requiredSkills - Compétences requises pour l'offre
   */
  async analyzeCvAndMatch(
    cvBuffer: Buffer,
    offerTitle: string,
    offerDescription: string,
    requiredSkills: string[],
  ): Promise<any> {
    try {
      // Préparer le payload pour Flask
      const payload = {
        cv_file: `data:application/pdf;base64,${cvBuffer.toString('base64')}`,
        offer_title: offerTitle,
        offer_text: offerDescription,
        required_skills: requiredSkills || [],
      };

      // 🔹 LOGS DÉTAILLÉS POUR DEBUG
      this.logger.log(`🔍 [ML SERVICE] === DÉBUT analyzeCvAndMatch ===`);
      this.logger.log(`🔍 [ML SERVICE] URL Flask: ${this.flaskUrl}/analyze`);
      this.logger.log(`🔍 [ML SERVICE] Payload size: ${JSON.stringify(payload).length} chars`);
      this.logger.log(`🔍 [ML SERVICE] Buffer CV size: ${cvBuffer.length} bytes`);
      
      // 🔹 LOG AVANT L'APPEL HTTP
      this.logger.log(`⏳ [ML SERVICE] Envoi requête HTTP vers Flask...`);
      
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.flaskUrl}/analyze`, payload, {
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 1800000,  // 3 minutes pour le LLM
        }),
      );

      // 🔹 LOG APRÈS RÉPONSE REÇUE
      this.logger.log(`✅ [ML SERVICE] Réponse Flask reçue!`);
      this.logger.log(`📊 [ML SERVICE] Données reçues:`, JSON.stringify({
        success: data?.success,
        matching_score: data?.matching_score,
        cv_classification: data?.cv_classification,
        classification_confidence: data?.classification_confidence,
        model_used: data?.model_used,
        skills_detected_count: data?.skills_detected?.length,
        hasError: !!data?.error,
        warning: data?.warning
      }, null, 2));

      // Vérifier les erreurs retournées par Flask
      if (data?.error) {
        this.logger.error(`❌ [ML SERVICE] Erreur dans réponse Flask: ${data.error}`);
        throw new Error(data.error);
      }

      this.logger.log(`✅ [ML SERVICE] === FIN analyzeCvAndMatch === Résultat: score=${data?.matching_score}, cat=${data?.cv_classification}`);
      
      return {
        success: true,
        matching_score: data?.matching_score || 0,
        cv_classification: data?.cv_classification || 'Non classifié',
        classification_confidence: data?.classification_confidence || 0,
        classification_top3: data?.classification_top3 || [],
        skills_detected: data?.skills_detected || [],
        model_used: data?.model_used || 'unknown',
        cv_text_preview: data?.cv_text_preview || '',
      };

    } catch (error) {
      // 🔹 LOG DÉTAILLÉ DE L'ERREUR
      this.logger.error(`❌ [ML SERVICE] === ERREUR CRITIQUE ===`);
      this.logger.error(`❌ [ML SERVICE] Message: ${error.message}`);
      this.logger.error(`❌ [ML SERVICE] Stack: ${error.stack}`);
      
      if (error.response) {
        this.logger.error(`❌ [ML SERVICE] HTTP Status: ${error.response.status}`);
        this.logger.error(`❌ [ML SERVICE] Response Data: ${JSON.stringify(error.response.data)}`);
      }
      if (error.request) {
        this.logger.error(`❌ [ML SERVICE] No response received - request: ${JSON.stringify(error.request)}`);
      }
      
      // 🔹 FALLBACK : Retourner un résultat minimal si Flask est indisponible
      this.logger.warn(`⚠️ [ML SERVICE] Utilisation du fallback`);
      return {
        success: true,
        matching_score: 0,
        cv_classification: 'Non classifié',
        classification_confidence: 0,
        classification_top3: [],
        skills_detected: [],
        model_used: 'fallback',
        warning: `Service ML indisponible: ${error.message}`,
      };
    }
  }

  /**
   * Vérifie si le service Flask est disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.flaskUrl}/health`, { 
          timeout: 5000 // 5 secondes max
        }),
      );
      return data?.status === 'ok';
    } catch (error) {
      this.logger.warn(`⚠️ ML Service health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Test simple avec du texte déjà extrait (pour débogage)
   */
  async analyzeWithText(
    cvText: string,
    offerTitle: string,
    offerDescription: string,
    requiredSkills: string[],
  ): Promise<any> {
    try {
      const payload = {
        cv_text: cvText, // Texte déjà extrait
        offer_title: offerTitle,
        offer_text: offerDescription,
        required_skills: requiredSkills || [],
      };

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.flaskUrl}/analyze`, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(`❌ Erreur analyzeWithText: ${error.message}`);
      throw error;
    }
  }
}
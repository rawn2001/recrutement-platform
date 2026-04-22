// src/ml-advice/ml-advice.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class MlAdviceService {
  private readonly flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5000';

  async analyzeCv(cvBuffer: Buffer, filename: string, jobText?: string) {  // ← ✅ jobText optionnel
    const formData = new FormData();
    formData.append('cv_file', cvBuffer, {
      filename: filename || 'cv.pdf',
      contentType: 'application/pdf',
    });
    
    // ✅ Si jobText est fourni, l'envoyer à Flask
    if (jobText) {
      formData.append('job_text', jobText);
    }

    try {
      const res = await axios.post(`${this.flaskUrl}/predict`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Length': formData.getLengthSync(),
        },
        timeout: 45000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return res.data;
    } catch (error: any) {
      console.error('❌ Erreur Flask ML:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.error || 'Échec de l\'analyse IA des conseils CV'
      );
    }
  }

  async healthCheck() {
    try {
      const res = await axios.get(`${this.flaskUrl}/health`, { timeout: 5000 });
      return res.data;
    } catch {
      return { status: 'unreachable' };
    }
  }
}
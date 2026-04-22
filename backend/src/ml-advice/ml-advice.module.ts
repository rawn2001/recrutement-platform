import { Module } from '@nestjs/common';
import { MlAdviceController } from './ml-advice.controller';
import { MlAdviceService } from './ml-advice.service';

@Module({
  controllers: [MlAdviceController],
  providers: [MlAdviceService],
  exports: [MlAdviceService],
})
export class MlAdviceModule {}
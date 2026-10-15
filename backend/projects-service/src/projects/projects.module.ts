import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { Panel } from '../entities/panel.entity';
import { Circuit } from '../entities/circuit.entity';
import { Load } from '../entities/load.entity';
import { CalculationResult } from '../entities/calculation-result.entity';
import { ComplianceFinding } from '../entities/compliance-finding.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CalcEngineService } from '../calc/calc-engine.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Panel, Circuit, Load, CalculationResult, ComplianceFinding]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, CalcEngineService],
})
export class ProjectsModule {}

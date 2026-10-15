import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Panel } from './entities/panel.entity';
import { Circuit } from './entities/circuit.entity';
import { Load } from './entities/load.entity';
import { CalculationResult } from './entities/calculation-result.entity';
import { ComplianceFinding } from './entities/compliance-finding.entity';
import { ProjectsModule } from './projects/projects.module';

// Prueba de concepto LOCAL: SQLite en archivo, no PostgreSQL como recomienda la
// Sección 16.1 del plan maestro. `synchronize: true` autogenera el esquema desde las
// entidades -- aceptable para un prototipo local, nunca en producción (se reemplaza
// por migraciones versionadas cuando este servicio deje de ser una prueba de
// concepto). La ruta del archivo se puede sobrescribir con DB_PATH (usada por la
// prueba e2e para no pisar datos de una corrida manual).
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'projects-service.sqlite',
      entities: [Project, Panel, Circuit, Load, CalculationResult, ComplianceFinding],
      synchronize: true,
    }),
    ProjectsModule,
  ],
})
export class AppModule {}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Circuit } from './circuit.entity';
import { ComplianceFinding } from './compliance-finding.entity';

// Snapshot inmutable de un cálculo (Sección 9.1/9.3 del plan maestro): cada llamada
// a POST /circuits/:id/calculate crea un registro nuevo, no actualiza uno existente.
@Entity()
export class CalculationResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('float')
  designCurrentA!: number;

  @Column('float')
  requiredCurrentA!: number;

  @Column()
  selectedConductor!: string;

  @Column('float')
  baseAmpacityA!: number;

  @Column('float')
  temperatureFactor!: number;

  @Column('float')
  groupingFactor!: number;

  @Column('float')
  correctedAmpacityA!: number;

  @Column('float')
  voltageDropPercent!: number;

  @Column()
  computedAt!: string;

  @ManyToOne(() => Circuit, (circuit) => circuit.calculationResults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuitId' })
  circuit!: Circuit;

  @Column()
  circuitId!: string;

  @OneToMany(() => ComplianceFinding, (finding) => finding.calculationResult)
  complianceFindings!: ComplianceFinding[];
}

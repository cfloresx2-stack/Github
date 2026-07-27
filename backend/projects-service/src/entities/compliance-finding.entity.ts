import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CalculationResult } from './calculation-result.entity';

// Sección 6.6 del plan maestro: evidencia técnica asociada a un resultado de
// cálculo, tal como la produce compliance-engine (vía calc-engine-wasm).
@Entity()
export class ComplianceFinding {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ruleId!: string;

  @Column()
  status!: string; // Cumple | Advertencia | NoCumple | NoEvaluable

  @Column()
  normReference!: string;

  @Column('text')
  observation!: string;

  @ManyToOne(() => CalculationResult, (result) => result.complianceFindings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calculationResultId' })
  calculationResult!: CalculationResult;

  @Column()
  calculationResultId!: string;
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Panel } from './panel.entity';
import { Load } from './load.entity';
import { CalculationResult } from './calculation-result.entity';

@Entity()
export class Circuit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  circuitType!: string; // 'alimentador' | 'derivado'

  @Column()
  threePhase!: boolean;

  @Column({ default: false })
  isContinuousLoad!: boolean;

  @Column('float')
  lengthM!: number;

  @Column('float')
  ambientTempC!: number;

  @Column()
  currentCarryingConductors!: number;

  @Column({ default: '75' })
  insulationRating!: string; // '60' | '75' | '90'

  @ManyToOne(() => Panel, (panel) => panel.circuits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'panelId' })
  panel!: Panel;

  @Column()
  panelId!: string;

  @OneToMany(() => Load, (load) => load.circuit)
  loads!: Load[];

  @OneToMany(() => CalculationResult, (result) => result.circuit)
  calculationResults!: CalculationResult[];
}

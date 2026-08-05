import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Circuit } from './circuit.entity';

@Entity()
export class Load {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  description!: string;

  @Column('float')
  powerVa!: number;

  @Column('float')
  powerFactor!: number;

  @ManyToOne(() => Circuit, (circuit) => circuit.loads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'circuitId' })
  circuit!: Circuit;

  @Column()
  circuitId!: string;
}

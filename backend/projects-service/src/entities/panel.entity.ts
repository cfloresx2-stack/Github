import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { Circuit } from './circuit.entity';

@Entity()
export class Panel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('float')
  voltage!: number;

  @ManyToOne(() => Project, (project) => project.panels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column()
  projectId!: string;

  @OneToMany(() => Circuit, (circuit) => circuit.panel)
  circuits!: Circuit[];
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Panel } from './panel.entity';

// Sección 9.3 del plan maestro (simplificado para la prueba de concepto local:
// sin Organization/User — un solo tenant implícito).
@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  installationType!: string; // industrial | comercial | residencial

  @Column()
  voltageClass!: string;

  @Column()
  createdAt!: string;

  @OneToMany(() => Panel, (panel) => panel.project)
  panels!: Panel[];
}

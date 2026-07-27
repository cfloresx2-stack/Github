import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Panel } from '../entities/panel.entity';
import { Circuit } from '../entities/circuit.entity';
import { Load } from '../entities/load.entity';
import { CalculationResult } from '../entities/calculation-result.entity';
import { ComplianceFinding } from '../entities/compliance-finding.entity';
import { CalcEngineService } from '../calc/calc-engine.service';
import {
  CalculateCircuitDto,
  CreateCircuitDto,
  CreateLoadDto,
  CreatePanelDto,
  CreateProjectDto,
} from './dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Panel) private readonly panels: Repository<Panel>,
    @InjectRepository(Circuit) private readonly circuits: Repository<Circuit>,
    @InjectRepository(Load) private readonly loads: Repository<Load>,
    @InjectRepository(CalculationResult)
    private readonly calculationResults: Repository<CalculationResult>,
    @InjectRepository(ComplianceFinding)
    private readonly complianceFindings: Repository<ComplianceFinding>,
    private readonly calcEngine: CalcEngineService,
  ) {}

  createProject(dto: CreateProjectDto): Promise<Project> {
    return this.projects.save(
      this.projects.create({ ...dto, createdAt: new Date().toISOString() }),
    );
  }

  getProject(id: string): Promise<Project | null> {
    return this.projects.findOne({ where: { id }, relations: ['panels'] });
  }

  async createPanel(projectId: string, dto: CreatePanelDto): Promise<Panel> {
    const project = await this.projects.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException(`Proyecto ${projectId} no existe`);
    return this.panels.save(this.panels.create({ ...dto, projectId }));
  }

  async createCircuit(panelId: string, dto: CreateCircuitDto): Promise<Circuit> {
    const panel = await this.panels.findOne({ where: { id: panelId } });
    if (!panel) throw new NotFoundException(`Tablero ${panelId} no existe`);
    return this.circuits.save(
      this.circuits.create({ ...dto, insulationRating: dto.insulationRating ?? '75', panelId }),
    );
  }

  async createLoad(circuitId: string, dto: CreateLoadDto): Promise<Load> {
    const circuit = await this.circuits.findOne({ where: { id: circuitId } });
    if (!circuit) throw new NotFoundException(`Circuito ${circuitId} no existe`);
    return this.loads.save(this.loads.create({ ...dto, circuitId }));
  }

  /**
   * Reproduce el pipeline de Sección 5.3 del plan maestro para un circuito:
   * carga instalada -> demanda -> corriente de diseño -> selección de conductor ->
   * caída de tensión -> evaluación de cumplimiento (Sección 6). Cada llamada crea
   * un CalculationResult nuevo (snapshot inmutable, Sección 9.1), nunca actualiza
   * uno existente.
   */
  async calculateCircuit(
    circuitId: string,
    dto: CalculateCircuitDto,
  ): Promise<{ result: CalculationResult; findings: ComplianceFinding[] }> {
    const circuit = await this.circuits.findOne({ where: { id: circuitId }, relations: ['loads'] });
    if (!circuit) throw new NotFoundException(`Circuito ${circuitId} no existe`);
    if (circuit.loads.length === 0) {
      throw new NotFoundException(`Circuito ${circuitId} no tiene cargas capturadas`);
    }

    // Módulo 4.1: carga instalada.
    const installedVa = circuit.loads.reduce((sum, load) => sum + load.powerVa, 0);
    // Módulo 4.2: demanda (factor ya resuelto -- ver aviso en dto.ts).
    const demandVa = installedVa * dto.demandFactor;

    // Módulo 4.4.
    const designCurrent = this.calcEngine.designCurrentAmps(
      demandVa,
      dto.nominalVoltage,
      circuit.threePhase,
    );
    const requiredCurrent = this.calcEngine.continuousLoadAdjustedCurrent(
      designCurrent,
      circuit.isContinuousLoad,
    );

    // Módulos 4.5-4.6.
    const selection = this.calcEngine.selectConductor(
      requiredCurrent,
      circuit.insulationRating,
      circuit.ambientTempC,
      circuit.currentCarryingConductors,
    );

    // Sección 5.4.
    const voltageDropPercent = this.calcEngine.voltageDropPercent(
      requiredCurrent,
      circuit.lengthM,
      selection.conductor,
      circuit.threePhase,
      dto.nominalVoltage,
    );

    const result = await this.calculationResults.save(
      this.calculationResults.create({
        circuitId,
        designCurrentA: designCurrent,
        requiredCurrentA: requiredCurrent,
        selectedConductor: selection.conductor,
        baseAmpacityA: selection.base_ampacity,
        temperatureFactor: selection.temperature_factor,
        groupingFactor: selection.grouping_factor,
        correctedAmpacityA: selection.corrected_ampacity,
        voltageDropPercent,
        computedAt: new Date().toISOString(),
      }),
    );

    // Sección 6: motor normativo.
    const isFeeder = circuit.circuitType === 'alimentador';
    const vdFinding = this.calcEngine.evaluateVoltageDrop(circuit.name, isFeeder, voltageDropPercent);
    const ampacityFinding = this.calcEngine.evaluateConductorAmpacity(
      circuit.name,
      requiredCurrent,
      selection.corrected_ampacity,
    );

    const findings = await this.complianceFindings.save([
      this.complianceFindings.create({
        calculationResultId: result.id,
        ruleId: vdFinding.rule_id,
        status: vdFinding.status,
        normReference: vdFinding.norm_reference,
        observation: vdFinding.observation,
      }),
      this.complianceFindings.create({
        calculationResultId: result.id,
        ruleId: ampacityFinding.rule_id,
        status: ampacityFinding.status,
        normReference: ampacityFinding.norm_reference,
        observation: ampacityFinding.observation,
      }),
    ]);

    return { result, findings };
  }

  async getCalculations(circuitId: string): Promise<CalculationResult[]> {
    return this.calculationResults.find({
      where: { circuitId },
      relations: ['complianceFindings'],
      order: { computedAt: 'DESC' },
    });
  }
}

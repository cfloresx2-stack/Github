import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CalculateCircuitDto,
  CreateCircuitDto,
  CreateLoadDto,
  CreatePanelDto,
  CreateProjectDto,
} from './dto';

// Subconjunto de los endpoints de la Sección 16.3 del plan maestro, suficiente para
// la prueba de concepto: proyecto -> tablero -> circuito -> cargas -> cálculo.
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) {
    return this.projects.createProject(dto);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    const project = await this.projects.getProject(id);
    if (!project) throw new NotFoundException(`Proyecto ${id} no existe`);
    return project;
  }

  @Post('projects/:id/panels')
  createPanel(@Param('id') projectId: string, @Body() dto: CreatePanelDto) {
    return this.projects.createPanel(projectId, dto);
  }

  @Post('panels/:id/circuits')
  createCircuit(@Param('id') panelId: string, @Body() dto: CreateCircuitDto) {
    return this.projects.createCircuit(panelId, dto);
  }

  @Post('circuits/:id/loads')
  createLoad(@Param('id') circuitId: string, @Body() dto: CreateLoadDto) {
    return this.projects.createLoad(circuitId, dto);
  }

  @Post('circuits/:id/calculate')
  calculate(@Param('id') circuitId: string, @Body() dto: CalculateCircuitDto) {
    return this.projects.calculateCircuit(circuitId, dto);
  }

  @Get('circuits/:id/calculations')
  getCalculations(@Param('id') circuitId: string) {
    return this.projects.getCalculations(circuitId);
  }
}

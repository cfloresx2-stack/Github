import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsIn(['industrial', 'comercial', 'residencial'])
  installationType!: string;

  @IsString()
  voltageClass!: string;
}

export class CreatePanelDto {
  @IsString()
  name!: string;

  @IsNumber()
  voltage!: number;
}

export class CreateCircuitDto {
  @IsString()
  name!: string;

  @IsIn(['alimentador', 'derivado'])
  circuitType!: string;

  @IsBoolean()
  threePhase!: boolean;

  @IsBoolean()
  isContinuousLoad!: boolean;

  @IsNumber()
  @Min(0)
  lengthM!: number;

  @IsNumber()
  ambientTempC!: number;

  @IsInt()
  @Min(1)
  currentCarryingConductors!: number;

  @IsOptional()
  @IsIn(['60', '75', '90'])
  insulationRating?: string;
}

export class CreateLoadDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  powerVa!: number;

  @IsNumber()
  @Min(0)
  powerFactor!: number;
}

export class CalculateCircuitDto {
  // Factor de demanda ya resuelto por el motor normativo (Sección 6) para la
  // categoría de carga del proyecto — este servicio no lo calcula, ver el mismo
  // desacoplo documentado en calc_engine::load.
  @IsNumber()
  @Min(0)
  demandFactor!: number;

  @IsNumber()
  nominalVoltage!: number;
}

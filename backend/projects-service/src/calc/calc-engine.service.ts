import { Injectable } from '@nestjs/common';

// El paquete generado por wasm-bindgen (target nodejs) exporta con `module.exports`,
// así que se requiere con `require`, no `import`, para evitar que TypeScript intente
// resolver tipos que el paquete no publica (no tiene .d.ts propios de una librería
// npm normal). Ver engine/calc-engine-wasm/README.md para cómo se genera.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wasm = require('calc_engine_wasm');

export interface ConductorSelectionResult {
  conductor: string;
  base_ampacity: number;
  temperature_factor: number;
  grouping_factor: number;
  corrected_ampacity: number;
}

export interface ComplianceFindingResult {
  rule_id: string;
  status: 'Cumple' | 'Advertencia' | 'NoCumple' | 'NoEvaluable';
  norm_reference: string;
  observation: string;
}

/**
 * Envoltura delgada de `calc-engine-wasm` (Rust compilado a WASM). Esta clase es el
 * único lugar del backend que conoce el contrato JSON del binding — el resto del
 * servicio trabaja con objetos TypeScript tipados.
 */
@Injectable()
export class CalcEngineService {
  designCurrentAmps(powerVa: number, voltage: number, threePhase: boolean): number {
    return wasm.design_current_amps(powerVa, voltage, threePhase);
  }

  continuousLoadAdjustedCurrent(designCurrent: number, isContinuous: boolean): number {
    return wasm.continuous_load_adjusted_current(designCurrent, isContinuous);
  }

  selectConductor(
    requiredAmps: number,
    insulationRating: string,
    ambientC: number,
    currentCarryingConductors: number,
  ): ConductorSelectionResult {
    const json = wasm.select_conductor(
      requiredAmps,
      insulationRating,
      ambientC,
      currentCarryingConductors,
    );
    return JSON.parse(json);
  }

  voltageDropPercent(
    currentAmps: number,
    oneWayLengthM: number,
    conductorName: string,
    threePhase: boolean,
    nominalVoltage: number,
  ): number {
    return wasm.voltage_drop_percent(
      currentAmps,
      oneWayLengthM,
      conductorName,
      threePhase,
      nominalVoltage,
    );
  }

  evaluateVoltageDrop(
    circuitName: string,
    isFeeder: boolean,
    voltageDropPercent: number,
  ): ComplianceFindingResult {
    return JSON.parse(wasm.evaluate_voltage_drop(circuitName, isFeeder, voltageDropPercent));
  }

  evaluateConductorAmpacity(
    circuitName: string,
    requiredCurrentAmps: number,
    correctedAmpacityAmps: number,
  ): ComplianceFindingResult {
    return JSON.parse(
      wasm.evaluate_conductor_ampacity(circuitName, requiredCurrentAmps, correctedAmpacityAmps),
    );
  }
}

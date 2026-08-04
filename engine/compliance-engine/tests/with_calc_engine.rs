//! Prueba de integración que conecta `calc-engine` con `compliance-engine`: reproduce
//! el escenario de `engine/calc-engine/tests/pipeline.rs` y evalúa sus resultados
//! contra las reglas de cumplimiento. Es exactamente el uso real que le daría un
//! servicio de proyectos (Sección 3.3 del plan maestro): calcular con un motor,
//! evaluar cumplimiento con el otro, sin que ninguno dependa del tipo del otro en
//! producción (solo esta prueba, como dev-dependency, une ambos).

use calc_engine::*;
use compliance_engine::*;

#[test]
fn calc_engine_results_pass_compliance_rules() {
    let loads = vec![
        Load::new("Compresor", 8_000.0, 0.88, LoadCategory::Fuerza, true),
        Load::new(
            "Banda transportadora",
            5_000.0,
            0.85,
            LoadCategory::Fuerza,
            true,
        ),
        Load::new(
            "Tablero de control",
            2_000.0,
            0.90,
            LoadCategory::Fuerza,
            false,
        ),
    ];
    let installed = installed_load_va(&loads);
    let demand = demand_load_va(installed, 0.9);
    let design_current = design_current_amps(demand, 220.0, Phases::Three);
    let required_current = continuous_load_adjusted_current(design_current, true);
    let selection =
        select_conductor_by_ampacity(required_current, ConductorMaterial::Copper, InsulationRating::C75, 35.0, 3).unwrap();

    let ampacity_finding = evaluate_conductor_ampacity(
        "Alim-Compresores",
        required_current,
        selection.corrected_ampacity,
    );
    assert_eq!(ampacity_finding.status, ComplianceStatus::Cumple);

    let vd_pct = voltage_drop_percent(
        required_current,
        25.0,
        &selection.conductor,
        K_COPPER,
        Phases::Three,
        220.0,
    );
    let vd_finding = evaluate_voltage_drop("Alim-Compresores", true, vd_pct);
    assert_eq!(vd_finding.status, ComplianceStatus::Cumple);

    let system_base = PerUnitBase::new(5_000_000.0, 220.0);
    let z_transformer = transformer_impedance_pu(4.5, 300_000.0, 220.0, system_base);
    let feeder_ohms = conductor_resistance_ohms(&selection.conductor, 25.0, K_COPPER);
    let z_feeder = conductor_impedance_pu(feeder_ohms, system_base);
    let z_total = radial_system_impedance_pu(0.0, z_transformer, z_feeder);
    let fault_current_ka = three_phase_fault_current_amps(z_total, system_base) / 1_000.0;

    let interrupting_finding =
        evaluate_interrupting_capacity("Alim-Compresores", 10.0, fault_current_ka);
    assert_eq!(interrupting_finding.status, ComplianceStatus::Cumple);
}

#[test]
fn a_deliberately_noncompliant_case_is_flagged() {
    // Circuito derivado con caída de tensión excesiva -> Advertencia, no Cumple.
    let vd_finding = evaluate_voltage_drop("Derivado-Lejano", false, 4.8);
    assert_eq!(vd_finding.status, ComplianceStatus::Advertencia);
    assert!(vd_finding.observation.contains("4.80%"));

    // Conductor insuficiente para la corriente requerida -> NoCumple.
    let ampacity_finding = evaluate_conductor_ampacity("Derivado-Lejano", 40.0, 30.0);
    assert_eq!(ampacity_finding.status, ComplianceStatus::NoCumple);
}

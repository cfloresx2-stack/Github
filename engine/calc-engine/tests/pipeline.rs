//! Prueba de integración que reproduce el pipeline de la Sección 5.3 del plan
//! maestro: carga instalada → demanda → corriente de diseño → selección de
//! conductor (con correcciones) → verificación de caída de tensión.

use calc_engine::*;

#[test]
fn full_pipeline_from_load_to_voltage_drop() {
    // Circuito derivado industrial, sistema trifásico 220 V, canalización con 3
    // conductores portadores de corriente, ambiente 35 °C, recorrido de 25 m (una
    // vía), aislamiento THHW 75 °C.
    let loads = vec![
        Load::new("Compresor", 8_000.0, 0.88, LoadCategory::Fuerza, true),
        Load::new("Banda transportadora", 5_000.0, 0.85, LoadCategory::Fuerza, true),
        Load::new("Tablero de control", 2_000.0, 0.90, LoadCategory::Fuerza, false),
    ];

    // Módulo 4.1: carga instalada.
    let installed = installed_load_va(&loads);
    assert_eq!(installed, 15_000.0);

    // Módulo 4.2: demanda. El factor de demanda ya resuelto vendría del motor
    // normativo (Sección 6); aquí se asume 0.9 para carga industrial de fuerza.
    let demand = demand_load_va(installed, 0.9);
    assert_eq!(demand, 13_500.0);

    // Módulo 4.4: corriente de diseño trifásica a 220 V.
    let design_current = design_current_amps(demand, 220.0, Phases::Three);
    assert!((design_current - 35.428).abs() < 0.01, "got {design_current}");

    // El circuito alimenta cargas continuas → 125%.
    let required_current = continuous_load_adjusted_current(design_current, true);
    assert!((required_current - 44.285).abs() < 0.01, "got {required_current}");

    // Módulos 4.5–4.6: selección de conductor con corrección por temperatura
    // ambiente (35 °C) y agrupamiento (3 conductores portadores de corriente).
    let selection = select_conductor_by_ampacity(required_current, InsulationRating::C75, 35.0, 3)
        .expect("debe existir un calibre que cumpla la ampacidad requerida");

    // Rango 31-35 °C / 75 °C → factor 0.94; ≤3 conductores → sin derate por
    // agrupamiento.
    assert_eq!(selection.temperature_factor, 0.94);
    assert_eq!(selection.grouping_factor, 1.00);
    assert!(selection.corrected_ampacity >= required_current);
    assert_eq!(selection.conductor.name, "8 AWG");

    // Sección 5.4: verificar caída de tensión con el calibre seleccionado; si
    // excediera el límite recomendado (3% en alimentador), tocaría subir de calibre.
    let vd_pct = voltage_drop_percent(
        required_current,
        25.0,
        &selection.conductor,
        K_COPPER,
        Phases::Three,
        220.0,
    );
    assert!(vd_pct < 3.0, "caída de tensión {vd_pct}% excede el 3% recomendado");

    // Módulo 4.8: selección de protección de conductor (240.4(B) — siguiente tamaño
    // estándar superior, permitido porque el circuito no alimenta tomacorrientes
    // para cargas portátiles).
    let protection_amps = conductor_protection_amps(selection.corrected_ampacity, true);
    assert_eq!(protection_amps, 50.0);

    // Verificación de capacidad interruptiva contra la falla disponible en el
    // tablero (dato que vendría del módulo de cortocircuito, aún no implementado —
    // aquí se asume un valor típico de placa de tablero de baja tensión).
    let interrupting_check = check_interrupting_capacity(22.0, 8.0);
    assert_eq!(interrupting_check, InterruptingCapacityCheck::Suficiente);

    // Coordinación básica contra el interruptor principal aguas arriba (100 A).
    let coordination = evaluate_basic_coordination(100.0, protection_amps);
    assert_eq!(coordination, Coordination::Selectiva);
}

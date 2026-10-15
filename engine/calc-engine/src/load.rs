//! Módulos 4.1–4.3 del plan maestro: carga instalada, demanda y factor de carga.

/// Categoría de carga, usada por el motor normativo (Sección 6) para resolver qué
/// factor de demanda tabular aplica antes de llamar a [`demand_load_va`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LoadCategory {
    AlumbradoGeneral,
    Fuerza,
    Motores,
    AireAcondicionado,
    Cocina,
    Otro,
}

/// Una carga individual dentro de un circuito.
#[derive(Debug, Clone)]
pub struct Load {
    pub description: String,
    /// Potencia aparente nominal en VA.
    pub power_va: f64,
    pub power_factor: f64,
    pub category: LoadCategory,
    /// Carga continua: opera a plena carga por 3 horas o más (equiv. Art. 100/210 NEC/NOM).
    pub is_continuous: bool,
}

impl Load {
    pub fn new(
        description: impl Into<String>,
        power_va: f64,
        power_factor: f64,
        category: LoadCategory,
        is_continuous: bool,
    ) -> Self {
        Self {
            description: description.into(),
            power_va,
            power_factor,
            category,
            is_continuous,
        }
    }
}

/// Carga instalada total (Módulo 4.1): suma simple de potencias nominales.
pub fn installed_load_va(loads: &[Load]) -> f64 {
    loads.iter().map(|l| l.power_va).sum()
}

/// Carga instalada agrupada por categoría, en el orden de primera aparición.
pub fn installed_load_by_category(loads: &[Load]) -> Vec<(LoadCategory, f64)> {
    let mut totals: Vec<(LoadCategory, f64)> = Vec::new();
    for load in loads {
        match totals.iter_mut().find(|(c, _)| *c == load.category) {
            Some(entry) => entry.1 += load.power_va,
            None => totals.push((load.category, load.power_va)),
        }
    }
    totals
}

/// Demanda (Módulo 4.2): aplica un factor de demanda ya resuelto a la carga instalada.
///
/// El catálogo de factores de demanda tabulares de la NOM-001-SEDE (equivalente a las
/// tablas 220.42/220.44 NEC) depende del tipo de ocupación y vive en el motor normativo
/// (Sección 6 del plan maestro) — este motor de cálculo se mantiene desacoplado de ese
/// catálogo y solo aplica el factor ya resuelto.
pub fn demand_load_va(installed_va: f64, demand_factor: f64) -> f64 {
    installed_va * demand_factor
}

/// Factor de carga (Módulo 4.3): consumo promedio del periodo entre demanda máxima.
///
/// `energy_kwh` es el consumo en el periodo, `period_hours` su duración y
/// `peak_demand_kw` la demanda máxima registrada en ese periodo.
pub fn load_factor(energy_kwh: f64, period_hours: f64, peak_demand_kw: f64) -> f64 {
    let average_kw = energy_kwh / period_hours;
    average_kw / peak_demand_kw
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn installed_load_sums_all_loads() {
        let loads = vec![
            Load::new("Motor 1", 3730.0, 0.86, LoadCategory::Motores, false),
            Load::new(
                "Iluminación",
                1200.0,
                0.95,
                LoadCategory::AlumbradoGeneral,
                true,
            ),
        ];
        assert_eq!(installed_load_va(&loads), 4930.0);
    }

    #[test]
    fn installed_load_by_category_groups_correctly() {
        let loads = vec![
            Load::new("Motor 1", 1000.0, 0.86, LoadCategory::Motores, false),
            Load::new("Motor 2", 500.0, 0.86, LoadCategory::Motores, false),
            Load::new(
                "Iluminación",
                1200.0,
                0.95,
                LoadCategory::AlumbradoGeneral,
                true,
            ),
        ];
        let totals = installed_load_by_category(&loads);
        assert_eq!(totals.len(), 2);
        assert_eq!(totals[0], (LoadCategory::Motores, 1500.0));
        assert_eq!(totals[1], (LoadCategory::AlumbradoGeneral, 1200.0));
    }

    #[test]
    fn demand_load_applies_factor() {
        assert_eq!(demand_load_va(10_000.0, 0.65), 6_500.0);
    }

    #[test]
    fn load_factor_matches_definition() {
        // 720,000 kWh en 720 h (30 días) con demanda pico de 1,200 kW.
        let lf = load_factor(720_000.0, 720.0, 1_200.0);
        assert!((lf - (1000.0 / 1200.0)).abs() < 1e-9);
    }
}

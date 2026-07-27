//! Módulo 4.7: llenado de ductos/canalizaciones.
//!
//! Implementa la regla de porcentaje de llenado (equiv. NEC Chapter 9, Table 1) y la
//! comparación de áreas.
//!
//! **No implementado:** las tablas de área transversal de conductor por tipo de
//! aislamiento (THHN, XHHW, etc.) ni las tablas de área interna por tipo y calibre
//! de canalización (EMT, PVC, RMC, LFMC...). Son decenas de filas por tabla — el
//! mismo tipo de dato que salió desalineado al extraer texto de los PDF de
//! referencia (ver aviso en `lib.rs`) — y el riesgo de reproducir un valor
//! incorrecto de memoria es alto. Estas áreas deben tomarse de la tabla oficial
//! (NOM-001-SEDE-2018 Capítulo 9 o catálogo de fabricante) y pasarse como parámetro
//! a las funciones de este módulo, no embeberse aquí.

/// Porcentaje máximo de llenado permitido según el número de conductores en la
/// canalización (equiv. NEC Chapter 9, Table 1: 1 conductor 53%, 2 conductores 31%,
/// 3 o más 40%).
pub fn max_fill_percent(conductor_count: u32) -> f64 {
    match conductor_count {
        0 => 0.0,
        1 => 0.53,
        2 => 0.31,
        _ => 0.40,
    }
}

/// Área interna utilizable de la canalización para el número de conductores dado.
pub fn usable_conduit_area_sq_in(conduit_internal_area_sq_in: f64, conductor_count: u32) -> f64 {
    conduit_internal_area_sq_in * max_fill_percent(conductor_count)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConduitFillCheck {
    Cumple,
    Excedido,
}

/// Compara el área total ocupada por los conductores (suma de las áreas
/// individuales, incluyendo el conductor de tierra si aplica) contra el área
/// utilizable de la canalización (Módulo 4.7).
pub fn check_conduit_fill(
    total_conductor_area_sq_in: f64,
    conduit_internal_area_sq_in: f64,
    conductor_count: u32,
) -> ConduitFillCheck {
    let usable = usable_conduit_area_sq_in(conduit_internal_area_sq_in, conductor_count);
    if total_conductor_area_sq_in <= usable {
        ConduitFillCheck::Cumple
    } else {
        ConduitFillCheck::Excedido
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn max_fill_percent_matches_table() {
        assert_eq!(max_fill_percent(1), 0.53);
        assert_eq!(max_fill_percent(2), 0.31);
        assert_eq!(max_fill_percent(3), 0.40);
        assert_eq!(max_fill_percent(10), 0.40);
    }

    #[test]
    fn usable_area_applies_percent() {
        assert!((usable_conduit_area_sq_in(0.5, 3) - 0.2).abs() < 1e-9);
    }

    #[test]
    fn check_conduit_fill_passes_within_limit() {
        assert_eq!(check_conduit_fill(0.15, 0.5, 3), ConduitFillCheck::Cumple);
    }

    #[test]
    fn check_conduit_fill_fails_over_limit() {
        assert_eq!(check_conduit_fill(0.25, 0.5, 3), ConduitFillCheck::Excedido);
    }
}

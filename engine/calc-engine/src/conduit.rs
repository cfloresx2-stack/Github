//! Módulo 4.7: llenado de ductos/canalizaciones.
//!
//! Implementa la regla de porcentaje de llenado y la comparación de áreas.
//! `max_fill_percent` **✅ validado contra la Tabla 1 del Capítulo 10 de la
//! NOM-001-SEDE-2018 oficial** (nota: en la NOM esta tabla vive en el Capítulo 10,
//! no en el 9 como en el NEC) — coincide exactamente: 1 conductor 53%, 2
//! conductores 31%, más de 2 conductores 40%.
//!
//! **✅ Tablas de área añadidas y validadas contra la NOM-001-SEDE-2018 oficial**:
//! área transversal de conductor aislado por familia de aislamiento (Tabla 5:
//! `THHN_AREA_MM2`, `THW_AREA_MM2`, `XHHW_AREA_MM2`) y área interna utilizable de
//! canalización por tipo y tamaño comercial (Tabla 4: `EMT_SIZES`, `PVC_SCH40_SIZES`,
//! `RMC_SIZES`). Todas en mm² -- unidad nativa de ambas tablas en la NOM.
//!
//! **Alcance limitado a propósito:** de los ~14 tipos de canalización de la Tabla 4
//! y las ~10 familias de aislamiento de la Tabla 5, solo se incluyen los 3 tipos de
//! tubería y las 3 familias de aislamiento más usadas en instalaciones eléctricas
//! típicas en México (EMT, PVC Cédula 40, RMC / THHN-THWN-2, THW-THHW-TW,
//! XHHW-XHHW-2). El resto queda pendiente -- mismo criterio que el resto de este
//! módulo: mejor no cubrir un caso que reproducir un valor mal transcrito.
//!
//! Los tamaños comerciales de tubería llegan hasta 4" -- alimentadores/circuitos
//! derivados que requieran una tubería mayor (servicios grandes, arreglos de barras)
//! quedan fuera de esta versión.
//!
//! **Simplificación asumida:** `select_conduit_size` asume que todos los
//! conductores dentro de la tubería son del mismo calibre (fases + neutro). En la
//! práctica el conductor de puesta a tierra suele ser de calibre menor -- esta
//! simplificación es conservadora (sobreestima el área ocupada, nunca la
//! subestima), así que el tamaño de tubería recomendado puede quedar un punto por
//! arriba del mínimo real, nunca por debajo.

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

/// Área transversal aproximada (mm²) de un conductor aislado tipo THHN/THWN/THWN-2
/// -- la familia de aislamiento más usada en instalaciones entubadas. Mismos 18
/// calibres y mismo orden que `crate::conductor::COPPER_CONDUCTORS` /
/// `ALUMINUM_CONDUCTORS` (el área de la Tabla 5 depende del calibre AWG/kcmil y del
/// tipo de aislamiento, no del material del conductor).
pub const THHN_AREA_MM2: &[(&str, f64)] = &[
    ("14 AWG", 6.258),
    ("12 AWG", 8.581),
    ("10 AWG", 13.61),
    ("8 AWG", 23.61),
    ("6 AWG", 32.71),
    ("4 AWG", 53.16),
    ("3 AWG", 62.77),
    ("2 AWG", 74.71),
    ("1 AWG", 100.8),
    ("1/0 AWG", 119.7),
    ("2/0 AWG", 143.4),
    ("3/0 AWG", 172.8),
    ("4/0 AWG", 208.8),
    ("250 kcmil", 256.1),
    ("300 kcmil", 297.3),
    ("350 kcmil", 338.2),
    ("400 kcmil", 378.3),
    ("500 kcmil", 456.3),
];

/// Área transversal aproximada (mm²) de un conductor aislado tipo TW/THW/THHW/THW-2
/// -- familia de 75 °C de uso general.
pub const THW_AREA_MM2: &[(&str, f64)] = &[
    ("14 AWG", 8.968),
    ("12 AWG", 11.68),
    ("10 AWG", 15.68),
    ("8 AWG", 28.19),
    ("6 AWG", 46.84),
    ("4 AWG", 62.77),
    ("3 AWG", 73.16),
    ("2 AWG", 86.00),
    ("1 AWG", 122.60),
    ("1/0 AWG", 143.40),
    ("2/0 AWG", 169.30),
    ("3/0 AWG", 201.10),
    ("4/0 AWG", 239.90),
    ("250 kcmil", 296.50),
    ("300 kcmil", 340.70),
    ("350 kcmil", 384.40),
    ("400 kcmil", 427.00),
    ("500 kcmil", 509.70),
];

/// Área transversal aproximada (mm²) de un conductor aislado tipo XHHW/XHHW-2/XHH.
pub const XHHW_AREA_MM2: &[(&str, f64)] = &[
    ("14 AWG", 8.968),
    ("12 AWG", 11.68),
    ("10 AWG", 15.68),
    ("8 AWG", 28.19),
    ("6 AWG", 38.06),
    ("4 AWG", 52.52),
    ("3 AWG", 62.06),
    ("2 AWG", 73.94),
    ("1 AWG", 98.97),
    ("1/0 AWG", 117.7),
    ("2/0 AWG", 141.3),
    ("3/0 AWG", 170.5),
    ("4/0 AWG", 206.3),
    ("250 kcmil", 251.9),
    ("300 kcmil", 292.6),
    ("350 kcmil", 333.3),
    ("400 kcmil", 373.0),
    ("500 kcmil", 450.6),
];

/// Familia de aislamiento del conductor, para efectos de área transversal (Tabla 5).
/// Independiente de `InsulationRating` (60/75/90 °C), que rige la ampacidad -- un
/// mismo conductor puede tener temperatura nominal 90 °C y pertenecer a la familia
/// THHN, por ejemplo.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InsulationFamily {
    Thhn,
    Thw,
    Xhhw,
}

/// Área transversal del conductor dado, según su familia de aislamiento.
pub fn conductor_area_mm2(conductor_name: &str, family: InsulationFamily) -> Option<f64> {
    let table = match family {
        InsulationFamily::Thhn => THHN_AREA_MM2,
        InsulationFamily::Thw => THW_AREA_MM2,
        InsulationFamily::Xhhw => XHHW_AREA_MM2,
    };
    table
        .iter()
        .find(|(name, _)| *name == conductor_name)
        .map(|(_, area)| *area)
}

/// Tipo de canalización (Tabla 4). Ver el comentario de cabecera del módulo para el
/// criterio de qué tipos se incluyen.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConduitType {
    /// Artículo 358 -- tubo conduit metálico eléctrico.
    Emt,
    /// Artículos 352/353 -- tubo conduit rígido de PVC, Cédula 40.
    PvcSch40,
    /// Artículo 344 -- tubo conduit metálico pesado.
    Rmc,
}

struct ConduitSizeRow {
    trade_size: &'static str,
    usable_1_conductor_mm2: f64,
    usable_2_conductors_mm2: f64,
    usable_over_2_conductors_mm2: f64,
}

impl ConduitSizeRow {
    fn usable_area_mm2(&self, conductor_count: u32) -> f64 {
        match conductor_count {
            0 => 0.0,
            1 => self.usable_1_conductor_mm2,
            2 => self.usable_2_conductors_mm2,
            _ => self.usable_over_2_conductors_mm2,
        }
    }
}

// Las tres columnas de área utilizable (1 / 2 / más de 2 conductores) se toman
// directamente de la Tabla 4 de la NOM -- ya vienen con el % de relleno aplicado,
// no se recalculan aquí a partir del área total para no introducir redondeos
// distintos a los de la tabla oficial.
const EMT_SIZES: &[ConduitSizeRow] = &[
    ConduitSizeRow { trade_size: "1/2\"", usable_1_conductor_mm2: 104.0, usable_2_conductors_mm2: 61.0, usable_over_2_conductors_mm2: 78.0 },
    ConduitSizeRow { trade_size: "3/4\"", usable_1_conductor_mm2: 182.0, usable_2_conductors_mm2: 106.0, usable_over_2_conductors_mm2: 137.0 },
    ConduitSizeRow { trade_size: "1\"", usable_1_conductor_mm2: 295.0, usable_2_conductors_mm2: 172.0, usable_over_2_conductors_mm2: 222.0 },
    ConduitSizeRow { trade_size: "1-1/4\"", usable_1_conductor_mm2: 513.0, usable_2_conductors_mm2: 300.0, usable_over_2_conductors_mm2: 387.0 },
    ConduitSizeRow { trade_size: "1-1/2\"", usable_1_conductor_mm2: 696.0, usable_2_conductors_mm2: 407.0, usable_over_2_conductors_mm2: 526.0 },
    ConduitSizeRow { trade_size: "2\"", usable_1_conductor_mm2: 1147.0, usable_2_conductors_mm2: 671.0, usable_over_2_conductors_mm2: 866.0 },
    ConduitSizeRow { trade_size: "2-1/2\"", usable_1_conductor_mm2: 2005.0, usable_2_conductors_mm2: 1173.0, usable_over_2_conductors_mm2: 1513.0 },
    ConduitSizeRow { trade_size: "3\"", usable_1_conductor_mm2: 3022.0, usable_2_conductors_mm2: 1767.0, usable_over_2_conductors_mm2: 2280.0 },
    ConduitSizeRow { trade_size: "3-1/2\"", usable_1_conductor_mm2: 3949.0, usable_2_conductors_mm2: 2310.0, usable_over_2_conductors_mm2: 2980.0 },
    ConduitSizeRow { trade_size: "4\"", usable_1_conductor_mm2: 5046.0, usable_2_conductors_mm2: 2951.0, usable_over_2_conductors_mm2: 3808.0 },
];

const PVC_SCH40_SIZES: &[ConduitSizeRow] = &[
    ConduitSizeRow { trade_size: "1/2\"", usable_1_conductor_mm2: 97.0, usable_2_conductors_mm2: 57.0, usable_over_2_conductors_mm2: 74.0 },
    ConduitSizeRow { trade_size: "3/4\"", usable_1_conductor_mm2: 173.0, usable_2_conductors_mm2: 101.0, usable_over_2_conductors_mm2: 131.0 },
    ConduitSizeRow { trade_size: "1\"", usable_1_conductor_mm2: 284.0, usable_2_conductors_mm2: 166.0, usable_over_2_conductors_mm2: 214.0 },
    ConduitSizeRow { trade_size: "1-1/4\"", usable_1_conductor_mm2: 495.0, usable_2_conductors_mm2: 290.0, usable_over_2_conductors_mm2: 374.0 },
    ConduitSizeRow { trade_size: "1-1/2\"", usable_1_conductor_mm2: 679.0, usable_2_conductors_mm2: 397.0, usable_over_2_conductors_mm2: 513.0 },
    ConduitSizeRow { trade_size: "2\"", usable_1_conductor_mm2: 1126.0, usable_2_conductors_mm2: 658.0, usable_over_2_conductors_mm2: 849.0 },
    ConduitSizeRow { trade_size: "2-1/2\"", usable_1_conductor_mm2: 1605.0, usable_2_conductors_mm2: 939.0, usable_over_2_conductors_mm2: 1212.0 },
    ConduitSizeRow { trade_size: "3\"", usable_1_conductor_mm2: 2487.0, usable_2_conductors_mm2: 1455.0, usable_over_2_conductors_mm2: 1877.0 },
    ConduitSizeRow { trade_size: "3-1/2\"", usable_1_conductor_mm2: 3327.0, usable_2_conductors_mm2: 1946.0, usable_over_2_conductors_mm2: 2511.0 },
    ConduitSizeRow { trade_size: "4\"", usable_1_conductor_mm2: 4288.0, usable_2_conductors_mm2: 2508.0, usable_over_2_conductors_mm2: 3237.0 },
];

const RMC_SIZES: &[ConduitSizeRow] = &[
    ConduitSizeRow { trade_size: "1/2\"", usable_1_conductor_mm2: 108.0, usable_2_conductors_mm2: 63.0, usable_over_2_conductors_mm2: 81.0 },
    ConduitSizeRow { trade_size: "3/4\"", usable_1_conductor_mm2: 187.0, usable_2_conductors_mm2: 109.0, usable_over_2_conductors_mm2: 141.0 },
    ConduitSizeRow { trade_size: "1\"", usable_1_conductor_mm2: 303.0, usable_2_conductors_mm2: 177.0, usable_over_2_conductors_mm2: 229.0 },
    ConduitSizeRow { trade_size: "1-1/4\"", usable_1_conductor_mm2: 522.0, usable_2_conductors_mm2: 305.0, usable_over_2_conductors_mm2: 394.0 },
    ConduitSizeRow { trade_size: "1-1/2\"", usable_1_conductor_mm2: 707.0, usable_2_conductors_mm2: 413.0, usable_over_2_conductors_mm2: 533.0 },
    ConduitSizeRow { trade_size: "2\"", usable_1_conductor_mm2: 1165.0, usable_2_conductors_mm2: 681.0, usable_over_2_conductors_mm2: 879.0 },
    ConduitSizeRow { trade_size: "2-1/2\"", usable_1_conductor_mm2: 1663.0, usable_2_conductors_mm2: 972.0, usable_over_2_conductors_mm2: 1255.0 },
    ConduitSizeRow { trade_size: "3\"", usable_1_conductor_mm2: 2565.0, usable_2_conductors_mm2: 1500.0, usable_over_2_conductors_mm2: 1936.0 },
    ConduitSizeRow { trade_size: "3-1/2\"", usable_1_conductor_mm2: 3424.0, usable_2_conductors_mm2: 2003.0, usable_over_2_conductors_mm2: 2584.0 },
    ConduitSizeRow { trade_size: "4\"", usable_1_conductor_mm2: 4408.0, usable_2_conductors_mm2: 2578.0, usable_over_2_conductors_mm2: 3326.0 },
];

fn sizes_for(conduit_type: ConduitType) -> &'static [ConduitSizeRow] {
    match conduit_type {
        ConduitType::Emt => EMT_SIZES,
        ConduitType::PvcSch40 => PVC_SCH40_SIZES,
        ConduitType::Rmc => RMC_SIZES,
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct ConduitSelection {
    pub conduit_type: ConduitType,
    pub trade_size: &'static str,
    pub usable_area_mm2: f64,
    pub required_area_mm2: f64,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ConduitSizeError {
    /// El calibre no está en la tabla de áreas de la familia de aislamiento pedida.
    UnknownConductor { name: String },
    /// Ningún tamaño comercial (hasta 4") de este tipo de tubería alcanza a
    /// contener los conductores dados con el % de relleno permitido.
    NoSizeFits { required_area_mm2: f64 },
}

/// Selecciona el tamaño comercial más económico de `conduit_type` cuya área
/// utilizable (según el % de relleno que corresponde a `conductor_count`, Tabla 1
/// Capítulo 10) alcanza para los conductores dados -- todos del mismo calibre
/// `conductor_name` y familia de aislamiento `family` (ver la limitación
/// documentada en la cabecera del módulo sobre el conductor de tierra).
pub fn select_conduit_size(
    conductor_name: &str,
    family: InsulationFamily,
    conductor_count: u32,
    conduit_type: ConduitType,
) -> Result<ConduitSelection, ConduitSizeError> {
    let area_per_conductor = conductor_area_mm2(conductor_name, family).ok_or_else(|| {
        ConduitSizeError::UnknownConductor {
            name: conductor_name.to_string(),
        }
    })?;
    let required_area_mm2 = area_per_conductor * conductor_count as f64;

    sizes_for(conduit_type)
        .iter()
        .find(|row| row.usable_area_mm2(conductor_count) >= required_area_mm2)
        .map(|row| ConduitSelection {
            conduit_type,
            trade_size: row.trade_size,
            usable_area_mm2: row.usable_area_mm2(conductor_count),
            required_area_mm2,
        })
        .ok_or(ConduitSizeError::NoSizeFits { required_area_mm2 })
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

    #[test]
    fn conductor_area_matches_nom_tabla_5() {
        // 8 AWG THHN: 23.61 mm² (Tabla 5, cruzado contra el valor conocido de NEC
        // Table 5 en in² -- 0.0366 in² x 645.16 = 23.61 mm²).
        assert_eq!(conductor_area_mm2("8 AWG", InsulationFamily::Thhn), Some(23.61));
        assert_eq!(conductor_area_mm2("14 AWG", InsulationFamily::Thw), Some(8.968));
        assert_eq!(conductor_area_mm2("500 kcmil", InsulationFamily::Xhhw), Some(450.6));
        assert_eq!(conductor_area_mm2("6 AWG", InsulationFamily::Thhn).is_some(), true);
        assert_eq!(conductor_area_mm2("no existe", InsulationFamily::Thhn), None);
    }

    #[test]
    fn select_conduit_size_picks_smallest_that_fits() {
        // 3 conductores 8 AWG THHN en EMT: área requerida = 3 x 23.61 = 70.83 mm².
        // 1/2" EMT (más de 2 conductores, 40%) tiene 78 mm² utilizables -- alcanza.
        let selection =
            select_conduit_size("8 AWG", InsulationFamily::Thhn, 3, ConduitType::Emt).unwrap();
        assert_eq!(selection.trade_size, "1/2\"");
        assert!((selection.required_area_mm2 - 70.83).abs() < 1e-6);
        assert_eq!(selection.usable_area_mm2, 78.0);
    }

    #[test]
    fn select_conduit_size_steps_up_for_more_conductors() {
        // 12 conductores 4/0 AWG THHN (208.8 mm² c/u) requieren 2505.6 mm² --
        // ninguna tubería de 1/2" a 2" en EMT alcanza; debe subir a un tamaño mayor.
        let selection =
            select_conduit_size("4/0 AWG", InsulationFamily::Thhn, 12, ConduitType::Emt).unwrap();
        assert!(selection.usable_area_mm2 >= selection.required_area_mm2);
        assert_ne!(selection.trade_size, "1/2\"");
    }

    #[test]
    fn select_conduit_size_unknown_conductor_errors() {
        let err =
            select_conduit_size("6 AWG raro", InsulationFamily::Thhn, 3, ConduitType::Emt)
                .unwrap_err();
        assert!(matches!(err, ConduitSizeError::UnknownConductor { .. }));
    }

    #[test]
    fn select_conduit_size_no_fit_errors_when_conductors_too_large_or_many() {
        // 40 conductores de 500 kcmil no caben en ningún tamaño hasta 4" de PVC
        // Cédula 40 de este catálogo.
        let err = select_conduit_size(
            "500 kcmil",
            InsulationFamily::Thhn,
            40,
            ConduitType::PvcSch40,
        )
        .unwrap_err();
        assert!(matches!(err, ConduitSizeError::NoSizeFits { .. }));
    }
}

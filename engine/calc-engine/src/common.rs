//! Tipos compartidos entre módulos del motor de cálculo.

/// Número de fases del circuito o sistema evaluado.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phases {
    Single,
    Three,
}

# Plan Maestro — Plataforma de Diseño y Cálculo Eléctrico Industrial
### Conforme a NOM-001-SEDE-2018 · iPhone · iPad · Mac · Web

**Equipo autor (roles simulados):** Dirección de Producto · Arquitectura de Software · Ingeniería Eléctrica (NOM-001-SEDE) · Protección y Coordinación · Sistemas de Potencia · UX/UI · Consultoría SaaS/Fintech · App Store · IA aplicada a Ingeniería

**Referencias técnicas base:** NOM-001-SEDE-2018 (Instalaciones Eléctricas), *Ugly's Electrical Reference*, tablas y metodologías de cálculo de carga, conductores, protecciones y puesta a tierra derivadas de dichas fuentes.

**Nombre de trabajo:** **ElectraNOM** *(placeholder — pendiente de validación de marca/disponibilidad)*

---

## Índice

1. Resumen Ejecutivo
2. Estudio de Mercado
3. Arquitectura de Producto
4. Diseño Funcional
5. Motor de Cálculo Eléctrico
6. Motor Normativo
7. Inteligencia Artificial
8. Diseño UX/UI
9. Base de Datos
10. MVP
11. Roadmap
12. Modelo de Negocio
13. App Store
14. Análisis Financiero
15. Ventajas Competitivas
16. Especificación Técnica para Desarrolladores

---

## Sección 1. Resumen Ejecutivo

### 1.1 Problema que resuelve

El diseño eléctrico industrial en México y Latinoamérica se realiza hoy con una combinación fragmentada de:

- Hojas de cálculo de Excel hechas a mano, sin trazabilidad normativa ni control de versiones.
- Software de potencia de origen extranjero (ETAP, EasyPower, SKM, CYME) diseñado para el mercado de EE. UU./Europa, con **licencias de USD 3,000–15,000/año**, curva de aprendizaje alta y nula referencia nativa a la NOM-001-SEDE.
- AutoCAD Electrical para diagramas, sin motor de cálculo normativo integrado.
- Memorias de cálculo redactadas manualmente en Word, propensas a errores humanos y sin verificación cruzada de cumplimiento normativo.
- Verificación de cumplimiento NOM realizada de forma manual, artículo por artículo, por el propio ingeniero o por la Unidad de Verificación (UVIE), con alto riesgo de observaciones, retrabajos y retrasos de obra.

El resultado: **ciclos de ingeniería lentos, riesgo de incumplimiento normativo, costos de licenciamiento altos y falta de una herramienta pensada en español, para la NOM-001-SEDE y para el flujo de trabajo del ingeniero eléctrico latinoamericano.**

### 1.2 Oportunidad de mercado

No existe hoy una plataforma nativa multiplataforma (iOS/iPadOS/macOS/Web) que combine:

1. Motor de cálculo eléctrico completo (carga, demanda, conductores, protecciones, cortocircuito, tierra física, factor de potencia).
2. Motor normativo NOM-001-SEDE-2018 con trazabilidad artículo-por-artículo.
3. Generación automática de memoria de cálculo y diagramas unifilares/trifilares.
4. Un asistente de IA especializado en la norma mexicana.

Este vacío, combinado con la obligatoriedad legal de cumplimiento NOM-001-SEDE para todo proyecto industrial, comercial y residencial de mediana/alta tensión en México, representa una oportunidad de mercado clara y defendible (ver Sección 2).

### 1.3 Propuesta de valor

> **"Diseña, calcula, valida y documenta instalaciones eléctricas conforme a la NOM-001-SEDE en una fracción del tiempo, con la confianza de un motor normativo que audita cada resultado."**

- **Velocidad:** de días a horas en la generación de memorias de cálculo.
- **Cumplimiento garantizado:** cada resultado queda vinculado al artículo NOM que lo sustenta.
- **Nativo Apple + Web:** continuidad de trabajo entre campo (iPhone/iPad) y oficina (Mac/Web).
- **IA especializada:** un copiloto que conoce la norma, no un chatbot genérico.
- **Modelo SaaS accesible:** fracción del costo de ETAP/EasyPower, con plan gratuito/individual de entrada.

### 1.4 Beneficios por tipo de usuario

| Usuario | Beneficio principal |
|---|---|
| Ingeniero proyectista | Reduce tiempo de cálculo y redacción de memorias en 70–90% |
| Contratista eléctrico | Cuantifica materiales y genera specs de compra automáticamente |
| Supervisor de obra | Verifica cumplimiento NOM in situ desde iPhone/iPad |
| Unidad Verificadora (UV) | Recibe evidencia técnica trazable, reduce tiempo de revisión |
| Responsable de mantenimiento | Accede a diagramas y memorias históricas versionadas |
| Empresa EPC | Estandariza el proceso de ingeniería eléctrica entre proyectos |
| Estudiante de ingeniería | Aprende con un motor que explica el "por qué" normativo de cada cálculo |

### 1.5 Diferenciadores clave

1. Único motor de cálculo con **trazabilidad normativa NOM-001-SEDE nativa** (no traducción de un producto extranjero).
2. Experiencia **multiplataforma real** (no solo "app móvil de un producto de escritorio").
3. **IA experta en la norma**, no un LLM genérico sin contexto normativo.
4. Generación automática de **memoria de cálculo + diagramas + cuantificación de materiales** en un solo flujo.
5. Modelo de precios accesible al mercado latinoamericano (vs. licencias de software de potencia internacional).

---

## Sección 2. Estudio de Mercado

### 2.1 Tamaño de mercado (estimación top-down / bottom-up)

| Segmento | Estimación | Fuente/metodología |
|---|---|---|
| Ingenieros eléctricos activos en México | ~120,000–150,000 (colegios + cédula profesional área eléctrica) | Estimación bottom-up sobre matrícula IEEE México / colegios de ingenieros |
| Empresas EPC / contratistas eléctricos industriales en México | ~8,000–12,000 | Directorios CANAME, CANACINTRA |
| Mercado direccionable (SAM) México (usuarios que pagarían licencia profesional) | 15,000–25,000 usuarios potenciales | Ingenieros + contratistas + EPC con proyectos industriales activos |
| Mercado latinoamericano ampliado (Colombia, Perú, Chile, Centroamérica — normas NEC-derivadas o compatibles) | 3–4x el tamaño de México en usuarios potenciales | Extrapolación por población industrial relativa |
| Ticket promedio anual objetivo | USD 240–1,200/usuario/año | Basado en modelo de precios (Sección 12) |
| **TAM estimado (LatAm, 5 años)** | **USD 25–60 M ARR potencial** | SAM × penetración esperada 8–15% a 5 años |

> Nota metodológica: cifras son estimaciones direccionales para plan de negocio, no datos censales verificados; se recomienda validar con encuesta primaria a colegios de ingenieros y cámaras (CANAME, CFE, colegios estatales) durante la fase de validación de mercado (Sección 10).

### 2.2 Mercado mexicano — contexto regulatorio

- La NOM-001-SEDE es de **cumplimiento obligatorio** para instalaciones eléctricas en México, verificada por Unidades de Verificación de Instalaciones Eléctricas (UVIE) acreditadas ante la CONUEE/EMA.
- Todo proyecto industrial, comercial de mediana tensión, y gran parte de obra pública requiere dictamen de cumplimiento NOM antes de energización por CFE.
- Esto crea una **demanda estructural y recurrente**, no dependiente de ciclos económicos: mientras haya construcción industrial, hay obligación de cumplimiento NOM.

### 2.3 Mercado latinoamericano

- Colombia (RETIE), Perú (Código Nacional de Electricidad), Chile (SEC/NCH), y Centroamérica comparten bases técnicas similares a NEC/NOM (caída de tensión, factores de demanda, dimensionamiento de conductores).
- Estrategia de expansión: **arquitectura de "motor normativo" desacoplada del contenido de la norma** (Sección 6), permitiendo agregar RETIE, CNE, etc. como módulos adicionales sin rediseñar el producto.

### 2.4 Competidores y comparación

| Producto | Origen | Enfoque | Precio aprox./año | Cobertura NOM-001-SEDE nativa | Plataformas | IA integrada |
|---|---|---|---|---|---|---|
| **ETAP** | EE. UU. | Análisis de sistemas de potencia (flujo de carga, cortocircuito, arco eléctrico) | USD 5,000–15,000+ | No | Windows | No |
| **EasyPower** | EE. UU. | Cortocircuito, coordinación, arc-flash | USD 3,000–8,000 | No | Windows | No |
| **SKM Power Tools** | EE. UU. | Análisis de potencia, coordinación de protecciones | USD 4,000–10,000 | No | Windows | No |
| **CYME** | Canadá | Distribución de potencia, redes | USD 5,000+ | No | Windows | No |
| **AutoCAD Electrical** | EE. UU. | Diagramación eléctrica (CAD), no cálculo normativo | USD 2,300+ | No | Windows | No |
| **Caneco** | Francia | Diseño BT/MT, cálculo de cortocircuito | USD 2,000–6,000 | Parcial (normas IEC) | Windows | No |
| **Dialux** | Alemania | Diseño de iluminación (no cálculo de instalaciones de potencia) | Gratuito/freemium | No | Windows/Web | No |
| **ElectraNOM (propuesto)** | México/LatAm | Diseño integral NOM-001-SEDE + IA + multiplataforma Apple/Web | USD 240–1,200 | **Sí, nativo** | **iPhone/iPad/Mac/Web** | **Sí, experta en NOM** |

### 2.5 Ventajas competitivas identificadas

1. **Barrera de entrada baja para el usuario final** (precio, idioma, curva de aprendizaje) vs. barrera de entrada alta en réplica del producto (motor normativo + IA especializada + certificación técnica del contenido).
2. Ningún competidor internacional prioriza NOM-001-SEDE como núcleo del producto — todos son "traducciones" de normas IEC/NEC genéricas.
3. Presencia móvil real (iPhone/iPad) inexistente en la competencia, relevante para supervisión de obra en campo.

### 2.6 Oportunidades de crecimiento

- Expansión a normas RETIE (Colombia), NEC (mercado hispano en EE. UU.), CNE (Perú).
- Venta B2B a Unidades Verificadoras (dictamen digital estandarizado).
- Marketplace de plantillas de proyecto por industria (petroquímica, automotriz, alimentos).
- Certificación/partnership con colegios de ingenieros y universidades (canal educativo).

---

## Sección 3. Arquitectura de Producto

### 3.1 Visión de arquitectura (alto nivel)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTES (Frontend)                        │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────────────┐   │
│  │  iPhone   │ │   iPad    │ │    Mac    │ │        Web         │   │
│  │ SwiftUI   │ │ SwiftUI   │ │ SwiftUI   │ │  React/Next.js     │   │
│  │ (native)  │ │ (native)  │ │ (Catalyst)│ │  (TypeScript)      │   │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └──────────┬─────────┘   │
└────────┼─────────────┼─────────────┼──────────────────┼─────────────┘
         │             │             │                  │
         └─────────────┴──────┬──────┴──────────────────┘
                               │  HTTPS / GraphQL + REST + WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY / BFF                           │
│         Auth (OAuth2/OIDC) · Rate limiting · Versionado API         │
└───────────────────────────────┬───────────────────────────────────────┘
                                 │
     ┌───────────────┬──────────┼───────────────┬───────────────────┐
     ▼               ▼          ▼               ▼                   ▼
┌─────────┐   ┌──────────────┐ ┌──────────┐ ┌───────────────┐ ┌────────────┐
│Proyectos│   │Motor de      │ │Motor     │ │IA / Asistente │ │Documentos  │
│Servicio │   │Cálculo       │ │Normativo │ │Experto (RAG)  │ │& Reportes  │
│(CRUD,   │   │Eléctrico     │ │NOM-001   │ │               │ │(PDF/Excel/ │
│versiones│   │(Node/Python) │ │-SEDE     │ │               │ │diagramas)  │
└────┬────┘   └──────┬───────┘ └────┬─────┘ └──────┬────────┘ └─────┬──────┘
     │               │               │              │                │
     └───────────────┴───────┬───────┴──────────────┴────────────────┘
                              ▼
                  ┌───────────────────────────┐
                  │   CAPA DE DATOS            │
                  │  PostgreSQL (transaccional)│
                  │  Vector DB (embeddings NOM)│
                  │  Object Storage (S3-compat)│
                  │  Redis (cache/sesión)      │
                  └───────────────────────────┘
                              │
                  ┌───────────────────────────┐
                  │  SERVICIOS EXTERNOS        │
                  │  - LLM Provider (Claude)   │
                  │  - Firma digital (e.firma/ │
                  │    DocuSign)               │
                  │  - Pagos (Stripe/Conekta)  │
                  │  - Notificaciones (SNS/APN)│
                  │  - Nube (AWS/GCP)          │
                  └───────────────────────────┘
```

### 3.2 Frontend

- **iOS/iPadOS/macOS:** Swift + SwiftUI, código compartido vía módulos (Swift Package Manager). macOS vía Catalyst o SwiftUI nativo multiplataforma para maximizar reutilización de UI y lógica de presentación.
- **Web:** React + Next.js + TypeScript, con la misma capa de dominio (cálculo/validación) reimplementada o compartida vía WebAssembly (evaluar compilar el motor de cálculo en un lenguaje compartible, ver 3.5).
- Diseño responsivo con **design system unificado** (tokens compartidos Figma → SwiftUI + Web).

### 3.3 Backend

- **Arquitectura de microservicios modulares** (no monolito, pero tampoco sobre-fragmentado en MVP — ver Sección 10):
  - `projects-service`: gestión de proyectos, versiones, documentos.
  - `calc-engine-service`: motor de cálculo eléctrico (Sección 5).
  - `compliance-engine-service`: motor normativo NOM (Sección 6).
  - `ai-assistant-service`: orquestación IA/RAG (Sección 7).
  - `reporting-service`: generación PDF/Excel/diagramas.
  - `billing-service`: suscripciones, facturación (Sección 12).
- Lenguaje recomendado backend: **TypeScript (NestJS)** para servicios de negocio + **Python (FastAPI)** para motor de cálculo/IA (ecosistema científico y de ML).
- Comunicación interna: REST/gRPC + colas de eventos (SQS/RabbitMQ) para procesos asíncronos (generación de reportes, cálculos pesados de cortocircuito).

### 3.4 Base de datos

Ver detalle en Sección 9. Resumen: PostgreSQL como fuente de verdad transaccional, extensión `pgvector` o base vectorial dedicada (Pinecone/Weaviate) para embeddings normativos, Redis para cache/sesiones, S3-compatible para archivos binarios (PDF, DWG, imágenes).

### 3.5 Nube

- Proveedor recomendado: **AWS** (o GCP como alternativa), por madurez de servicios gestionados (RDS, S3, Lambda, SageMaker/Bedrock) y disponibilidad de datacenters en México/LatAm (mx-central-1 en AWS reduce latencia y facilita cumplimiento de residencia de datos).
- Infraestructura como código (Terraform), despliegue vía contenedores (Docker + Kubernetes/ECS).
- Multi-tenant con aislamiento lógico por `tenant_id` (ver Sección 9), evaluar aislamiento físico para plan Empresarial.

### 3.6 IA

- Orquestación vía **Claude (Anthropic)** como modelo base para el asistente experto, con arquitectura **RAG (Retrieval-Augmented Generation)** sobre corpus normativo NOM-001-SEDE + Ugly's Electrical Reference (ver Sección 7).
- Capa de "tool use"/function calling para que el asistente pueda invocar el motor de cálculo real (no solo generar texto) y el motor normativo, garantizando que las respuestas numéricas provienen del motor determinístico, no del LLM.

### 3.7 Servicios externos

| Servicio | Proveedor sugerido | Propósito |
|---|---|---|
| Pagos/suscripciones | Stripe (internacional) + Conekta/MercadoPago (México/LatAm) | Cobro de planes SaaS |
| Firma digital | e.firma (SAT) para México + DocuSign internacional | Firma de responsiva de memorias de cálculo |
| Notificaciones push | APNs (Apple) + Firebase Cloud Messaging (Web) | Alertas de proyecto, colaboración |
| LLM | Anthropic Claude API | Asistente experto e IA de revisión |
| Analítica de producto | Amplitude/Mixpanel | Comportamiento de usuario, retención |
| Observabilidad | Datadog/Grafana + Sentry | Monitoreo, logs, errores |

---

## Sección 4. Diseño Funcional

> Cada módulo se describe con: **Entradas → Procesamiento → Fórmulas/Reglas → Resultados → Validación NOM**.

### 4.1 Módulo: Carga Instalada

- **Entradas:** listado de cargas (motores, iluminación, tomas, equipos especiales), potencia nominal, factor de potencia, tipo de carga (continua/no continua).
- **Procesamiento:** suma de potencias nominales agrupadas por circuito, alimentador y tablero; clasificación por tipo de carga según Art. 220 (equivalente NOM).
- **Fórmulas:** `Carga Instalada (VA) = Σ (Potencia nominal_i × Cantidad_i)`; conversión HP→W para motores mediante tablas NOM (eficiencias típicas) o placa de datos.
- **Resultados:** carga instalada total por tablero/proyecto, desglose por tipo de uso.
- **Validación NOM:** verifica clasificación correcta de cargas continuas (125%) vs. no continuas conforme a la norma.

### 4.2 Módulo: Demanda y Factor de Demanda

- **Entradas:** carga instalada por categoría (alumbrado general, fuerza, motores, aire acondicionado, cocina, etc.).
- **Procesamiento:** aplicación de tablas de factor de demanda NOM-001-SEDE (equivalentes a Tabla 220 NEC) según tipo de ocupación (industrial, comercial, residencial).
- **Fórmulas:** `Demanda (VA) = Carga Instalada × Factor de Demanda (tabla según categoría y rango)`.
- **Resultados:** demanda máxima probable por tablero y general del proyecto.
- **Validación NOM:** confirma que el factor de demanda aplicado corresponde al rango tabular correcto y a la categoría de carga declarada.

### 4.3 Módulo: Factor de Carga

- **Entradas:** curva de carga o consumo histórico (kWh) y demanda máxima registrada (kW).
- **Fórmulas:** `Factor de Carga = Consumo promedio / Demanda máxima = (kWh / horas) / kW pico`.
- **Resultados:** indicador de eficiencia de uso de la instalación; insumo para dimensionamiento de transformador y análisis de facturación (demanda contratada CFE).

### 4.4 Módulo: Alimentadores y Circuitos Derivados

- **Entradas:** demanda del circuito/alimentador, distancia, tipo de canalización, temperatura ambiente, número de conductores agrupados.
- **Procesamiento:** cálculo de corriente de diseño, aplicación de factores de corrección (temperatura + agrupamiento), selección de calibre en tablas de ampacidad (Tabla 310 NOM), verificación de caída de tensión.
- **Fórmulas:** `I_diseño = Demanda (VA) / (√3 × V_línea × FP)` (trifásico) o `/ (V × FP)` (monofásico); `I_corregida_ampacidad = I_tabla × F_temp × F_agrupamiento`.
- **Resultados:** calibre de conductor propuesto, tipo de aislamiento, canalización requerida.
- **Validación NOM:** ampacidad corregida ≥ corriente de diseño; caída de tensión ≤ 3% en alimentador / 5% total (alimentador + derivado), conforme a recomendación NOM.

### 4.5 Módulo: Selección Automática de Conductores

- **Entradas:** corriente de diseño, longitud del circuito, material (Cu/Al), tipo de aislamiento (THHW, XHHW, etc.), temperatura de operación.
- **Procesamiento:** motor de reglas que recorre tablas de ampacidad y aplica corrección simultánea por temperatura y agrupamiento, seleccionando el calibre mínimo que cumple ampacidad **y** caída de tensión.
- **Resultados:** calibre óptimo (mínimo costo que cumple norma), con alternativas (Cu vs. Al) y su impacto en costo/peso.

### 4.6 Módulo: Corrección por Temperatura y por Agrupamiento

- **Entradas:** temperatura ambiente de diseño, número de conductores portadores de corriente en la misma canalización.
- **Fórmulas:** factores tabulares NOM (equivalentes Tabla 310.15(B)(1) y (B)(3)(a) NEC): `F_temp` según temperatura ambiente vs. temperatura nominal del aislamiento; `F_agrup` según cantidad de conductores (3, 4–6, 7–9, 10–20, etc.).
- **Resultados:** ampacidad ajustada aplicable al proyecto real (no la nominal de catálogo).

### 4.7 Módulo: Canalizaciones y Capacidad de Ductos

- **Entradas:** tipo y calibre de conductores a instalar, tipo de canalización (tubo conduit EMT/PVC/RMC, charola).
- **Procesamiento:** cálculo de área ocupada por conductores vs. área interna disponible del ducto, aplicando el % de llenado permitido (40% para 3+ conductores, según tabla NOM Capítulo 9).
- **Resultados:** diámetro de canalización mínimo requerido.

### 4.8 Módulo: Protecciones y Coordinación

- **Entradas:** corriente de diseño, curva de disparo deseada, tipo de carga (motor, alimentador, circuito derivado), corriente de cortocircuito disponible en el punto.
- **Procesamiento:** selección de interruptor termomagnético/fusible conforme a reglas de protección de conductor (Art. 240) y protección de motor (Art. 430 equivalente); verificación de coordinación selectiva entre protecciones aguas arriba/abajo (relación de disparo, curvas tiempo-corriente).
- **Resultados:** capacidad nominal del interruptor, tipo de curva, verificación de coordinación (selectiva / no selectiva / parcial).

### 4.9 Módulo: Transformadores

- **Entradas:** demanda del sistema, tensión primaria/secundaria, tipo de conexión (Delta-Estrella, etc.), factor de crecimiento futuro.
- **Procesamiento:** dimensionamiento de kVA nominal con margen de crecimiento, cálculo de corriente nominal primaria/secundaria, %Z para estudio de cortocircuito.
- **Resultados:** kVA recomendado, corriente nominal, %Z típico según fabricante/tabla.

### 4.10 Módulo: Cortocircuito y Corriente de Falla

- **Entradas:** topología del sistema (unifilar), capacidad de la fuente (CFE/transformador), %Z de transformadores, impedancia de conductores/longitudes.
- **Procesamiento:** método de por-unidad o MVA para calcular corriente de falla trifásica y línea-tierra en cada punto del sistema (buses/tableros).
- **Fórmulas (base):** `I_falla = I_base / Z_total(pu)`; `Z_transformador(pu) = %Z × (kVA_base/kVA_transformador)`.
- **Resultados:** kA de falla disponible por bus, insumo directo para verificar capacidad interruptiva de protecciones (Módulo 4.8) y validar coordinación.

### 4.11 Módulo: Puesta a Tierra

- **Entradas:** tipo de sistema (TN, resistencia de tierra deseada), resistividad del suelo, tipo de electrodo (varilla, malla, contraantena).
- **Procesamiento:** cálculo de resistencia de electrodo (fórmula de Dwight/varilla simple o malla), dimensionamiento de conductor de puesta a tierra de equipos (Tabla 250 NOM) según capacidad de la protección aguas arriba.
- **Resultados:** calibre de conductor de tierra, número/arreglo de electrodos, resistencia esperada del sistema.

### 4.12 Módulo: Tableros Eléctricos

- **Entradas:** lista de circuitos derivados/alimentadores a alojar, corriente total, espacios disponibles.
- **Procesamiento:** balanceo de fases, verificación de capacidad de barras, generación de directorio de circuitos.
- **Resultados:** especificación de tablero (marca/modelo referencial, capacidad de barras, número de polos), diagrama de tablero.

### 4.13 Módulo: Bancos de Capacitores y Factor de Potencia

- **Entradas:** kW de demanda activa, FP actual, FP objetivo (típicamente ≥0.90 para evitar penalización CFE).
- **Fórmulas:** `kVAR requerido = kW × (tan(cos⁻¹(FP_actual)) − tan(cos⁻¹(FP_objetivo)))`.
- **Resultados:** kVAR de banco requerido, configuración (fijo/automático, pasos), ahorro estimado en facturación CFE.

### 4.14 Módulo: Diagramas Unifilares y Trifilares

- **Entradas:** topología del proyecto (tableros, alimentadores, protecciones, transformadores) capturada en los módulos anteriores.
- **Procesamiento:** generación automática de diagrama vectorial (SVG) a partir del modelo de datos del proyecto (no dibujo manual).
- **Resultados:** diagrama unifilar (representación por fase) y trifilar (representación de las tres fases), exportables a PDF/DWG.

### 4.15 Módulo: Catálogo y Cuantificación de Materiales

- **Entradas:** resultados de todos los módulos de dimensionamiento (conductores, canalizaciones, protecciones, tableros).
- **Procesamiento:** consolidación en lista de materiales (BOM) con cantidades, referencia a catálogo (editable/vinculable a proveedores).
- **Resultados:** BOM exportable a Excel, listado automático de equipos con especificación técnica.

### 4.16 Módulo: Memoria de Cálculo y Reportes

- **Entradas:** todos los resultados de cálculo del proyecto + referencias normativas asociadas (Sección 6).
- **Procesamiento:** ensamblado de documento estructurado (portada, índice, memoria por circuito, anexos normativos, diagramas, BOM).
- **Resultados:** exportación a PDF (memoria firmable) y Excel (hojas de cálculo editables/auditables).

---

## Sección 5. Motor de Cálculo Eléctrico

### 5.1 Principios de diseño del motor

- **Determinístico y auditable:** cada resultado numérico debe ser trazable a una fórmula y a las variables de entrada exactas (requisito para responsabilidad profesional del ingeniero firmante).
- **Unidades explícitas y conversión centralizada** (VA, kVA, A, V, Ω, kA, °C) para evitar errores de conversión.
- **Motor "puro"** (sin efectos secundarios) para permitir pruebas unitarias exhaustivas contra casos de la NOM y de Ugly's Electrical Reference.

### 5.2 Variables núcleo

| Variable | Símbolo | Unidad |
|---|---|---|
| Potencia aparente | S | VA / kVA |
| Potencia activa | P | W / kW |
| Factor de potencia | FP | adimensional (0–1) |
| Corriente de diseño | I_d | A |
| Tensión de línea | V_L | V |
| Ampacidad tabular | I_tabla | A |
| Factor de temperatura | F_t | adimensional |
| Factor de agrupamiento | F_a | adimensional |
| Caída de tensión | %CT | % |
| Impedancia por unidad | Z_pu | pu |
| Corriente de falla | I_cc | kA |
| Resistencia de tierra | R_t | Ω |

### 5.3 Procesos del motor (pipeline)

```
Entrada de datos del proyecto
        │
        ▼
[1] Cálculo de Carga Instalada  ──▶ [2] Cálculo de Demanda
        │                                   │
        ▼                                   ▼
[3] Corriente de Diseño por circuito ──▶ [4] Selección de Conductor
        │  (aplica F_t, F_a)                 (ampacidad + %CT)
        ▼                                   │
[5] Selección de Canalización              ▼
        │                          [6] Selección de Protección
        ▼                                   │
[7] Cálculo de Cortocircuito ◀──────────────┘
        │
        ▼
[8] Verificación de Coordinación de Protecciones
        │
        ▼
[9] Puesta a Tierra  ──▶ [10] Factor de Potencia / Capacitores
        │
        ▼
   Resultado consolidado del proyecto
        │
        ▼
   Motor Normativo (Sección 6) → Validación de cumplimiento
```

### 5.4 Conductores — lógica detallada

1. Calcular `I_d` (corriente de diseño) a partir de demanda y tensión.
2. Aplicar 125% si la carga es continua (Art. 210/215 equivalente).
3. Buscar en tabla de ampacidad el calibre cuya `I_tabla × F_t × F_a ≥ I_d`.
4. Verificar caída de tensión con el calibre seleccionado; si excede el límite, subir de calibre (no solo por ampacidad, sino por impedancia del conductor).
5. Retornar calibre final + justificación (qué criterio fue determinante: ampacidad o caída de tensión).

### 5.5 Protecciones — lógica detallada

1. Determinar corriente nominal de protección según tipo de carga (conductor: 100–125% de ampacidad; motor: reglas específicas de arranque).
2. Verificar capacidad interruptiva de la protección ≥ corriente de falla disponible en ese punto (Módulo 5.7).
3. Evaluar coordinación con protección aguas arriba (relación mínima de corrientes de disparo o superposición de curvas tiempo-corriente) y clasificar como *selectiva*, *parcialmente selectiva* o *no selectiva*.

### 5.6 Transformadores — lógica detallada

1. `kVA_transformador ≥ Demanda_proyecto × (1 + margen_crecimiento)`.
2. Redondear al tamaño comercial estándar superior (15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000 kVA, etc.).
3. Obtener %Z típico (de tabla por rango de kVA si no se especifica de placa) para alimentar el módulo de cortocircuito.

### 5.7 Cortocircuito — lógica detallada (método por unidad, simplificado)

1. Definir potencia base `S_base` (p. ej. 100 MVA) y tensión base por nivel de tensión.
2. Convertir impedancia de cada elemento (transformador, conductor) a por unidad sobre la base común.
3. Sumar impedancias en serie/paralelo según topología del unifilar (grafo de nodos y ramas).
4. `I_falla(kA) = I_base(kA) / Z_total(pu)` en cada nodo de interés.
5. Repetir para falla trifásica y falla línea-tierra (esta última incorporando impedancia de secuencia cero y del sistema de tierra).

### 5.8 Puesta a Tierra — lógica detallada

1. Seleccionar calibre de conductor de tierra de equipos según la tabla NOM en función de la capacidad nominal de la protección aguas arriba (no del calibre del conductor de fase).
2. Calcular resistencia de electrodo simple: `R = (ρ / (2πL)) × [ln(4L/d) − 1]` (fórmula de varilla vertical, ρ = resistividad del terreno, L = longitud enterrada, d = diámetro).
3. Si no cumple el máximo permitido (típicamente 25 Ω para electrodo único, o el valor de diseño del proyecto), iterar arreglo de electrodos en paralelo o malla.

### 5.9 Factor de Potencia / Capacitores — lógica detallada

1. Calcular kVAR actual y objetivo a partir de FP actual/objetivo y kW de demanda activa.
2. Dimensionar banco de capacitores en pasos estándar comerciales.
3. Verificar riesgo de resonancia con armónicos si existen variadores de frecuencia (alerta cualitativa, no cálculo de flujo armónico completo en MVP).

---

## Sección 6. Motor Normativo

### 6.1 Objetivo

Convertir el texto legal de la NOM-001-SEDE-2018 en una **base de reglas estructurada y consultable**, de modo que cada resultado del motor de cálculo pueda:

1. Vincularse al artículo/tabla exacto que lo sustenta.
2. Ser auditado automáticamente contra los límites normativos.
3. Generar observaciones técnicas redactadas en el mismo lenguaje que usaría un revisor de Unidad Verificadora.

### 6.2 Arquitectura del motor normativo

```
NOM-001-SEDE-2018 (texto fuente)
        │
        ▼
[A] Extracción y estructuración
    - Artículos, incisos, tablas → registros estructurados
    - Metadatos: capítulo, tema, tipo de regla (límite, tabla, procedimiento)
        │
        ▼
[B] Motor de Reglas (Rules Engine)
    - Reglas declarativas: "SI <condición sobre variable de cálculo> ENTONCES <cumple/no cumple> REFERENCIA <artículo>"
    - Ej.: SI %CT_alimentador > 3% ENTONCES incumplimiento, REF Art. 215-2 (equiv.)
        │
        ▼
[C] Evaluador de Cumplimiento
    - Recibe el resultado consolidado del Motor de Cálculo (Sección 5)
    - Ejecuta todas las reglas aplicables al tipo de proyecto/circuito
        │
        ▼
[D] Generador de Observaciones
    - Para cada regla NO cumplida: genera texto de observación técnica
      (qué se evaluó, qué se encontró, qué artículo se incumple, qué corrección se sugiere)
        │
        ▼
Reporte de Cumplimiento NOM (evidencia técnica trazable)
```

### 6.3 Identificación de artículos aplicables

- Cada módulo del motor de cálculo (Sección 5) está pre-etiquetado con los artículos NOM potencialmente aplicables (mapa módulo → artículos, mantenido como catálogo maestro versionado por edición de la norma).
- Al ejecutar un cálculo, el motor normativo filtra solo los artículos relevantes al tipo de instalación (industrial/comercial/residencial, tensión, tipo de carga).

### 6.4 Detección de incumplimientos

- Reglas cuantitativas (umbrales: %CT, ampacidad, llenado de ducto, resistencia de tierra) evaluadas de forma determinística.
- Reglas cualitativas (procedimentales: clasificación correcta de área peligrosa, tipo de canalización permitida por ambiente) evaluadas mediante checklist estructurado capturado por el usuario y verificado por reglas lógicas.

### 6.5 Generación de observaciones técnicas

Plantilla de observación generada automáticamente:

> **Observación NOM-###:** El alimentador "Tablero TG-1 → TG-2" presenta una caída de tensión calculada de **4.1%**, superior al límite recomendado de **3%** para alimentadores (Art. XXX). **Corrección sugerida:** incrementar calibre de 3/0 AWG a 4/0 AWG, o reducir longitud de recorrido si es viable.

### 6.6 Evidencia técnica

- Cada observación queda vinculada a: variables de entrada, fórmula aplicada, resultado numérico, artículo de referencia, y estado (pendiente/corregido/aceptado con justificación de excepción).
- Esta evidencia es la base del **paquete de entrega para Unidad Verificadora** (Sección 15 — diferenciador "inspección virtual de cumplimiento").

### 6.7 Gobernanza normativa

- El catálogo de reglas se versiona de forma independiente al código de la aplicación (permite actualizar a futuras ediciones de la NOM sin requerir release de la app).
- Revisión periódica por el rol de "Ingeniero Eléctrico especialista NOM" (equipo interno o consultor certificado) antes de publicar actualizaciones del catálogo de reglas.

---

## Sección 7. Inteligencia Artificial

### 7.1 Rol del asistente de IA

Un **copiloto técnico especializado en NOM-001-SEDE**, no un chatbot genérico: responde preguntas normativas, revisa proyectos ya calculados, sugiere mejoras de diseño, detecta errores y redacta documentación — siempre apoyado en el motor de cálculo y el motor normativo determinísticos (Secciones 5 y 6), nunca "inventando" un resultado numérico.

### 7.2 Capacidades

| Capacidad | Descripción |
|---|---|
| Preguntas sobre NOM | Responde consultas normativas citando artículo/tabla exacta (RAG sobre corpus NOM + Ugly's) |
| Revisión automática de proyectos | Ejecuta el motor normativo sobre un proyecto existente y resume hallazgos en lenguaje natural |
| Recomendaciones de diseño | Sugiere optimizaciones (p. ej. cambiar calibre para reducir costo manteniendo cumplimiento) |
| Detección de errores | Identifica inconsistencias entre módulos (p. ej. protección no coordinada con conductor aguas abajo) |
| Generación de memorias | Redacta el texto narrativo de la memoria de cálculo a partir de resultados estructurados |
| Generación de especificaciones | Redacta specs técnicas de materiales/equipos a partir del BOM |

### 7.3 Arquitectura de IA recomendada

```
Usuario (pregunta o solicitud de revisión)
        │
        ▼
[Orquestador de Agente] ── decide qué herramientas invocar
        │
   ┌────┴─────────────────────────────────┐
   ▼                                      ▼
[Retrieval NOM/Ugly's]              [Tool calling]
- Embeddings del corpus normativo    - Invoca Motor de Cálculo real
  (chunking por artículo/tabla)      - Invoca Motor Normativo real
- Vector DB (pgvector/Pinecone)      - Invoca datos del proyecto (DB)
        │                                      │
        └──────────────┬───────────────────────┘
                        ▼
              [LLM — Claude API]
      Compone respuesta en lenguaje natural
      usando SOLO los datos recuperados/calculados
      (evita alucinación numérica)
                        │
                        ▼
              Respuesta al usuario
        (con citas a artículo NOM y a resultados reales del proyecto)
```

- **Principio de diseño crítico:** el LLM **redacta y explica**, pero **no calcula**. Todo número que aparece en una respuesta debe provenir de una llamada real al motor de cálculo/normativo (function calling), garantizando responsabilidad profesional y auditabilidad.
- **RAG sobre corpus normativo:** ingestión de NOM-001-SEDE-2018 y Ugly's Electrical Reference en chunks semánticos (por artículo/tabla), embeddings almacenados en base vectorial, recuperación por similitud + reranking.
- **Memoria de contexto por proyecto:** el asistente conoce el estado actual del proyecto abierto (tableros, circuitos, resultados) para responder con contexto específico, no genérico.

### 7.4 Salvaguardas

- Toda respuesta que cite un artículo normativo debe incluir la referencia exacta recuperada (trazabilidad), y el sistema debe marcar explícitamente cuando una recomendación es una **sugerencia de ingeniería** (no un dictamen de cumplimiento) que requiere validación del ingeniero responsable.
- Registro de auditoría de todas las interacciones IA relevantes a decisiones de diseño (requisito para responsabilidad profesional).

---

## Sección 8. Diseño UX/UI

### 8.1 Dashboard principal

- Vista de proyectos recientes (tarjetas con estado: en progreso / validado NOM / con observaciones pendientes).
- Indicador de cumplimiento normativo por proyecto (semáforo: verde/amarillo/rojo).
- Acceso rápido a: nuevo proyecto, asistente IA, plantillas por industria.

### 8.2 Pantallas requeridas (inventario)

1. Onboarding / selección de plan.
2. Dashboard de proyectos.
3. Creador de proyecto (datos generales: tipo de instalación, tensión, ubicación).
4. Editor de unifilar (canvas interactivo de tableros/circuitos).
5. Formulario de carga por circuito (entradas del Módulo 4.1).
6. Panel de resultados de cálculo por circuito (conductor, protección, canalización).
7. Panel de cumplimiento normativo (observaciones, artículos, estado).
8. Visor/editor de diagrama unifilar y trifilar.
9. Catálogo y cuantificación de materiales (BOM).
10. Generador de memoria de cálculo (preview + export PDF/Excel).
11. Asistente IA (chat contextual al proyecto).
12. Gestión documental y versiones de proyecto.
13. Configuración de cuenta, equipo y suscripción.

### 8.3 Flujo de trabajo (golden path)

```
Crear proyecto → Definir datos generales → Modelar tableros/circuitos
   → Capturar cargas → Ejecutar motor de cálculo → Revisar cumplimiento NOM
   → Resolver observaciones (asistido por IA) → Generar diagramas
   → Generar BOM → Generar memoria de cálculo → Exportar/Firmar → Compartir/Archivar
```

### 8.4 Experiencia móvil (iPhone)

- Enfoque: **captura de campo y consulta**, no modelado extenso de proyectos complejos.
- Casos de uso prioritarios: verificación de cumplimiento in situ, consulta al asistente IA, captura de datos de levantamiento (fotos, mediciones), aprobación de observaciones.

### 8.5 Experiencia tablet (iPad)

- Enfoque: **modelado completo del unifilar** con canvas táctil optimizado (Apple Pencil para anotaciones sobre diagramas), adecuado para trabajo en obra o en oficina.

### 8.6 Experiencia escritorio (Mac/Web)

- Enfoque: **ingeniería de detalle y generación de entregables** — edición extensa de tablas de cálculo, revisión de memoria completa, exportación y gestión documental, colaboración multiusuario.

---

## Sección 9. Base de Datos

### 9.1 Entidades principales

| Entidad | Descripción |
|---|---|
| `Organization` | Empresa/despacho cliente (tenant) |
| `User` | Usuario individual, pertenece a una o más `Organization` |
| `Subscription` | Plan y estado de suscripción de la organización |
| `Project` | Proyecto de ingeniería eléctrica |
| `ProjectVersion` | Snapshot versionado de un proyecto |
| `Panel` (Tablero) | Tablero eléctrico dentro de un proyecto |
| `Circuit` (Circuito) | Circuito derivado o alimentador dentro de un tablero |
| `Load` (Carga) | Carga individual asignada a un circuito |
| `CalculationResult` | Resultado de cálculo de un circuito/proyecto (snapshot inmutable) |
| `ComplianceFinding` | Hallazgo de cumplimiento/incumplimiento NOM asociado a un resultado |
| `NormReference` | Artículo/tabla NOM estructurado (catálogo maestro) |
| `MaterialItem` | Ítem de catálogo de materiales |
| `ProjectBOM` | Lista de materiales cuantificada de un proyecto |
| `Document` | Documento generado (memoria, PDF, Excel, diagrama) |
| `AIConversation` | Conversación del asistente IA asociada a un proyecto |

### 9.2 Relaciones (modelo conceptual)

```
Organization 1───* User
Organization 1───1 Subscription
Organization 1───* Project
Project 1───* ProjectVersion
ProjectVersion 1───* Panel
Panel 1───* Circuit
Circuit 1───* Load
Circuit 1───* CalculationResult
CalculationResult 1───* ComplianceFinding
ComplianceFinding *───1 NormReference
Project 1───1 ProjectBOM
ProjectBOM *───* MaterialItem
Project 1───* Document
Project 1───* AIConversation
```

### 9.3 Estructura de tablas (extracto — PostgreSQL)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'engineer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  installation_type TEXT NOT NULL, -- industrial | comercial | residencial
  voltage_class TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  version_number INT NOT NULL,
  snapshot JSONB NOT NULL, -- estado completo versionado
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, version_number)
);

CREATE TABLE panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_version_id UUID REFERENCES project_versions(id),
  name TEXT NOT NULL,
  parent_panel_id UUID REFERENCES panels(id), -- jerarquía TG → TSG → TD
  voltage FLOAT NOT NULL
);

CREATE TABLE circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id),
  circuit_type TEXT NOT NULL, -- alimentador | derivado
  is_continuous_load BOOLEAN NOT NULL DEFAULT false,
  length_m FLOAT,
  conductor_material TEXT,
  ambient_temp_c FLOAT
);

CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id UUID REFERENCES circuits(id),
  description TEXT,
  power_va FLOAT NOT NULL,
  power_factor FLOAT NOT NULL DEFAULT 0.9,
  load_category TEXT NOT NULL
);

CREATE TABLE calculation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id UUID REFERENCES circuits(id),
  design_current_a FLOAT,
  selected_conductor TEXT,
  voltage_drop_pct FLOAT,
  selected_protection TEXT,
  short_circuit_ka FLOAT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE norm_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL, -- p.ej. "NOM-001-SEDE-2018 Art. 215-2"
  title TEXT NOT NULL,
  full_text TEXT NOT NULL,
  embedding VECTOR(1536) -- pgvector
);

CREATE TABLE compliance_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_result_id UUID REFERENCES calculation_results(id),
  norm_reference_id UUID REFERENCES norm_references(id),
  status TEXT NOT NULL, -- cumple | incumple | requiere_revision
  observation TEXT
);
```

### 9.4 Índices clave

- `projects(organization_id)`, `circuits(panel_id)`, `loads(circuit_id)` — consultas jerárquicas frecuentes.
- Índice vectorial (HNSW/IVFFlat) sobre `norm_references(embedding)` para búsqueda semántica del asistente IA.
- Índice compuesto `compliance_findings(status, calculation_result_id)` para dashboards de cumplimiento.
- `project_versions(project_id, version_number)` único, ya declarado, soporta control de versiones eficiente.

---

## Sección 10. MVP

### 10.1 Alcance mínimo viable

Plataforma **Web + iPad** (prioridad, por ser el dispositivo de modelado principal) cubriendo el flujo completo para **un proyecto de baja tensión industrial simple** (un tablero principal + tableros derivados, sin estudio de arco eléctrico avanzado).

### 10.2 Funciones críticas (incluidas en MVP)

1. Gestión de proyectos y datos generales.
2. Cálculo de carga instalada y demanda (Módulos 4.1–4.2).
3. Dimensionamiento de conductores y canalizaciones (4.4–4.7).
4. Selección de protecciones (sin coordinación avanzada) (4.8, básico).
5. Cálculo de cortocircuito simplificado (4.10, un nivel de transformador).
6. Puesta a tierra básica (4.11).
7. Motor normativo con reglas cuantitativas core (Sección 6, subconjunto de artículos de mayor incidencia: ampacidad, caída de tensión, llenado de ducto, tierra).
8. Generación de memoria de cálculo (PDF) y BOM (Excel).
9. Diagrama unifilar automático (sin trifilar aún).
10. Asistente IA en modo "preguntas sobre NOM" (sin revisión automática de proyecto todavía).

### 10.3 Funciones diferidas (post-MVP)

- Coordinación avanzada de protecciones (curvas tiempo-corriente completas).
- Bancos de capacitores / corrección de FP.
- Diagramas trifilares.
- Firma digital integrada.
- App nativa iPhone (MVP prioriza iPad/Web; iPhone en Fase 2).
- Revisión automática de proyecto completo por IA.
- Expansión a otras normas (RETIE, etc.).

### 10.4 Estrategia de lanzamiento

- **Beta cerrada** con 15–25 despachos/ingenieros independientes seleccionados (partnership con 1–2 colegios de ingenieros), 60–90 días, feedback estructurado semanal.
- Ajuste de motor normativo con casos reales antes de beta abierta.
- Lanzamiento público con **plan gratuito limitado** (1 proyecto activo) + plan Individual de pago.

---

## Sección 11. Roadmap

| Fase | Duración estimada | Funcionalidades principales |
|---|---|---|
| **Fase 1 — MVP** | Meses 1–5 | Ver Sección 10.2. Web + iPad. Beta cerrada → lanzamiento público limitado. |
| **Fase 2 — Consolidación** | Meses 6–10 | App iPhone nativa. Coordinación de protecciones avanzada. Diagramas trifilares. Bancos de capacitores/FP. Firma digital. App Mac nativa (actualmente solo web en Mac). |
| **Fase 3 — Expansión de plataforma** | Meses 11–16 | Revisión automática de proyecto completo por IA. Colaboración multiusuario en tiempo real. Plantillas por industria (petroquímica, automotriz, alimentos). Integración con proveedores (catálogo dinámico de materiales). Portal para Unidades Verificadoras. |
| **Fase 4 — Expansión geográfica y de mercado** | Meses 17–24 | Módulo normativo RETIE (Colombia) y CNE (Perú) como plug-ins del motor normativo. Marketplace de plantillas. Certificación educativa (universidades/colegios). Plan Empresarial con aislamiento dedicado y SSO. |

---

## Sección 12. Modelo de Negocio

### 12.1 Planes propuestos

| Plan | Precio (USD, referencia) | Incluye |
|---|---|---|
| **Gratuito** | $0 | 1 proyecto activo, cálculos básicos, sin exportación de memoria firmable, marca de agua en PDF |
| **Individual mensual** | $29–39/mes | Proyectos ilimitados, memoria/BOM sin marca de agua, asistente IA (consultas limitadas/mes) |
| **Individual anual** | $290–390/año (≈2 meses gratis) | Igual que mensual, descuento por pago anual |
| **Profesional** | $79–99/mes | Todo lo anterior + IA sin límite de consultas, coordinación avanzada de protecciones, diagramas trifilares, firma digital |
| **Empresarial** | Desde $500/mes (por equipo, escalable por asientos) | Multiusuario, colaboración en tiempo real, SSO, aislamiento de datos dedicado, soporte prioritario, onboarding asistido |
| **Servicios complementarios** | Variable | Capacitación, migración de proyectos legacy, consultoría de implementación, revisión de proyectos por expertos certificados (marketplace) |

### 12.2 Justificación de precio

- Referencia de mercado: ETAP/EasyPower cobran USD 3,000–15,000/año por licencia individual. ElectraNOM se posiciona en **8–15% de ese costo**, apostando a **volumen** (mercado de ingenieros independientes y PyMEs de ingeniería, no solo grandes corporativos).

### 12.3 Proyección de ingresos (escenario ilustrativo, 3 años)

| Año | Usuarios pagados (acumulado) | ARR estimado (USD) | Supuesto clave |
|---|---|---|---|
| Año 1 | 400–800 | $150K–350K | Lanzamiento + beta, adopción temprana vía colegios de ingenieros |
| Año 2 | 2,000–3,500 | $900K–1.8M | Expansión LatAm inicia, plan Empresarial tracciona |
| Año 3 | 5,000–9,000 | $2.5M–5.5M | Consolidación México + entrada Colombia/Perú |

> Estas cifras son **hipótesis de planeación**, a validar con datos reales de conversión de la beta (Sección 10.4) antes de comprometerse en materiales de inversión.

---

## Sección 13. App Store

### 13.1 Estrategia de publicación

- Categoría primaria: **Productividad** / secundaria: **Negocios**.
- Cumplimiento estricto de App Store Review Guidelines: suscripciones vía In-App Purchase (StoreKit 2) para features desbloqueadas dentro de la app iOS/iPadOS (nota: la app Web puede ofrecer checkout externo conforme a políticas vigentes de "reader apps"/enlaces externos, a validar caso por caso con las guidelines vigentes al momento del release).
- Versión macOS vía Mac App Store **y** distribución directa notarizada (Developer ID) para clientes empresariales que requieran MDM.

### 13.2 Estrategia ASO (App Store Optimization)

- Palabras clave objetivo: "NOM 001", "cálculo eléctrico", "instalaciones eléctricas", "ingeniería eléctrica", "memoria de cálculo".
- Screenshots orientados a *resultado* (diagrama unifilar generado, memoria de cálculo, panel de cumplimiento NOM) más que a *formulario*.
- Localización: español (México neutro), portugués (Brasil, expansión futura), inglés (mercado hispano EE. UU.).

### 13.3 Adquisición de usuarios

- Canal primario: colegios de ingenieros, cámaras (CANAME), universidades (facultades de ingeniería eléctrica).
- Contenido técnico (webinars sobre NOM-001-SEDE, casos prácticos) como imán de adquisición orgánica.
- Partnerships con Unidades Verificadoras para co-marketing ("proyectos generados en ElectraNOM llegan pre-validados").

### 13.4 Marketing técnico

- Blog/recursos con actualizaciones de la norma, casos de estudio, comparativas de calibre/costo.
- Presencia en eventos técnicos (CIGRE México, expos de CANAME/CANACINTRA).

### 13.5 Programa de referidos

- Meses gratis por referido convertido a plan de pago, aplicable tanto a usuarios individuales como a despachos (referido de empresa completa con bono mayor).

---

## Sección 14. Análisis Financiero

### 14.1 Costos de desarrollo (estimación MVP, Fase 1)

| Rubro | Estimado (USD) |
|---|---|
| Equipo de ingeniería de software (backend + frontend + iOS, 5–7 personas × 5 meses) | $250K–400K |
| Ingeniería eléctrica/normativa (validación técnica del motor y catálogo de reglas) | $60K–100K |
| Diseño UX/UI | $40K–70K |
| IA/RAG (integración, curación de corpus normativo, pruebas) | $50K–90K |
| QA y aseguramiento de calidad | $30K–50K |
| **Total Fase 1 (MVP)** | **$430K–710K** |

### 14.2 Costos de operación e infraestructura (anual, en régimen)

| Rubro | Estimado anual (USD) |
|---|---|
| Infraestructura cloud (AWS/GCP: cómputo, DB, storage, LLM API) | $60K–180K (escala con usuarios) |
| Soporte y éxito de cliente | $80K–150K |
| Mantenimiento normativo (actualización de catálogo NOM) | $30K–50K |
| Licencias/servicios (pagos, firma digital, observabilidad) | $20K–40K |

### 14.3 Punto de equilibrio (ilustrativo)

- Costo fijo operativo anual estimado (post-MVP, en régimen): ~$400K–600K/año.
- Con ticket promedio ponderado ~USD 350/usuario/año: **punto de equilibrio ≈ 1,150–1,700 usuarios pagados activos.**
- Según proyección de la Sección 12.3, este umbral se alcanzaría **entre el Año 1 y el Año 2**, dependiendo de la velocidad de conversión de la beta.

### 14.4 ROI — escenarios (horizonte 3 años, ilustrativo)

| Escenario | Supuesto de crecimiento | ARR Año 3 | Inversión acumulada estimada | ROI aproximado |
|---|---|---|---|---|
| **Conservador** | Adopción lenta, foco solo México | $1.2M–1.8M | $1.5M–2M | ROI marginal / cerca de equilibrio |
| **Medio** | Adopción según Sección 12.3 | $2.5M–5.5M | $1.8M–2.3M | ROI positivo, payback ~24–30 meses |
| **Agresivo** | Expansión LatAm acelerada + plan Empresarial fuerte | $6M–10M+ | $2.5M–3.5M | ROI alto, payback ~15–20 meses |

> Todas las cifras financieras de esta sección son **estimaciones de planeación para un plan de negocio**, no proyecciones auditadas ni asesoría de inversión.

---

## Sección 15. Ventajas Competitivas (Innovación)

1. **Diseño asistido por IA:** el asistente sugiere optimizaciones de calibre/costo manteniendo cumplimiento normativo (no solo responde preguntas).
2. **Revisión automática NOM:** escaneo integral de un proyecto existente (incluso importado de otra herramienta) contra el motor normativo.
3. **Generación inteligente de memorias:** redacción narrativa automática de la memoria de cálculo, editable por el ingeniero.
4. **Generación automática de diagramas:** unifilar/trifilar derivados del modelo de datos, no dibujados manualmente.
5. **Inspección virtual de cumplimiento:** paquete de evidencia técnica estructurado, pensado para consumo directo por Unidades Verificadoras (reduce fricción en el dictamen).
6. **Gemelo digital de instalaciones (roadmap Fase 3+):** vínculo entre el proyecto "as designed" y datos reales de operación/mantenimiento (lecturas de medidores, hallazgos de mantenimiento) para mantener la memoria de cálculo viva a lo largo del ciclo de vida de la instalación.

---

## Sección 16. Especificación Técnica para Desarrolladores

### 16.1 Stack tecnológico recomendado

| Capa | Tecnología |
|---|---|
| iOS/iPadOS/macOS | Swift 5.x, SwiftUI, Swift Package Manager, Combine/async-await |
| Web | TypeScript, React, Next.js, Tailwind CSS |
| Backend de negocio | Node.js + NestJS (TypeScript) |
| Motor de cálculo / IA | Python + FastAPI (numpy/scipy para cálculos, integración SDK Anthropic) |
| Base de datos transaccional | PostgreSQL 15+ |
| Base vectorial | pgvector (extensión de Postgres) o Pinecone gestionado |
| Cache/sesión | Redis |
| Almacenamiento de archivos | S3 (AWS) o equivalente compatible |
| Mensajería asíncrona | Amazon SQS o RabbitMQ |
| Infraestructura | Terraform + Docker + ECS/Kubernetes (AWS) |
| CI/CD | GitHub Actions (build, test, lint, despliegue por entorno) |
| Observabilidad | Sentry (errores), Datadog/Grafana+Prometheus (métricas/logs) |
| Autenticación | OAuth2/OIDC (Auth0/Cognito), Sign in with Apple obligatorio en iOS si hay login social |

### 16.2 Convenciones de API

- API principal: **REST** versionado (`/v1/...`) para operaciones CRUD; considerar **GraphQL** como capa BFF si el frontend requiere consultas anidadas complejas (proyecto → tableros → circuitos → resultados) para evitar sobre-fetching.
- Autenticación: Bearer JWT (OIDC), refresh tokens rotativos.
- Formato de error estándar: `{ "error": { "code": "...", "message": "...", "details": {...} } }`.
- Idempotencia en endpoints de creación (header `Idempotency-Key`) para evitar duplicados en reintentos móviles.

### 16.3 Endpoints clave (extracto ilustrativo)

```
POST   /v1/projects
GET    /v1/projects/:id
POST   /v1/projects/:id/versions
POST   /v1/projects/:id/panels
POST   /v1/panels/:id/circuits
POST   /v1/circuits/:id/loads
POST   /v1/circuits/:id/calculate        → invoca calc-engine-service
GET    /v1/circuits/:id/calculation      → último resultado
POST   /v1/projects/:id/compliance-check → invoca compliance-engine-service
GET    /v1/projects/:id/compliance       → hallazgos NOM
POST   /v1/projects/:id/reports/memoria  → genera PDF (async, retorna job id)
GET    /v1/jobs/:id                      → estado de job asíncrono
POST   /v1/projects/:id/ai/ask           → consulta al asistente IA (RAG + tools)
```

### 16.4 Contrato del motor de cálculo (ejemplo simplificado)

```json
// POST /v1/circuits/:id/calculate — request
{
  "circuit_id": "uuid",
  "design_inputs": {
    "loads_va": [1200, 3600, 750],
    "power_factor": 0.9,
    "is_continuous": true,
    "voltage": 220,
    "phases": 3,
    "length_m": 45,
    "ambient_temp_c": 30,
    "grouped_conductors": 4,
    "conductor_material": "Cu",
    "insulation_type": "THHW"
  }
}

// response
{
  "design_current_a": 24.9,
  "selected_conductor": "8 AWG",
  "ampacity_corrected_a": 40.8,
  "voltage_drop_pct": 1.8,
  "selected_protection": "30A termomagnético",
  "conduit_size_in": "3/4",
  "compliance_refs": ["NOM-001-SEDE-2018 Art. 215-2 (equiv.)", "Tabla 310-..."]
}
```

### 16.5 Estrategia de pruebas

- **Pruebas unitarias del motor de cálculo** contra casos de referencia extraídos de Ugly's Electrical Reference y ejemplos oficiales de aplicación de la NOM (banco de casos de prueba versionado, mínimo 200 casos antes de release del MVP).
- **Pruebas de contrato** entre frontend y backend (esquemas OpenAPI/JSON Schema compartidos).
- **Pruebas end-to-end** del flujo dorado (Sección 8.3) en Web e iPad antes de cada release.
- **Revisión técnica humana obligatoria** (Ingeniero Eléctrico especialista NOM) de cualquier cambio al catálogo de reglas normativas antes de publicarse (control de calidad crítico, no solo automatizado).

### 16.6 Seguridad

- Cifrado en tránsito (TLS 1.2+) y en reposo (KMS) para todos los datos de proyecto.
- Aislamiento multi-tenant estricto a nivel de fila (`organization_id` en cada consulta, reforzado con Row-Level Security en PostgreSQL).
- Gestión de secretos vía vault gestionado (AWS Secrets Manager/GCP Secret Manager), nunca en código o variables de entorno planas en repos.
- Auditoría de acceso a proyectos (log inmutable de quién vio/modificó qué, relevante por la naturaleza profesional/legal de las memorias de cálculo).

### 16.7 Riesgos técnicos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Error en el motor de cálculo genera resultado incorrecto usado en obra real | Alto (seguridad física, responsabilidad legal) | Suite exhaustiva de pruebas contra casos de referencia; doble validación por ingeniero especialista antes de cada release; disclaimers claros de responsabilidad profesional del firmante |
| Actualización de NOM-001-SEDE a nueva edición | Medio-Alto | Catálogo de reglas desacoplado y versionado (Sección 6.7), permite actualizar sin re-arquitecturar |
| IA genera afirmación normativa incorrecta ("alucinación") | Alto (reputacional/legal) | Arquitectura "LLM redacta, motor calcula" (Sección 7.3); toda cifra debe originarse en tool call verificable, no en generación libre del LLM |
| Dependencia de proveedor único de LLM | Medio | Capa de abstracción de proveedor de IA para permitir cambio/multi-proveedor sin reescribir lógica de negocio |
| Escalabilidad de cálculo de cortocircuito en proyectos grandes (muchos nodos) | Medio | Diseño del motor como grafo con cálculo incremental/cacheable por nodo, procesamiento asíncrono para proyectos grandes |
| Adopción lenta por resistencia al cambio del gremio de ingeniería tradicional | Medio-Alto (negocio) | Estrategia de canal vía colegios de ingenieros + plan gratuito de entrada + contenido educativo (Sección 13) |

---

## Conclusiones Ejecutivas

1. Existe una **oportunidad de mercado clara y defendible**: ningún competidor internacional (ETAP, EasyPower, SKM, CYME, Caneco, Dialux) prioriza NOM-001-SEDE ni ofrece experiencia nativa multiplataforma Apple + Web.
2. El diferenciador sostenible no es el cálculo eléctrico en sí (commoditizable), sino la **combinación de motor normativo trazable + IA experta + generación automática de entregables**, que reduce drásticamente el tiempo de ingeniería y el riesgo de incumplimiento.
3. El **MVP debe ser deliberadamente acotado** (Web + iPad, proyecto industrial de baja tensión simple) para validar con usuarios reales antes de invertir en el alcance completo de 40 funcionalidades.
4. El **modelo de negocio SaaS de bajo ticket y alto volumen** (vs. licencias tradicionales de USD 3,000–15,000/año) es la palanca de crecimiento principal en un mercado sensible al precio.
5. El **mayor riesgo no es técnico sino de responsabilidad profesional**: todo resultado numérico debe ser trazable, auditable y nunca generado libremente por el LLM — este principio debe ser innegociable en la arquitectura desde el día uno.
6. La oportunidad de expansión a **RETIE (Colombia), CNE (Perú) y otras normas latinoamericanas** está soportada por la arquitectura desacoplada del motor normativo (Sección 6), sin requerir rediseño del producto.

---

*Documento generado como plan maestro inicial. Las cifras de mercado y financieras son estimaciones de planeación (Secciones 2 y 14) y deben validarse con datos primarios (encuestas a colegios de ingenieros, entrevistas con Unidades Verificadoras, pruebas de precio con la beta cerrada) antes de su uso en materiales de inversión formales.*

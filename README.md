# Simulador Epidemiológico COVID-19 – Oaxaca (2020–2023)

Este proyecto implementa un simulador epidemiológico interactivo para analizar la evolución del **COVID-19** en el estado de **Oaxaca**. Utiliza **React**, procesamiento de archivos CSV, gráficas dinámicas y un **modelo SIRD discretizado** para estimar contagios, recuperaciones y defunciones.

El sistema permite visualizar datos reales, generar predicciones mediante regresión lineal y comparar escenarios epidemiológicos a nivel regional.

---

## 1. Descripción General del Proyecto

El simulador fue desarrollado como una herramienta computacional para:

* Analizar la **evolución mensual** del COVID-19 en Oaxaca.
* Comparar datos reales con estimaciones basadas en **modelos estadísticos**.
* Identificar **picos epidemiológicos** y tendencias por región.
* Generar **escenarios predictivos** (base, optimista, pesimista).
* Visualizar mapas regionales, gráficas interactivas y estadísticas epidemiológicas.

Se integran datos históricos de las **ocho regiones** del estado:

* Valles Centrales
* Istmo
* Costa
* Mixteca
* Sierra Norte
* Sierra Sur
* Cañada
* Papaloapan

## 2. Modelo Epidemiológico

El proyecto se basa en un **Modelo SIRD**, que considera:

* **S:** Susceptibles
* **I:** Infectados
* **R:** Recuperados
* **D:** Fallecidos

### Ecuaciones del Modelo Discretizado

Las ecuaciones del modelo discretizado que representan la dinámica del sistema son:

$$
\frac{dS}{dt} = −\beta \cdot \frac{S \cdot I}{N} \\
\frac{dI}{dt} = \beta \cdot \frac{S \cdot I}{N} − \gamma I − \mu I \\
\frac{dR}{dt} = \gamma I \\
\frac{dD}{dt} = \mu I
$$

También incorpora **simulación estocástica**, usando:

* **Distribución exponencial** (tiempo entre contagios)
* **Distribución normal** (tiempo de recuperación)
* **Distribución uniforme** (movimiento espacial)
* **Distribución Bernoulli** (probabilidad de contagio)

Esto permite simular variaciones realistas en el comportamiento epidemiológico.

## 3. Arquitectura del Sistema

El sistema está construido con módulos independientes:

1.  **Lector de Datos**: Procesa archivos CSV por año, valida encabezados y normaliza datos regionales y mensuales.
2.  **Mapa Interactivo**: Muestra las regiones de Oaxaca y representa concentraciones de contagios mediante colorimetría.
3.  **Sistema de Gráficas**: Incluye gráficos de casos confirmados, defunciones, recuperaciones, comparación Real vs Predicción y escenarios alternos.
4.  **Comparador Epidemiológico**: Ofrece análisis de regresión lineal por mes y región, error absoluto, error porcentual, Coeficiente **R²**, y mejor/peor mes predictivo.
5.  **Motor de Simulación**: Implementa el modelo SIRD discretizado y los elementos probabilísticos.

## 4. Datos Utilizados

Se emplean archivos CSV con los siguientes campos:

* `Región`
* `Mes`
* `Casos Confirmados`
* `Casos Sospechosos`
* `Recuperaciones`
* `Defunciones`

> Por cada año se integran: **96 registros** (12 meses × 8 regiones).

### Métricas Analizadas

| Métrica | Descripción |
| :--- | :--- |
| Tasa de Letalidad | Defunciones / Confirmados |
| Tasa de Recuperación | Recuperados / Confirmados |
| Pico Epidemiológico | Mes con mayor número de casos |
| Variación Interanual | Cambio porcentual año contra año |
| Concentración Regional | Distribución por región |

## 5. Funcionalidades Principales

### 5.1 Carga de Datos
Permite cargar archivos CSV; el sistema verifica estructura y encabezados.

### 5.2 Mapas Interactivos
Representación geográfica de los casos por región.

### 5.3 Gráficas Dinámicas
Gráficas comparativas e históricas con datos reales y estimados.

### 5.4 Simulación Temporal
Animación que representa la evolución mes a mes.

### 5.5 Predicción Epidemiológica
El sistema genera predicciones empleando **regresión lineal**:

* **Escenario Base**
* **Escenario Optimista** (−15%)
* **Escenario Pesimista** (+25%)

### 5.6 Comparación Real vs Predicción
Incluye métricas de precisión como:

* Error Absoluto
* Error Porcentual
* **R²**
* Diferencia mensual entre real y predicción

---

## 6. 🖼️ Visualización del Simulador

Aquí puedes ver el simulador en acción, mostrando el mapa interactivo y las gráficas dinámicas.

<p align="center">
  <img src="URL_A_TU_CAPTURA_DE_PANTALLA_O_GIF" alt="Captura de Pantalla del Simulador Epidemiológico" width="800"/>
</p>
<p align="center">
  *Vista de la Interfaz principal con datos regionales y gráficas de tendencias.*
</p>

---

## 7. 🛠️ Tecnologías Utilizadas

* **React.js**
* **JavaScript**
* **Recharts** para gráficas
* **PapaParse** para lectura de CSV
* **XLSX.js** para exportación a Excel
* **HTML5 / CSS3**

## 8. Estructura del Código

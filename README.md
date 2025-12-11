# Simulador Epidemiológico COVID-19 – Oaxaca (2020–2023)

![Badge Tecnologías](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Badge Lenguaje](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Badge Librerías](https://img.shields.io/badge/Recharts-8884d8?style=for-the-badge&logo=react)
![Badge Datos](https://img.shields.io/badge/CSV_Data-47834C?style=for-the-badge&logo=csv)

Este proyecto implementa un simulador epidemiológico interactivo para analizar la evolución del **COVID-19** en el estado de **Oaxaca**. Utiliza **React**, procesamiento de archivos CSV, gráficas dinámicas y un **modelo SIRD discretizado** para estimar contagios, recuperaciones y defunciones.

El sistema permite visualizar datos reales, generar predicciones mediante regresión lineal y comparar escenarios epidemiológicos a nivel regional, sirviendo como una herramienta de apoyo en la toma de decisiones y el análisis exploratorio en salud pública.

---

## 1. Descripción General del Proyecto

El simulador fue desarrollado como una herramienta computacional para:

* Analizar la **evolución mensual** del COVID-19 en Oaxaca.
* Comparar datos reales con estimaciones basadas en **modelos estadísticos** (Regresión Lineal).
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

## 2. Modelo Epidemiológico: SIRD Estocástico

El proyecto se basa en un **Modelo SIRD** (Susceptible-Infectado-Recuperado-Defunción), que ha sido adaptado a un entorno discreto.

### Ecuaciones del Modelo Discretizado

El comportamiento general del sistema se basa en las siguientes ecuaciones diferenciales que representan las transiciones entre estados:

$$
\frac{dS}{dt} = −\beta \cdot \frac{S \cdot I}{N} \\
\frac{dI}{dt} = \beta \cdot \frac{S \cdot I}{N} − \gamma I − \mu I \\
\frac{dR}{dt} = \gamma I \\
\frac{dD}{dt} = \mu I
$$

Donde: $\beta$ es la tasa de transmisión, $\gamma$ la tasa de recuperación, y $\mu$ la tasa de mortalidad.

### Simulación Estocástica

Para imitar comportamientos más realistas al incluir variabilidad y la naturaleza probabilística de la transmisión, el simulador incorpora elementos estocásticos utilizando distintas distribuciones:

* **Distribución Exponencial:** Modela el tiempo entre contagios consecutivos.
* **Distribución Normal:** Se utiliza para representar el tiempo de recuperación de los individuos infectados.
* **Distribución Uniforme:** Simula la posición y movimiento aleatorio de los individuos dentro de cada región, representando el contacto uniforme.
* **Distribución Bernoulli:** Determina si un contacto cercano resulta en un contagio efectivo o no.

## 3. Arquitectura del Sistema

El sistema está construido con una arquitectura modular en React, permitiendo la separación de funciones y la gestión eficiente del estado:

1.  **Lector de Datos (`DataLoader`):** Módulo encargado de la carga y procesamiento de archivos CSV. Utiliza la librería **PapaParse** para validar encabezados, normalizar y organizar los datos regionales y mensuales.
2.  **Mapa Interactivo (`MapView`):** Visualización geográfica de las ocho regiones de Oaxaca, representando la concentración de casos mediante colorimetría.
3.  **Sistema de Gráficas (`Charts`):** Genera gráficas dinámicas de evolución temporal (Casos, Defunciones, Recuperaciones) utilizando la librería **Recharts**.
4.  **Comparador Epidemiológico (`CovidComparison`):** Componente dedicado al análisis de regresión lineal y métricas de precisión.
5.  **Motor de Simulación:** Implementa el modelo SIRD discretizado, encargado de actualizar el estado de los individuos en cada iteración.

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
Gráficas comparativas e históricas con datos reales y estimados, implementadas con **Recharts**.

### 5.4 Simulación Temporal
Animación que representa la evolución mes a mes.

### 5.5 Predicción Epidemiológica
El sistema genera predicciones empleando **regresión lineal** (`calculateLinearRegression`) para proyectar el año objetivo basado en los datos de al menos 2 años anteriores.

* **Escenario Base** (Predicción lineal pura)
* **Escenario Optimista** (−15%)
* **Escenario Pesimista** (+25%)

### 5.6 Comparación Real vs Predicción
Incluye métricas clave de precisión para validar el modelo de regresión:

* **Error Absoluto y Promedio**
* **Error Porcentual**
* **Coeficiente de Determinación (R²):** Mide la proporción de la varianza en los datos reales que es predecible a partir del modelo de regresión lineal. Se calcula como $1 - (SS_{Res} / SS_{Total})$.
* **Análisis Mensual:** Identifica el mejor y peor mes predictivo.

---

## 6. 🖼️ Visualización del Simulador

Aquí puedes ver el simulador en acción, mostrando el mapa interactivo y las gráficas dinámicas de comparación de predicción.

<p align="center">
  <img src="URL_A_TU_CAPTURA_DE_PANTALLA_O_GIF" alt="Captura de Pantalla del Simulador Epidemiológico" width="800"/>
</p>
<p align="center">
  *Vista de la Interfaz principal con datos regionales y gráficas de tendencias.*
</p>

---

## 7. 🛠️ Tecnologías Utilizadas

* **React.js** (Framework principal)
* **JavaScript** (Lenguaje de programación)
* **Recharts** (Generación de gráficas dinámicas)
* **PapaParse** (Análisis y lectura de CSV)
* **XLSX.js** (Librería para exportación de reportes a Excel)
* **Lucide React** (Iconografía)
* **HTML5 / CSS3**

## 8. Estructura del Código

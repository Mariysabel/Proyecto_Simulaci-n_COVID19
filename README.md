# Simulador Epidemiológico COVID-19 – Oaxaca (2020–2023) Equipo 13

![Badge Tecnologías](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Badge Lenguaje](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Badge Librerías](https://img.shields.io/badge/Recharts-8884d8?style=for-the-badge&logo=react)
![Badge Datos](https://img.shields.io/badge/CSV_Data-47834C?style=for-the-badge&logo=csv)

Este proyecto implementa un simulador epidemiológico interactivo para analizar la evolución del **COVID-19** en el estado de **Oaxaca**. Utiliza **React**, procesamiento de archivos CSV, gráficas dinámicas y un **modelo SIRD discretizado** para estimar contagios, recuperaciones y defunciones.

El sistema permite visualizar datos reales, generar predicciones mediante regresión lineal y comparar escenarios epidemiológicos a nivel regional, sirviendo como una herramienta de apoyo en la toma de decisiones y el análisis exploratorio en salud pública.

---

## 1. Descripción General del Proyecto y Objetivos

El simulador fue desarrollado como una herramienta computacional para el análisis de sistemas dinámicos de salud pública. Los objetivos principales incluyen:

1.  **Análisis Temporal y Regional:** Estudiar la **evolución mensual** del COVID-19 en Oaxaca, contrastando las tendencias entre las ocho regiones del estado.
2.  **Modelado Híbrido:** Aplicar un **modelo SIRD discreto** para la simulación de las transiciones epidemiológicas, complementado con el uso de **regresión lineal** para la proyección de tendencias a corto y mediano plazo.
3.  **Generación de Escenarios:** Cuantificar el impacto de diferentes condiciones (optimista, base, pesimista) mediante la predicción estadística.
4.  **Visualización Interactiva:** Ofrecer una interfaz que facilite la interpretación de datos mediante (colorimetría) y **gráficas comparativas**.

Se integran datos históricos de las **ocho regiones** del estado, que son cruciales para el análisis segmentado: Valles Centrales, Istmo, Costa, Mixteca, Sierra Norte, Sierra Sur, Cañada y Papaloapan.

## 2. Modelo Epidemiológico: SIRD Discreto

El núcleo del proyecto reside en la implementación del **Modelo SIRD** (Susceptible-Infectado-Recuperado-Defunción), adaptado para simulación a tiempo discreto y enriquecido con componentes probabilísticos para aumentar el realismo.

### 2.1 Ecuaciones de Transición

El comportamiento general del sistema se basa en las siguientes ecuaciones diferenciales que describen el cambio en las poblaciones entre estados:

$$
\frac{dS}{dt} = −\beta \cdot \frac{S \cdot I}{N} \\
\frac{dI}{dt} = \beta \cdot \frac{S \cdot I}{N} − \gamma I − \mu I \\
\frac{dR}{dt} = \gamma I \\
\frac{dD}{dt} = \mu I
$$

Donde:
* $\beta$: Tasa de transmisión (Contagio).
* $\gamma$: Tasa de recuperación.
* $\mu$: Tasa de mortalidad.
* $N$: Población total de la región.

## 3. Arquitectura del Sistema y Flujo de Datos

El sistema está construido como una **SPA (Single Page Application)** utilizando React, lo que garantiza una interfaz de usuario reactiva y rápida. La arquitectura se centra en la modularidad para facilitar el mantenimiento y la extensión.

### 3.1 Módulos Clave (Componentes y Servicios)

#### 1. Lector de Datos (`DataLoader.js` / `csvProcessor.js`)
* **Responsabilidad:** Ingesta de datos históricos y transformación.
* **Tecnología:** Utiliza **PapaParse** para el análisis eficiente de los archivos CSV por parte del navegador.
* **Funcionalidad:**
    * Verifica la integridad de la estructura del archivo (encabezados, número de columnas).
    * Normaliza los datos, consolidando registros por región y año en un formato estandarizado (JSON) listo para ser consumido por el estado de la aplicación.
    * Facilita la carga mediante un componente de interfaz simple.

#### 2. Motor de Simulación y Predicción (`regression.js` / Core Logic)
* **Responsabilidad:** Ejecución de modelos matemáticos y proyecciones estadísticas.
* **Modelo SIRD:** Se ejecuta discretamente para simular la dinámica poblacional a lo largo del tiempo, tomando en cuenta los parámetros estocásticos definidos.
* **Modelo Predictivo:** Implementa la función `calculateLinearRegression`. Esta función es crítica para proyectar el crecimiento o decrecimiento de casos en un año objetivo, basándose en la tendencia observada en los años históricos previos (mínimo 2 años).

#### 3. Visualización (`MapView.js` / `Charts.js`)
* **Responsabilidad:** Renderizar los resultados de forma intuitiva.
* **`MapView`:** Componente encargado de la representación geográfica de Oaxaca. Utiliza **colorimetría** para reflejar la region seleccionada en ese momento. (ej. Valles Centrales).
* **`Charts`:** Utiliza la librería **Recharts** para crear gráficas de alto rendimiento:
    * **LineChart:** Para series de tiempo (tendencias de Casos, Recuperaciones, Defunciones).
    * **BarChart:** Para comparaciones regionales y mensuales.

#### 4. Comparador Epidemiológico (`CovidComparison.js`)
* **Responsabilidad:** Evaluación de la precisión del modelo predictivo y presentación de los escenarios.
* **Métricas de Validación:** Calcula y despliega el **Coeficiente R²**, el Error Absoluto y el Error Porcentual, permitiendo al usuario juzgar la bondad de ajuste del modelo de regresión.
* **Interpretación:** Muestra el resultado de los escenarios (Base, Optimista, Pesimista) y utiliza un sistema de **tarjetas informativas**:
    * Tarjetas rojas: Indican un aumento porcentual de casos interanual.
    * Tarjetas verdes: Indican una reducción porcentual.
    * Símbolo ⚡: Indica que el valor mostrado es una proyección (predicción) y no un dato real.
## 4. Datos Utilizados y Métricas de Validación

La robustez del simulador se basa en la calidad de los datos históricos ingresados y en las métricas utilizadas para evaluar la precisión de las predicciones.

### 4.1 Campos de Datos
Se espera que los archivos CSV de entrada contengan los siguientes campos para cada registro:

* `Región`, `Mes`, `Casos Confirmados`, `Casos Sospechosos`, `Recuperaciones`, `Defunciones`.

> El volumen de datos integrado es de **96 registros por año** (12 meses × 8 regiones).

### 4.2 Métricas Clave de Salud Pública

| Métrica | Descripción |
| :--- | :--- |
| Tasa de Letalidad | $Defunciones / Casos Confirmados$ |
| Tasa de Recuperación | $Recuperados / Casos Confirmados$ |
| Pico Epidemiológico | Mes con mayor número de casos registrados |
| Concentración Regional | Distribución de casos absolutos por región |

### 4.3 Métricas de Precisión del Modelo Predictivo

El módulo de Regresión Lineal evalúa la fiabilidad de las proyecciones mediante:

* **Error Absoluto (AE) y Error Porcentual (PE):** Miden la magnitud del error entre el valor real y el valor proyectado.
* **Coeficiente de Determinación (R²):** Es la métrica principal de bondad de ajuste de la regresión lineal. Un valor cercano a 1 indica que el modelo explica una alta proporción de la variabilidad de los datos. Se calcula como:
    $$
    R^2 = 1 - \frac{SS_{Res}}{SS_{Total}}
    $$

## 5. Visualización del Simulador

A continuación, se muestran las vistas principales de la aplicación, destacando la interacción y la presentación de resultados.

### 5.1 Interfaz Principal y Carga de Datos
Muestra el dashboard inicial y la sección donde el usuario interactúa para cargar el conjunto de datos CSV.
<p align="center">
  <img src="imagenes/Interfaz_1.png" alt="Interfaz Principal y Carga de Datos" width="800"/>
</p>
<p align="center">
  *Figura 1: Vista del dashboard inicial. Se utilizan iconos de Lucide React (Upload, Settings, Database) para la gestión del sistema.*
</p>

### 5.2 Mapa Interactivo y Gráfica de Tendencias
Esta sección visualiza los casos por región mediante colorimetría y ofrece un resumen de la evolución de las métricas clave.
<p align="center">
  <img src="imagenes/Interfaz_3.png" alt="Mapa Interactivo" width="800"/>
</p>
<p align="center">
   <p align="center">
  <img src="imagenes/Interfaz_2.png" alt="Gráfica de Tendencias" width="800"/>
</p>
<p align="center">
  *Figura 2: Mapa de Oaxaca mostrando la concentración regional de casos y la gráfica de línea que detalla la tendencia temporal.*
</p>

### 5.3 Comparación Real vs Predicción
Detalle de las proyecciones futuras (Base, Optimista, Pesimista) y su contraste con los datos reales, incluyendo el cálculo del coeficiente R².
<p align="center">
  <img src="imagenes/Interfaz_4.png" alt="Comparación de Predicción y Escenarios" width="800"/>
</p>
<p align="center">
  *Figura 3: Gráfica comparativa que utiliza Recharts (LineChart) para diferenciar las tendencias de casos reales (línea sólida) contra los escenarios predichos (líneas discontinuas).*
</p>

---

## 7. Tecnologías Utilizadas

* **React.js** (Framework principal)
* **JavaScript** (Lenguaje de programación)
* **Recharts** (Generación de gráficas dinámicas de alto rendimiento)
* **PapaParse** (Análisis robusto y lectura de CSV)
* **XLSX.js** (Librería para exportación de reportes tabulares a formato Excel)
* **Lucide React** (Iconografía modular)
* **HTML5 / CSS3**

## 8. Resultados Principales

La ejecución del simulador a lo largo del período 2020–2023 y la aplicación del modelo SIRD-Regresión Lineal permitieron obtener una serie de hallazgos significativos sobre la dinámica del COVID-19 en Oaxaca:

### 8.1 Validación y Consistencia del Modelo SIRD

El modelo SIRD en tiempo discreto, enriquecido con la simulación estocástica, logró reproducir las tendencias epidemiológicas observadas en los datos oficiales.

* **Comportamiento Consistente:** Las curvas de **Recuperaciones** y **Mortalidad** simuladas mostraron una alta coherencia con los reportes de la Secretaría de Salud, validando el uso de las tasas de transición ($\gamma$ y $\mu$) incorporadas.
* **Identificación de Picos:** El sistema localizó con precisión los **picos epidemiológicos** anuales. Por ejemplo, se observó claramente el impacto de la variante Ómicron a principios de 2022 y la tendencia general de las "olas" de contagio que afectaron a la población estatal.

### 8.2 Análisis de Incidencia Regional

El componente de visualización regional (MapView) y el procesamiento de datos por región confirmaron patrones de concentración de casos bien definidos:

* **Valles Centrales:** Se confirmó como la región con la **mayor incidencia acumulada** de casos confirmados durante todo el período. Este resultado es esperado dada la alta densidad poblacional y la concentración de actividades económicas y administrativas en la zona metropolitana de Oaxaca de Juárez.
* **Correlación Socio-demográfica:** El simulador indirectamente demostró una fuerte correlación entre la densidad poblacional y la tasa de contagio (factor $S \cdot I / N$ en el modelo), siendo las zonas más pobladas las más afectadas, lo cual refuerza la importancia de la variable espacial en el modelo estocástico.

### 8.3 Precisión de las Predicciones (Regresión Lineal)

El módulo de comparación evaluó la fiabilidad del modelo de regresión lineal para generar proyecciones de corto plazo (Escenarios Base, Optimista, Pesimista).

* **Nivel de Precisión:** El análisis de precisión (Figura 4) arrojó **niveles moderados de precisión** en las predicciones mensuales, con el **Coeficiente R²** variando según la región y el mes. Los valores de R² fueron generalmente más altos en periodos de tendencia estable y menores en puntos de inflexión abruptos (cambios de ola).
* **Utilidad de Corto Plazo:** Se concluyó que la regresión lineal es una técnica viable para generar proyecciones de **corto plazo** y establecer los límites de los escenarios (±15% y ±25%), proporcionando a los tomadores de decisiones un rango de resultados probables.
* **Análisis Predictivo Detallado:** El sistema fue capaz de identificar el **"Mejor mes predictivo"** (donde el Error Absoluto fue mínimo) y el **"Peor mes predictivo"** (donde el Error Absoluto fue máximo), lo cual es crucial para la calibración futura del modelo.

### 8.4 Tendencias Generales (2020–2023)

* **Tendencia de Mortalidad:** El análisis mostró una tendencia general de reducción en la tasa de letalidad, particularmente después de la implementación de la campaña de vacunación masiva a partir de 2021.
* **Variación Interanual:** Las tarjetas de resultado (Figura 4) confirmaron las variaciones porcentuales año contra año, reflejando la transición de la fase pandémica a una fase con menor impacto, pero con rebrotes ocasionales.

## 9. Comandos Disponibles

En este proyecto puedes ejecutar:

### `npm start`

Ejecuta la aplicación en modo desarrollo.
Abre `http://localhost:3000` en tu navegador.
La página se recarga al hacer cambios y puedes ver errores en la consola.

### `npm run build`

Crea una versión optimizada para producción en la carpeta `build`.
Los archivos se minifican y están listos para desplegar en cualquier servidor web estático.
Más info en la sección de deployment. 

## 10. Cómo Ejecutar el Proyecto

1.  **Clonar el repositorio**
    ```bash
    git clone [https://github.com/usuario/repositorio.git](https://github.com/usuario/repositorio.git)
    ```
2.  **Instalar dependencias**
    ```bash
    npm install
    ```
3.  **Iniciar la aplicación**
    ```bash
    npm start
    ```
4.  **Cargar los archivos CSV** desde la interfaz. El sistema procesará automáticamente los registros para generar las visualizaciones.

## 11. Conclusiones

Este proyecto no solo funcionó como un ejercicio de simulación computacional, sino que se consolidó como una herramienta funcional y analítica. Las siguientes conclusiones resumen los principales logros y el valor técnico del simulador:

### 11.1 Validación y Utilidad del Modelo Híbrido

* **Modelo SIRD Discreto Validado:** La adaptación del Modelo SIRD a un entorno de tiempo discreto demostró ser efectiva para la replicación de las curvas epidemiológicas observadas en Oaxaca. Al incorporar **parámetros estocásticos** (Distribuciones Exponencial, Normal, Uniforme y Bernoulli), el modelo ganó en realismo, permitiendo que la simulación reflejara mejor la variabilidad inherente a los sistemas dinámicos de salud.
* **Coherencia con Datos Reales:** La integración rigurosa de datos oficiales históricos aseguró que los resultados de la simulación y el análisis estadístico mantuvieran una **alta coherencia** con el comportamiento observado de la pandemia a nivel regional.

### 11.2 Implicaciones en la Regresión y Predicción

* **Regresión Lineal para Proyección:** Se confirmó que la implementación de la **Regresión Lineal** fue una técnica de análisis eficiente para la generación de proyecciones a **corto plazo**.
* **Establecimiento de Escenarios:** La capacidad del sistema para generar escenarios (Base, Optimista, Pesimista) provee un marco invaluable para el **análisis exploratorio**. Estos escenarios ofrecen a potenciales usuarios (investigadores o decisores) un rango de resultados probables, permitiendo evaluar el riesgo futuro en las tendencias de contagio y mortalidad.
* **Métricas de Calidad (R²):** El uso del **Coeficiente de Determinación (R²)** dentro del módulo de comparación establece una base transparente para la validación del modelo, permitiendo medir objetivamente el grado de ajuste de la proyección a los datos históricos.

### 11.3 Valor como Herramienta Educativa y de Apoyo

* **Herramienta Funcional:** El simulador es un sistema modular y funcional construido con React, cumpliendo con los requisitos de la ingeniería de software moderna y la visualización de datos.
* **Impacto Regional:** El análisis segmentado por las ocho regiones de Oaxaca demostró la utilidad de la desagregación de datos. Esto es fundamental para identificar focos de alta incidencia (como Valles Centrales) y priorizar recursos de salud pública de manera efectiva.
* **Potencial Educativo:** En esencia, el sistema sirve como una **herramienta educativa** de alto valor, permitiendo a estudiantes y analistas interactuar con las variables del modelo SIRD y observar de primera mano cómo las tasas de transmisión y recuperación impactan la dinámica de una epidemia.

## 12. Integrantes del Proyecto

* Angel de Jesús Méndez García
* Santiago Enmanuel Pérez Jiménez
* María Isabel Pérez Cruz

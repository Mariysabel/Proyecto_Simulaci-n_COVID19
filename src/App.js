import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, Upload, Map, AlertCircle, TrendingUp } from 'lucide-react';
import Papa from 'papaparse';

const OaxacaCovidSimulator = () => {
  const [selectedYear, setSelectedYear] = useState('2020');
  const [selectedRegion, setSelectedRegion] = useState('Valles Centrales');
  const [selectedMetrics, setSelectedMetrics] = useState(['confirmados']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [showMap, setShowMap] = useState(true);
  const [csvData, setCsvData] = useState({});
  const [filesUploaded, setFilesUploaded] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrediction2024, setShowPrediction2024] = useState(true);
  const [showPrediction2023, setShowPrediction2023] = useState(false);
  const [predictionMode, setPredictionMode] = useState('base');
  const [showComparison, setShowComparison] = useState(false);

  const regions = ['Valles Centrales', 'Istmo', 'Costa', 'Mixteca', 'Sierra Norte', 'Sierra Sur', 'Cañada', 'Papaloapan'];
  const years = ['2020', '2021', '2022', '2023'];
  const metrics = [
    { value: 'confirmados', label: 'Casos Confirmados', color: '#ef4444' },
    { value: 'sospechosos', label: 'Casos Sospechosos', color: '#f59e0b' },
    { value: 'recuperacion', label: 'Recuperaciones', color: '#10b981' },
    { value: 'defunciones', label: 'Defunciones', color: '#6b7280' }
  ];

  const regionCoordinates = {
    'Valles Centrales': { x: 180, y: 140 },
    'Istmo': { x: 280, y: 180 },
    'Costa': { x: 100, y: 200 },
    'Mixteca': { x: 120, y: 80 },
    'Sierra Norte': { x: 200, y: 60 },
    'Sierra Sur': { x: 160, y: 180 },
    'Cañada': { x: 220, y: 100 },
    'Papaloapan': { x: 260, y: 80 }
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Función para normalizar nombres de regiones
  const normalizeRegionName = (regionName) => {
    if (!regionName) return null;
    
    const normalized = regionName
      .trim()
      .replace(/Ã±/g, 'ñ')
      .replace(/CaÃ±ad/g, 'Cañada')
      .replace(/Cañad$/g, 'Cañada');
    
    // Buscar coincidencia exacta
    const exactMatch = regions.find(r => r === normalized);
    if (exactMatch) return exactMatch;
    
    // Buscar coincidencia parcial
    const partialMatch = regions.find(r => 
      r.toLowerCase().includes(normalized.toLowerCase()) || 
      normalized.toLowerCase().includes(r.toLowerCase())
    );
    
    return partialMatch || null;
  };

  useEffect(() => {
    const loadAllCSVs = async () => {
      setLoading(true);
      const allData = {};
      const filesLoaded = {};

      for (const year of years) {
        try {
          const filename = `covid_oaxaca_${year}_mensual.csv`;
          const data = await window.fs.readFile(filename, { encoding: 'utf8' });

          Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            delimitersToGuess: [';', ',', '\t', '|'],
            complete: (results) => {
              const processedData = processCSVData(results.data);
              allData[year] = processedData;
              filesLoaded[year] = true;
            }
          });
        } catch (err) {
          console.log(`No se pudo cargar ${year}:`, err);
        }
      }

      setCsvData(allData);
      setFilesUploaded(filesLoaded);
      setLoading(false);
    };

    loadAllCSVs();
  }, []);

  const handleFileUpload = (event, year) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimitersToGuess: [';', ',', '\t', '|'],
      complete: (results) => {
        try {
          const processedData = processCSVData(results.data);
          setCsvData(prev => ({ ...prev, [year]: processedData }));
          setFilesUploaded(prev => ({ ...prev, [year]: true }));
          setLoading(false);
        } catch (err) {
          setError(`Error procesando ${year}: ${err.message}`);
          setLoading(false);
        }
      },
      error: (err) => {
        setError(`Error leyendo archivo: ${err.message}`);
        setLoading(false);
      }
    });
  };

  const processCSVData = (data) => {
    const regionData = {};
    regions.forEach(region => { regionData[region] = []; });

    data.forEach(row => {
      const normalizedRow = {};
      Object.keys(row).forEach(key => { 
        const cleanKey = key.trim();
        normalizedRow[cleanKey] = row[key]; 
      });

      let regionRaw = normalizedRow['Region'] || normalizedRow['region'] || normalizedRow['REGION'];
      const mes = normalizedRow['Mes'] || normalizedRow['mes'] || normalizedRow['MES'];

      // Normalizar el nombre de la región
      const region = normalizeRegionName(regionRaw);

      if (region && mes) {
        const monthData = {
          mes: mes,
          confirmados: parseInt(normalizedRow['Casos Confirmados'] || normalizedRow['Casos Confir'] || normalizedRow['confirmados'] || 0),
          sospechosos: parseInt(normalizedRow['Casos Sospechosos'] || normalizedRow['Casos Sospe'] || normalizedRow['sospechosos'] || 0),
          recuperacion: parseInt(normalizedRow['Recuperaciones'] || normalizedRow['recuperacion'] || 0),
          defunciones: parseInt(normalizedRow['Defunciones'] || normalizedRow['defunciones'] || 0)
        };
        regionData[region].push(monthData);
      }
    });

    Object.keys(regionData).forEach(region => {
      regionData[region].sort((a, b) => meses.indexOf(a.mes) - meses.indexOf(b.mes));
    });

    return regionData;
  };

  useEffect(() => {
    let interval;
    if (isAnimating && currentMonth < 11) {
      interval = setInterval(() => {
        setCurrentMonth(prev => prev + 1);
      }, 800);
    } else if (currentMonth >= 11) {
      setIsAnimating(false);
    }
    return () => clearInterval(interval);
  }, [isAnimating, currentMonth]);

  const handleAnimate = () => {
    if (!csvData[selectedYear] || !csvData[selectedYear][selectedRegion]) {
      setError('Por favor carga el archivo CSV del año seleccionado primero');
      return;
    }
    setCurrentMonth(0);
    setIsAnimating(true);
  };

  const toggleMetric = (metricValue) => {
    if (selectedMetrics.includes(metricValue)) {
      if (selectedMetrics.length > 1) {
        setSelectedMetrics(selectedMetrics.filter(m => m !== metricValue));
      }
    } else {
      setSelectedMetrics([...selectedMetrics, metricValue]);
    }
  };

  // Predicción mejorada que sigue patrones mensuales históricos
  const predictForRegionMetric = (region, metric, targetYear, yearsToUse) => {
    const predictions = new Array(12).fill(0);
    
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const monthlyValues = [];
      const yearWeights = [];
      
      yearsToUse.forEach((year, idx) => {
        const yearData = csvData[year];
        const val = yearData?.[region]?.[monthIdx]?.[metric];
        if (typeof val === 'number' && !isNaN(val)) {
          monthlyValues.push(val);
          yearWeights.push(idx + 1);
        }
      });

      if (monthlyValues.length === 0) {
        predictions[monthIdx] = 0;
        continue;
      }

      if (monthlyValues.length === 1) {
        predictions[monthIdx] = monthlyValues[0];
        continue;
      }

      const totalWeight = yearWeights.reduce((a, b) => a + b, 0);
      const weightedSum = monthlyValues.reduce((sum, val, idx) => {
        return sum + (val * yearWeights[idx]);
      }, 0);
      
      const weightedAvg = weightedSum / totalWeight;

      const firstVal = monthlyValues[0];
      const lastVal = monthlyValues[monthlyValues.length - 1];
      const trend = (lastVal - firstVal) / monthlyValues.length;

      const prediction = weightedAvg + trend;
      predictions[monthIdx] = Math.max(0, Math.round(prediction));
    }

    return predictions;
  };

  const predict2023ForRegionMetric = (region, metric) => {
    const availableYears = years.filter(y => parseInt(y) <= 2022 && csvData[y]);
    return predictForRegionMetric(region, metric, 2023, availableYears);
  };

  const predict2024ForRegionMetric = (region, metric) => {
    const availableYears = years.filter(y => parseInt(y) <= 2023 && csvData[y]);
    return predictForRegionMetric(region, metric, 2024, availableYears);
  };

  const chartData = useMemo(() => {
    const hist = (csvData[selectedYear]?.[selectedRegion]) || [];
    const hist2023 = (csvData['2023']?.[selectedRegion]) || [];
    
    const result = meses.map((mes, idx) => {
      const dataPoint = { mes };
      
      selectedMetrics.forEach(metric => {
        const historicalVal = hist[idx]?.[metric];
        dataPoint[`${metric}_hist`] = typeof historicalVal === 'number' ? historicalVal : null;
        
        // Para predicciones 2023: si hay datos reales de 2023, usarlos
        if (hist2023[idx] && typeof hist2023[idx][metric] === 'number') {
          dataPoint[`${metric}_pred2023_base`] = hist2023[idx][metric];
          dataPoint[`${metric}_pred2023_optimista`] = hist2023[idx][metric];
          dataPoint[`${metric}_pred2023_pesimista`] = hist2023[idx][metric];
        } else {
          const pred2023 = predict2023ForRegionMetric(selectedRegion, metric);
          dataPoint[`${metric}_pred2023_base`] = pred2023[idx];
          dataPoint[`${metric}_pred2023_optimista`] = Math.max(0, Math.round(pred2023[idx] * 0.85));
          dataPoint[`${metric}_pred2023_pesimista`] = Math.round(pred2023[idx] * 1.25);
        }
        
        // Predicciones 2024
        const pred2024 = predict2024ForRegionMetric(selectedRegion, metric);
        dataPoint[`${metric}_pred2024_base`] = pred2024[idx];
        dataPoint[`${metric}_pred2024_optimista`] = Math.max(0, Math.round(pred2024[idx] * 0.85));
        dataPoint[`${metric}_pred2024_pesimista`] = Math.round(pred2024[idx] * 1.25);
      });
      
      return dataPoint;
    });
    
    return result;
  }, [csvData, selectedYear, selectedRegion, selectedMetrics]);

  const comparisonData = useMemo(() => {
    const result = [];
    
    years.forEach(year => {
      const yearData = csvData[year]?.[selectedRegion] || [];
      const total = {
        año: year,
        confirmados: 0,
        sospechosos: 0,
        recuperacion: 0,
        defunciones: 0
      };
      
      yearData.forEach(monthData => {
        total.confirmados += monthData.confirmados || 0;
        total.sospechosos += monthData.sospechosos || 0;
        total.recuperacion += monthData.recuperacion || 0;
        total.defunciones += monthData.defunciones || 0;
      });
      
      result.push(total);
    });
    
    // Si hay datos reales de 2023, usarlos en lugar de predicción
    const has2023Data = csvData['2023'] && csvData['2023'][selectedRegion];
    if (!has2023Data) {
      const pred2023 = {
        año: '2023*',
        confirmados: 0,
        sospechosos: 0,
        recuperacion: 0,
        defunciones: 0
      };
      
      metrics.forEach(metric => {
        const predictions = predict2023ForRegionMetric(selectedRegion, metric.value);
        pred2023[metric.value] = predictions.reduce((sum, val) => sum + val, 0);
      });
      
      result.push(pred2023);
    }
    
    // Predicción 2024
    const pred2024 = {
      año: '2024*',
      confirmados: 0,
      sospechosos: 0,
      recuperacion: 0,
      defunciones: 0
    };
    
    metrics.forEach(metric => {
      const predictions = predict2024ForRegionMetric(selectedRegion, metric.value);
      pred2024[metric.value] = predictions.reduce((sum, val) => sum + val, 0);
    });
    
    result.push(pred2024);
    
    return result;
  }, [csvData, selectedRegion]);

  const displayedData = useMemo(() => {
    if (!isAnimating) return chartData;
    return chartData.map((d, i) => {
      const newData = { ...d };
      selectedMetrics.forEach(metric => {
        newData[`${metric}_hist`] = i <= currentMonth ? d[`${metric}_hist`] : null;
      });
      return newData;
    });
  }, [chartData, isAnimating, currentMonth, selectedMetrics]);

  const hasData = csvData[selectedYear] && csvData[selectedYear][selectedRegion] && csvData[selectedYear][selectedRegion].length > 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#0c4a6e', margin: 0, fontWeight: 800 }}>COVID-19 Oaxaca</h1>
        <p style={{ color: '#475569', marginTop: '8px', fontSize: '1.1rem', fontWeight: 500 }}>
          Simulador Interactivo de Datos Epidemiológicos
        </p>
      </header>

      <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Upload size={18}/> Deseas modificar algún Archivo CSV
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {years.map(year => (
            <div key={year} style={{
              minWidth: '130px', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '12px',
              border: filesUploaded[year] ? '2px solid #86efac' : '2px solid #dbeafe',
              background: filesUploaded[year] ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              position: 'relative', opacity: filesUploaded[year] ? 1 : 0.6
            }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>{year}</div>
              <div style={{ marginLeft: 'auto', fontWeight: 700, color: '#059669', fontSize: '1.2rem' }}>
                {filesUploaded[year] ? '✓' : '○'}
              </div>
              <input 
                type="file" 
                id={`file-${year}`} 
                accept=".csv" 
                onChange={(e) => handleFileUpload(e, year)} 
                style={{ display: 'none' }}
              />
              <label htmlFor={`file-${year}`} style={{
                position: 'absolute', right: '8px', bottom: '8px',
                background: 'rgba(255,255,255,0.9)', borderRadius: '6px',
                padding: '4px 6px', cursor: 'pointer', fontSize: '14px'
              }}>📁</label>
            </div>
          ))}
        </div>
        {loading && <div style={{ width: '28px', height: '28px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '12px 0' }} />}
        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#dc2626', fontWeight: 600, marginTop: '12px', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
            <AlertCircle size={16}/> {error}
          </div>
        )}
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '12px' }}>
          Los archivos CSV se cargan automáticamente desde los documentos adjuntos o pueden subirse manualmente.
        </p>
      </section>

      <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
            <label style={{ color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>Año</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              style={{ padding: '10px 12px', borderRadius: '10px', border: '2px solid #e5e7eb', background: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
            <label style={{ color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>Región</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)} 
              style={{ padding: '10px 12px', borderRadius: '10px', border: '2px solid #e5e7eb', background: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={handleAnimate} 
              disabled={isAnimating || !hasData} 
              style={{ color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: hasData && !isAnimating ? 'pointer' : 'not-allowed', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #10b981, #059669)', opacity: hasData && !isAnimating ? 1 : 0.5 }}
            >
              <Play size={14}/> Animar
            </button>
            <button 
              onClick={() => setShowMap(!showMap)} 
              style={{ color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
            >
              <Map size={14}/> {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
            </button>
            <button 
              onClick={() => setShowComparison(!showComparison)} 
              style={{ color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <TrendingUp size={14}/> {showComparison ? 'Ocultar' : 'Comparación'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>Seleccionar métricas a visualizar:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '10px' }}>
            {metrics.map(metric => (
              <label key={metric.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', border: '2px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.value)}
                  onChange={() => toggleMetric(metric.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', background: metric.color, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                {metric.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showPrediction2023} 
              onChange={(e) => setShowPrediction2023(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Mostrar predicción 2023
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showPrediction2024} 
              onChange={(e) => setShowPrediction2024(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Mostrar predicción 2024
          </label>
          
          <label style={{ color: '#374151', fontSize: '0.95rem', fontWeight: 600 }}>
            Escenario:
            <select 
              value={predictionMode} 
              onChange={(e) => setPredictionMode(e.target.value)} 
              style={{ padding: '10px 12px', borderRadius: '10px', border: '2px solid #e5e7eb', background: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', marginLeft: '8px' }}
            >
              <option value="base">Base</option>
              <option value="optimista">Optimista (-15%)</option>
              <option value="pesimista">Pesimista (+25%)</option>
              <option value="todos">Mostrar todos</option>
            </select>
          </label>
        </div>
      </section>

      {showMap && (
        <section style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #93c5fd', borderRadius: '16px', padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', fontWeight: 700 }}>Mapa de Oaxaca</h3>
          <svg width="520" height="320" style={{ borderRadius: '12px', marginTop: '12px', background: 'white', padding: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <defs>
              <pattern id="mapBackground" x="0" y="0" width="520" height="320" patternUnits="userSpaceOnUse">
                <image href="/img/mapa.png" x="0" y="0" width="520" height="320" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            </defs>
            
            <rect x="0" y="0" width="520" height="320" fill="url(#mapBackground)" opacity="0.4" />
            
            <path 
              d="M 80 100 L 100 70 L 140 50 L 180 45 L 220 50 L 260 60 L 300 80 L 340 100 L 370 130 L 390 160 L 400 190 L 390 220 L 360 240 L 320 250 L 280 255 L 240 250 L 200 245 L 160 235 L 120 220 L 90 200 L 70 170 L 65 140 Z"
              fill="#e0f2fe"
              stroke="#0369a1"
              strokeWidth="2.5"
              opacity="0.3"
            />
            
            <path 
              d="M 150 100 Q 180 120 200 100 T 250 110"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            
            <text x="260" y="160" fontSize="11" fill="#0369a1" opacity="0.6" fontWeight="600" textAnchor="middle">
              OAXACA
            </text>
            
            {regions.map(region => {
              const coords = regionCoordinates[region];
              const isSelected = region === selectedRegion;
              const hasRegionData = csvData[selectedYear]?.[region]?.length > 0;
              return (
                <g key={region} style={{ cursor: hasRegionData ? 'pointer' : 'default' }}>
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? 16 : 12}
                    fill={isSelected ? '#10b981' : hasRegionData ? '#3b82f6' : '#9ca3af'}
                    stroke="#fff"
                    strokeWidth="3"
                    style={{ cursor: hasRegionData ? 'pointer' : 'default' }}
                    onClick={() => hasRegionData && setSelectedRegion(region)}
                  />
                  <text 
                    x={coords.x} 
                    y={coords.y + 30}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#1e293b"
                  >
                    {region.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>
      )}

      <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', fontWeight: 700 }}>Evolución Temporal — {selectedRegion}</h3>
        </div>

        {hasData ? (
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={displayedData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis 
                dataKey="mes" 
                label={{ value: 'Meses', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 12 }}
                height={60}
              />
              <YAxis 
                label={{ value: 'Casos', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {selectedMetrics.map(metric => {
                const metricObj = metrics.find(m => m.value === metric);
                return (
                  <React.Fragment key={metric}>
                    <Line 
                      type="monotone" 
                      dataKey={`${metric}_hist`} 
                      name={`${metricObj.label} (${selectedYear})`} 
                      stroke={metricObj.color} 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: metricObj.color, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                      label={isAnimating ? { 
                        position: 'top', 
                        fill: metricObj.color, 
                        fontSize: 12, 
                        fontWeight: 'bold',
                        formatter: (value) => value !== null ? value : ''
                      } : false}
                    />
                    {showPrediction2023 && (predictionMode === 'base' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2023_base`} 
                        name={`${metricObj.label} 2023 (Base)`} 
                        stroke="#8b5cf6" 
                        strokeDasharray="6 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.7}
                      />
                    )}
                    {showPrediction2023 && (predictionMode === 'optimista' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2023_optimista`} 
                        name={`${metricObj.label} 2023 (Opt.)`} 
                        stroke="#a78bfa" 
                        strokeDasharray="4 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.6}
                      />
                    )}
                    {showPrediction2023 && (predictionMode === 'pesimista' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2023_pesimista`} 
                        name={`${metricObj.label} 2023 (Pes.)`} 
                        stroke="#7c3aed" 
                        strokeDasharray="2 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.6}
                      />
                    )}
                    {showPrediction2024 && (predictionMode === 'base' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2024_base`} 
                        name={`${metricObj.label} 2024 (Base)`} 
                        stroke={metricObj.color} 
                        strokeDasharray="6 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.7}
                      />
                    )}
                    {showPrediction2024 && (predictionMode === 'optimista' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2024_optimista`} 
                        name={`${metricObj.label} 2024 (Opt.)`} 
                        stroke="#06b6d4" 
                        strokeDasharray="4 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.6}
                      />
                    )}
                    {showPrediction2024 && (predictionMode === 'pesimista' || predictionMode === 'todos') && (
                      <Line 
                        type="monotone" 
                        dataKey={`${metric}_pred2024_pesimista`} 
                        name={`${metricObj.label} 2024 (Pes.)`} 
                        stroke="#ef4444" 
                        strokeDasharray="2 6" 
                        strokeWidth={2} 
                        dot={false}
                        opacity={0.6}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <Upload size={64} color="#94a3b8" />
            <p style={{ marginTop: '10px', fontSize: '1rem' }}>No hay datos disponibles. Sube el archivo CSV correspondiente</p>
          </div>
        )}
      </section>

      {showComparison && (
        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', fontWeight: 700 }}>Comparación Anual 2020-2024* — {selectedRegion}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>* 2023 y 2024 son predicciones basadas en tendencias históricas (si no hay datos reales)</p>
          </div>
          
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis 
                dataKey="año" 
                label={{ value: 'Año', position: 'insideBottom', offset: -10 }}
                height={60}
              />
              <YAxis 
                label={{ value: 'Total de Casos', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="confirmados" fill="#ef4444" name="Confirmados" />
              <Bar dataKey="sospechosos" fill="#f59e0b" name="Sospechosos" />
              <Bar dataKey="recuperacion" fill="#10b981" name="Recuperaciones" />
              <Bar dataKey="defunciones" fill="#6b7280" name="Defunciones" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OaxacaCovidSimulator;
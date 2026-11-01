"use client";

import React, { useState } from "react";

interface Experiment {
  id: number;
  volume: number;
  speed: number;
  time: number;
  coeff: number;
  homogeneity: number;
  energy: number;
  timeTo95: number | string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("main");

  // Параметры моделирования
  const [volume, setVolume] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(300);
  const [time, setTime] = useState<number>(10);
  const [coeff, setCoeff] = useState<number>(0.001);
  const [targetHomogeneity, setTargetHomogeneity] = useState<number>(95);

  // Результаты
  const [currentHomogeneity, setCurrentHomogeneity] = useState<number>(
    Number((100 * (1 - Math.exp(-0.001 * 300 * 10))).toFixed(2))
  );
  const [currentEnergy, setCurrentEnergy] = useState<number>(
    Number((0.0001 * Math.pow(300, 2) * 10).toFixed(2))
  );

  const [experiments, setExperiments] = useState<Experiment[]>([
    { id: 1, volume: 100, speed: 150, time: 5, coeff: 0.001, homogeneity: 52.76, energy: 11.25, timeTo95: 19.97 },
    { id: 2, volume: 100, speed: 250, time: 8, coeff: 0.001, homogeneity: 86.47, energy: 50.0, timeTo95: 11.98 },
    { id: 3, volume: 100, speed: 350, time: 10, coeff: 0.001, homogeneity: 96.98, energy: 122.5, timeTo95: 8.56 },
    { id: 4, volume: 100, speed: 450, time: 12, coeff: 0.001, homogeneity: 99.55, energy: 243.0, timeTo95: 6.66 },
    { id: 5, volume: 100, speed: 500, time: 15, coeff: 0.001, homogeneity: 99.94, energy: 375.0, timeTo95: 5.99 },
  ]);

  const [optimalResult, setOptimalResult] = useState<{
    speed: number;
    time: number;
    homogeneity: number;
    energy: number;
  } | null>(null);

  const calcHomogeneity = (t: number, n: number, k: number) => {
    const H = 100 * (1 - Math.exp(-k * n * t));
    return Number(H.toFixed(2));
  };

  const calcEnergy = (n: number, t: number) => {
    const E = 0.0001 * Math.pow(n, 2) * t;
    return Number(E.toFixed(2));
  };

  const calcTimeToTarget = (n: number, k: number, target = 95) => {
    if (n <= 0 || k <= 0) return "N/A";
    const targetDec = target / 100;
    const t = -Math.log(1 - targetDec) / (k * n);
    return t > 0 ? Number(t.toFixed(2)) : "N/A";
  };

  const handleCalculate = () => {
    const H = calcHomogeneity(time, speed, coeff);
    const E = calcEnergy(speed, time);
    const t95 = calcTimeToTarget(speed, coeff, targetHomogeneity);

    setCurrentHomogeneity(H);
    setCurrentEnergy(E);

    const newExp: Experiment = {
      id: experiments.length + 1,
      volume,
      speed,
      time,
      coeff,
      homogeneity: H,
      energy: E,
      timeTo95: t95,
    };
    setExperiments([newExp, ...experiments]);
  };

  const handleReset = () => {
    setVolume(100);
    setSpeed(300);
    setTime(10);
    setCoeff(0.001);
    setTargetHomogeneity(95);
    setCurrentHomogeneity(calcHomogeneity(10, 300, 0.001));
    setCurrentEnergy(calcEnergy(300, 10));
  };

  const handleOptimize = () => {
    let minEnergy = Infinity;
    let bestSpeed = 100;
    let bestTime = 1;
    let bestH = 0;

    for (let n = 100; n <= 500; n += 5) {
      for (let t = 1; t <= 20; t += 0.5) {
        const h = calcHomogeneity(t, n, coeff);
        if (h >= targetHomogeneity) {
          const e = calcEnergy(n, t);
          if (e < minEnergy) {
            minEnergy = e;
            bestSpeed = n;
            bestTime = t;
            bestH = h;
          }
        }
      }
    }

    if (minEnergy !== Infinity) {
      setOptimalResult({
        speed: bestSpeed,
        time: Number(bestTime.toFixed(1)),
        homogeneity: Number(bestH.toFixed(2)),
        energy: Number(minEnergy.toFixed(2)),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Шапка */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-base font-bold text-blue-600">
            Лабораторная работа №2: ЛКМ
          </h1>
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {[
              { id: "main", label: "Главная" },
              { id: "theory", label: "Теория" },
              { id: "model", label: "Модель" },
              { id: "sim", label: "Расчёт" },
              { id: "opt", label: "Оптимизация" },
              { id: "results", label: "График" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Основной контейнер */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Главная */}
        {activeTab === "main" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded">
                Моделирование процессов
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Приготовление лакокрасочных материалов
              </h2>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                Интерактивное веб-приложение для математического моделирования, визуализации и оптимизации процесса смешивания компонентов в смесительных установках.
              </p>
            </div>

            {/* Простая схема */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-around gap-4 text-center">
              <div className="bg-white p-4 rounded border border-gray-200 w-full md:w-1/3 shadow-sm">
                <div className="text-xs font-bold text-gray-500">КОМПОНЕНТЫ</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">Смола (G1) + Растворитель (G2)[cite: 5]</div>
              </div>
              <div className="text-gray-400 font-bold">→</div>
              <div className="bg-white p-4 rounded border border-blue-200 w-full md:w-1/3 shadow-sm">
                <div className="text-xs font-bold text-blue-500">СМЕСИТЕЛЬНЫЙ УЗЕЛ</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">Скорость n, Объем V[cite: 2, 5]</div>
              </div>
              <div className="text-gray-400 font-bold">→</div>
              <div className="bg-white p-4 rounded border border-green-200 w-full md:w-1/3 shadow-sm">
                <div className="text-xs font-bold text-green-600">ГОТОВЫЙ ПРОДУКТ</div>
                <div className="text-sm font-semibold text-gray-800 mt-1">Степень однородности H[cite: 2]</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("sim")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition shadow-sm"
            >
              Перейти к расчетам
            </button>
          </div>
        )}

        {/* Теория */}
        {activeTab === "theory" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm text-sm">
            <h2 className="text-lg font-bold text-gray-900">Теоретические сведения</h2>
            <p className="text-gray-600 leading-relaxed">
              Лакокрасочные материалы (ЛКМ) готовятся путем смешивания смол и растворителей в специальных агрегатах[cite: 5]. Для описания динамики процесса используется закон сохранения материи (приход = убыль + приращение)[cite: 5].
            </p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-xs text-blue-700">
              T · (dC / dt) + C = P<sub>i</sub>[cite: 5]
            </div>
          </div>
        )}

        {/* Математическая модель */}
        {activeTab === "model" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm text-sm">
            <h2 className="text-lg font-bold text-gray-900">Математическая модель</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-xs font-bold text-gray-500 mb-1">ФОРМУЛА ОДНОРОДНОСТИ</div>
                <div className="font-mono text-sm text-gray-800">H(t, n) = 100 · (1 - e<sup>-k · n · t</sup>)</div>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="text-xs font-bold text-gray-500 mb-1">ЭНЕРГОЗАТРАТЫ</div>
                <div className="font-mono text-sm text-gray-800">E(n, t) = 0.0001 · n² · t</div>
              </div>
            </div>
          </div>
        )}

        {/* Моделирование и расчет */}
        {activeTab === "sim" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Панель управления */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Параметры</h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Сбросить
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600 flex justify-between">
                  <span>Объем (л)[cite: 2]</span>
                  <span className="font-mono">{volume}</span>
                </label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600 flex justify-between">
                  <span>Скорость n (об/мин)</span>
                  <span className="font-mono">{speed}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600 flex justify-between">
                  <span>Время t (мин)</span>
                  <span className="font-mono">{time}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={time}
                  onChange={(e) => setTime(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-600 flex justify-between">
                  <span>Коэффициент k[cite: 2]</span>
                  <span className="font-mono">{coeff}</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={coeff}
                  onChange={(e) => setCoeff(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 rounded transition shadow-sm"
              >
                Рассчитать
              </button>
            </div>

            {/* Результаты и таблица */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Однородность (H)[cite: 2]</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{currentHomogeneity}%</div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Энергозатраты (E)</div>
                  <div className="text-xl font-bold text-gray-800 mt-1">{currentEnergy}</div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Время до 95%</div>
                  <div className="text-xl font-bold text-gray-800 mt-1">{calcTimeToTarget(speed, coeff, 95)} мин</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded p-4 shadow-sm overflow-x-auto">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">История экспериментов[cite: 2, 4]</h4>
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-2">№</th>
                      <th className="p-2">Скорость</th>
                      <th className="p-2">Время</th>
                      <th className="p-2">H (%)</th>
                      <th className="p-2">Энергия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {experiments.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-2 font-mono">#{exp.id}</td>
                        <td className="p-2">{exp.speed} об/мин</td>
                        <td className="p-2">{exp.time} мин</td>
                        <td className="p-2 font-semibold text-blue-600">{exp.homogeneity}%</td>
                        <td className="p-2">{exp.energy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Оптимизация */}
        {activeTab === "opt" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Оптимизация параметров</h2>
            <p className="text-sm text-gray-600">
              Поиск минимальных энергозатрат при условии достижения однородности смеси H ≥ 95%[cite: 2, 3].
            </p>
            <button
              onClick={handleOptimize}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded transition shadow-sm"
            >
              Найти оптимум
            </button>

            {optimalResult && (
              <div className="bg-amber-50 border border-amber-200 rounded p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mt-4">
                <div>
                  <div className="text-xs text-gray-500">Скорость</div>
                  <div className="font-bold text-gray-800">{optimalResult.speed} об/мин</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Время</div>
                  <div className="font-bold text-gray-800">{optimalResult.time} мин</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Однородность</div>
                  <div className="font-bold text-blue-600">{optimalResult.homogeneity}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Энергозатраты</div>
                  <div className="font-bold text-amber-700">{optimalResult.energy}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Графики и результаты */}
        {activeTab === "results" && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">График зависимости однородности</h2>
            
            {/* График с интерактивным ховером и тултипом */}
            <div className="h-56 flex items-end gap-1 border-b border-l border-gray-300 p-2 relative pt-8">
              {[...Array(20)].map((_, i) => {
                const tVal = i + 1;
                const hVal = calcHomogeneity(tVal, speed, coeff);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Всплывающая подсказка (тултип) при наведении */}
                    <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow z-10 whitespace-nowrap pointer-events-none">
                      <span>t: {tVal} мин</span>
                      <span>H: {hVal}%</span>
                    </div>

                    {/* Столбец графика */}
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-pointer"
                      style={{ height: `${hVal}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center">
              Изменение однородности H от времени (1 до 20 мин) при скорости n = {speed} об/мин
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
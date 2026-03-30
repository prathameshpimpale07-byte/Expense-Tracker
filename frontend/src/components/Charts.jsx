import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Charts({ 
  data, 
  labels: directLabels, 
  values: directValues, 
  chartType = "line", 
  color = "#0d9488", 
  title = "" 
}) {
  const isSemicircle = chartType === "semicircle";
  const isDoughnut = chartType === "doughnut";

  // Doughnut Chart (for Expense Distribution)
  if (isDoughnut) {
    const doughnutData = {
      labels: data?.map(d => d.category || d.label) || [],
      datasets: [
        {
          data: data?.map(d => d.total || d.value) || [],
          backgroundColor: [
            "#0d9488", "#ea580c", "#2563eb", "#8b5cf6", "#ec4899", "#f59e0b", "#6366f1"
          ],
          borderWidth: 0,
          cutout: "70%",
        },
      ],
    };

    const doughnutOptions = {
        plugins: {
          legend: { 
            position: 'right',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: { weight: '700', size: 11 }
            }
          },
          tooltip: { enabled: true },
        },
        maintainAspectRatio: false,
        responsive: true,
      };

      return (
        <div className="w-full h-full">
           <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      );
  }

  // Semicircle / Gauge chart configuration
  if (isSemicircle) {
    const gaugeData = {
      datasets: [
        {
          data: [data, 100 - data],
          backgroundColor: [color, "#f1f5f9"],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
          cutout: "85%",
        },
      ],
    };

    const gaugeOptions = {
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      maintainAspectRatio: false,
      responsive: true,
    };

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="w-full h-full">
           <Doughnut data={gaugeData} options={gaugeOptions} />
        </div>
        <div className="absolute top-[60%] flex flex-col items-center">
           <span className="text-2xl font-black text-slate-800">${title}</span>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data}%</span>
        </div>
      </div>
    );
  }

  // Standard Trends Chart
  const chartData = {
    labels: directLabels || (data?.map((d) => d.label || d.month) || []),
    datasets: [
      {
        fill: true,
        label: title || "Amount",
        data: directValues || (data?.map((d) => d.income || d.total || 0) || []),
        borderColor: color,
        backgroundColor: chartType === "bar" ? color + "cc" : color + "18",
        borderRadius: 8,
        tension: 0.45,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: color,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        barThickness: 28,
        borderWidth: chartType === "bar" ? 0 : 2.5,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#f97316",
        borderColor: "#f1f5f9",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => `${title} : $${Number(ctx.raw || 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { weight: "600", size: 10 },
          callback: (v) => `$${Number(v).toLocaleString()}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { weight: "600", size: 10 },
          maxRotation: 0,
        },
      },
    },
  };

  return chartType === "bar" ? (
    <Bar data={chartData} options={options} />
  ) : (
    <Line data={chartData} options={options} />
  );
}

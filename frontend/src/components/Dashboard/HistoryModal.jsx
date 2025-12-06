import { useState, useEffect, useRef } from "react";
import { FiX, FiClock, FiDownload } from "react-icons/fi";
import { getMetricHistory, getAllMetricHistory } from "../../services/api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, addHours } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatToTimezone } from "../../utils/dateUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HistoryModal({ server, onClose }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("24h");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  // Timezone EAT = UTC+3
  const TIMEZONE_OFFSET_HOURS = 3;

  const convertToLocalTime = (utcDateString) => {
    const utcDate = new Date(utcDateString);
    return addHours(utcDate, TIMEZONE_OFFSET_HOURS);
  };

  useEffect(() => {
    fetchHistory();
  }, [server.ip, period]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let response;

      // Si "Tout" est sélectionné, utiliser la route complète
      if (period === "all") {
        response = await getAllMetricHistory(server.ip);
        const allData = response.data.data || [];
        const sortedData = allData.reverse();
        setMetrics(sortedData);
        console.log(`Chargé TOUTES les données: ${sortedData.length} mesures`);
      } else {
        // Sinon, utiliser la route normale avec limite
        const limit = getPeriodLimit(period);
        response = await getMetricHistory(server.ip, limit);
        const data = response.data.data || [];
        const sortedData = data.reverse();
        setMetrics(sortedData);
        console.log(`Chargé ${sortedData.length} mesures pour ${period}`);
      }
    } catch (error) {
      console.error("Erreur historique modal:", error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLimit = (p) => {
    const limits = {
      "1h": 290,
      "12h": 3500,
      "24h": 6920,
      "7d": 48400,
    };
    return limits[p] || 6920;
  };

  const getStats = () => {
    if (metrics.length === 0) return null;
    const cpu = metrics.map((m) => m.cpu_usage || 0);
    const ram = metrics.map((m) => m.memory_usage || 0);
    const disk = metrics.map((m) => m.disk_usage || 0);
    return {
      cpu: {
        avg: (cpu.reduce((a, b) => a + b, 0) / cpu.length).toFixed(1),
        max: Math.max(...cpu).toFixed(1),
        min: Math.min(...cpu).toFixed(1),
      },
      ram: {
        avg: (ram.reduce((a, b) => a + b, 0) / ram.length).toFixed(1),
        max: Math.max(...ram).toFixed(1),
        min: Math.min(...ram).toFixed(1),
      },
      disk: {
        avg: (disk.reduce((a, b) => a + b, 0) / disk.length).toFixed(1),
        max: Math.max(...disk).toFixed(1),
        min: Math.min(...disk).toFixed(1),
      },
    };
  };

  // Export CSV
  const exportToCSV = () => {
    const csvData = metrics.map((m) => ({
      "Heure (EAT)": format(
        convertToLocalTime(m.timestamp),
        "yyyy-MM-dd HH:mm:ss",
        { locale: fr }
      ),
      "CPU (%)": (m.cpu_usage || 0).toFixed(2),
      "RAM (%)": (m.memory_usage || 0).toFixed(2),
      "Disque (%)": (m.disk_usage || 0).toFixed(2),
      "Température (°C)": (m.cpu_temperature || 0).toFixed(2),
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename =
      period === "all"
        ? `historique_complet_${server.alias || server.ip}_${Date.now()}.csv`
        : `historique_${server.alias || server.ip}_${period}_${Date.now()}.csv`;

    saveAs(blob, filename);
    toast.success(`Export CSV terminé (${metrics.length} mesures)`);
    setShowExportMenu(false);
  };

  // Export Excel
  const exportToExcel = () => {
    const excelData = metrics.map((m) => ({
      "Heure (EAT)": format(
        convertToLocalTime(m.timestamp),
        "yyyy-MM-dd HH:mm:ss",
        { locale: fr }
      ),
      "CPU (%)": (m.cpu_usage || 0).toFixed(2),
      "RAM (%)": (m.memory_usage || 0).toFixed(2),
      "Disque (%)": (m.disk_usage || 0).toFixed(2),
      "Température (°C)": (m.cpu_temperature || 0).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    ws["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historique");

    const filename =
      period === "all"
        ? `historique_complet_${server.alias || server.ip}_${Date.now()}.xlsx`
        : `historique_${
            server.alias || server.ip
          }_${period}_${Date.now()}.xlsx`;

    XLSX.writeFile(wb, filename);
    toast.success(`Export Excel terminé (${metrics.length} mesures)`);
    setShowExportMenu(false);
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const title =
      period === "all"
        ? `Historique Complet - ${server.alias || server.ip}`
        : `Historique - ${server.alias || server.ip}`;
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`IP: ${server.ip}`, 14, 28);
    doc.text(
      `Période: ${period === "all" ? "Toutes les données" : period}`,
      14,
      34
    );
    doc.text(
      `Date d'export: ${format(new Date(), "dd/MM/yyyy HH:mm", {
        locale: fr,
      })}`,
      14,
      40
    );
    doc.text(`Nombre de mesures: ${metrics.length}`, 14, 46);

    const stats = getStats();
    if (stats) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Statistiques:", 14, 56);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `CPU - Moyenne: ${stats.cpu.avg}% | Maximum: ${stats.cpu.max}% | Minimum: ${stats.cpu.min}%`,
        14,
        62
      );
      doc.text(
        `RAM - Moyenne: ${stats.ram.avg}% | Maximum: ${stats.ram.max}% | Minimum: ${stats.ram.min}%`,
        14,
        68
      );
      doc.text(
        `Disque - Moyenne: ${stats.disk.avg}% | Maximum: ${stats.disk.max}% | Minimum: ${stats.disk.min}%`,
        14,
        74
      );
    }

    // Limiter le tableau pour performance
    const maxRows = 500;
    const tableData = metrics
      .slice(0, maxRows)
      .map((m) => [
        format(convertToLocalTime(m.timestamp), "HH:mm:ss", { locale: fr }),
        (m.cpu_usage || 0).toFixed(1) + "%",
        (m.memory_usage || 0).toFixed(1) + "%",
        (m.disk_usage || 0).toFixed(1) + "%",
        (m.cpu_temperature || 0).toFixed(1) + "°C",
      ]);

    if (metrics.length > maxRows) {
      doc.setFontSize(8);
      doc.text(
        `Note: Seules les ${maxRows} premières mesures sont affichées.`,
        14,
        80
      );
    }

    autoTable(doc, {
      startY: metrics.length > maxRows ? 84 : 80,
      head: [["Heure (EAT)", "CPU", "RAM", "Disque", "Température"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 7 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} / ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    const filename =
      period === "all"
        ? `historique_complet_${server.alias || server.ip}_${Date.now()}.pdf`
        : `historique_${server.alias || server.ip}_${period}_${Date.now()}.pdf`;

    doc.save(filename);
    toast.success(
      `Export PDF terminé (${Math.min(metrics.length, maxRows)} mesures)`
    );
    setShowExportMenu(false);
  };

  // Données pour le graphique CPU
  const cpuChartData = {
    labels: metrics.map((m) =>
      format(convertToLocalTime(m.timestamp), "HH:mm", { locale: fr })
    ),
    datasets: [
      {
        label: "CPU %",
        data: metrics.map((m) => m.cpu_usage || 0),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique RAM
  const ramChartData = {
    labels: data.map((item) => formatToTimezone(item.timestamp)),
    datasets: [
      {
        label: "RAM %",
        data: metrics.map((m) => m.memory_usage || 0),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique Disque
  const diskChartData = {
    labels: metrics.map((m) =>
      format(convertToLocalTime(m.timestamp), "HH:mm", { locale: fr })
    ),
    datasets: [
      {
        label: "Disque %",
        data: metrics.map((m) => m.disk_usage || 0),
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%",
        },
      },
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
    },
  };

  const stats = getStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Historique - {server.alias || server.ip}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{server.ip}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Menu Export */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || metrics.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <FiDownload />
                <span>Exporter</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="px-3 py-2 bg-gray-100 border-b">
                    <p className="text-xs font-semibold text-gray-600">
                      {period === "all"
                        ? "Toutes les données"
                        : `Période: ${period}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {metrics.length} mesures
                    </p>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center space-x-2"
                  >
                    <span>📄</span>
                    <span className="text-sm">Export CSV</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center space-x-2"
                  >
                    <span>📊</span>
                    <span className="text-sm">Export Excel</span>
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition flex items-center space-x-2"
                  >
                    <span>📑</span>
                    <span className="text-sm">Export PDF</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <FiClock className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Période :{" "}
                {period === "all" && " Toutes les données disponibles"}{" "}
                {period !== "all" && ` ${period}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["1h", "12h", "24h", "7d", "all"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    period === p
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  } disabled:opacity-50`}
                >
                  {p === "all" ? "Tout" : p}
                </button>
              ))}
            </div>
          </div>
          {metrics.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {metrics.length} mésures • EAT (UTC+3)
            </p>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : metrics.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <p className="text-lg font-semibold">Aucune donnée disponible</p>
              <p className="text-sm mt-2">
                Les métriques apparaîtront une fois collectées
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Statistics Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    label="CPU"
                    stats={stats.cpu}
                    color="text-blue-600"
                  />
                  <StatCard
                    label="RAM"
                    stats={stats.ram}
                    color="text-green-600"
                  />
                  <StatCard
                    label="Disque"
                    stats={stats.disk}
                    color="text-purple-600"
                  />
                </div>
              )}

              {/* Charts */}
              <div className="space-y-6">
                {/* CPU Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Utilisation CPU
                  </h3>
                  <div style={{ height: "250px" }}>
                    <Line data={cpuChartData} options={chartOptions} />
                  </div>
                </div>

                {/* RAM Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Utilisation RAM
                  </h3>
                  <div style={{ height: "250px" }}>
                    <Line data={ramChartData} options={chartOptions} />
                  </div>
                </div>

                {/* Disk Chart */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Utilisation Disque
                  </h3>
                  <div style={{ height: "250px" }}>
                    <Line data={diskChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, stats, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h4 className={`text-sm font-medium ${color} mb-3`}>{label}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Moyenne</span>
          <span className="font-semibold">{stats.avg}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Maximum</span>
          <span className="font-semibold text-red-600">{stats.max}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Minimum</span>
          <span className="font-semibold text-green-600">{stats.min}%</span>
        </div>
      </div>
    </div>
  );
}

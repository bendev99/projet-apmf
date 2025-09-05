import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
  ArcElement,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
  ArcElement
);

// Configurations des graphiques en ligne
const lineChartData = (labels, data, label, color) => ({
  labels: labels,
  datasets: [
    {
      label: label,
      data: data,
      borderColor: color,
      backgroundColor: color.replace("1)", "0.4)"), // Remplissage plus opaque
      fill: true,
      tension: 0.4, // Courbature ajustée
      borderWidth: 1, // Taille de la courbe plus épaisse
      pointRadius: 1.5, // Points plus visibles
      pointHoverRadius: 4, // Points plus grands au survol
      pointStyle: "circle",
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 0.2,
    },
  ],
});

const lineChartOptions = (yTitle) => ({
  scales: {
    y: { beginAtZero: false, title: { display: true, text: yTitle } },
    x: { title: { display: true, text: "Heure (UTC+3)" } },
  },
  plugins: { legend: { display: true } },
  animation: {
    duration: 1000,
    easing: "easeOutQuart",
  },
  maintainAspectRatio: false, // Permet de personnaliser la hauteur sans ratio fixe
});

// Configuration pour le Pie chart (utilisation du disque)
const pieChartData = ({ disk_usage }) => ({
  labels: ["Utilisation Disque", "Espace Libre"],
  datasets: [
    {
      label: "Utilisation du disque",
      data: [disk_usage ?? 0, 100 - (disk_usage ?? 0)],
      backgroundColor: ["rgba(108, 92, 231, 1)", "rgba(108, 92, 231, 0.2)"],
      borderColor: ["#fff", "#fff"],
      borderWidth: 2, // Épaisseur des bordures des tranches
      hoverOffset: 4, // Offset au survol pour agrandir les tranches
    },
  ],
});

const pieChartOptions = {
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#333",
        font: { size: 14 },
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}%`, // Afficher les pourcentages dans le tooltip
      },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeOutQuart",
  },
  maintainAspectRatio: false, // Désactiver le ratio d'aspect pour éviter l'étirement
  responsive: true, // Rend le graphique responsive
};

export { lineChartData, lineChartOptions, pieChartData, pieChartOptions };

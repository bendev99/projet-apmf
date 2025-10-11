import AdvancedGaugeChart from "./AdvancedGaugeChart";
import GaugeChart from "./GaugeChart";

function Graphe() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Tableau de bord avec jauges
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Jauge simple */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <GaugeChart percentage={85.56} label="Taux de réussite" />
          </div>

          {/* Jauge avancée */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <AdvancedGaugeChart percentage={85.56} label="Performance" />
          </div>

          {/* Autres exemples */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <AdvancedGaugeChart
              percentage={45}
              label="Progression"
              size={180}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <AdvancedGaugeChart percentage={92} label="Satisfaction" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <AdvancedGaugeChart percentage={25} label="Completion" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <AdvancedGaugeChart percentage={75} label="Efficacité" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Graphe;

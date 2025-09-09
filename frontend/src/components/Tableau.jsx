import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";

const Tableau = () => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const rowsPerPage = 7;

  // Récupérer les données paginées pour le tableau
  const fetchPaginatedData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/paginated_metrics?page=${currentPage}&limit=${rowsPerPage}`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTableData(data.metrics || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données paginées:",
        error
      );
      toast.error(`Erreur lors du chargement du tableau: ${error.message}`);
    }
  };

  // useEffect pour le tableau : fetch sur mount/page change, et interval auto si page=1
  useEffect(() => {
    fetchPaginatedData();

    let interval;
    if (currentPage === 1) {
      interval = setInterval(fetchPaginatedData, 5000);
    }
    return () => clearInterval(interval);
  }, [currentPage]);

  return (
    <div className="w-full max-w-7xl mt-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Tableau historique
        </h2>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchPaginatedData}
          disabled={currentPage === 1} // Auto-rafraîchissement sur page 1, manuel sinon
        >
          Rafraîchir
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date et Heure</TableCell>
              <TableCell>Température CPU (°C)</TableCell>
              <TableCell>Utilisation CPU (%)</TableCell>
              <TableCell>Utilisation Mémoire (%)</TableCell>
              <TableCell>Utilisation Disque (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {new Date(row.timestamp).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </TableCell>
                <TableCell>{row.cpu_temperature ?? "N/A"}</TableCell>
                <TableCell>{row.cpu_usage}</TableCell>
                <TableCell>{row.memory_usage}</TableCell>
                <TableCell>{row.disk_usage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={currentPage - 1} // Pagination MUI commence à 0
        onPageChange={(e, newPage) => setCurrentPage(newPage + 1)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]} // Fixé à 7, modifiable si besoin
        className="flex justify-start"
      />
    </div>
  );
};

export default Tableau;

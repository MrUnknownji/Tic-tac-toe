import { useEffect, useState } from "react";
import "./History.css";
import { fetchMatchs, deleteUserMatchesBulk, deleteUserAllMatches, createMatch } from "../../src/api";
import CustomDropdown from "../common/CustomDropdown";

interface ResultType {
  _id: string;
  result: string;
  createdAt: string;
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  totalMatches: number;
}

const History = ({ userId }: { userId: string }) => {
  const [results, setResults] = useState<ResultType[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalMatches: 0
  });
  
  // Define calculateStats function before using it
  const calculateStats = () => {
    // Make sure results is an array before filtering
    const safeResults = Array.isArray(results) ? results : [];
    
    const totalGames = safeResults.length;
    const wins = safeResults.filter(r => r.result === 'win').length;
    const losses = safeResults.filter(r => r.result === 'loss').length;
    
    // Calculate win percentage
    const winPercentage = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    
    // Calculate trend (comparing to previous 10 games if available)
    const recentGames = [...safeResults].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, Math.min(10, totalGames));
    
    const recentWins = recentGames.filter(r => r.result === 'win').length;
    const recentWinPercentage = recentGames.length > 0 ? Math.round((recentWins / recentGames.length) * 100) : 0;
    
    // Trend is positive if recent win % is higher than overall
    const trend = recentWinPercentage - winPercentage;
    const trendDirection = trend >= 0 ? '↑' : '↓';
    const trendValue = `${Math.abs(trend)}%`;
    
    return [
      {
        title: "Total Games",
        value: totalGames.toString(),
        trend: totalGames > 0 ? `${trendDirection} ${trendValue}` : "N/A"
      },
      {
        title: "Wins",
        value: wins.toString(),
        trend: `${winPercentage}%`
      },
      {
        title: "Win/Loss Ratio",
        value: losses > 0 ? (wins / losses).toFixed(1) : wins > 0 ? "∞" : "0",
        trend: recentGames.length > 0 ? `${trendDirection} ${trendValue}` : "N/A"
      }
    ];
  };
  
  // Now use the function after it's defined
  const [stats, setStats] = useState(() => calculateStats());

  const fetchResults = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMatchs(userId, page, 10);
      
      // Make sure we handle the response correctly
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Handle old API format (array of matches)
          setResults(response.data);
          setPagination({
            totalPages: 1,
            currentPage: 1,
            totalMatches: response.data.length
          });
        } else if (response.data.matches) {
          // Handle new API format (object with matches array)
          setResults(response.data.matches);
          setPagination({
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.currentPage || 1,
            totalMatches: response.data.totalMatches || 0
          });
        } else {
          setResults([]);
          setError("No matches found in the response");
        }
      } else {
        setResults([]);
        setError("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setResults([]);
      setError("Failed to load match history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [userId]);

  useEffect(() => {
    setStats(calculateStats());
  }, [results]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedMatches);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMatches(newSelection);
  };

  const handleBulkDelete = async () => {
    const userPassword = window.prompt("Enter your password to confirm deletion:");
    if (!userPassword) return;
    
    try {
      await deleteUserMatchesBulk({
        userId,
        password: userPassword,
        ids: Array.from(selectedMatches),
      });
      
      // Refresh the list after deletion
      const response = await fetchMatchs(userId);
      setResults(response.data);
      setSelectedMatches(new Set());
    } catch (error) {
      console.error("Error deleting matches:", error);
      alert("Failed to delete matches. Please check your password and try again.");
    }
  };

  const handleDeleteAll = async () => {
    const userPassword = window.prompt("Enter your password to confirm deletion of all matches:");
    if (!userPassword) return;
    
    try {
      await deleteUserAllMatches({
        userId,
        password: userPassword,
      });
      
      // Refresh the list after deletion
      const response = await fetchMatchs(userId);
      setResults(response.data);
      setSelectedMatches(new Set());
    } catch (error) {
      console.error("Error deleting all matches:", error);
      alert("Failed to delete all matches. Please check your password and try again.");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchResults(newPage);
    }
  };

  // Make sure we're safely filtering results
  const filteredResults = Array.isArray(results) 
    ? results.filter((result) => {
        if (filter === "all") return true;
        return result.result === filter;
      })
    : [];

  const filterOptions = [
    { value: "all", label: "All Results" },
    { value: "win", label: "Wins" },
    { value: "loss", label: "Losses" },
    { value: "draw", label: "Draws" }
  ];

  return (
    <div className="history">
      <h2 className="history-title">Game History</h2>
      
      <div className="stats-container">
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <h3>{stat.title}</h3>
            <div className="value">{stat.value}</div>
            <div className="trend">
              <span>{stat.trend.startsWith('↑') ? '↑' : '↓'}</span>
              {stat.trend.replace(/[↑↓]/, '')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="filter-container">
        <CustomDropdown 
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          placeholder="Filter results"
        />
        <div className="bulk-actions">
          <button
            onClick={handleBulkDelete}
            disabled={selectedMatches.size === 0}
          >
            Delete Selected
          </button>
          <button onClick={handleDeleteAll}>Delete All</button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : filteredResults.length > 0 ? (
        <>
          {filteredResults.map((result) => (
            <Result
              key={result._id}
              result={result}
              selectedMatches={selectedMatches}
              toggleSelection={toggleSelection}
            />
          ))}
          
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                &laquo; Prev
              </button>
              
              <div className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalMatches} total matches)
              </div>
              
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="no-results">No matches found</div>
      )}
    </div>
  );
};

const Result = ({
  result,
  selectedMatches,
  toggleSelection,
}: {
  result: ResultType;
  selectedMatches: Set<string>;
  toggleSelection: (id: string) => void;
}) => {
  const formattedDate = new Date(result.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div className="result">
      <input 
        type="checkbox" 
        checked={selectedMatches.has(result._id)}
        onChange={() => toggleSelection(result._id)}
      />
      <div className="time-div">
        <span className="time-text">Time</span>
        <span className="result-time">{formattedDate}</span>
      </div>
      <div className="result-div">
        <span className="result-text">Result</span>
        <span className="result-result">{result.result}</span>
      </div>
      <div className="result-status" data-status={result.result.toLowerCase()}>
        {result.result}
      </div>
    </div>
  );
};

export default History;

import { useEffect, useState } from "react";
import {
  fetchAdminUsers,
  fetchAdminMatches,
  adminDeleteMatch,
  adminDeleteMatchesBulk,
  adminDeleteAllMatches,
  adminDeleteUser,
} from "../../src/api";
import "./AdminPanel.css"; // Create appropriate styles

interface UserType {
  _id: string;
  username: string;
  isAdmin: boolean;
}

interface MatchType {
  _id: string;
  result: string;
  createdAt: string;
  user: { username: string };
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface AdminPanelProps {
  adminUsername: string;
  onClose: () => void;
}

const AdminPanel = ({ adminUsername, onClose }: AdminPanelProps) => {
  const [adminPassword, setAdminPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "matches">("users");
  const [users, setUsers] = useState<UserType[]>([]);
  const [matches, setMatches] = useState<MatchType[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState({ users: false, matches: false });
  
  // Pagination state
  const [usersPagination, setUsersPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0
  });
  
  const [matchesPagination, setMatchesPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalItems: 0
  });

  const fetchUsers = async (page: number = 1) => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const response = await fetchAdminUsers(page);
      setUsers(response.data.users);
      setUsersPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalItems: response.data.totalUsers
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchMatchesData = async (page: number = 1) => {
    setLoading(prev => ({ ...prev, matches: true }));
    try {
      const response = await fetchAdminMatches(page);
      setMatches(response.data.matches);
      setMatchesPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalItems: response.data.totalMatches
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(prev => ({ ...prev, matches: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchMatchesData();
  }, []);

  const handleUserPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= usersPagination.totalPages) {
      fetchUsers(newPage);
    }
  };

  const handleMatchesPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= matchesPagination.totalPages) {
      fetchMatchesData(newPage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminDeleteUser({ adminUsername, adminPassword }, userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await adminDeleteMatch({ adminUsername, adminPassword }, matchId);
      fetchMatchesData();
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedMatches);
      await adminDeleteMatchesBulk({ adminUsername, adminPassword, ids });
      setSelectedMatches(new Set());
      fetchMatchesData();
    } catch (error) {
      console.error("Error in bulk delete:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await adminDeleteAllMatches({ adminUsername, adminPassword });
      fetchMatchesData();
    } catch (error) {
      console.error("Error deleting all matches:", error);
    }
  };

  const toggleMatchSelection = (matchId: string) => {
    const newSet = new Set(selectedMatches);
    if (newSet.has(matchId)) {
      newSet.delete(matchId);
    } else {
      newSet.add(matchId);
    }
    setSelectedMatches(newSet);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="return-button" onClick={onClose}>
          Return to Home
        </button>
      </div>
      <div className="admin-password">
        <input
          type="password"
          placeholder="Enter your admin password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
      </div>
      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={activeTab === "matches" ? "active" : ""}
          onClick={() => setActiveTab("matches")}
        >
          Matches
        </button>
      </div>
      {activeTab === "users" && (
        <div className="admin-users">
          {loading.users ? (
            <div className="loading-spinner">Loading users...</div>
          ) : (
            <>
              <div className="admin-table">
                <div className="table-header">
                  <div className="header-cell">Username</div>
                  <div className="header-cell">Role</div>
                  <div className="header-cell">Actions</div>
                </div>
                {users.map((user) => (
                  <div key={user._id} className="table-row">
                    <div className="table-cell">{user.username}</div>
                    <div className="table-cell">
                      {user.isAdmin ? "Admin" : "User"}
                    </div>
                    <div className="table-cell">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={user.isAdmin}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {usersPagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-button"
                    onClick={() => handleUserPageChange(usersPagination.currentPage - 1)}
                    disabled={usersPagination.currentPage === 1}
                  >
                    &laquo; Prev
                  </button>
                  
                  <div className="pagination-info">
                    Page {usersPagination.currentPage} of {usersPagination.totalPages}
                  </div>
                  
                  <button 
                    className="pagination-button"
                    onClick={() => handleUserPageChange(usersPagination.currentPage + 1)}
                    disabled={usersPagination.currentPage === usersPagination.totalPages}
                  >
                    Next &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {activeTab === "matches" && (
        <div className="admin-matches">
          {loading.matches ? (
            <div className="loading-spinner">Loading matches...</div>
          ) : (
            <>
              <div className="bulk-actions">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedMatches.size === 0}
                >
                  Delete Selected
                </button>
                <button onClick={handleDeleteAll}>Delete All Matches</button>
              </div>
              <div className="admin-table">
                <div className="table-header">
                  <div className="header-cell">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedMatches.size === matches.length && matches.length > 0}
                    />
                  </div>
                  <div className="header-cell">User</div>
                  <div className="header-cell">Result</div>
                  <div className="header-cell">Date</div>
                  <div className="header-cell">Actions</div>
                </div>
                {matches.map((match) => (
                  <div key={match._id} className="table-row">
                    <div className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedMatches.has(match._id)}
                        onChange={() => toggleMatchSelection(match._id)}
                      />
                    </div>
                    <div className="table-cell">{match.user.username}</div>
                    <div className="table-cell">{match.result}</div>
                    <div className="table-cell">
                      {new Date(match.createdAt).toLocaleString()}
                    </div>
                    <div className="table-cell">
                      <button
                        onClick={() => handleDeleteMatch(match._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {matchesPagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-button"
                    onClick={() => handleMatchesPageChange(matchesPagination.currentPage - 1)}
                    disabled={matchesPagination.currentPage === 1}
                  >
                    &laquo; Prev
                  </button>
                  
                  <div className="pagination-info">
                    Page {matchesPagination.currentPage} of {matchesPagination.totalPages}
                  </div>
                  
                  <button 
                    className="pagination-button"
                    onClick={() => handleMatchesPageChange(matchesPagination.currentPage + 1)}
                    disabled={matchesPagination.currentPage === matchesPagination.totalPages}
                  >
                    Next &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 
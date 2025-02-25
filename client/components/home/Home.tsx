import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../admin/AdminPanel";
import ChangeUsernameModal from "../modal/ChangeUsernameModal";
import History from "../history/History";
import "./Home.css";
import logoutIcon from '../../src/assets/logout.svg';
import plusIcon from '../../src/assets/plus.svg';

interface Props {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  userId: string;
  isAdmin: boolean;
  handleLogOut: () => void;
}

const Home = ({ username, userId, isAdmin, handleLogOut }: Props) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {showAdminPanel ? (
        <AdminPanel adminUsername={username} onClose={() => setShowAdminPanel(false)} />
      ) : showChangeUsername ? (
        <ChangeUsernameModal 
          setIsVisible={setShowChangeUsername} 
          onChangeUsername={(currentPassword, newUsername) => {
            console.log("Changing username with", currentPassword, newUsername);
            setShowChangeUsername(false);
          }}
        />
      ) : (
        <div className="history-section fade-in">
          <div className="header-buttons">
            <button onClick={handleLogOut} className="logout-button">
              <img src={logoutIcon} className="icon" alt="logout" />
              <span>Logout</span>
            </button>
            <div className="user-controls">
              <button onClick={() => setShowChangeUsername(true)}>
                Change Username
              </button>
              {isAdmin && (
                <button onClick={() => setShowAdminPanel(true)} className="admin-button">
                  Admin Panel
                </button>
              )}
            </div>
          </div>
          
          <History userId={userId} />
          
          <button
            className="new-game-button primary-button"
            onClick={() => navigate("/game")}
          >
            <img src={plusIcon} className="icon" alt="" />
          </button>
          
          <div className="mobile-nav">
            <div className="mobile-nav-buttons">
              <button className="mobile-nav-button active">
                <span>History</span>
              </button>
              <button className="mobile-nav-button" onClick={() => navigate("/game")}>
                <span>New Game</span>
              </button>
              <button className="mobile-nav-button" onClick={handleLogOut}>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;

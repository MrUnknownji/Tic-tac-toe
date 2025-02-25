import "./App.css";
import Modal from "../components/modal/Modal";
import Home from "../components/home/Home";
import Game from "../components/game/Game";
import { useState, useEffect } from "react";
import { loginUser, signUpUser } from "./api";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
}

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isDialogueVisible, setIsDialogueVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo(user);
      setIsLoggedIn(true);
      setUsername(user.username);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleAuthSelection = (authmode: "login" | "signup") => {
    setIsLogin(authmode === "login");
    setIsDialogueVisible(true);
  };

  const handleLogin = async (authType: "login" | "signup", user: string, pass: string) => {
    if (!user || !pass) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const response =
        authType === "login"
          ? await loginUser(user, pass)
          : await signUpUser(user, pass);
          
      if (response.data) {
        const userData: User = response.data.user || response.data;
        setUserInfo(userData);
        setIsLoggedIn(true);
        setIsDialogueVisible(false);
        setUsername(userData.username);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error(`Failed to ${authType}:`, error);
      alert(error.response?.data?.message || `Failed to ${authType}. Please try again.`);
      setIsLoggedIn(false);
    }
  };
  
  const handleLogOut = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserInfo(null);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="app-wrapper" data-theme={theme}>
      <header className="app-header">
        <h1 className="app-title">TicTacToe</h1>
        <button 
          className="theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      <main className="app-container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              !isLoggedIn ? (
                !isDialogueVisible ? (
                  <div className="auth-container">
                    <div className="auth-card fade-in">
                      <h2>Welcome Back</h2>
                      <button
                        className="primary-button"
                        onClick={() => handleAuthSelection("login")}
                      >
                        Login
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => handleAuthSelection("signup")}
                      >
                        SignUp
                      </button>
                    </div>
                  </div>
                ) : (
                  <Modal
                    isLogin={isLogin}
                    setIsDialogueVisible={setIsDialogueVisible}
                    handleLogin={handleLogin}
                    onUsernameChange={handleOnChange}
                    onPasswordChange={handlePasswordChange}
                    username={username}
                    password={password}
                  />
                )
              ) : (
                <Navigate to="/home" />
              )
            } />
            <Route path="/home" element={
              isLoggedIn && userInfo ? (
                <Home
                  username={username}
                  userId={userInfo._id}
                  isAdmin={userInfo.isAdmin}
                  setIsLoggedIn={setIsLoggedIn}
                  handleLogOut={handleLogOut}
                />
              ) : (
                <Navigate to="/" />
              )
            } />
            <Route path="/game" element={
              isLoggedIn && userInfo ? (
                <Game username={username} userId={userInfo._id} />
              ) : (
                <Navigate to="/" />
              )
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} TicTacToe Game | <a href="#">Privacy Policy</a></p>
      </footer>
    </div>
  );
}

export default App;

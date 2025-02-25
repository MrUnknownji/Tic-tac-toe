import "./Modal.css";
import { useState } from "react";

interface ChangeUsernameModalProps {
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onChangeUsername: (currentPassword: string, newUsername: string) => void;
}

const ChangeUsernameModal = ({ setIsVisible, onChangeUsername }: ChangeUsernameModalProps) => {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim() && currentPassword.trim()) {
      onChangeUsername(currentPassword, newUsername);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button
          className="close-button secondary-button"
          onClick={() => setIsVisible(false)}
          type="button"
        >
          X
        </button>
        <h3>Change Username</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            name="newUsername"
            value={newUsername}
            placeholder="Enter new username"
            onChange={(e) => setNewUsername(e.target.value)}
            className="username-input"
          />
          <input
            name="currentPassword"
            type="password"
            value={currentPassword}
            placeholder="Enter current password"
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="username-input"
          />
          <button type="submit" className="login-signup-button primary-button">
            Change Username
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeUsernameModal; 
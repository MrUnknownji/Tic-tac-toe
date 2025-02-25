import "./Modal.css";

interface ModalProps {
  isLogin: boolean;
  setIsDialogueVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: (authType: "login" | "signup", username: string, password: string) => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
  password: string;
}

const Modal = ({
  isLogin,
  setIsDialogueVisible,
  handleLogin,
  onUsernameChange,
  onPasswordChange,
  username,
  password,
}: ModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button
          className="close-button secondary-button"
          onClick={() => setIsDialogueVisible(false)}
          type="button"
        >
          X
        </button>
        <h3>{isLogin ? "Login" : "SignUp"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username.trim() && password.trim())
              handleLogin(isLogin ? "login" : "signup", username, password);
          }}
          className="modal-form"
        >
          <input
            name="username"
            value={username}
            placeholder={`Enter ${isLogin ? "your" : ""} username`}
            onChange={onUsernameChange}
            className="username-input"
          />
          <input
            name="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={onPasswordChange}
            className="username-input"
          />
          <button type="submit" className="login-signup-button primary-button">
            {isLogin ? "Login" : "SignUp"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import API from "../utils/api";

const AuthContext = createContext(null);

const TIMEOUT_DURATION = 10 * 60 * 1000;
const WARNING_BEFORE  = 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(60);

  const timeoutRef   = useRef(null);
  const warningRef   = useRef(null);
  const countdownRef = useRef(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (!localStorage.getItem("token")) return;
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    timeoutRef.current = setTimeout(logout, TIMEOUT_DURATION);
  }, [logout]);

  useEffect(() => {
    if (!user) return;
    resetTimer();
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(e => window.addEventListener(e, resetTimer));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      clearInterval(countdownRef.current);
    };
  }, [user, resetTimer]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await API.post("/auth/register", data);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const updateUser = (fields) => {
    const updated = { ...user, ...fields };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}

      {/* Session Warning Modal */}
      {showWarning && user && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
            style={{ backgroundColor: "#ffffff" }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
              ⏱️
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A0A2E" }}>
              Session Expiring Soon
            </h3>
            <p className="text-sm mb-5" style={{ color: "#718096" }}>
              You've been inactive. Your session will expire in
            </p>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-2"
              style={{
                background: countdown <= 10 ? "#FFF5F5" : "#F8F5FF",
                border: `4px solid ${countdown <= 10 ? "#C53030" : "#D4A017"}`,
              }}>
              <span className="text-3xl font-bold"
                style={{ color: countdown <= 10 ? "#C53030" : "#D4A017" }}>
                {countdown}
              </span>
            </div>
            <p className="text-xs mb-6" style={{ color: "#A0AEC0" }}>seconds remaining</p>
            <div className="flex gap-3">
              <button onClick={resetTimer}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
                Stay Logged In
              </button>
              <button onClick={logout}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:opacity-80"
                style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
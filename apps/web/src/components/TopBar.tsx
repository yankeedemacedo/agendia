import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const sair = async () => {
    await logout();
    setOpen(false);
    navigate("/login");
  };

  return (
    <header className="topbar">
      <Link to="/" className="wordmark" onClick={() => setOpen(false)}>
        agendia<span className="bang">!</span>
      </Link>
      <button
        className="hamburger"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`nav${open ? " open" : ""}`}>
        {user && (
          <Link to="/meus-eventos" onClick={() => setOpen(false)}>
            Minhas vagas
          </Link>
        )}
        {(user?.papel === "admin" || user?.papel === "organizer") && (
          <Link to="/admin" onClick={() => setOpen(false)}>
            Painel
          </Link>
        )}
        {user ? (
          <>
            <Link to="/perfil" onClick={() => setOpen(false)}>
              {user.nome.split(" ")[0]}
            </Link>
            <button className="btn-ghost" onClick={sair}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setOpen(false)}>
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="btn-primary btn-sm"
              onClick={() => setOpen(false)}
            >
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

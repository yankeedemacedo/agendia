import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="wordmark">
          agendia<span className="bang">!</span>
        </Link>
        <nav className="footer-nav">
          <Link to="/">Catálogo</Link>
          <Link to="/meus-eventos">Minhas vagas</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/login">Entrar</Link>
        </nav>
        <p className="footer-note">Eventos vivos, inscrição em 1-clique.</p>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const FIELDS = [
  { name: "nome", label: "Nome completo", type: "text" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "telefone", label: "Telefone (DDD+Número, 11 dígitos)", type: "tel" },
  { name: "cpf", label: "CPF (11 dígitos)", type: "text" },
  { name: "dataNascimento", label: "Data de nascimento", type: "date" },
  { name: "senha", label: "Senha (mín. 6 caracteres)", type: "password" },
] as const;

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container narrow">
      <h1>Criar conta</h1>
      {error && <p className="alert-error">{error}</p>}
      <form className="form" onSubmit={submit}>
        {FIELDS.map((f) => (
          <label key={f.name}>
            {f.label}
            <input
              className="input"
              type={f.type}
              required
              value={form[f.name] ?? ""}
              onChange={(e) =>
                setForm({ ...form, [f.name]: e.target.value })
              }
            />
          </label>
        ))}
        <button className="btn-primary" disabled={saving}>
          {saving ? "Criando…" : "Finalizar cadastro"}
        </button>
      </form>
      <p className="muted">
        Já tem conta? <Link to="/login">Entre</Link>
      </p>
    </main>
  );
}

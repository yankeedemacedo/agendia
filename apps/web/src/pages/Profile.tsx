import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

export function Profile() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: user?.nome ?? "",
    email: user?.email ?? "",
    telefone: user?.telefone ?? "",
    dataNascimento: user?.dataNascimento?.slice(0, 10) ?? "",
    novaSenha: "",
    senhaAtual: "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!user) return null;
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.patch(`/api/users/${user.id}`, {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        dataNascimento: form.dataNascimento,
        ...(form.novaSenha ? { novaSenha: form.novaSenha } : {}),
        senhaAtual: form.senhaAtual,
      });
      await refresh();
      setForm({ ...form, novaSenha: "", senhaAtual: "" });
      setMsg({ ok: true, text: "Dados atualizados com sucesso!" });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  };

  const remove = async () => {
    if (!form.senhaAtual) {
      setMsg({
        ok: false,
        text: "Informe sua senha atual antes de excluir a conta.",
      });
      return;
    }
    if (!confirm("Excluir sua conta para sempre?")) return;
    if (!confirm("Última confirmação: todos os dados serão apagados.")) return;
    try {
      await api.del(`/api/users/${user.id}`, {
        senhaAtual: form.senhaAtual,
      });
      await logout();
      navigate("/login");
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  };

  return (
    <main className="container narrow">
      <h1>Meus dados</h1>
      {msg && (
        <p className={msg.ok ? "alert-success" : "alert-error"}>{msg.text}</p>
      )}
      <form className="form" onSubmit={save}>
        <label>
          Nome completo
          <input
            className="input"
            value={form.nome}
            onChange={(e) => set("nome", e.target.value)}
            required
          />
        </label>
        <label>
          E-mail
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </label>
        <label>
          Telefone
          <input
            className="input"
            value={form.telefone}
            onChange={(e) => set("telefone", e.target.value)}
            required
          />
        </label>
        <label>
          Data de nascimento
          <input
            className="input"
            type="date"
            value={form.dataNascimento}
            onChange={(e) => set("dataNascimento", e.target.value)}
            required
          />
        </label>
        <label>
          Nova senha (em branco = não alterar)
          <input
            className="input"
            type="password"
            value={form.novaSenha}
            onChange={(e) => set("novaSenha", e.target.value)}
          />
        </label>
        <label>
          Senha atual *
          <input
            className="input"
            type="password"
            required
            value={form.senhaAtual}
            onChange={(e) => set("senhaAtual", e.target.value)}
          />
        </label>
        <button className="btn-primary">Atualizar dados</button>
      </form>

      <section className="danger">
        <h3>Zona de perigo</h3>
        <p className="muted">Todas as suas inscrições serão perdidas.</p>
        <button className="btn-danger" onClick={remove}>
          Excluir minha conta
        </button>
      </section>
    </main>
  );
}

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    fullName: "",
    cpf: "",
    rg: "",
    congregation: "",
    maritalStatus: "",
    age: "",
    phone: "",
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const congregations = [
    "Água Rasa",
    "Parque São Lucas",
    "Vila Prudente"
  ];

  function onlyDigits(s) { return s.replace(/\D/g, ""); }
  function maskCPF(v) {
    const d = onlyDigits(v).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  function maskPhone(v) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3").trim();
  }

  function onChange(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === "cpf") v = maskCPF(value);
    if (name === "phone") v = maskPhone(value);
    if (name === "age") v = value.replace(/\D/g, "").slice(0, 3);
    setForm((f) => ({ ...f, [name]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (j.ok) {
        setStatus({ ok: true, msg: "Cadastro confirmado. Obrigado!" });
        setForm({ fullName: "", cpf: "", rg: "", congregation: "", maritalStatus: "", age: "", phone: "" });
      } else {
        setStatus({ ok: false, msg: j.error || "Erro desconhecido" });
      }
    } catch (err) {
      setStatus({ ok: false, msg: String(err) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <form onSubmit={submit} className="card" noValidate>
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Excursão – Cadastro</h1>
          <p className="text-slate-600 text-sm">Preencha seus dados para garantir a vaga.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="label">Nome completo *</span>
            <input className="input" name="fullName" value={form.fullName} onChange={onChange} required placeholder="Ex.: Maria da Silva" autoComplete="name" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">CPF *</span>
            <input className="input" name="cpf" value={form.cpf} onChange={onChange} required inputMode="numeric" placeholder="000.000.000-00" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">RG</span>
            <input className="input" name="rg" value={form.rg} onChange={onChange} placeholder="Opcional" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Congregação *</span>
            <select className="select" name="congregation" value={form.congregation} onChange={onChange} required>
              <option value="">Selecione…</option>
              {congregations.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Estado civil</span>
            <select className="select" name="maritalStatus" value={form.maritalStatus} onChange={onChange}>
              <option value="">Selecione…</option>
              <option>Solteiro(a)</option>
              <option>Casado(a)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Idade</span>
            <input className="input" name="age" type="text" value={form.age} onChange={onChange} inputMode="numeric" placeholder="Ex.: 17" />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="label">Telefone</span>
            <input className="input" name="phone" value={form.phone} onChange={onChange} inputMode="tel" placeholder="(11) 90000-0000" autoComplete="tel" />
          </label>
        </div>

        {status && (
          <div className={status.ok ? "alert-ok" : "alert-err"}>{status.msg}</div>
        )}

        <button className="btn" disabled={submitting}>
          {submitting ? "Enviando…" : "Enviar cadastro"}
        </button>

        <footer className="mt-2 text-slate-600 text-sm">
          Seus dados serão usados apenas para organizar a excursão.
        </footer>
      </form>
    </main>
  );
}
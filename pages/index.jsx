import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function Home({ theme, toggleTheme }) {
  const [form, setForm] = useState({
    fullName: "",
    cpf: "",
    rg: "",
    congregation: "",
    maritalStatus: "",
    age: "",
    phone: "",
    instrument: "",
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [congregationSelect, setCongregationSelect] = useState("");
  const [instrumentSelect, setInstrumentSelect] = useState("");

  const congregations = [
    "Água Rasa",
    "Flor De Vila Formosa",
    "Parque Sevilha",
    "Vila Diva",
    "Vila Ema",
    "Vila Formosa",
    "Vila Rio Branco",
    "Baixada Do Glicério",
    "Barra Funda",
    "Belém",
    "Bom Retiro",
    "Canindé",
    "Dianópolis",
    "Ponte Pequena",
    "Vila Bela",
    "Vila Prudente",
    "Americanópolis",
    "Bosque Da Saúde",
    "Ipiranga",
    "Jabaquara",
    "Jardim Da Glória",
    "Vila Carioca",
    "Vila Clara",
    "Vila Guarani",
    "Vila Mariana",
    "Jardim Elba",
    "Jardim Mimar",
    "Jardim Panorama",
    "Jardim Planalto",
    "Jardim São Nicolau",
    "Jardim São Roberto",
    "Parque Santa Madalena",
    "Sapopemba",
    "Jardim Independência",
    "Jardim Santo Eduardo",
    "Jardim Yara",
    "Parque São Lucas",
    "Sítio Pinheirinho",
    "Vila Alpina",
    "Vila Califórnia",
    "Caraguatá",
    "Jardim Maria Estela",
    "Jardim São Savério",
    "Jardim Seckler",
    "São João Clímaco",
    "Vila Arapuá",
    "Vila Independência",
    "Vila Liviero",
    "Vila Moraes"
  ];

  const instruments = {
    "Cordas": [
      "Violino", "Viola", "Violoncelo"
    ],
    "Madeiras": [
      "Flauta Transversal", "Oboé", "Oboé D'Amore", "Corne Inglês", "Clarinete", "Clarinete Alto", "Clarinete Baixo", "Fagote", "Saxofone Soprano", "Saxofone Alto", "Saxofone Tenor", "Saxofone Barítono"
    ],
    "Metais": [
      "Trompete", "Cornet", "Flugelhorn", "Trompa", "Trombone", "Trombonito", "Barítono", "Eufônio", "Tuba"
    ]
  };

  function onlyDigits(s) { return s.replace(/\D/g, ""); }
  function maskCPF(v) {
    const d = onlyDigits(v).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  function maskRG(v) {
    const d = onlyDigits(v).slice(0, 9);
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  function maskPhone(v) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3").trim();
  }

  function onChange(e) {
    const { name, value } = e.target;
    let v = value;
    if (name === "congregationSelect") {
      setCongregationSelect(v);
      if (v === "__OTHER__") {
        setForm((f) => ({ ...f, congregation: "" }));
        setErrors((er) => ({ ...er, congregation: true }));
      } else {
        setForm((f) => ({ ...f, congregation: v }));
        setErrors((er) => ({ ...er, congregation: !String(v).trim() }));
      }
      return;
    }
    if (name === "congregationOther") {
      setForm((f) => ({ ...f, congregation: v }));
      setErrors((er) => ({ ...er, congregation: !String(v).trim() }));
      return;
    }
    if (name === "instrumentSelect") {
      setInstrumentSelect(v);
      if (v === "__OTHER__") {
        setForm((f) => ({ ...f, instrument: "" }));
        setErrors((er) => ({ ...er, instrument: true }));
      } else {
        setForm((f) => ({ ...f, instrument: v }));
        setErrors((er) => ({ ...er, instrument: !String(v).trim() }));
      }
      return;
    }
    if (name === "instrumentOther") {
      setForm((f) => ({ ...f, instrument: v }));
      setErrors((er) => ({ ...er, instrument: !String(v).trim() }));
      return;
    }
    if (name === "doc") {
      const d = onlyDigits(value);
      const isCPF = d.length > 9; // 10-11 dígitos: assume CPF, até 9: RG
      v = isCPF ? maskCPF(value) : maskRG(value);
      setForm((f) => ({ ...f, cpf: isCPF ? v : "", rg: isCPF ? "" : v }));
      setErrors((er) => ({ ...er, doc: d.length === 0 }));
      return;
    }
    if (name === "cpf") v = maskCPF(value); // fallback se algum dia voltar a usar input cpf
    if (name === "phone") v = maskPhone(value);
    if (name === "age") v = value.replace(/\D/g, "").slice(0, 3);
    setForm((f) => ({ ...f, [name]: v }));
    setErrors((er) => ({ ...er, [name]: !String(v).trim() }));
  }

  // Mantém o select sincronizado com o valor atual do formulário
  useEffect(() => {
    if (!form.congregation) {
      setCongregationSelect("");
      return;
    }
    if (congregations.includes(form.congregation)) {
      setCongregationSelect(form.congregation);
    } else {
      setCongregationSelect("__OTHER__");
    }
  }, [form.congregation]);

  // Sincroniza select de Instrumento com valor atual
  useEffect(() => {
    if (!form.instrument) {
      setInstrumentSelect("");
      return;
    }
    const instrumentList = Object.values(instruments).flat();
    if (instrumentList.includes(form.instrument) || form.instrument === "Não toco") {
      setInstrumentSelect(form.instrument);
    } else {
      setInstrumentSelect("__OTHER__");
    }
  }, [form.instrument]);

  function validate() {
    const hasDoc = (form.cpf && onlyDigits(form.cpf).length > 0) || (form.rg && onlyDigits(form.rg).length > 0);
    const newErrors = {
      fullName: !form.fullName?.trim(),
      doc: !hasDoc,
      congregation: !form.congregation,
      maritalStatus: !form.maritalStatus,
      age: !form.age,
      phone: !form.phone,
      instrument: !form.instrument,
    };
    setErrors(newErrors);
    const hasAny = Object.values(newErrors).some(Boolean);
    if (hasAny) return "Preencha os campos obrigatórios";
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Enviando…");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (j.ok) {
        setStatus({ ok: true, msg: "Cadastro confirmado. Obrigado!" });
        toast.success("Cadastro confirmado. Obrigado!", { id: toastId });
  setForm({ fullName: "", cpf: "", rg: "", congregation: "", maritalStatus: "", age: "", phone: "", instrument: "" });
      } else {
        setStatus({ ok: false, msg: j.error || "Erro desconhecido" });
        toast.error(j.error || "Erro desconhecido", { id: toastId });
      }
    } catch (err) {
      setStatus({ ok: false, msg: String(err) });
      toast.error(String(err), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <main className="min-h-screen grid place-items-center app-bg p-6">
      <form onSubmit={submit} className="card" noValidate>
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Excursão – Cadastro</h1>
            <p className="text-muted text-sm">Preencha seus dados para garantir a vaga no ônibus.</p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={toggleTheme}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="label">Nome completo *</span>
            <input className={`input ${errors.fullName ? 'input-error' : ''}`} name="fullName" value={form.fullName} onChange={onChange} required placeholder="Ex.: Maria da Silva" autoComplete="name" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">CPF ou RG *</span>
            <input
              className={`input ${errors.doc ? 'input-error' : ''}`}
              name="doc"
              value={form.cpf || form.rg}
              onChange={onChange}
              required
              inputMode="numeric"
              placeholder="CPF (000.000.000-00) ou RG (00.000.000-0)"
              autoComplete="off"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Instrumento *</span>
            <select
              className={`select ${errors.instrument && instrumentSelect !== "__OTHER__" ? 'select-error' : ''}`}
              name="instrumentSelect"
              value={instrumentSelect}
              onChange={onChange}
              required
            >
              <option value="">Selecione…</option>
              <option value="Não toco">Não toco</option>
              {Object.entries(instruments).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((inst) => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </optgroup>
              ))}
              <option value="__OTHER__">Outra</option>
            </select>
            {instrumentSelect === "__OTHER__" && (
              <input
                className={`input ${errors.instrument ? 'input-error' : ''} mt-2`}
                name="instrumentOther"
                value={form.instrument}
                onChange={onChange}
                placeholder="Digite o nome do instrumento"
                autoComplete="off"
                required
              />
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Comum congregação *</span>
            <select
              className={`select ${errors.congregation && congregationSelect !== "__OTHER__" ? 'select-error' : ''}`}
              name="congregationSelect"
              value={congregationSelect}
              onChange={onChange}
              required
            >
              <option value="">Selecione…</option>
              {congregations.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__OTHER__">Outra</option>
            </select>
            {congregationSelect === "__OTHER__" && (
              <input
                className={`input ${errors.congregation ? 'input-error' : ''} mt-2`}
                name="congregationOther"
                value={form.congregation}
                onChange={onChange}
                placeholder="Digite o nome da sua comum"
                autoComplete="off"
                required
              />
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Estado civil *</span>
            <select className={`select ${errors.maritalStatus ? 'select-error' : ''}`} name="maritalStatus" value={form.maritalStatus} onChange={onChange} required>
              <option value="">Selecione…</option>
              <option>Solteiro(a)</option>
              <option>Casado(a)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="label">Idade *</span>
            <input className={`input ${errors.age ? 'input-error' : ''}`} name="age" type="text" value={form.age} onChange={onChange} inputMode="numeric" placeholder="Ex.: 17" required />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="label">Telefone *</span>
            <input className={`input ${errors.phone ? 'input-error' : ''}`} name="phone" value={form.phone} onChange={onChange} inputMode="tel" placeholder="(11) 90000-0000" autoComplete="tel" required />
          </label>

          
        </div>

        <button className="btn" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden="true"></span>}
          {submitting ? "Enviando…" : "Enviar cadastro"}
        </button>

        <footer className="mt-2 text-muted text-sm">
          Seus dados serão usados apenas para organizar a excursão.
        </footer>
      </form>
    </main>
  );
}
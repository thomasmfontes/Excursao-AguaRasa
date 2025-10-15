import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";

export default function Home({ theme, toggleTheme }) {
  // Tabs
  const [activeTab, setActiveTab] = useState("form");

  // PIX (defina seu código copia e cola via env ou aqui)
  const PIX_COPIA_E_COLA = process.env.NEXT_PUBLIC_PIX_COPIA_E_COLA || ""; // defina NEXT_PUBLIC_PIX_COPIA_E_COLA
  const [pixQrDataUrl, setPixQrDataUrl] = useState("");
  const panelsRef = useRef(null);
  const formPanelRef = useRef(null);
  const pixPanelRef = useRef(null);

  // Extrai o valor (tag 54) do BR Code Pix
  function parsePixAmount(brcode) {
    if (!brcode) return null;
    let i = 0;
    try {
      while (i + 4 <= brcode.length) {
        const id = brcode.slice(i, i + 2);
        const lenStr = brcode.slice(i + 2, i + 4);
        const len = parseInt(lenStr, 10);
        if (Number.isNaN(len) || len < 0) return null;
        const start = i + 4;
        const end = start + len;
        if (end > brcode.length) return null;
        const value = brcode.slice(start, end);
        if (id === "54") {
          // Valor no formato 54.00
          const n = Number(value.replace(",", "."));
          return Number.isFinite(n) ? n : null;
        }
        i = end;
      }
    } catch {
      return null;
    }
    return null;
  }

  const pixAmount = useMemo(() => parsePixAmount(PIX_COPIA_E_COLA), [PIX_COPIA_E_COLA]);
  const pixAmountFormatted = useMemo(() => {
    if (pixAmount == null) return null;
    try {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(pixAmount);
    } catch {
      // Fallback simples
      const fixed = pixAmount.toFixed(2).replace(".", ",");
      return `R$ ${fixed}`;
    }
  }, [pixAmount]);

  // Form
  const [form, setForm] = useState({
    fullName: "",
    cpf: "",
    rg: "",
    congregation: "",
    maritalStatus: "",
    age: "",
    phone: "",
    instrument: "",
    auxiliar: "",
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
    "Vila Moraes",
  ];

  const instruments = {
    Cordas: ["Violino", "Viola", "Violoncelo"],
    Madeiras: [
      "Flauta Transversal",
      "Oboé",
      "Oboé D'Amore",
      "Corne Inglês",
      "Clarinete",
      "Clarinete Alto",
      "Clarinete Baixo",
      "Fagote",
      "Saxofone Soprano",
      "Saxofone Alto",
      "Saxofone Tenor",
      "Saxofone Barítono",
    ],
    Metais: [
      "Trompete",
      "Cornet",
      "Flugelhorn",
      "Trompa",
      "Trombone",
      "Trombonito",
      "Barítono",
      "Eufônio",
      "Tuba",
    ],
    Teclas: ["Órgão"],
  };

  function onlyDigits(s) {
    return s.replace(/\D/g, "");
  }
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
    if (d.length <= 10)
      return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
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
    if (name === "auxiliar") {
      // Campo obrigatório
      setForm((f) => ({ ...f, auxiliar: v }));
      setErrors((er) => ({ ...er, auxiliar: !String(v).trim() }));
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
    if (name === "cpf") v = maskCPF(value);
    if (name === "phone") v = maskPhone(value);
    if (name === "age") v = value.replace(/\D/g, "").slice(0, 3);
    setForm((f) => ({ ...f, [name]: v }));
    setErrors((er) => ({ ...er, [name]: !String(v).trim() }));
  }

  // Mantém selects sincronizados com valor atual
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
    const hasDoc =
      (form.cpf && onlyDigits(form.cpf).length > 0) ||
      (form.rg && onlyDigits(form.rg).length > 0);
    const newErrors = {
      fullName: !form.fullName?.trim(),
      doc: !hasDoc,
      congregation: !form.congregation,
      maritalStatus: !form.maritalStatus,
      auxiliar: !form.auxiliar,
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
        setForm({
          fullName: "",
          cpf: "",
          rg: "",
          congregation: "",
          maritalStatus: "",
          age: "",
          phone: "",
          instrument: "",
          auxiliar: "",
        });
      } else {
        setStatus({ ok: false, msg: j.error || "Erro desconhecido" });
        toast.error(j.error || "Erro desconhecido", { id: toastId });
      }
    } catch (err2) {
      setStatus({ ok: false, msg: String(err2) });
      toast.error(String(err2), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  // Geração do QR do Pix quando aba ativa e código disponível
  useEffect(() => {
    let cancelled = false;
    async function gen() {
      try {
        if (activeTab !== "pix" || !PIX_COPIA_E_COLA) return;
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(PIX_COPIA_E_COLA, { width: 256, margin: 1 });
        if (!cancelled) setPixQrDataUrl(url);
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Falha ao gerar QR do Pix");
      }
    }
    gen();
    return () => {
      cancelled = true;
    };
  }, [activeTab, PIX_COPIA_E_COLA]);

  function copyPix() {
    if (!PIX_COPIA_E_COLA) {
      toast.error("Configure o código Pix primeiro");
      return;
    }
    navigator.clipboard
      .writeText(PIX_COPIA_E_COLA)
      .then(() => toast.success("Código Pix copiado!"))
      .catch(() => toast.error("Não foi possível copiar"));
  }

  // Ajusta a altura do container para a altura do painel ativo (evita corte no mobile)
  useEffect(() => {
    const panels = panelsRef.current;
    if (!panels) return;
    const activeEl = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
    if (!activeEl) return;
    // Usa scrollHeight para considerar conteúdo interno
    const h = activeEl.scrollHeight;
    panels.style.height = h + "px";
  }, [activeTab, form, pixQrDataUrl, congregationSelect, instrumentSelect]);

  // Ajuste inicial ao montar
  useEffect(() => {
    const panels = panelsRef.current;
    if (!panels) return;
    const activeEl = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
    if (activeEl) panels.style.height = activeEl.scrollHeight + "px";
    // também atualizar no resize (teclado mobile/safe-area podem mudar o layout)
    function onResize() {
      const el = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
      if (el && panels) panels.style.height = el.scrollHeight + "px";
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <main className="min-h-screen grid place-items-center app-bg p-6">
      <section className="card w-full max-w-3xl">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === "form" ? "Excursão Campinas" : "Pix do Ônibus"}
            </h1>
            <p className="text-muted text-sm">
              {activeTab === "form"
                ? "Preencha seus dados para garantir a vaga no ônibus."
                : "Pague via Pix lendo o QR Code ou copiando o código."}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <div role="tablist" aria-label="Escolher aba" className="mb-4 flex gap-2 border-b">
          <button
            role="tab"
            aria-selected={activeTab === "form"}
            className={`px-3 py-2 -mb-px border-b-2 transition-colors duration-200 ${
              activeTab === "form"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted hover:text-slate-600"
            }`}
            onClick={() => setActiveTab("form")}
          >
            Formulário
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "pix"}
            className={`px-3 py-2 -mb-px border-b-2 transition-colors duration-200 ${
              activeTab === "pix"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted hover:text-slate-600"
            }`}
            onClick={() => setActiveTab("pix")}
          >
            Pix
          </button>
        </div>

        {/* Animated panels */}
  <div className="tab-panels min-h-[24rem]" ref={panelsRef}>
          {/* Form panel */}
          <div className="tab-panel" ref={formPanelRef} data-active={activeTab === "form"} aria-hidden={activeTab !== "form"}>
            <form onSubmit={submit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="label">Nome completo *</span>
                <input
                  className={`input ${errors.fullName ? "input-error" : ""}`}
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  required
                  placeholder="Ex.: Maria da Silva"
                  autoComplete="name"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="label">CPF ou RG *</span>
                <input
                  className={`input ${errors.doc ? "input-error" : ""}`}
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
                  className={`select ${errors.instrument && instrumentSelect !== "__OTHER__" ? "select-error" : ""}`}
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
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="__OTHER__">Outra</option>
                </select>
                {instrumentSelect === "__OTHER__" && (
                  <input
                    className={`input ${errors.instrument ? "input-error" : ""} mt-2`}
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
                  className={`select ${errors.congregation && congregationSelect !== "__OTHER__" ? "select-error" : ""}`}
                  name="congregationSelect"
                  value={congregationSelect}
                  onChange={onChange}
                  required
                >
                  <option value="">Selecione…</option>
                  {congregations.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__OTHER__">Outra</option>
                </select>
                {congregationSelect === "__OTHER__" && (
                  <input
                    className={`input ${errors.congregation ? "input-error" : ""} mt-2`}
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
                <select
                  className={`select ${errors.maritalStatus ? "select-error" : ""}`}
                  name="maritalStatus"
                  value={form.maritalStatus}
                  onChange={onChange}
                  required
                >
                  <option value="">Selecione…</option>
                  <option>Solteiro(a)</option>
                  <option>Casado(a)</option>
                </select>
              </label>

              {/* Auxiliar (obrigatório) */}
              <label className="flex flex-col gap-1">
                <span className="label">Auxiliar *</span>
                <select
                  className={`select ${errors.auxiliar ? "select-error" : ""}`}
                  name="auxiliar"
                  value={form.auxiliar}
                  onChange={onChange}
                  required
                >
                  <option value="">Selecione…</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="label">Idade *</span>
                <input
                  className={`input ${errors.age ? "input-error" : ""}`}
                  name="age"
                  type="text"
                  value={form.age}
                  onChange={onChange}
                  inputMode="numeric"
                  placeholder="Ex.: 17"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="label">Telefone *</span>
                <input
                  className={`input ${errors.phone ? "input-error" : ""}`}
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  inputMode="tel"
                  placeholder="(11) 90000-0000"
                  autoComplete="tel"
                  required
                />
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
          </div>

          {/* Pix panel */}
          <div className="tab-panel" ref={pixPanelRef} data-active={activeTab === "pix"} aria-hidden={activeTab !== "pix"}>
            <div>
            {pixAmountFormatted && (
              <div className="mb-3">
                <span className="label">Valor:</span>
                <div className="mt-1 ml-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold">
                  {pixAmountFormatted}
                </div>
              </div>
            )}
            {!PIX_COPIA_E_COLA && (
              <div className="alert-err">
                Defina o código Pix em <code>NEXT_PUBLIC_PIX_COPIA_E_COLA</code> ou
                diretamente no arquivo.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col items-center gap-3 p-3 border rounded-xl">
                {pixQrDataUrl ? (
                  <img src={pixQrDataUrl} alt="QR Code do Pix" className="w-56 h-56" />
                ) : (
                  <div className="w-56 h-56 grid place-items-center text-muted">QR Code</div>
                )}
                <span className="text-sm text-muted">Escaneie no app do seu banco</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="label">Código copia e cola</span>
                <textarea className="input min-h-[140px]" value={PIX_COPIA_E_COLA} readOnly />
                <div className="flex gap-2">
                  <button type="button" className="btn-minimal" onClick={copyPix}>
                    Copiar código
                  </button>
                </div>
                <p className="text-sm text-muted">
                  Cole este código no Pix do seu banco se preferir não usar o QR.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
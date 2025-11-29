import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import ProgressIndicator from "../components/ProgressIndicator";
import { maskCPF, maskRG, maskPhone, maskNumber, formatCurrency } from "../utils/formatters";
import { validateForm, onlyDigits } from "../utils/validators";

export default function Home({ theme, toggleTheme }) {
  const router = useRouter();

  // Tabs
  const [activeTab, setActiveTab] = useState("form");

  // PIX
  const PIX_COPIA_E_COLA = process.env.NEXT_PUBLIC_PIX_COPIA_E_COLA || "";
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
    return formatCurrency(pixAmount);
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

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [congregationSelect, setCongregationSelect] = useState("");
  const [instrumentSelect, setInstrumentSelect] = useState("");

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('formDraft', JSON.stringify(form));
      } catch (e) {
        console.error('Erro ao salvar rascunho:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('formDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        // Só carrega se tiver algum campo preenchido
        const hasData = Object.values(parsed).some(v => v && String(v).trim());
        if (hasData) {
          setForm(parsed);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar rascunho:', e);
    }

    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'pix') {
      setActiveTab('pix');
    }
  }, []);

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

  function onChange(e) {
    const { name, value } = e.target;
    let v = value;

    if (name === "congregationSelect") {
      setCongregationSelect(v);
      if (v === "__OTHER__") {
        setForm((f) => ({ ...f, congregation: "" }));
      } else {
        setForm((f) => ({ ...f, congregation: v }));
      }
      return;
    }

    if (name === "congregationOther") {
      setForm((f) => ({ ...f, congregation: v }));
      return;
    }

    if (name === "instrumentSelect") {
      setInstrumentSelect(v);
      if (v === "__OTHER__") {
        setForm((f) => ({ ...f, instrument: "" }));
      } else {
        setForm((f) => ({ ...f, instrument: v }));
      }
      return;
    }

    if (name === "instrumentOther") {
      setForm((f) => ({ ...f, instrument: v }));
      return;
    }

    if (name === "doc") {
      const d = onlyDigits(value);
      const isCPF = d.length > 9;
      v = isCPF ? maskCPF(value) : maskRG(value);
      setForm((f) => ({ ...f, cpf: isCPF ? v : "", rg: isCPF ? "" : v }));
      return;
    }

    if (name === "cpf") v = maskCPF(value);
    if (name === "phone") v = maskPhone(value);
    if (name === "age") v = maskNumber(value, 3);

    setForm((f) => ({ ...f, [name]: v }));
  }

  // Mantém selects sincronizados
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

  async function submit(e) {
    e.preventDefault();

    // Validação
    const validation = validateForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError || "Preencha os campos obrigatórios");
      return;
    }

    setErrors({});
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
        toast.success("Cadastro confirmado! 🎉", { id: toastId });

        // Salva dados da submissão
        try {
          localStorage.setItem('lastSubmission', JSON.stringify(form));
          localStorage.removeItem('formDraft');
        } catch (e) {
          console.error('Erro ao salvar submissão:', e);
        }

        // Limpa formulário
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

        // Redireciona para página de sucesso
        setTimeout(() => {
          router.push('/success');
        }, 500);
      } else {
        toast.error(j.error || "Erro desconhecido", { id: toastId });
      }
    } catch (err2) {
      toast.error(String(err2), { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  // Geração do QR do Pix
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

  // Ajusta altura do container
  useEffect(() => {
    const panels = panelsRef.current;
    if (!panels) return;
    const activeEl = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
    if (!activeEl) return;
    const h = activeEl.scrollHeight;
    panels.style.height = h + "px";
  }, [activeTab, form, pixQrDataUrl, congregationSelect, instrumentSelect, errors]);

  useEffect(() => {
    const panels = panelsRef.current;
    if (!panels) return;
    const activeEl = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
    if (activeEl) panels.style.height = activeEl.scrollHeight + "px";

    function onResize() {
      const el = activeTab === "form" ? formPanelRef.current : pixPanelRef.current;
      if (el && panels) panels.style.height = el.scrollHeight + "px";
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <main className="min-h-screen grid place-items-center app-bg p-4 sm:p-6">
      <section className="card w-full max-w-3xl">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {activeTab === "form" ? "Excursão Campinas" : "Pix do Ônibus"}
            </h1>
            <p className="text-muted text-sm sm:text-base">
              {activeTab === "form"
                ? "Preencha seus dados para garantir a vaga no ônibus."
                : "Pague via Pix lendo o QR Code ou copiando o código."}
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </header>

        <div role="tablist" aria-label="Escolher aba" className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          <button
            role="tab"
            aria-selected={activeTab === "form"}
            className={`px-4 py-3 -mb-px border-b-2 transition-all duration-200 font-medium ${activeTab === "form"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            onClick={() => setActiveTab("form")}
          >
            Formulário
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "pix"}
            className={`px-4 py-3 -mb-px border-b-2 transition-all duration-200 font-medium ${activeTab === "pix"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            onClick={() => setActiveTab("pix")}
          >
            Pix
          </button>
        </div>

        <div className="tab-panels min-h-[24rem]" ref={panelsRef}>
          {/* Form panel */}
          <div className="tab-panel" ref={formPanelRef} data-active={activeTab === "form"} aria-hidden={activeTab !== "form"}>
            <form onSubmit={submit} noValidate>
              <ProgressIndicator form={form} />

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
                  {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
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
                    placeholder="000.000.000-00 ou 00.000.000-0"
                    autoComplete="off"
                  />
                  {errors.doc && <span className="field-error-text">{errors.doc}</span>}
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
                  {errors.instrument && instrumentSelect !== "__OTHER__" && (
                    <span className="field-error-text">{errors.instrument}</span>
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
                  {errors.congregation && congregationSelect !== "__OTHER__" && (
                    <span className="field-error-text">{errors.congregation}</span>
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
                  {errors.maritalStatus && <span className="field-error-text">{errors.maritalStatus}</span>}
                </label>

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
                  {errors.auxiliar && <span className="field-error-text">{errors.auxiliar}</span>}
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
                  {errors.age && <span className="field-error-text">{errors.age}</span>}
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
                  {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                </label>
              </div>

              <button className="btn-base btn-primary w-full mt-4" disabled={submitting}>
                {submitting && <span className="spinner" aria-hidden="true"></span>}
                {submitting ? "Enviando…" : "Enviar cadastro"}
              </button>

              <footer className="mt-3 text-muted text-sm text-center">
                Seus dados serão usados apenas para organizar a excursão.
              </footer>
            </form>
          </div>

          {/* Pix panel */}
          <div className="tab-panel" ref={pixPanelRef} data-active={activeTab === "pix"} aria-hidden={activeTab !== "pix"}>
            <div>
              {pixAmountFormatted && (
                <div className="mb-4">
                  <span className="label">Valor:</span>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 font-bold text-lg text-blue-700 dark:text-blue-300">
                    {pixAmountFormatted}
                  </div>
                </div>
              )}

              {!PIX_COPIA_E_COLA && (
                <div className="alert-err">
                  Defina o código Pix em <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">NEXT_PUBLIC_PIX_COPIA_E_COLA</code> ou
                  diretamente no arquivo.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50">
                  {pixQrDataUrl ? (
                    <img src={pixQrDataUrl} alt="QR Code do Pix" className="w-56 h-56 rounded-lg" />
                  ) : (
                    <div className="w-56 h-56 grid place-items-center text-muted bg-slate-100 dark:bg-slate-800 rounded-lg">
                      QR Code
                    </div>
                  )}
                  <span className="text-sm text-muted text-center">Escaneie no app do seu banco</span>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="label">Código copia e cola</span>
                  <textarea
                    className="input min-h-[140px] font-mono text-xs"
                    value={PIX_COPIA_E_COLA}
                    readOnly
                  />
                  <button type="button" className="btn-base btn-secondary w-full mt-3" onClick={copyPix}>
                    📋 Copiar código
                  </button>
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
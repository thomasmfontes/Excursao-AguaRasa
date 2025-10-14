import { useState } from "react";


export default function Home() {
  const [form, setForm] = useState({
    fullName: "", cpf: "", rg: "", congregation: "", maritalStatus: "", age: "", phone: "", paid: false, paymentTx: ""
  });
  const [status, setStatus] = useState(null);


  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }


  async function submit(e) {
    e.preventDefault();
    setStatus('Enviando...');
    const res = await fetch('/api/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    const j = await res.json();
    setStatus(j.ok ? 'Confirmado' : ('Erro: ' + (j.error || 'unknown')));
  }


  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-lg bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-bold mb-4">Excursão – Cadastro</h1>


        <label className="block mb-2">Nome completo<input name="fullName" value={form.fullName} onChange={onChange} required className="w-full p-2 border rounded" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">CPF<input name="cpf" value={form.cpf} onChange={onChange} required className="w-full p-2 border rounded" /></label>
          <label className="block">RG<input name="rg" value={form.rg} onChange={onChange} className="w-full p-2 border rounded" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <label className="block">Congregação<input name="congregation" value={form.congregation} onChange={onChange} className="w-full p-2 border rounded" /></label>
          <label className="block">Estado civil<input name="maritalStatus" value={form.maritalStatus} onChange={onChange} className="w-full p-2 border rounded" /></label>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <label>Idade<input name="age" type="number" value={form.age} onChange={onChange} className="w-full p-2 border rounded" /></label>
          <label>Telefone<input name="phone" value={form.phone} onChange={onChange} className="w-full p-2 border rounded" /></label>
        </div>


        <label className="flex items-center gap-2 mt-3"><input type="checkbox" name="paid" checked={form.paid} onChange={onChange} /> Já pagou</label>
        <label className="block mt-2">Chave/Tx do pagamento<input name="paymentTx" value={form.paymentTx} onChange={onChange} className="w-full p-2 border rounded" /></label>


        <button className="mt-4 w-full p-2 rounded bg-blue-600 text-white">Enviar</button>
        {status && <p className="mt-2">{status}</p>}
      </form>
    </main>
  )
}
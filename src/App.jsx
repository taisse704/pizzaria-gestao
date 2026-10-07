import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { LayoutDashboard, ShoppingBag, Landmark, CreditCard, Receipt, BarChart3, Settings, LogOut, Menu, X, Plus, RefreshCw, Search, Download, CheckCircle2, AlertCircle } from "lucide-react";

const modules=[
  ["dashboard","Dashboard",LayoutDashboard],["vendas","Vendas",ShoppingBag],["recebimentos","Recebimentos",Receipt],["bancos","Bancos / Extratos",Landmark],
  ["cartoes","Cartões",CreditCard],["contas","Contas a pagar",Receipt],["relatorios","Relatórios",BarChart3],["configuracoes","Configurações",Settings]
];
const money=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0));
const dateBR=v=>v?new Date(v+"T00:00:00").toLocaleDateString("pt-BR"):"—";
const today=()=>new Date().toISOString().slice(0,10);
const monthStart=()=>new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10);

async function seedUser(user){
  const defaults=[
    {name:"TON",institution:"TON",account_type:"bank"},
    {name:"iFood Pago",institution:"iFood",account_type:"bank"}
  ];
  const cats=[
    ["Venda","Receita"],["iFood","Receita"],["BeeFood","Receita"],["99Food","Receita"],["PIX","Receita"],["Outros recebimentos","Receita"],
    ["Matéria-prima","Despesas"],["Fornecedor","Despesas"],["Aluguel","Despesas"],["Energia","Despesas"],["Água","Despesas"],["Internet","Despesas"],["Funcionários","Despesas"],["Impostos","Despesas"],["Taxas","Despesas"],["Manutenção","Despesas"],["Outras despesas","Despesas"],
    ["Transferência entre contas","Outros"],["Aporte","Outros"],["Retirada","Outros"],["Ajuste","Outros"],["Empréstimo","Outros"]
  ];
  const chans=["Direto","iFood","BeeFood","99Food"];
  const [{data:banks},{data:existingCats},{data:existingChans}]=await Promise.all([
    supabase.from("bank_accounts").select("id").eq("user_id",user.id).limit(1),
    supabase.from("categories").select("id").eq("user_id",user.id).limit(1),
    supabase.from("channels").select("id").eq("user_id",user.id).limit(1)
  ]);
  if(!banks?.length) await supabase.from("bank_accounts").insert(defaults.map(x=>({...x,user_id:user.id})));
  if(!existingCats?.length) await supabase.from("categories").insert(cats.map(([name,classification])=>({user_id:user.id,name,classification})));
  if(!existingChans?.length) await supabase.from("channels").insert(chans.map(name=>({user_id:user.id,name})));
}

function Login({onLogin}){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[loading,setLoading]=useState(false),[registering,setRegistering]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 async function submit(e){e.preventDefault();setError("");setMessage("");setLoading(true);
  if(!supabase){setError("Supabase ainda não foi configurado.");setLoading(false);return}
  if(registering){const {data,error}=await supabase.auth.signUp({email,password});if(error)setError(error.message);else if(data.session){await seedUser(data.user);onLogin(data.user)}else setMessage("Cadastro realizado. Verifique seu e-mail para confirmar a conta.");}
  else {const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else{await seedUser(data.user);onLogin(data.user)}}
  setLoading(false);
 }
 return <div className="login-page"><div className="login-card"><div className="brand-mark">🍕</div><h1>Pizzaria Gestão</h1><p>Controle financeiro e operacional da sua pizzaria.</p>
  <form onSubmit={submit}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="error">{error}</div>}{message&&<div className="success">{message}</div>}<button className="primary" disabled={loading}>{loading?(registering?"Cadastrando...":"Entrando..."):(registering?"Criar conta":"Entrar")}</button></form>
  <button className="link-button" type="button" onClick={()=>{setRegistering(!registering);setError("");setMessage("")}}>{registering?"Já tenho uma conta — Entrar":"Ainda não tenho conta — Criar cadastro"}</button>
 </div></div>
}

function Dashboard({data}){
 const {sales,payables,receivables,bankTx}=data;
 const receita=sales.reduce((a,x)=>a+Number(x.net_amount||0),0), despesas=payables.filter(x=>x.status!=="paid").reduce((a,x)=>a+Number(x.amount||0),0);
 const aReceber=receivables.filter(x=>x.status!=="received").reduce((a,x)=>a+Number(x.amount||0)-Number(x.received_amount||0),0);
 const saldo=bankTx.reduce((a,x)=>a+(x.direction==="in"?Number(x.amount):-Number(x.amount)),0);
 return <main className="content"><div className="page-head"><div><h2>Dashboard</h2><p>Visão geral por competência — {new Date().toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}.</p></div></div>
 <div className="cards"><div className="card"><span>Receita líquida</span><strong>{money(receita)}</strong><small>Vendas do período</small></div><div className="card"><span>Contas a pagar</span><strong>{money(despesas)}</strong><small>Pendências</small></div><div className="card"><span>A receber</span><strong>{money(aReceber)}</strong><small>Valores pendentes</small></div><div className="card"><span>Movimentação bancária</span><strong>{money(saldo)}</strong><small>Entradas menos saídas</small></div></div>
 <section className="panel"><div className="section-title"><h3>Resumo operacional</h3><button className="ghost" onClick={data.reload}><RefreshCw size={16}/>Atualizar</button></div>
 <div className="summary-grid"><div><b>{sales.length}</b><span>vendas</span></div><div><b>{payables.filter(x=>x.status==="pending").length}</b><span>contas pendentes</span></div><div><b>{receivables.filter(x=>x.status!=="received").length}</b><span>recebimentos pendentes</span></div><div><b>{bankTx.filter(x=>x.status==="unreconciled").length}</b><span>movimentos a conferir</span></div></div></section></main>
}

function Vendas({data}){
 const [open,setOpen]=useState(false),[form,setForm]=useState({fact_date:today(),competence_date:today(),gross_amount:"",discounts:"0",fees:"0",cancellations:"0",payment_method:"PIX",source:"manual",channel_id:""}),[saving,setSaving]=useState(false);
 async function save(e){e.preventDefault();setSaving(true);const gross=Number(form.gross_amount||0),net=gross-Number(form.discounts||0)-Number(form.fees||0)-Number(form.cancellations||0);const {error}=await supabase.from("sales").insert({...form,user_id:data.user.id,channel_id:form.channel_id||null,gross_amount:gross,discounts:Number(form.discounts||0),fees:Number(form.fees||0),cancellations:Number(form.cancellations||0),net_amount:net,fact_date:new Date(form.fact_date+"T12:00:00").toISOString()});setSaving(false);if(error)alert(error.message);else{setOpen(false);data.reload()}}
 return <main className="content"><div className="page-head"><div><h2>Vendas</h2><p>Registre e acompanhe vendas por canal e competência.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Nova venda</button></div>
 <TableToolbar search={data.search} setSearch={data.setSearch} exportData={()=>downloadCSV(data.sales,"vendas.csv")}/>
 <div className="table-wrap"><table><thead><tr><th>Fato gerador</th><th>Competência</th><th>Canal</th><th>Pagamento</th><th>Bruta</th><th>Taxas</th><th>Líquida</th></tr></thead><tbody>{data.sales.map(x=><tr key={x.id}><td>{new Date(x.fact_date).toLocaleDateString("pt-BR")}</td><td>{dateBR(x.competence_date)}</td><td>{x.channels?.name||"—"}</td><td>{x.payment_method||"—"}</td><td>{money(x.gross_amount)}</td><td>{money(Number(x.discounts)+Number(x.fees)+Number(x.cancellations))}</td><td><b>{money(x.net_amount)}</b></td></tr>)}{!data.sales.length&&<EmptyRow text="Nenhuma venda registrada."/>}</tbody></table></div>
 {open&&<Modal title="Nova venda" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Data do fato gerador"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})}/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})}/></Field><Field label="Canal"><select value={form.channel_id} onChange={e=>setForm({...form,channel_id:e.target.value})}><option value="">Selecione</option>{data.channels.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Forma de pagamento"><input value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}/></Field><Field label="Valor bruto"><input type="number" step="0.01" value={form.gross_amount} onChange={e=>setForm({...form,gross_amount:e.target.value})} required/></Field><Field label="Descontos"><input type="number" step="0.01" value={form.discounts} onChange={e=>setForm({...form,discounts:e.target.value})}/></Field><Field label="Taxas"><input type="number" step="0.01" value={form.fees} onChange={e=>setForm({...form,fees:e.target.value})}/></Field><Field label="Cancelamentos"><input type="number" step="0.01" value={form.cancellations} onChange={e=>setForm({...form,cancellations:e.target.value})}/></Field><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Salvando...":"Salvar venda"}</button></div></form></Modal>}</main>
}

function Bancos({data}){
 const [open,setOpen]=useState(false),[form,setForm]=useState({fact_date:today(),competence_date:today(),description:"",classification:"Despesas",amount:"",direction:"out",bank_account_id:""});
 async function save(e){e.preventDefault();const {error}=await supabase.from("bank_transactions").insert({...form,user_id:data.user.id,amount:Number(form.amount),status:"unreconciled"});if(error)alert(error.message);else{setOpen(false);data.reload()}}
 return <main className="content"><div className="page-head"><div><h2>Bancos / Extratos</h2><p>Movimentos por data do fato gerador e competência.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Novo movimento</button></div>
 <div className="filters"><select value={data.bankFilter} onChange={e=>data.setBankFilter(e.target.value)}><option value="">Todos os bancos</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><input placeholder="Pesquisar descrição..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/><button className="ghost" onClick={()=>downloadCSV(data.bankTx,"extrato.csv")}><Download size={16}/>CSV</button></div>
 <div className="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Classificação</th><th>Categoria</th><th>Entrada</th><th>Saída</th><th>Banco</th><th>Status</th></tr></thead><tbody>{data.bankTx.map(x=><tr key={x.id}><td>{new Date(x.fact_date).toLocaleDateString("pt-BR")}</td><td>{x.description}</td><td>{x.classification}</td><td>{x.categories?.name||"—"}</td><td>{x.direction==="in"?money(x.amount):"—"}</td><td>{x.direction==="out"?money(x.amount):"—"}</td><td>{x.bank_accounts?.name||"—"}</td><td><span className="badge">{x.status==="reconciled"?"Conferido":"A conferir"}</span></td></tr>)}{!data.bankTx.length&&<EmptyRow text="Nenhum movimento registrado."/>}</tbody></table></div>
 {open&&<Modal title="Novo movimento bancário" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.from("bank_transactions").insert({...form,user_id:data.user.id,amount:Number(form.amount)});if(error)alert(error.message);else{setOpen(false);data.reload()}}}><Field label="Data do fato gerador"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})}/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})}/></Field><Field label="Banco"><select value={form.bank_account_id} onChange={e=>setForm({...form,bank_account_id:e.target.value})} required><option value="">Selecione</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Classificação"><select value={form.classification} onChange={e=>setForm({...form,classification:e.target.value})}><option>Receita</option><option>Despesas</option><option>Outros</option></select></Field><Field label="Categoria"><select value={form.category_id||""} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{data.categories.filter(c=>c.classification===form.classification).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Tipo"><select value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})}><option value="out">Saída</option><option value="in">Entrada</option></select></Field><Field label="Valor"><input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></Field><div className="form-actions"><button className="primary">Salvar movimento</button></div></form></Modal>}</main>
}

function Contas({data}){
 const [open,setOpen]=useState(false),[form,setForm]=useState({description:"",amount:"",due_date:today(),competence_date:today(),category_id:"",supplier_id:"",payment_bank_account_id:"",status:"pending"});
 async function save(e){e.preventDefault();const {error}=await supabase.from("payables").insert({...form,user_id:data.user.id,category_id:form.category_id||null,supplier_id:form.supplier_id||null,payment_bank_account_id:form.payment_bank_account_id||null,amount:Number(form.amount)});if(error)alert(error.message);else{setOpen(false);data.reload()}}
 async function pay(x){const {error}=await supabase.from("payables").update({status:"paid",payment_date:today(),paid_bank_account_id:x.payment_bank_account_id}).eq("id",x.id);if(error)alert(error.message);else data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Contas a pagar</h2><p>Ordenadas pela data de vencimento.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Nova conta</button></div>
 <div className="filters"><select value={data.payFilter} onChange={e=>data.setPayFilter(e.target.value)}><option value="">Todas</option><option value="pending">Pendentes</option><option value="paid">Pagas</option></select><input placeholder="Pesquisar..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div>
 <div className="table-wrap"><table><thead><tr><th>Vencimento</th><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Competência</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>{data.payables.map(x=><tr key={x.id}><td>{dateBR(x.due_date)}</td><td>{x.description}</td><td>{x.suppliers?.name||"—"}</td><td>{x.categories?.name||"—"}</td><td>{dateBR(x.competence_date)}</td><td>{money(x.amount)}</td><td><span className={x.status==="paid"?"badge ok":"badge"}>{x.status==="paid"?"Pago":"Pendente"}</span></td><td>{x.status!=="paid"&&<button className="icon-btn" title="Marcar como paga" onClick={()=>pay(x)}><CheckCircle2 size={18}/></button>}</td></tr>)}{!data.payables.length&&<EmptyRow text="Nenhuma conta cadastrada."/>}</tbody></table></div>
 {open&&<Modal title="Nova conta a pagar" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Valor"><input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></Field><Field label="Vencimento"><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})}/></Field><Field label="Categoria"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{data.categories.filter(c=>c.classification==="Despesas").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Fornecedor"><select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})}><option value="">Selecione</option>{data.suppliers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Banco para pagamento"><select value={form.payment_bank_account_id} onChange={e=>setForm({...form,payment_bank_account_id:e.target.value})}><option value="">Selecione</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><div className="form-actions"><button className="primary">Salvar conta</button></div></form></Modal>}</main>
}

function Cadastros({data}){
 const [tab,setTab]=useState("banks"),[name,setName]=useState("");
 async function add(table,extra={}){if(!name.trim())return;const {error}=await supabase.from(table).insert({user_id:data.user.id,name:name.trim(),...extra});if(error)alert(error.message);else{setName("");data.reload()}}
 return <main className="content"><div className="page-head"><div><h2>Configurações</h2><p>Cadastros básicos do sistema.</p></div></div><div className="tabs"><button className={tab==="banks"?"active":""} onClick={()=>setTab("banks")}>Bancos</button><button className={tab==="cards"?"active":""} onClick={()=>setTab("cards")}>Cartões</button><button className={tab==="cats"?"active":""} onClick={()=>setTab("cats")}>Categorias</button><button className={tab==="channels"?"active":""} onClick={()=>setTab("channels")}>Canais</button><button className={tab==="suppliers"?"active":""} onClick={()=>setTab("suppliers")}>Fornecedores</button></div><section className="panel"><div className="inline-form"><input placeholder="Nome do cadastro..." value={name} onChange={e=>setName(e.target.value)}/><button className="primary small" onClick={()=>add(tab==="banks"?"bank_accounts":tab==="cards"?"card_accounts":tab==="cats"?"categories":tab==="channels"?"channels":"suppliers",tab==="cats"?{classification:"Despesas"}:{})}><Plus size={16}/>Adicionar</button></div><div className="simple-list">{tab==="banks"&&data.banks.map(x=><div key={x.id}>{x.name}<span>{x.institution||""}</span></div>)}{tab==="cards"&&data.cards.map(x=><div key={x.id}>{x.name}<span>Fechamento {x.closing_day||"—"} / Vencimento {x.due_day||"—"}</span></div>)}{tab==="cats"&&data.categories.map(x=><div key={x.id}>{x.name}<span>{x.classification}</span></div>)}{tab==="channels"&&data.channels.map(x=><div key={x.id}>{x.name}</div>)}{tab==="suppliers"&&data.suppliers.map(x=><div key={x.id}>{x.name}<span>{x.phone||x.email||""}</span></div>)}</div></section></main>
}

function Recebimentos({data}){
 const [status,setStatus]=useState("");
 const rows=data.receivables.filter(x=>!status||x.status===status);
 async function receive(x){const bank=data.banks[0];if(!bank){alert("Cadastre um banco primeiro.");return}const {error}=await supabase.from("receivables").update({status:"received",received_date:today(),received_amount:Number(x.amount),bank_account_id:bank.id}).eq("id",x.id);if(error)alert(error.message);else data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Recebimentos</h2><p>Controle o que foi gerado na competência e o que efetivamente entrou no banco.</p></div></div>
 <div className="filters"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos</option><option value="pending">Pendentes</option><option value="received">Recebidos</option></select><button className="ghost" onClick={()=>downloadCSV(rows,"recebimentos.csv")}><Download size={16}/>CSV</button></div>
 <div className="table-wrap"><table><thead><tr><th>Competência</th><th>Descrição</th><th>Previsto</th><th>Recebido</th><th>Data prevista</th><th>Data real</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td>{dateBR(x.competence_date)}</td><td>{x.description}</td><td>{money(x.amount)}</td><td>{money(x.received_amount)}</td><td>{dateBR(x.expected_date)}</td><td>{dateBR(x.received_date)}</td><td><span className={x.status==="received"?"badge ok":"badge"}>{x.status==="received"?"Recebido":"Pendente"}</span></td><td>{x.status!=="received"&&<button className="icon-btn" onClick={()=>receive(x)} title="Marcar recebido"><CheckCircle2 size={18}/></button>}</td></tr>)}{!rows.length&&<EmptyRow text="Nenhum recebimento cadastrado."/>}</tbody></table></div></main>
}
function Cartoes({data}){return <main className="content"><div className="page-head"><div><h2>Cartões</h2><p>Compras, parcelas e faturas.</p></div></div><div className="cards">{data.cards.map(c=><div className="card" key={c.id}><strong>{c.name}</strong><small>Fechamento: {c.closing_day||"—"} • Vencimento: {c.due_day||"—"}</small></div>)}{!data.cards.length&&<div className="panel empty"><h3>Nenhum cartão cadastrado</h3><p>Cadastre em Configurações.</p></div>}</div></main>}
function Relatorios({data}){const totalIn=data.bankTx.filter(x=>x.direction==="in").reduce((a,x)=>a+Number(x.amount),0),totalOut=data.bankTx.filter(x=>x.direction==="out").reduce((a,x)=>a+Number(x.amount),0);return <main className="content"><div className="page-head"><div><h2>Relatórios</h2><p>Visão financeira consolidada.</p></div><button className="ghost" onClick={()=>downloadCSV(data.bankTx,"relatorio-financeiro.csv")}><Download size={16}/>Exportar CSV</button></div><div className="cards"><div className="card"><span>Entradas</span><strong>{money(totalIn)}</strong></div><div className="card"><span>Saídas</span><strong>{money(totalOut)}</strong></div><div className="card"><span>Resultado de caixa</span><strong>{money(totalIn-totalOut)}</strong></div><div className="card"><span>Vendas líquidas</span><strong>{money(data.sales.reduce((a,x)=>a+Number(x.net_amount||0),0))}</strong></div></div><section className="panel"><h3>Conferência</h3><p>Movimentos bancários não conciliados: <b>{data.bankTx.filter(x=>x.status==="unreconciled").length}</b>.</p><p>Contas a pagar pendentes: <b>{data.payables.filter(x=>x.status!=="paid").length}</b>.</p><p>Recebimentos pendentes: <b>{data.receivables.filter(x=>x.status!=="received").length}</b>.</p></section></main>}

function TableToolbar({search,setSearch,exportData}){return <div className="filters"><div className="search"><Search size={16}/><input placeholder="Pesquisar..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="ghost" onClick={exportData}><Download size={16}/>CSV</button></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Modal({title,onClose,children}){return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
function EmptyRow({text}){return <tr><td colSpan="9" className="empty-row">{text}</td></tr>}
function downloadCSV(rows,name){const clean=rows.map(r=>Object.fromEntries(Object.entries(r).filter(([k,v])=>typeof v!=="object"&&k!=="id")));const keys=[...new Set(clean.flatMap(r=>Object.keys(r)))];const csv=[keys.join(";"),...clean.map(r=>keys.map(k=>String(r[k]??"").replaceAll(";"," ")).join(";"))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=name;a.click();URL.revokeObjectURL(a.href)}

function useData(user){
 const [state,setState]=useState({banks:[],categories:[],channels:[],suppliers:[],cards:[],sales:[],bankTx:[],payables:[],receivables:[],loading:true});
 const [search,setSearch]=useState(""),[bankFilter,setBankFilter]=useState(""),[payFilter,setPayFilter]=useState("");
 async function reload(){setState(s=>({...s,loading:true}));const uid=user.id;
  const [banks,categories,channels,suppliers,cards,sales,bankTx,payables,receivables]=await Promise.all([
   supabase.from("bank_accounts").select("*").eq("user_id",uid).eq("active",true).order("name"),
   supabase.from("categories").select("*").eq("user_id",uid).eq("active",true).order("classification").order("name"),
   supabase.from("channels").select("*").eq("user_id",uid).eq("active",true).order("name"),
   supabase.from("suppliers").select("*").eq("user_id",uid).eq("active",true).order("name"),
   supabase.from("card_accounts").select("*").eq("user_id",uid).eq("active",true).order("name"),
   supabase.from("sales").select("*,channels(name)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(500),
   supabase.from("bank_transactions").select("*,bank_accounts(name),categories(name)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(500),
   supabase.from("payables").select("*,suppliers(name),categories(name)").eq("user_id",uid).order("due_date",{ascending:true}).limit(500),
   supabase.from("receivables").select("*").eq("user_id",uid).order("expected_date",{ascending:true}).limit(500)
  ]);
  setState({banks:banks.data||[],categories:categories.data||[],channels:channels.data||[],suppliers:suppliers.data||[],cards:cards.data||[],sales:sales.data||[],bankTx:bankTx.data||[],payables:payables.data||[],receivables:receivables.data||[],loading:false});
 }
 useEffect(()=>{reload()},[user.id]);
 const filterText=x=>!search||JSON.stringify(x).toLowerCase().includes(search.toLowerCase());
 return {...state,reload,search,setSearch,bankFilter,setBankFilter,payFilter,setPayFilter,
  sales:state.sales.filter(filterText),bankTx:state.bankTx.filter(x=>(!bankFilter||x.bank_account_id===bankFilter)&&filterText(x)),
  payables:state.payables.filter(x=>(!payFilter||x.status===payFilter)&&filterText(x))};
}

export default function App(){
 const [user,setUser]=useState(null),[active,setActive]=useState("dashboard"),[mobile,setMobile]=useState(false),data=useData(user||{id:""});
 useEffect(()=>{if(!supabase)return;supabase.auth.getSession().then(async({data})=>{if(data.session?.user){await seedUser(data.session.user);setUser(data.session.user)}});const {data:{subscription}}=supabase.auth.onAuthStateChange(async(_e,s)=>{setUser(s?.user??null);if(s?.user)await seedUser(s.user)});return()=>subscription.unsubscribe()},[]);
 async function logout(){await supabase?.auth.signOut();setUser(null)}
 if(!user)return <Login onLogin={setUser}/>;
 const current=modules.find(m=>m[0]===active), Icon=current?.[2];
 return <div className="app"><aside className={mobile?"sidebar open":"sidebar"}><div className="logo"><span>🍕</span><div><b>Pizzaria</b><small>GESTÃO</small></div><button className="close" onClick={()=>setMobile(false)}><X size={20}/></button></div><nav>{modules.map(([id,label,I])=><button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setMobile(false)}}><I size={19}/>{label}</button>)}</nav><button className="logout" onClick={logout}><LogOut size={18}/>Sair</button></aside>
 <div className="main"><header><button className="menu" onClick={()=>setMobile(true)}><Menu/></button><div className="header-title">{Icon&&<Icon size={18}/>} {current?.[1]}</div><div className="header-user">{user.email}</div></header>
 {data.loading?<main className="content"><section className="panel empty"><RefreshCw className="spin"/><h3>Carregando seus dados...</h3></section></main>:
 active==="dashboard"?<Dashboard data={data}/>:active==="vendas"?<Vendas data={{...data,user}}/>:active==="recebimentos"?<Recebimentos data={data}/>:active==="bancos"?<Bancos data={{...data,user}}/>:active==="contas"?<Contas data={{...data,user}}/>:active==="cartoes"?<Cartoes data={data}/>:active==="relatorios"?<Relatorios data={data}/>:<Cadastros data={{...data,user}}/>}
 </div></div>
}
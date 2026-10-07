import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import {
  LayoutDashboard, ShoppingBag, Landmark, CreditCard, Receipt,
  BarChart3, Settings, LogOut, Menu, X
} from "lucide-react";

const modules = [
  ["dashboard","Dashboard",LayoutDashboard],
  ["vendas","Vendas",ShoppingBag],
  ["bancos","Bancos / Extratos",Landmark],
  ["cartoes","Cartões",CreditCard],
  ["contas","Contas a pagar",Receipt],
  ["relatorios","Relatórios",BarChart3],
  ["configuracoes","Configurações",Settings],
];

function Login({ onLogin }) {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [registering,setRegistering] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    if (!supabase) {
      setError("Supabase ainda não foi configurado.");
      setLoading(false);
      return;
    }
    if (registering) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) onLogin(data.user);
      else setMessage("Cadastro realizado. Verifique seu e-mail para confirmar a conta antes de entrar.");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin(data.user);
    }
    setLoading(false);
  }

  return <div className="login-page">
    <div className="login-card">
      <div className="brand-mark">🍕</div>
      <h1>Pizzaria Gestão</h1>
      <p>Controle financeiro e operacional da sua pizzaria.</p>
      <form onSubmit={submit}>
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <button className="primary" disabled={loading}>{loading ? (registering ? "Cadastrando..." : "Entrando...") : (registering ? "Criar conta" : "Entrar")}</button>
      </form>
      <button className="link-button" type="button" onClick={()=>{setRegistering(!registering);setError("");setMessage("");}}>
        {registering ? "Já tenho uma conta — Entrar" : "Ainda não tenho conta — Criar cadastro"}
      </button>
    </div>
  </div>;
}

function Dashboard({ user }) {
  const cards = [
    ["Receita do mês","R$ 0,00","Nenhuma venda importada ainda"],
    ["Despesas","R$ 0,00","Nenhuma despesa registrada"],
    ["A receber","R$ 0,00","Sem recebimentos pendentes"],
    ["A pagar","R$ 0,00","Sem contas pendentes"],
  ];
  return <main className="content">
    <div className="page-head"><div><h2>Dashboard</h2><p>Visão geral da pizzaria por competência.</p></div></div>
    <div className="cards">{cards.map(([a,b,c])=><div className="card" key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></div>)}</div>
    <section className="panel">
      <h3>Comece configurando o sistema</h3>
      <p>Conectaremos bancos, vendas, cartões, contas e relatórios ao Supabase. Os dados ficarão separados por usuário e serão persistidos.</p>
    </section>
  </main>;
}

function Placeholder({ title }) {
  return <main className="content"><div className="page-head"><div><h2>{title}</h2><p>Módulo preparado para receber os dados persistidos no Supabase.</p></div></div><section className="panel empty"><div>📋</div><h3>{title}</h3><p>Este módulo será implementado na próxima etapa.</p></section></main>;
}

export default function App() {
  const [user,setUser] = useState(null);
  const [active,setActive] = useState("dashboard");
  const [mobile,setMobile] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data})=>setUser(data.session?.user ?? null));
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase?.auth.signOut();
    setUser(null);
  }

  if (!user) return <Login onLogin={setUser} />;

  const current = modules.find(m=>m[0]===active);
  return <div className="app">
    <aside className={mobile ? "sidebar open" : "sidebar"}>
      <div className="logo"><span>🍕</span><div><b>Pizzaria</b><small>GESTÃO</small></div><button className="close" onClick={()=>setMobile(false)}><X size={20}/></button></div>
      <nav>{modules.map(([id,label,Icon])=><button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setMobile(false)}}><Icon size={19}/>{label}</button>)}</nav>
      <button className="logout" onClick={logout}><LogOut size={18}/>Sair</button>
    </aside>
    <div className="main">
      <header><button className="menu" onClick={()=>setMobile(true)}><Menu/></button><div className="header-user">{user.email}</div></header>
      {active==="dashboard" ? <Dashboard user={user}/> : <Placeholder title={current?.[1] || "Módulo"}/>}
    </div>
  </div>;
}
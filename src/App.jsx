import { Component, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { LayoutDashboard, ShoppingBag, Landmark, CreditCard, Receipt, BarChart3, Settings, LogOut, Menu, X, Plus, RefreshCw, Search, Download, CheckCircle2, AlertCircle, Upload, Database, Utensils, ClipboardCheck } from "lucide-react";



class ModuleErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Erro ao renderizar o módulo:", error, info?.componentStack || "");
  }
  render() {
    if (this.state.hasError) {
      return <main className="content"><section className="panel"><h2>Não foi possível abrir esta tela</h2><p>O restante do sistema continua disponível. Detalhe do erro: {this.state.error?.message || "erro inesperado"}.</p><p>Recarregue o aplicativo para tentar novamente. Se persistir, envie esta mensagem de erro ao suporte.</p><button className="primary small" onClick={() => window.location.reload()}>Recarregar aplicativo</button></section></main>;
    }
    return this.props.children;
  }
}

const modules=[
  ["dashboard","Dashboard",LayoutDashboard],["vendas","Vendas",ShoppingBag],["recebimentos","Recebimentos",Receipt],["bancos","Bancos / Extratos",Landmark],
  ["cartoes","Cartões",CreditCard],["caixa","Caixa / Fluxo de caixa",Landmark],["contas","Contas a pagar",Receipt],["compras","Compras / Matéria-prima",ShoppingBag],["despesas","Despesas",Receipt],["cardapio","Cardápio",Utensils],["conciliacao","Conciliação",ClipboardCheck],["dados","Dados / Importações / Backup",Database],["relatorios","Relatórios",BarChart3],["configuracoes","Configurações",Settings]
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

  const menu = [
    {category:"Pizzas Tradicionais", items:[
      ["A MODA","Frango, calabresa, presunto, catupiry, palmito, lombinho, azeitona e orégano.",[45.99,55.99,65.99,80.99]],
      ["CALABRESA","Calabresa, cebola, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["FRANGO C/ CATUPIRY","Frango, catupiry, azeitona e orégano.",[45.99,55.99,65.99,80.99]],
      ["PORTUGUESA","Presunto, ovo, cebola, ervilha, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["TOSCANA","Calabresa, bacon, ovo, cebola, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["LOMBINHO","Lombresa, cebola, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["4 QUEIJOS","Catupiry, provolone, gorgonzola, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["MARGUERITA","Tomate, parmesão, manjericão, alho tostado, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["VEGETARIANA","Tomate, milho, palmito, azeitona preta e orégano.",[44.99,54.99,64.99,79.99]]
    ]},
    {category:"Pizzas Especiais", items:[
      ["FRANGO ESPECIAL","Frango, catupiry, milho, bacon, calabresa, cebola, azeitona e orégano.",[45.99,55.99,65.99,80.99]],
      ["CALABRESA ESPECIAL","Calabresa, palmito, catupiry, cebola, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["BACON ESPECIAL","Bacon, tomate, milho, calabresa, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["RAVENNA","Tomate, calabresa, milho, catupiry, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["NÁPOLES","Tomate, lombinho, cheddar, bacon, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["4 CARNES","Bacon, calabresa, presunto, lombinho, azeitona e orégano.",[45.99,55.99,65.99,80.99]],
      ["LOMBINHO C/ CHEDDAR","Molho da casa, mussarela, lombinho, cheddar, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["SAINTROPEZ","Catupiry, palmito, lombinho, parmesão, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["PRESUNTO ESPECIAL","Presunto, bacon, milho, tomate, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["VENEZA","Tomate, provolone, bacon, alho tostado, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["CATUPIRY ESPECIAL","Catupiry, milho, tomate, azeitona e orégano.",[44.99,54.99,64.99,79.99]],
      ["VEGETARIANA ESPECIAL","Tomate, milho, palmito, ervilha, manjericão, azeitona e orégano.",[44.99,54.99,64.99,79.99]]
    ]},
    {category:"Bebidas", items:[
      ["REFRIGERANTE 1 L - COCA COLA","Coca Cola.",[10]],
      ["REFRIGERANTE 1,5 L - GUARANÁ MINEIRO","Guaraná Mineiro.",[9]],
      ["REFRIGERANTE 1,5 L - GUARANÁ MINEIRO ZERO","Guaraná Mineiro Zero.",[9]],
      ["REFRIGERANTE 2 L - COCA COLA","Coca Cola.",[16]],
      ["REFRIGERANTE 2 L - GUARANÁ MINEIRO","Guaraná Mineiro.",[11]],
      ["REFRIGERANTE MINEIRO 600ml","Refrigerante Mineiro 600ml.",[7]],
      ["REFRIGERANTE MINEIRO 350ml (LATA)","Refrigerante Mineiro 350ml em lata.",[5]]
    ]},
    {category:"Bordas Recheadas", items:[
      ["CATUPIRY","Catupiry.",[12,12,12,14]],
      ["CHEDDAR","Cheddar.",[12,12,12,14]],
      ["CATUPIRY C/ BACON","Catupiry com bacon.",[14,14,14,16]],
      ["CHEDDAR C/ BACON","Cheddar com bacon.",[14,14,14,16]],
      ["PRESUNTO C/ MUSSARELA","Presunto com mussarela.",[16,16,16,18]]
    ]}
  ];
  for(const group of menu){
    let {data:cat}=await supabase.from("categories").select("id").eq("user_id",user.id).eq("name",group.category).limit(1);
    let categoryId=cat?.[0]?.id;
    if(!categoryId){
      const {data:created}=await supabase.from("categories").insert({user_id:user.id,name:group.category,classification:"Receita"}).select("id").single();
      categoryId=created?.id;
    }
    if(!categoryId) continue;
    for(const [name,description,prices] of group.items){
      const p=prices||[];
      const payload={category_id:categoryId,description,price_p:p[0]??null,price_m:p[1]??null,price_g:p[2]??null,price_f:p[3]??null,sale_price:Number(p[0]??p[1]??p[2]??p[3]??0),active:true,cost_price:0};
      const {data:existing}=await supabase.from("products").select("id").eq("user_id",user.id).eq("name",name).limit(1);
      if(!existing?.[0]) await supabase.from("products").insert({...payload,user_id:user.id,name});
    }
  }
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
 const now=new Date();
 const currentMonth=String(now.getFullYear())+"-"+String(now.getMonth()+1).padStart(2,"0");
 const monthOf=x=>String(x?.competence_date||x?.fact_date||x?.due_date||x?.expected_date||"").slice(0,7);
 const cashMonthOf=x=>String(x?.fact_date||x?.received_date||x?.payment_date||"").slice(0,7);
 const sales=(data.sales||[]).filter(x=>monthOf(x)===currentMonth&&x.status!=="cancelled");
 const payables=(data.payables||[]).filter(x=>monthOf(x)===currentMonth);
 const receivables=(data.receivables||[]).filter(x=>monthOf(x)===currentMonth);
 const bankTx=(data.bankTx||[]).filter(x=>(x?.fact_date||"").slice(0,7)===currentMonth);
 const receita=sales.reduce((a,x)=>a+Number(x.net_amount||0),0);
 const despesas=payables.filter(x=>x.status!=="paid"&&x.status!=="cancelled").reduce((a,x)=>a+Math.max(0,Number(x.amount||0)-Number(x.paid_amount||0)),0);
 const aReceber=receivables.filter(x=>x.status!=="received"&&x.status!=="cancelled").reduce((a,x)=>a+Math.max(0,Number(x.amount||0)-Number(x.received_amount||0)),0);
 const saldo=bankTx.reduce((a,x)=>a+(x.direction==="in"?Number(x.amount||0):x.direction==="out"?-Number(x.amount||0):0),0);
 const monthLabel=now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
 return <main className="content"><div className="page-head"><div><h2>Dashboard</h2><p>Visão geral por competência — {monthLabel}.</p></div></div>
 <div className="cards"><div className="card"><span>Receita líquida</span><strong>{money(receita)}</strong><small>Vendas não canceladas da competência</small></div><div className="card"><span>Contas a pagar</span><strong>{money(despesas)}</strong><small>Saldo pendente da competência</small></div><div className="card"><span>A receber</span><strong>{money(aReceber)}</strong><small>Saldo pendente da competência</small></div><div className="card"><span>Movimentação bancária</span><strong>{money(saldo)}</strong><small>Entradas menos saídas no mês</small></div></div>
 <section className="panel"><div className="section-title"><h3>Resumo operacional — {monthLabel}</h3><button className="ghost" onClick={data.reload}><RefreshCw size={16}/>Atualizar</button></div>
 <div className="summary-grid"><div><b>{sales.length}</b><span>vendas</span></div><div><b>{payables.filter(x=>x.status==="pending"||x.status==="overdue"||x.status==="partial").length}</b><span>contas pendentes</span></div><div><b>{receivables.filter(x=>x.status!=="received"&&x.status!=="cancelled").length}</b><span>recebimentos pendentes</span></div><div><b>{bankTx.filter(x=>x.status==="unreconciled").length}</b><span>movimentos a conferir</span></div></div>
 <p style={{fontSize:13,color:"var(--muted)"}}>Os indicadores acima consideram a competência selecionada no painel. Recebimentos e pagamentos efetivos devem ser conferidos pelos relatórios de caixa e bancos.</p></section></main>
}

function Vendas({data}){
 const [open,setOpen]=useState(false),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false),[selected,setSelected]=useState(new Set());
 const [month,setMonth]=useState(""),[dateFrom,setDateFrom]=useState(""),[dateTo,setDateTo]=useState(""),[channel,setChannel]=useState(""),[payment,setPayment]=useState("");
 const products=data.products||[];
 const categoryName=p=>p?.categories?.name||"";
 const pizzas=products.filter(p=>["Pizzas Tradicionais","Pizzas Especiais"].includes(categoryName(p)));
 const drinks=products.filter(p=>categoryName(p)==="Bebidas");
 const borders=products.filter(p=>categoryName(p)==="Bordas Recheadas");
 const sizeLabel={P:"Pequena",M:"Média",G:"Grande",F:"Família"};
 const priceFor=(p,size)=>{
   if(!p||!size)return 0;
   const key="price_"+String(size).toLowerCase();
   return p[key]==null?0:Number(p[key]);
 };
 const newPizza=()=>({type:"pizza",product_id:"",flavor_2_product_id:"",half:false,size:"",border_product_id:"",quantity:"1"});
 const newProduct=()=>({type:"product",category:"",product_id:"",size:"",quantity:"1"});
 const blank={fact_date:today(),customer_name:"",customer_phone:"",customer_address:"",delivery_fee:"0",discounts:"0",fees:"0",cancellations:"0",payment_method:"PIX",channel_id:data.channels.find(x=>x.name==="Direto")?.id||"",source:"manual",lines:[newPizza()]};
 const [form,setForm]=useState(blank);
 const lineValue=line=>{
   const qty=Math.max(1,Number(line.quantity||1));
   if(line.type==="pizza"){
     const p1=products.find(x=>x.id===line.product_id),p2=products.find(x=>x.id===line.flavor_2_product_id),b=products.find(x=>x.id===line.border_product_id);
     if(!p1||!line.size)return 0;
     const a=priceFor(p1,line.size),pizza=p2?(a+priceFor(p2,line.size))/2:a;     return (pizza+(b?priceFor(b,line.size):0))*qty;   }
   const p=products.find(x=>x.id===line.product_id);
   if(!p)return 0;
   return (line.category==="Bordas Recheadas"?priceFor(p,line.size):Number(p.sale_price||0))*qty;
 };
 const itemTotal=form.lines.reduce((sum,line)=>sum+lineValue(line),0);
 const gross=itemTotal+Number(form.delivery_fee||0),net=gross-Number(form.discounts||0)-Number(form.fees||0)-Number(form.cancellations||0);
 const rows=(data.sales||[]).filter(x=>{
   const d=String(x.fact_date||"").slice(0,10),ym=d.slice(0,7);
   const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");return (!month||ym===month)&&(!dateFrom||d>=dateFrom)&&(!dateTo||d<=dateTo)&&(!channel||x.channel_id===channel)&&(!payment||String(x.payment_method||"")===payment)&&(!term||[x.customer_name,x.customer_phone,x.customer_address,x.payment_method,x.channels?.name].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term)));
 });
 const selectableRows=rows;
 const allSelected=selectableRows.length>0&&selectableRows.every(x=>selected.has(x.id));useEffect(()=>{setSelected(new Set())},[month,dateFrom,dateTo,channel,payment,data.search]);function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)selectableRows.forEach(x=>next.delete(x.id));else selectableRows.forEach(x=>next.add(x.id));return next})}function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}
 const totalGross=rows.reduce((sum,x)=>sum+Number(x.gross_amount||0),0);
 const totalFeesDiscounts=rows.reduce((sum,x)=>sum+Number(x.discounts||0)+Number(x.fees||0)+Number(x.cancellations||0),0);
 const totalNet=rows.reduce((sum,x)=>sum+Number(x.net_amount||0),0);
 function reset(){setEditing(null);setForm({...blank,channel_id:data.channels.find(x=>x.name==="Direto")?.id||"",lines:[newPizza()]});setOpen(true)}
 function editSale(x){
   if(x.source!=="manual"){alert("Esta venda foi importada e não pode ser editada aqui. Para manter a importação íntegra, edições manuais ficam disponíveis somente para vendas diretas.");return}
   const items=x.sale_items||[];
   const lines=items.map(i=>{
     const p=products.find(p=>p.id===i.product_id)||products.find(p=>p.name===i.product_name);
     if(i.item_type==="pizza")return {type:"pizza",product_id:p?.id||"",flavor_2_product_id:products.find(p=>p.id===i.flavor_2_product_id)?.id||"",half:Boolean(i.flavor_2_product_id),size:i.size||"",border_product_id:products.find(p=>p.id===i.border_product_id)?.id||"",quantity:String(i.quantity||1)};
     return {type:"product",category:categoryName(p),product_id:p?.id||"",size:i.size||"",quantity:String(i.quantity||1)};
   });
   setEditing(x);setForm({fact_date:String(x.fact_date||"").slice(0,10)||today(),customer_name:x.customer_name||"",customer_phone:x.customer_phone||"",customer_address:x.customer_address||"",delivery_fee:String(x.delivery_fee||0),discounts:String(x.discounts||0),fees:String(x.fees||0),cancellations:String(x.cancellations||0),payment_method:x.payment_method||"PIX",channel_id:x.channel_id||"",source:"manual",lines:lines.length?lines:[newPizza()]});setOpen(true);
 }
 function updateLine(i,patch){setForm(f=>({...f,lines:f.lines.map((l,n)=>n===i?{...l,...patch}:l)}))}
 function addPizza(){setForm(f=>({...f,lines:[...f.lines,newPizza()]}))}
 function addProduct(){setForm(f=>({...f,lines:[...f.lines,newProduct()]}))}
 function removeLine(i){setForm(f=>{const lines=f.lines.filter((_,n)=>n!==i);return {...f,lines:lines.length?lines:[newPizza()]}})}
 async function save(e){
  e.preventDefault();
  if(form.lines.some(l=>!l.product_id))return alert("Selecione o produto de cada item.");
  if(form.lines.some(l=>l.type==="pizza"&&l.half&&!l.flavor_2_product_id))return alert("Na pizza meio a meio, selecione o segundo sabor.");
  if(form.lines.some(l=>l.type==="pizza"&&!l.size))return alert("Selecione o tamanho de todas as pizzas.");
  if(form.lines.some(l=>l.type==="product"&&l.category==="Bordas Recheadas"&&!l.size))return alert("Selecione o tamanho de todas as bordas.");
  setSaving(true);
  try{
   const payload={channel_id:form.channel_id||null,fact_date:new Date(form.fact_date+"T12:00:00").toISOString(),competence_date:form.fact_date,payment_method:form.payment_method,source:"manual",customer_name:form.customer_name.trim()||null,customer_phone:form.customer_phone.trim()||null,customer_address:form.customer_address.trim()||null,gross_amount:gross,delivery_fee:Number(form.delivery_fee||0),discounts:Number(form.discounts||0),fees:Number(form.fees||0),cancellations:Number(form.cancellations||0),net_amount:net};
   let saleId=editing?.id;
   if(editing){const {error}=await supabase.from("sales").update(payload).eq("id",editing.id).eq("user_id",data.user.id);if(error)throw error;await supabase.from("sale_items").delete().eq("sale_id",editing.id)}
   else{const {data:sale,error}=await supabase.from("sales").insert({...payload,user_id:data.user.id}).select("id").single();if(error)throw error;saleId=sale.id}
   const itemRows=form.lines.map(line=>{
     const p=products.find(x=>x.id===line.product_id),p2=products.find(x=>x.id===line.flavor_2_product_id),b=products.find(x=>x.id===line.border_product_id),qty=Math.max(1,Number(line.quantity||1));
     return {sale_id:saleId,product_id:p.id,product_name:p.name,quantity:qty,unit_price:lineValue({...line,quantity:1}),total_amount:lineValue(line),item_type:line.type==="pizza"?"pizza":"product",size:(line.type==="pizza"||line.category==="Bordas Recheadas")?line.size:null,flavor_2_product_id:p2?.id||null,flavor_2_name:p2?.name||null,border_product_id:b?.id||null,border_name:b?.name||null,notes:line.type==="pizza"?(p2?("Meia "+p.name+" + meia "+p2.name):p.name):p.name};
   });
   const {error:itemError}=await supabase.from("sale_items").insert(itemRows);if(itemError)throw itemError;
   const {data:recv}=await supabase.from("receivables").select("id").eq("sale_id",saleId).limit(1);
   if(recv?.[0]){const {error}=await supabase.from("receivables").update({description:"Venda direta"+(form.customer_name.trim()?" — "+form.customer_name.trim():""),competence_date:form.fact_date,expected_date:form.fact_date,amount:net}).eq("id",recv[0].id);if(error)throw error}
   else{const {error}=await supabase.from("receivables").insert({user_id:data.user.id,sale_id:saleId,description:"Venda direta"+(form.customer_name.trim()?" — "+form.customer_name.trim():""),competence_date:form.fact_date,expected_date:form.fact_date,amount:net,received_amount:0,status:"pending",source:"manual"});if(error)throw error}
   setOpen(false);data.reload();
  }catch(error){alert(error?.message||"Não foi possível salvar a venda.")}finally{setSaving(false)}
 }
 async function removeSale(x){
  if(!confirm(`Excluir esta venda ${x.source==="manual"?"direta":"importada"} e seus itens/recebíveis vinculados? Esta ação não poderá ser desfeita.`))return;
  try{const {data:links,error:linkError}=await supabase.from("reconciliation_batch_items").select("batch_id").eq("sale_id",x.id).limit(1);if(linkError)throw linkError;if(links?.length){alert("Esta venda está vinculada a uma conciliação. Entre em Conciliação e desfaça o repasse antes de excluir.");return}const {error:r}=await supabase.from("receivables").delete().eq("sale_id",x.id).eq("user_id",data.user.id);if(r)throw r;const {error:i}=await supabase.from("sale_items").delete().eq("sale_id",x.id);if(i)throw i;const {error}=await supabase.from("sales").delete().eq("id",x.id).eq("user_id",data.user.id);if(error)throw error;setSelected(prev=>{const next=new Set(prev);next.delete(x.id);return next});data.reload()}catch(error){alert(error?.message||"Não foi possível excluir a venda.")}
 }
 async function removeSelectedSales(){const ids=selectableRows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;if(!confirm(`Excluir ${ids.length} venda(s) selecionada(s), importada(s) ou direta(s), incluindo itens e recebíveis vinculados? Esta ação não poderá ser desfeita.`))return;try{const {data:links,error:linkError}=await supabase.from("reconciliation_batch_items").select("sale_id").in("sale_id",ids);if(linkError)throw linkError;if(links?.length){alert("Uma ou mais vendas selecionadas estão vinculadas a uma conciliação. Entre em Conciliação e desfaça os repasses correspondentes antes de excluir.");return}for(const id of ids){const {error:e1}=await supabase.from("receivables").delete().eq("sale_id",id).eq("user_id",data.user.id);if(e1)throw e1;const {error:e2}=await supabase.from("sale_items").delete().eq("sale_id",id);if(e2)throw e2;const {error:e3}=await supabase.from("sales").delete().eq("id",id).eq("user_id",data.user.id);if(e3)throw e3}setSelected(new Set());data.reload()}catch(error){alert(error?.message||"Não foi possível excluir todas as vendas. Confira os registros antes de tentar novamente.")}
 }
 return <main className="content"><div className="page-head"><div><h2>Vendas</h2><p>Venda direta: vários itens no mesmo pedido, pizzas por tamanho, meia a meia, bordas, bebidas, taxa de entrega e pagamento.</p></div><button className="primary small" onClick={reset}><Plus size={16}/>Nova venda direta</button></div>
 <div className="filters"><label>Mês <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>De <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label>Até <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label><select value={channel} onChange={e=>setChannel(e.target.value)}><option value="">Todos os canais</option>{data.channels.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><select value={payment} onChange={e=>setPayment(e.target.value)}><option value="">Todos os pagamentos</option>{["PIX","Dinheiro","Cartão de crédito","Cartão de débito"].map(x=><option key={x}>{x}</option>)}</select><div className="search"><Search size={16}/><input placeholder="Pesquisar..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div></div>
 <div className="cards" style={{marginTop:16}}><div className="card"><span>Bruto total</span><strong>{money(totalGross)}</strong><small>{rows.length} venda(s) filtrada(s)</small></div><div className="card"><span>Taxas/Descontos</span><strong>{money(totalFeesDiscounts)}</strong><small>Taxas, descontos e cancelamentos</small></div><div className="card"><span>Líquido total</span><strong>{money(totalNet)}</strong><small>Após taxas e descontos</small></div></div>
 {rows.length>0&&<div className="filters" style={{marginTop:12,alignItems:"center"}}><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todas as {rows.length} venda(s) filtrada(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelectedSales}>Excluir selecionadas</button><small>Inclui vendas diretas e importadas; vendas conciliadas exigem desfazer o repasse primeiro.</small></div>}
 <div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Data</th><th>Cliente</th><th>Canal</th><th>Pagamento</th><th>Bruta</th><th>Taxas/Descontos</th><th>Líquida</th><th>Ações</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar venda" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{new Date(x.fact_date).toLocaleDateString("pt-BR")}</td><td>{x.customer_name||"—"}</td><td>{x.channels?.name||"—"}</td><td>{x.payment_method||"—"}</td><td>{money(x.gross_amount)}</td><td>{money(Number(x.discounts||0)+Number(x.fees||0)+Number(x.cancellations||0))}</td><td><b>{money(x.net_amount)}</b></td><td><button className="icon-btn" title={x.source==="manual"?"Editar":"Venda importada — edição bloqueada"} disabled={x.source!=="manual"} onClick={()=>editSale(x)} style={x.source!=="manual"?{opacity:.45,cursor:"not-allowed"}:undefined}>✏️</button><button className="icon-btn" title="Excluir venda e registros vinculados" onClick={()=>removeSale(x)}>🗑️</button></td></tr>)}{!rows.length&&<EmptyRow text="Nenhuma venda encontrada."/>}</tbody></table></div>
 {open&&<Modal title={editing?"Editar venda direta":"Nova venda direta"} onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}>
 <Field label="Cliente"><input value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} placeholder="Nome do cliente"/></Field><Field label="Telefone"><input value={form.customer_phone} onChange={e=>setForm({...form,customer_phone:e.target.value})} placeholder="Telefone"/></Field><Field label="Endereço"><input value={form.customer_address} onChange={e=>setForm({...form,customer_address:e.target.value})} placeholder="Para entrega"/></Field><Field label="Data"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})} required/></Field>
 <div className="panel" style={{gridColumn:"1/-1"}}><div className="section-title"><h3>Itens da venda</h3><div><button type="button" className="ghost small" onClick={addPizza}>➕ Adicionar pizza</button><button type="button" className="ghost small" onClick={addProduct}>➕ Adicionar outro produto</button></div></div>
 {form.lines.map((line,i)=><div className="panel" key={i} style={{marginBottom:12,border:"1px solid #eee"}}>
  {line.type==="pizza"?<><div className="section-title"><h4>🍕 Pizza {i+1}</h4><button type="button" className="icon-btn" onClick={()=>removeLine(i)}>🗑️</button></div>
   <div className="form-grid"><Field label="Tamanho"><select required value={line.size} onChange={e=>updateLine(i,{size:e.target.value})}><option value="">Selecione</option><option value="P">Pequena</option><option value="M">Média</option><option value="G">Grande</option><option value="F">Família</option></select></Field>
   <Field label="Tipo"><select value={line.half?"half":"whole"} onChange={e=>updateLine(i,{half:e.target.value==="half"})}><option value="whole">Pizza inteira</option><option value="half">Meio a meio</option></select></Field>
   <Field label="1º sabor"><select required value={line.product_id} onChange={e=>updateLine(i,{product_id:e.target.value})}><option value="">Selecione</option>{pizzas.map(p=><option key={p.id} value={p.id}>{p.name} — {line.size?money(priceFor(p,line.size)):"selecione o tamanho"}</option>)}</select></Field>
   {line.half&&<Field label="2º sabor"><select required value={line.flavor_2_product_id} onChange={e=>updateLine(i,{flavor_2_product_id:e.target.value})}><option value="">Selecione</option>{pizzas.filter(p=>p.id!==line.product_id).map(p=><option key={p.id} value={p.id}>{p.name} — {money(priceFor(p,line.size))}</option>)}</select></Field>}
   <Field label="Quantidade"><input type="number" min="1" step="1" value={line.quantity} onChange={e=>updateLine(i,{quantity:e.target.value})}/></Field>
   <Field label="Borda (opcional)"><select value={line.border_product_id} onChange={e=>updateLine(i,{border_product_id:e.target.value})}><option value="">Sem borda</option>{borders.map(p=><option key={p.id} value={p.id}>{p.name} — {line.size?money(priceFor(p,line.size)):"selecione o tamanho"}</option>)}</select></Field>
   <div style={{alignSelf:"end"}}><b>{line.size&&line.product_id?money(lineValue(line)):money(0)}</b></div></div>
  </>:<><div className="section-title"><h4>➕ Outro produto {i+1}</h4><button type="button" className="icon-btn" onClick={()=>removeLine(i)}>🗑️</button></div>
   <div className="form-grid"><Field label="Categoria"><select value={line.category} onChange={e=>updateLine(i,{category:e.target.value,product_id:"",size:""})}><option value="">Selecione</option><option value="Pizzas">Pizzas</option><option value="Bebidas">Bebidas</option><option value="Bordas Recheadas">Bordas Recheadas</option></select></Field>
   <Field label="Produto"><select required value={line.product_id} onChange={e=>updateLine(i,{product_id:e.target.value})}><option value="">Selecione</option>{products.filter(p=>{const n=categoryName(p);return line.category==="Pizzas"?(n==="Pizzas Tradicionais"||n==="Pizzas Especiais"):n===line.category}).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
   {line.category==="Bordas Recheadas"&&<Field label="Variação / Tamanho"><select required value={line.size} onChange={e=>updateLine(i,{size:e.target.value})}><option value="">Selecione</option><option value="P">Pequena — {line.product_id?money(priceFor(products.find(p=>p.id===line.product_id),"P")):""}</option><option value="M">Média — {line.product_id?money(priceFor(products.find(p=>p.id===line.product_id),"M")):""}</option><option value="G">Grande — {line.product_id?money(priceFor(products.find(p=>p.id===line.product_id),"G")):""}</option><option value="F">Família — {line.product_id?money(priceFor(products.find(p=>p.id===line.product_id),"F")):""}</option></select></Field>}
   {line.category==="Pizzas"&&<Field label="Variação / Tamanho"><select required value={line.size} onChange={e=>updateLine(i,{size:e.target.value})}><option value="">Selecione</option><option value="P">Pequena</option><option value="M">Média</option><option value="G">Grande</option><option value="F">Família</option></select></Field>}
   <Field label="Quantidade"><input type="number" min="1" step="1" value={line.quantity} onChange={e=>updateLine(i,{quantity:e.target.value})}/></Field><div style={{alignSelf:"end"}}><b>{line.product_id?money(lineValue(line)):money(0)}</b></div></div>
  </>}
 </div>)}
 <div style={{textAlign:"right",fontSize:18}}><b>Produtos: {money(itemTotal)}</b></div></div>
 <Field label="Canal"><select value={form.channel_id} onChange={e=>setForm({...form,channel_id:e.target.value})}><option value="">Selecione</option>{data.channels.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Forma de pagamento"><select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}><option>PIX</option><option>Dinheiro</option><option>Cartão de crédito</option><option>Cartão de débito</option></select></Field>
 <Field label="Taxa de entrega"><input type="number" step="0.01" min="0" value={form.delivery_fee} onChange={e=>setForm({...form,delivery_fee:e.target.value})}/></Field><Field label="Desconto"><input type="number" step="0.01" min="0" value={form.discounts} onChange={e=>setForm({...form,discounts:e.target.value})}/></Field>
 <div className="panel" style={{gridColumn:"1/-1"}}><b>Resumo:</b> Produtos {money(itemTotal)} + taxa de entrega {money(form.delivery_fee)} - desconto {money(form.discounts)} = <b>{money(net)}</b></div><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Salvando...":editing?"Salvar alterações":"Salvar venda"}</button></div>
 </form></Modal>}</main>
}
function Bancos({data}){
 const [open,setOpen]=useState(false),[editing,setEditing]=useState(null),[selected,setSelected]=useState(new Set());
 const blank={fact_date:today(),description:"",classification:"Despesas",category_id:"",amount:"",direction:"out",bank_account_id:""};
 const [form,setForm]=useState(blank),[month,setMonth]=useState(""),[dateFrom,setDateFrom]=useState(""),[dateTo,setDateTo]=useState(""),[direction,setDirection]=useState(""),[bank,setBank]=useState("");
 const rows=(data.bankTx||[]).filter(x=>{const d=String(x.fact_date||"").slice(0,10);const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");return (!month||d.slice(0,7)===month)&&(!dateFrom||d>=dateFrom)&&(!dateTo||d<=dateTo)&&(!direction||x.direction===direction)&&(!bank||x.bank_account_id===bank)&&(!term||[x.description,x.classification,x.bank_accounts?.name,x.categories?.name].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term)))});
 useEffect(()=>{setSelected(new Set())},[month,dateFrom,dateTo,direction,bank,data.search]);
 const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));
 function toggleOne(id){setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
 function toggleAll(){setSelected(prev=>{const n=new Set(prev);if(allSelected)rows.forEach(x=>n.delete(x.id));else rows.forEach(x=>n.add(x.id));return n})}
 function reset(){setEditing(null);setForm({...blank});setOpen(true)}
 function editBank(x){setEditing(x);setForm({fact_date:String(x.fact_date||"").slice(0,10)||today(),description:x.description||"",classification:x.classification||"Despesas",category_id:x.category_id||"",amount:String(x.amount||""),direction:x.direction||"out",bank_account_id:x.bank_account_id||""});setOpen(true)}
 async function save(e){e.preventDefault();try{const payload={fact_date:new Date(form.fact_date+"T12:00:00").toISOString(),description:form.description,classification:form.classification,category_id:form.category_id||null,amount:Number(form.amount),direction:form.direction,bank_account_id:form.bank_account_id,status:editing?.status||"unreconciled"};const q=editing?supabase.from("bank_transactions").update(payload).eq("id",editing.id).eq("user_id",data.user.id):supabase.from("bank_transactions").insert({...payload,user_id:data.user.id});const {error}=await q;if(error)throw error;setOpen(false);data.reload()}catch(error){alert(error?.message||"Não foi possível salvar o movimento.")}}
 async function removeBank(x){if(!confirm("Excluir esta movimentação bancária?"))return;const {error}=await supabase.from("bank_transactions").delete().eq("id",x.id).eq("user_id",data.user.id);if(error)alert(error.message);else data.reload()}
 async function removeSelected(){const ids=[...selected];if(!ids.length)return;if(!confirm(`Excluir ${ids.length} movimentação(ões) selecionada(s)? Esta ação não poderá ser desfeita.`))return;const {error}=await supabase.from("bank_transactions").delete().eq("user_id",data.user.id).in("id",ids);if(error){alert(error.message);return}setSelected(new Set());data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Bancos / Extratos</h2><p>Ordenados pela data da ocorrência. Inclua, edite ou exclua qualquer movimentação.</p></div><button className="primary small" onClick={reset}><Plus size={16}/>Novo movimento</button></div>
 <div className="filters"><label>Mês <input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label>De <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label>Até <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label><select value={bank} onChange={e=>setBank(e.target.value)}><option value="">Todos os bancos</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><select value={direction} onChange={e=>setDirection(e.target.value)}><option value="">Entradas e saídas</option><option value="in">Entrada</option><option value="out">Saída</option></select><div className="search"><Search size={16}/><input placeholder="Pesquisar descrição..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div><button className="ghost" onClick={()=>downloadCSV(rows,"extrato.csv")}><Download size={16}/>CSV</button></div>
 <div className="filters" style={{marginTop:12,alignItems:"center"}}><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todas as {rows.length} movimentação(ões) filtrada(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelected}>Excluir selecionadas</button></div>
 <div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Data</th><th>Descrição</th><th>Banco</th><th>Tipo</th><th>Valor</th><th>Categoria</th><th>Status</th><th>Ações</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar movimentação" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{new Date(x.fact_date).toLocaleDateString("pt-BR")}</td><td>{x.description}</td><td>{x.bank_accounts?.name||"—"}</td><td>{x.direction==="in"?"Entrada":"Saída"}</td><td>{money(x.amount)}</td><td>{x.categories?.name||"—"}</td><td><span className="badge">{x.status==="reconciled"?"Conferido":"A conferir"}</span></td><td><button className="icon-btn" title="Editar" onClick={()=>editBank(x)}>✏️</button><button className="icon-btn" title="Excluir" onClick={()=>removeBank(x)}>🗑️</button></td></tr>)}{!rows.length&&<EmptyRow text="Nenhum movimento encontrado."/>}</tbody></table></div>
 {open&&<Modal title={editing?"Editar movimento bancário":"Novo movimento bancário"} onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Data da ocorrência"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})} required/></Field><Field label="Banco"><select value={form.bank_account_id} onChange={e=>setForm({...form,bank_account_id:e.target.value})} required><option value="">Selecione</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Tipo de movimentação"><select value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})}><option value="in">Entrada</option><option value="out">Saída</option></select></Field><Field label="Valor"><input type="number" step="0.01" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></Field><Field label="Classificação"><select value={form.classification} onChange={e=>setForm({...form,classification:e.target.value})}><option>Receita</option><option>Despesas</option><option>Outros</option></select></Field><Field label="Categoria"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{data.categories.filter(c=>c.classification===form.classification).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><div className="form-actions"><button className="primary">{editing?"Salvar alterações":"Salvar movimento"}</button></div></form></Modal>}</main>
}

function Contas({data}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState(new Set()),[form,setForm]=useState({description:"",amount:"",due_date:today(),competence_date:today(),category_id:"",supplier_id:"",payment_bank_account_id:"",status:"pending"});
 async function save(e){e.preventDefault();const {error}=await supabase.from("payables").insert({...form,user_id:data.user.id,category_id:form.category_id||null,supplier_id:form.supplier_id||null,payment_bank_account_id:form.payment_bank_account_id||null,amount:Number(form.amount)});if(error)alert(error.message);else{setOpen(false);data.reload()}}
 const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");const rows=(data.payables||[]).filter(x=>(!data.payFilter||x.status===data.payFilter)&&(!term||[x.description,x.suppliers?.name,x.categories?.name,x.status].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term))));const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));useEffect(()=>{setSelected(new Set())},[data.payFilter,data.search]);function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)rows.forEach(x=>next.delete(x.id));else rows.forEach(x=>next.add(x.id));return next})}async function removeSelected(){const ids=rows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;if(!confirm(`Excluir ${ids.length} conta(s) a pagar selecionada(s)? Esta ação não poderá ser desfeita.`))return;const {error}=await supabase.from("payables").delete().eq("user_id",data.user.id).in("id",ids);if(error){alert(error.message);return}setSelected(new Set());data.reload()} async function pay(x){const {error}=await supabase.from("payables").update({status:"paid",payment_date:today(),paid_bank_account_id:x.payment_bank_account_id}).eq("id",x.id).eq("user_id",data.user.id);if(error)alert(error.message);else data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Contas a pagar</h2><p>Ordenadas pela data de vencimento.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Nova conta</button></div>
 <div className="filters"><select value={data.payFilter} onChange={e=>data.setPayFilter(e.target.value)}><option value="">Todas</option><option value="pending">Pendentes</option><option value="paid">Pagas</option></select><input placeholder="Pesquisar..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div>
 <div className="filters" style={{marginTop:12,alignItems:"center"}}><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todas as {rows.length} conta(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelected}>Excluir selecionadas</button></div><div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Vencimento</th><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Competência</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar conta a pagar" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{dateBR(x.due_date)}</td><td>{x.description}</td><td>{x.suppliers?.name||"—"}</td><td>{x.categories?.name||"—"}</td><td>{dateBR(x.competence_date)}</td><td>{money(x.amount)}</td><td><span className={x.status==="paid"?"badge ok":"badge"}>{x.status==="paid"?"Pago":"Pendente"}</span></td><td>{x.status!=="paid"&&<button className="icon-btn" title="Marcar como paga" onClick={()=>pay(x)}><CheckCircle2 size={18}/></button>}</td></tr>)}{!rows.length&&<EmptyRow text="Nenhuma conta cadastrada."/>}</tbody></table></div>
 {open&&<Modal title="Nova conta a pagar" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Valor"><input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></Field><Field label="Vencimento"><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})}/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})}/></Field><Field label="Categoria"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{data.categories.filter(c=>c.classification==="Despesas").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Fornecedor"><select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})}><option value="">Selecione</option>{data.suppliers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Banco para pagamento"><select value={form.payment_bank_account_id} onChange={e=>setForm({...form,payment_bank_account_id:e.target.value})}><option value="">Selecione</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><div className="form-actions"><button className="primary">Salvar conta</button></div></form></Modal>}</main>
}

function Cadastros({data}){
 const [tab,setTab]=useState("banks"),[name,setName]=useState("");
 async function add(table,extra={}){if(!name.trim())return;const {error}=await supabase.from(table).insert({user_id:data.user.id,name:name.trim(),...extra});if(error)alert(error.message);else{setName("");data.reload()}}
 return <main className="content"><div className="page-head"><div><h2>Configurações</h2><p>Cadastros básicos do sistema.</p></div></div><div className="tabs"><button className={tab==="banks"?"active":""} onClick={()=>setTab("banks")}>Bancos</button><button className={tab==="cards"?"active":""} onClick={()=>setTab("cards")}>Cartões</button><button className={tab==="cats"?"active":""} onClick={()=>setTab("cats")}>Categorias</button><button className={tab==="channels"?"active":""} onClick={()=>setTab("channels")}>Canais</button><button className={tab==="suppliers"?"active":""} onClick={()=>setTab("suppliers")}>Fornecedores</button></div><section className="panel"><div className="inline-form"><input placeholder="Nome do cadastro..." value={name} onChange={e=>setName(e.target.value)}/><button className="primary small" onClick={()=>add(tab==="banks"?"bank_accounts":tab==="cards"?"card_accounts":tab==="cats"?"categories":tab==="channels"?"channels":"suppliers",tab==="cats"?{classification:"Despesas"}:{})}><Plus size={16}/>Adicionar</button></div><div className="simple-list">{tab==="banks"&&data.banks.map(x=><div key={x.id}>{x.name}<span>{x.institution||""}</span></div>)}{tab==="cards"&&data.cards.map(x=><div key={x.id}>{x.name}<span>Fechamento {x.closing_day||"—"} / Vencimento {x.due_day||"—"}</span></div>)}{tab==="cats"&&data.categories.map(x=><div key={x.id}>{x.name}<span>{x.classification}</span></div>)}{tab==="channels"&&data.channels.map(x=><div key={x.id}>{x.name}</div>)}{tab==="suppliers"&&data.suppliers.map(x=><div key={x.id}>{x.name}<span>{x.phone||x.email||""}</span></div>)}</div></section></main>
}

function Recebimentos({data}){
 const [status,setStatus]=useState("all");
 const bankRows=(data.bankTx||[]).filter(x=>x.direction==="in"&&String(x.classification||"").toLocaleLowerCase("pt-BR").includes("receita"));
 const forecast=(data.receivables||[]).filter(x=>x.status!=="cancelled"&&(status==="all"||status==="pending"&&x.status!=="received"||status==="received"&&x.status==="received"));
 const bankTotal=bankRows.reduce((a,x)=>a+Number(x.amount||0),0),pendingTotal=forecast.filter(x=>x.status!=="received").reduce((a,x)=>a+Math.max(0,Number(x.amount||0)-Number(x.received_amount||0)),0);
 return <main className="content"><div className="page-head"><div><h2>Recebimentos</h2><p>Receitas classificadas no banco. A previsão das vendas fica separada para evitar somar o mesmo dinheiro duas vezes.</p></div><button className="ghost" onClick={()=>downloadCSV(bankRows,"receitas-do-banco.csv")}><Download size={16}/>Exportar receitas do banco</button></div><div className="cards"><div className="card"><span>Receitas que entraram no banco</span><strong>{money(bankTotal)}</strong></div><div className="card"><span>Previsão de vendas pendentes</span><strong>{money(pendingTotal)}</strong></div></div><section className="panel"><div className="section-title"><h3>Entradas registradas no banco</h3><span>{bankRows.length} movimentação(ões)</span></div><div className="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Banco</th><th>Valor</th><th>Classificação</th><th>Conferência</th></tr></thead><tbody>{bankRows.map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.description||"—"}</td><td>{x.bank_accounts?.name||"—"}</td><td>{money(x.amount)}</td><td>{x.classification||"Receita"}</td><td>{x.status==="reconciled"?"Conferido":"A conferir"}</td></tr>)}{!bankRows.length&&<EmptyRow text="Nenhuma entrada classificada como Receita. Classifique em Bancos / Extratos."/>}</tbody></table></div></section><section className="panel"><div className="section-title"><h3>Controle de recebimentos das vendas</h3><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Todos</option><option value="pending">Pendentes</option><option value="received">Recebidos</option></select></div><p>Esta previsão não é somada ao total bancário.</p><div className="table-wrap"><table><thead><tr><th>Competência</th><th>Descrição</th><th>Previsto</th><th>Recebido vinculado</th><th>Data prevista</th><th>Data real</th><th>Status</th></tr></thead><tbody>{forecast.map(x=><tr key={x.id}><td>{dateBR(x.competence_date)}</td><td>{x.description}</td><td>{money(x.amount)}</td><td>{money(x.received_amount)}</td><td>{dateBR(x.expected_date)}</td><td>{dateBR(x.received_date)}</td><td>{x.status==="received"?"Recebido":"Pendente"}</td></tr>)}{!forecast.length&&<EmptyRow text="Nenhuma previsão de recebimento."/>}</tbody></table></div></section></main>
}

function Cartoes({data}){
 const cards=Array.isArray(data.cards)?data.cards:[];
 const categories=Array.isArray(data.categories)?data.categories:[];
 const [open,setOpen]=useState(false);
 const [form,setForm]=useState({card_account_id:"",fact_date:today(),competence_date:today(),description:"",category_id:"",total_amount:"",installments:"1"});
 const [rows,setRows]=useState([]);
 const [selected,setSelected]=useState(new Set());
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState("");
 const [saving,setSaving]=useState(false);
 async function load(){
  setLoading(true);setLoadError("");
  try{
   const {data:found,error}=await supabase.from("card_transactions").select("*,card_accounts(name),categories(name)").eq("user_id",data.user.id).order("fact_date",{ascending:false}).limit(500);
   if(error)throw error;
   setRows(Array.isArray(found)?found:[]);
  }catch(error){
   console.error("Erro ao carregar a tela Cartões:",error);
   setRows([]);
   setLoadError(error?.message||"Não foi possível carregar as compras de cartão.");
  }finally{setLoading(false)}
 }
 useEffect(()=>{load()},[data.user.id]); const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));
 function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})} function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)rows.forEach(x=>next.delete(x.id));else rows.forEach(x=>next.add(x.id));return next})}
 async function removeSelected(){
  const ids=rows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;
  if(!confirm(`Excluir ${ids.length} compra(s) de cartão selecionada(s) e suas parcelas? Esta ação não poderá ser desfeita.`))return;
  try{
   for(const id of ids){
    const {error:e1}=await supabase.from("card_installments").delete().eq("card_transaction_id",id);if(e1)throw e1;
    const {error:e2}=await supabase.from("card_transactions").delete().eq("id",id).eq("user_id",data.user.id);if(e2)throw e2;
   }
   setSelected(new Set());await load();data.reload();
  }catch(error){alert(error?.message||"Não foi possível excluir as compras selecionadas.")}
 }
 async function save(e){
  e.preventDefault();
  if(!form.card_account_id)return alert("Selecione o cartão.");
  const total=Number(form.total_amount||0),n=Math.max(1,Number(form.installments||1));
  if(!(total>0))return alert("Informe um valor total maior que zero.");
  setSaving(true);
  try{
   const {data:t,error}=await supabase.from("card_transactions").insert({user_id:data.user.id,card_account_id:form.card_account_id,fact_date:form.fact_date,competence_date:form.competence_date,description:form.description,category_id:form.category_id||null,total_amount:total,installments:n,source:"manual"}).select("id").single();
   if(error)throw error;
   const base=Math.floor(total/n*100)/100;let acc=0;
   const card=cards.find(x=>x.id===form.card_account_id);
   const installmentRows=[];
   for(let k=1;k<=n;k++){
    const amount=k===n?Number((total-acc).toFixed(2)):base;acc+=amount;
    const d=new Date(form.fact_date+"T12:00:00");d.setMonth(d.getMonth()+k-1);
    const due=new Date(d.getFullYear(),d.getMonth(),Number(card?.due_day||10));
    installmentRows.push({card_transaction_id:t.id,installment_number:k,due_date:due.toISOString().slice(0,10),amount,status:"open"});
   }
   const {error:installmentError}=await supabase.from("card_installments").insert(installmentRows);
   if(installmentError)throw installmentError;
   setOpen(false);setForm({card_account_id:"",fact_date:today(),competence_date:today(),description:"",category_id:"",total_amount:"",installments:"1"});await load();data.reload();
  }catch(error){alert(error?.message||"Não foi possível salvar a compra no cartão.")}finally{setSaving(false)}
 }
 return <main className="content">
  <div className="page-head"><div><h2>Cartões</h2><p>Compras e parcelas por competência, sem duplicar no pagamento da fatura.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Nova compra</button></div>
  <div className="cards">{cards.map(c=><div className="card" key={c.id}><strong>{c.name}</strong><small>Fechamento: {c.closing_day||"—"} • Vencimento: {c.due_day||"—"}</small></div>)}{!cards.length&&<div className="card"><span>Nenhum cartão cadastrado</span><small>Confira os cartões em Configurações.</small></div>}</div>
  {loadError&&<section className="panel"><p className="error">Não foi possível carregar os dados dos cartões: {loadError}</p><button className="ghost" onClick={load}><RefreshCw size={16}/>Tentar novamente</button></section>}
  <div className="filters" style={{marginTop:16,alignItems:"center"}}><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll} disabled={!rows.length}/>Selecionar todas as {rows.length} compra(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size||loading} onClick={removeSelected}>Excluir selecionadas</button></div>
  <div className="table-wrap" style={{marginTop:12}}><table><thead><tr><th>Selecionar</th><th>Data</th><th>Descrição</th><th>Cartão</th><th>Categoria</th><th>Bruto</th><th>Taxa</th><th>Recebido</th><th>Parcelas</th></tr></thead><tbody>{loading?<EmptyRow text="Carregando compras de cartão..."/>:rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar compra de cartão" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{dateBR(x.fact_date)}</td><td>{x.description||"—"}</td><td>{x.card_accounts?.name||"—"}</td><td>{x.categories?.name||"—"}</td><td>{money(x.gross_amount??x.total_amount)}</td><td>{money(x.fee_amount)}</td><td>{money(x.received_amount??x.total_amount)}</td><td>{x.installments||1}x</td></tr>)}{!loading&&!rows.length&&!loadError&&<EmptyRow text="Nenhuma compra cadastrada."/>}</tbody></table></div>
  {open&&<Modal title="Nova compra no cartão" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Cartão"><select value={form.card_account_id} onChange={e=>setForm({...form,card_account_id:e.target.value})} required><option value="">Selecione</option>{cards.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Data da compra"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})} required/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})} required/></Field><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Categoria"><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{categories.filter(c=>c.classification==="Despesas").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Valor total"><input type="number" min="0.01" step="0.01" value={form.total_amount} onChange={e=>setForm({...form,total_amount:e.target.value})} required/></Field><Field label="Parcelas"><input type="number" min="1" max="120" step="1" value={form.installments} onChange={e=>setForm({...form,installments:e.target.value})} required/></Field><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Salvando...":"Salvar compra"}</button></div></form></Modal>}
 </main>
}
function Caixa({data}){
 const [open,setOpen]=useState(false),[from,setFrom]=useState(monthStart()),[to,setTo]=useState(today()),[saving,setSaving]=useState(false),[form,setForm]=useState({fact_date:today(),description:"",direction:"in",amount:"",category:""});
 const tx=(data.cashMovements||[]).filter(x=>(!from||x.fact_date>=from)&&(!to||x.fact_date<=to)),entradas=tx.filter(x=>x.direction==="in").reduce((a,x)=>a+Number(x.amount||0),0),saidas=tx.filter(x=>x.direction==="out").reduce((a,x)=>a+Number(x.amount||0),0);
 async function save(e){e.preventDefault();if(!(Number(form.amount)>0))return alert("Informe um valor maior que zero.");setSaving(true);try{const {error}=await supabase.from("cash_movements").insert({user_id:data.user.id,fact_date:form.fact_date,description:form.description.trim(),direction:form.direction,amount:Number(form.amount),category:form.category||null});if(error)throw error;setOpen(false);setForm({fact_date:today(),description:"",direction:"in",amount:"",category:""});await data.reload()}catch(error){alert(error?.message||"Não foi possível salvar o movimento de caixa.")}finally{setSaving(false)}}
 return <main className="content"><div className="page-head"><div><h2>Caixa / Fluxo de caixa</h2><p>Somente dinheiro físico. O extrato bancário não aparece no caixa.</p></div><div className="actions"><button className="ghost" onClick={()=>downloadCSV(tx,"fluxo-de-caixa.csv")}><Download size={16}/>CSV</button><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Novo movimento de caixa</button></div></div><div className="filters"><Field label="De"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></Field><Field label="Até"><input type="date" value={to} onChange={e=>setTo(e.target.value)}/></Field></div><div className="cards"><div className="card"><span>Entradas em dinheiro</span><strong>{money(entradas)}</strong></div><div className="card"><span>Saídas em dinheiro</span><strong>{money(saidas)}</strong></div><div className="card"><span>Saldo de caixa</span><strong>{money(entradas-saidas)}</strong></div></div><section className="panel"><div className="section-title"><h3>Movimentações de dinheiro físico</h3><span>{tx.length} registro(s)</span></div><div className="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Entrada</th><th>Saída</th></tr></thead><tbody>{tx.map(x=><tr key={x.id}><td>{dateBR(x.fact_date)}</td><td>{x.description}</td><td>{x.category||"—"}</td><td>{x.direction==="in"?money(x.amount):"—"}</td><td>{x.direction==="out"?money(x.amount):"—"}</td></tr>)}{!tx.length&&<EmptyRow text="Nenhum movimento de dinheiro físico cadastrado."/>}</tbody></table></div></section>{open&&<Modal title="Novo movimento de caixa" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Data"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})} required/></Field><Field label="Tipo"><select value={form.direction} onChange={e=>setForm({...form,direction:e.target.value})}><option value="in">Entrada em dinheiro</option><option value="out">Saída em dinheiro</option></select></Field><Field label="Descrição"><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></Field><Field label="Categoria"><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></Field><Field label="Valor"><input type="number" min="0.01" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required/></Field><div className="form-actions"><button className="primary" disabled={saving}>{saving?"Salvando...":"Salvar movimento"}</button></div></form></Modal>}</main>
}

function Relatorios({data}){
 const now=new Date();
 const currentMonth=String(now.getFullYear())+"-"+String(now.getMonth()+1).padStart(2,"0");
 const [view,setView]=useState("month"),[reportMenu,setReportMenu]=useState(true),[month,setMonth]=useState(currentMonth),[year,setYear]=useState(String(now.getFullYear())),[bank,setBank]=useState(""),[paymentMethod,setPaymentMethod]=useState(""),[channelFilter,setChannelFilter]=useState(""),[nameFilter,setNameFilter]=useState("");
 const monthKey=x=>String(x?.competence_date||x?.fact_date||x?.due_date||x?.expected_date||"").slice(0,7);
 const cashMonth=x=>String(x?.received_date||x?.payment_date||x?.fact_date||"").slice(0,7);
 const inRange=key=>view==="year"?key.startsWith(year):key===month;
 const sum=(rows,field)=>rows.reduce((total,x)=>total+Number(x?.[field]||0),0);
 const fmtMonth=key=>{const [y,m]=key.split("-");return new Date(Number(y),Number(m)-1,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})};
 const normText=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
  const salesAll=(data.sales||[]).filter(x=>inRange(monthKey(x))&&(!paymentMethod||normText(x.payment_method).includes(normText(paymentMethod)))&&(!channelFilter||String(x.channel_id||"")===channelFilter)&&(!nameFilter||[x.customer_name,x.external_id,x.payment_method,x.channels?.name].some(v=>normText(v).includes(normText(nameFilter)))));
 const sales=salesAll.filter(x=>x.status!=="cancelled");
 const payables=(data.payables||[]).filter(x=>inRange(monthKey(x))&&(!nameFilter||[x.description,x.suppliers?.name,x.categories?.name,x.status].some(v=>normText(v).includes(normText(nameFilter)))));
 const purchases=(data.purchases||[]).filter(x=>inRange(monthKey(x))&&(!nameFilter||[x.description,x.suppliers?.name,x.categories?.name,x.status].some(v=>normText(v).includes(normText(nameFilter)))));
 const bankTx=(data.bankTx||[]).filter(x=>(!bank||x.bank_account_id===bank)&&inRange(String(x?.fact_date||"").slice(0,7))&&(!nameFilter||[x.description,x.classification,x.bank_accounts?.name,x.direction,x.status].some(v=>normText(v).includes(normText(nameFilter)))));
 const received=(data.receivables||[]).filter(x=>x.status==="received"&&inRange(cashMonth(x)));
 const pendingReceivables=(data.receivables||[]).filter(x=>inRange(monthKey(x))&&x.status!=="received"&&x.status!=="cancelled");
 const gross=sum(sales,"gross_amount"),discountTotal=sum(sales,"discounts"),fees=sum(sales,"fees"),cancellations=sum(salesAll,"cancellations"),net=sum(sales,"net_amount");
 const paid=payables.filter(x=>x.status==="paid"),pending=payables.filter(x=>x.status!=="paid"&&x.status!=="cancelled");
 const bankIn=bankTx.filter(x=>x.direction==="in"),bankOut=bankTx.filter(x=>x.direction==="out");
 const bankClassifiedRevenue=bankTx.filter(x=>normText(x.classification).includes("receita"));
 const bankClassifiedExpense=bankTx.filter(x=>normText(x.classification).includes("despesa"));
 const classifiedRevenueTotal=sum(bankClassifiedRevenue,"amount"),classifiedExpenseTotal=sum(bankClassifiedExpense,"amount");
 const receivedTotal=received.reduce((a,x)=>a+Number(x.received_amount??x.amount??0),0);
 const expensePaid=paid.filter(x=>x.categories?.classification==="Despesas"||!x.categories).reduce((a,x)=>a+Number(x.amount||0),0);
 const purchasesPaid=purchases.filter(x=>x.status==="paid").reduce((a,x)=>a+Number(x.amount||0),0);
 const resultEstimated=net-expensePaid-purchasesPaid;
 const methods=[...new Set((data.sales||[]).map(x=>x.payment_method).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
 const nameOptions=[...new Set([
  ...(data.sales||[]).flatMap(x=>[x.customer_name,x.external_id,x.channels?.name]),
  ...(data.payables||[]).flatMap(x=>[x.description,x.suppliers?.name,x.categories?.name,x.status]),
  ...(data.purchases||[]).flatMap(x=>[x.description,x.suppliers?.name,x.categories?.name,x.status]),
  ...(data.bankTx||[]).flatMap(x=>[x.description,x.classification,x.bank_accounts?.name,x.direction,x.status])
 ].map(v=>String(v||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
 const byPayment=methods.map(method=>{
   const rows=sales.filter(x=>x.payment_method===method);
   const methodReceived=received.filter(r=>rows.some(s=>s.id===r.sale_id));
   return {method,count:rows.length,gross:sum(rows,"gross_amount"),net:sum(rows,"net_amount"),received:sum(methodReceived,"received_amount")||sum(methodReceived,"amount")};
 }).filter(x=>!paymentMethod||normText(x.method).includes(normText(paymentMethod)));
 const productRows={};
 sales.forEach(s=>(s.sale_items||[]).forEach(i=>{
   const name=i.product_name||"Item sem nome";
   if(!productRows[name])productRows[name]={name,quantity:0,total:0};
   productRows[name].quantity+=Number(i.quantity||0);
   productRows[name].total+=Number(i.total_amount||0);
 }));
 const bestSellers=Object.values(productRows).sort((a,b)=>b.quantity-a.quantity).slice(0,10);
 const monthlyRows=Array.from({length:12},(_,i)=>{
   const key=year+"-"+String(i+1).padStart(2,"0");
   const allSales=(data.sales||[]).filter(x=>monthKey(x)===key);
   const s=allSales.filter(x=>x.status!=="cancelled");
   const p=(data.payables||[]).filter(x=>monthKey(x)===key);
   const pur=(data.purchases||[]).filter(x=>monthKey(x)===key);
   const bt=(data.bankTx||[]).filter(x=>(!bank||x.bank_account_id===bank)&&String(x?.fact_date||"").slice(0,7)===key&&(!nameFilter||[x.description,x.classification,x.bank_accounts?.name,x.direction,x.status].some(v=>normText(v).includes(normText(nameFilter)))));
   const rec=(data.receivables||[]).filter(x=>x.status==="received"&&cashMonth(x)===key);
   return {competencia:fmtMonth(key),vendas_brutas:sum(s,"gross_amount"),descontos:sum(s,"discounts"),taxas:sum(s,"fees"),cancelamentos:sum(allSales,"cancellations"),vendas_liquidas:sum(s,"net_amount"),contas_pagas:sum(p.filter(x=>x.status==="paid"),"amount"),contas_em_aberto:sum(p.filter(x=>x.status!=="paid"&&x.status!=="cancelled"),"amount"),compras:sum(pur.filter(x=>x.status==="paid"),"amount"),despesas_bancarias:sum(bt.filter(x=>x.direction==="out"),"amount"),entradas_bancarias:sum(bt.filter(x=>x.direction==="in"),"amount"),receitas_classificadas:sum(bt.filter(x=>normText(x.classification).includes("receita")),"amount"),despesas_classificadas:sum(bt.filter(x=>normText(x.classification).includes("despesa")),"amount"),receita_recebida:sum(rec,"received_amount")||sum(rec,"amount"),_key:key};
 });
 const annualTotals=monthlyRows.reduce((a,r)=>{for(const k of ["vendas_brutas","descontos","taxas","cancelamentos","vendas_liquidas","contas_pagas","contas_em_aberto","compras","despesas_bancarias","entradas_bancarias","receitas_classificadas","despesas_classificadas","receita_recebida"])a[k]=(a[k]||0)+r[k];return a;},{});
 const reportRows=view==="year"?monthlyRows:[{competencia:fmtMonth(month),vendas_brutas:gross,descontos:discountTotal,taxas:fees,cancelamentos:cancellations,vendas_liquidas:net,contas_pagas:sum(paid,"amount"),contas_em_aberto:sum(pending,"amount"),compras:sum(purchases.filter(x=>x.status==="paid"),"amount"),despesas_bancarias:sum(bankOut,"amount"),entradas_bancarias:sum(bankIn,"amount"),receitas_classificadas:classifiedRevenueTotal,despesas_classificadas:classifiedExpenseTotal,receita_recebida:receivedTotal,_key:month}];
 function exportCurrent(){
   let rows;
   if(view==="financial"||view==="other") rows=bankTx.filter(x=>view!=="other"||normText(x.classification).includes("outro")||normText(x.description).includes("outro")).map(x=>({data:String(x.fact_date||"").slice(0,10),banco:x.bank_accounts?.name||"",descricao:x.description||"",classificacao:x.classification||"",tipo:x.direction==="in"?"Entrada":"Saída",valor:Number(x.amount||0),status:x.status==="reconciled"?"Conferido":"A conferir"}));
    else if(view==="sales"||view==="revenue") rows=sales.map(x=>({data:String(x.fact_date||"").slice(0,10),canal:x.channels?.name||data.channels.find(c=>c.id===x.channel_id)?.name||"",cliente:x.customer_name||"",identificador:x.external_id||"",forma_pagamento:x.payment_method||"",venda_bruta:Number(x.gross_amount||0),descontos:Number(x.discounts||0),taxas:Number(x.fees||0),venda_liquida:Number(x.net_amount||0)}));
    else if(view==="payables"||view==="expenses") rows=payables.filter(x=>view!=="expenses"||(x.categories?.classification==="Despesas"||!x.categories)).map(x=>({vencimento:String(x.due_date||x.competence_date||x.fact_date||"").slice(0,10),descricao:x.description||"",fornecedor:x.suppliers?.name||"",categoria:x.categories?.name||"",status:x.status||"",valor:Number(x.amount||0)}));
    else if(view==="purchases") rows=purchases.map(x=>({data:String(x.fact_date||x.competence_date||"").slice(0,10),descricao:x.description||"",fornecedor:x.suppliers?.name||"",status:x.status||"",valor:Number(x.amount||0)}));
   else if(view==="operational") rows=bestSellers.map(x=>({produto:x.name,quantidade:x.quantity,total_vendido:x.total}));
   else if(view==="payments") rows=byPayment.map(x=>({forma_pagamento:x.method,vendas:x.count,vendas_brutas:x.gross,vendas_liquidas:x.net,recebido:x.received}));
   else rows=reportRows.map(({_key,...x})=>x);
   downloadCSV(rows,"relatorio-"+view+"-"+(view==="year"?year:month)+".csv");
 }
 const reportOptions=[
  {id:"month",icon:"📅",title:"Relatório mensal",description:"Resumo da competência, vendas, custos, contas e recebimentos."},
  {id:"year",icon:"📊",title:"Comparativo anual",description:"Compare os 12 meses do ano selecionado."},
  {id:"sales",icon:"🍕",title:"Vendas por plataforma / canal",description:"iFood, BeeFood, WhatsApp, 99Food e vendas diretas."},
  {id:"revenue",icon:"💰",title:"Receitas brutas e líquidas",description:"Vendas brutas, descontos, taxas, líquidas e recebidas."},
  {id:"payables",icon:"🧾",title:"Contas a pagar",description:"Contas pagas e pendentes, vencimentos e fornecedores."},
  {id:"expenses",icon:"💸",title:"Despesas",description:"Despesas por categoria, descrição, valor e situação."},
  {id:"financial",icon:"🏦",title:"Bancos e extratos",description:"Entradas, saídas, bancos e situação da conciliação."},
  {id:"purchases",icon:"🛒",title:"Compras / matéria-prima",description:"Compras, fornecedores, valores e pagamentos."},
  {id:"other",icon:"📂",title:"Outros lançamentos",description:"Movimentações bancárias classificadas como outros."},
  {id:"payments",icon:"💳",title:"Formas de pagamento",description:"Compare vendas e recebimentos por forma de pagamento."},
  {id:"operational",icon:"🍽️",title:"Produtos mais vendidos",description:"Ranking dos produtos e quantidades vendidas."}
 ];
 if(reportMenu)return <main className="content">
  <div className="page-head"><div><h2>Relatórios</h2><p>Escolha o relatório que deseja consultar. Os filtros aparecem dentro de cada relatório.</p></div></div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(235px,1fr))",gap:16,alignItems:"stretch"}}>
   {reportOptions.map(option=><button key={option.id} type="button" onClick={()=>{setView(option.id);setReportMenu(false)}} className="panel" style={{textAlign:"left",cursor:"pointer",border:"1px solid var(--border, #e5e7eb)",display:"flex",flexDirection:"column",gap:10,minHeight:145,background:"var(--panel, #fff)",color:"inherit",font:"inherit",transition:"transform .15s, box-shadow .15s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(0,0,0,.08)"}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
    <span style={{fontSize:28}}>{option.icon}</span><strong style={{fontSize:16}}>{option.title}</strong><span style={{fontSize:13,color:"var(--muted)",lineHeight:1.5}}>{option.description}</span><span style={{marginTop:"auto",fontSize:13,fontWeight:600}}>Abrir relatório →</span>
   </button>)}
  </div>
 </main>;
 return <main className="content">
  <div className="page-head"><div><h2>Relatórios</h2><p>Consulte os dados e ajuste os filtros abaixo para refinar o resultado.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="ghost" onClick={()=>setReportMenu(true)}>← Todos os relatórios</button><button className="ghost" onClick={exportCurrent}><Download size={16}/>Exportar CSV</button></div></div>
  <section className="panel"><div className="filters" style={{alignItems:"end"}}>
   <Field label="Tipo de relatório"><select value={view} onChange={e=>setView(e.target.value)}><option value="month">Mensal — competência</option><option value="year">Anual — comparar 12 meses</option><option value="financial">Financeiro e bancário</option><option value="sales">Vendas por plataforma/canal</option><option value="revenue">Receitas — brutas e líquidas</option><option value="payables">Contas a pagar</option><option value="expenses">Despesas</option><option value="purchases">Compras / matéria-prima</option><option value="other">Outros lançamentos bancários</option><option value="payments">Recebimentos por forma de pagamento</option><option value="operational">Operacional — produtos vendidos</option></select></Field>
   {view==="year"?<Field label="Ano"><select value={year} onChange={e=>setYear(e.target.value)}>{Array.from({length:8},(_,i)=>String(now.getFullYear()-i)).map(y=><option key={y} value={y}>{y}</option>)}</select></Field>:<Field label="Competência"><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></Field>}
   {(view==="financial"||view==="year"||view==="other")&&<Field label="Banco"><select value={bank} onChange={e=>setBank(e.target.value)}><option value="">Todos os bancos</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>}
    {(view==="sales"||view==="revenue")&&<Field label="Plataforma / canal"><select value={channelFilter} onChange={e=>setChannelFilter(e.target.value)}><option value="">Todos os canais</option>{data.channels.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>}
    <Field label="Filtrar por nome"><select value={nameFilter} onChange={e=>setNameFilter(e.target.value)}><option value="">Todos os nomes</option>{nameOptions.map(name=><option key={name} value={name}>{name}</option>)}</select></Field>
   {(view==="month"||view==="payments"||view==="operational"||view==="sales"||view==="revenue")&&<Field label="Forma de pagamento"><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="">Todas as formas</option>{methods.map(method=><option key={method} value={method}>{method}</option>)}</select></Field>}
  </div></section>
  {view==="month"?<>
   <div className="cards">
    <div className="card"><span>Vendas brutas</span><strong>{money(gross)}</strong><small>Vendas não canceladas da competência</small></div>
    <div className="card"><span>Descontos</span><strong>{money(discountTotal)}</strong><small>Descontos lançados nas vendas</small></div>
    <div className="card"><span>Taxas</span><strong>{money(fees)}</strong><small>Taxas registradas nas vendas</small></div>
    <div className="card"><span>Cancelamentos</span><strong>{money(cancellations)}</strong><small>Registros de cancelamento da competência</small></div>
    <div className="card"><span>Vendas líquidas</span><strong>{money(net)}</strong><small>Não significa necessariamente dinheiro recebido</small></div>
    <div className="card"><span>Contas pagas</span><strong>{money(sum(paid,"amount"))}</strong><small>Por competência</small></div>
    <div className="card"><span>Contas pendentes</span><strong>{money(sum(pending,"amount"))}</strong><small>Saldo ainda em aberto</small></div>
    <div className="card"><span>Recebimentos efetivos</span><strong>{money(receivedTotal)}</strong><small>Por data real de recebimento</small></div>
    <div className="card"><span>Receitas classificadas no banco</span><strong>{money(classifiedRevenueTotal)}</strong><small>Movimentações bancárias classificadas como receita</small></div>
    <div className="card"><span>Despesas classificadas no banco</span><strong>{money(classifiedExpenseTotal)}</strong><small>Movimentações bancárias classificadas como despesa</small></div>
   </div>
   <section className="panel"><h3>Resultado e custos — {fmtMonth(month)}</h3><div className="table-wrap"><table><thead><tr><th>Indicador</th><th>Valor</th><th>Como é calculado</th></tr></thead><tbody>
    <tr><td>Vendas líquidas</td><td>{money(net)}</td><td>Vendas não canceladas menos descontos/taxas conforme lançamentos</td></tr>
    <tr><td>Despesas pagas</td><td>{money(expensePaid)}</td><td>Contas pagas classificadas como despesas</td></tr>
    <tr><td>Compras pagas / matéria-prima</td><td>{money(purchasesPaid)}</td><td>Compras registradas como pagas, exibidas separadamente das contas</td></tr>
    <tr><td>Resultado estimado antes de outros custos</td><td>{money(resultEstimated)}</td><td>Vendas líquidas menos despesas pagas e compras pagas; confira duplicidade caso uma compra também tenha sido lançada como conta a pagar</td></tr>
   </tbody></table></div></section>
   <section className="panel"><h3>Detalhamento da competência</h3><div className="table-wrap"><table><thead><tr><th>Indicador</th><th>Valor</th><th>Critério</th></tr></thead><tbody>
    <tr><td>Vendas brutas</td><td>{money(gross)}</td><td>Competência da venda</td></tr><tr><td>Descontos</td><td>{money(discountTotal)}</td><td>Campo de descontos das vendas</td></tr><tr><td>Taxas sobre vendas</td><td>{money(fees)}</td><td>Campo de taxas das vendas</td></tr><tr><td>Cancelamentos</td><td>{money(cancellations)}</td><td>Registros de cancelamento no período</td></tr><tr><td>Vendas líquidas</td><td>{money(net)}</td><td>Separadas de recebimentos efetivos</td></tr><tr><td>Contas lançadas</td><td>{money(sum(payables,"amount"))}</td><td>Contas da competência, pagas e pendentes</td></tr><tr><td>Entradas bancárias</td><td>{money(sum(bankIn,"amount"))}</td><td>Movimentações na data efetiva, não somadas às vendas</td></tr><tr><td>Saídas bancárias</td><td>{money(sum(bankOut,"amount"))}</td><td>Todas as saídas registradas, sem somar às contas a pagar</td></tr><tr><td>Receitas classificadas no banco</td><td>{money(classifiedRevenueTotal)}</td><td>Movimentações cuja classificação contém “receita”; exibidas separadamente das vendas</td></tr><tr><td>Despesas classificadas no banco</td><td>{money(classifiedExpenseTotal)}</td><td>Movimentações cuja classificação contém “despesa”; exibidas separadamente das contas a pagar</td></tr><tr><td>Recebimentos efetivos</td><td>{money(receivedTotal)}</td><td>Data de recebimento registrada</td></tr><tr><td>A receber pendente</td><td>{money(sum(pendingReceivables,"amount")-sum(pendingReceivables,"received_amount"))}</td><td>Saldo pendente vinculado à competência</td></tr>
   </tbody></table></div></section>
  </>:view==="year"?<>
   <div className="cards"><div className="card"><span>Vendas brutas no ano</span><strong>{money(annualTotals.vendas_brutas||0)}</strong></div><div className="card"><span>Vendas líquidas no ano</span><strong>{money(annualTotals.vendas_liquidas||0)}</strong></div><div className="card"><span>Taxas no ano</span><strong>{money(annualTotals.taxas||0)}</strong></div><div className="card"><span>Contas pagas</span><strong>{money(annualTotals.contas_pagas||0)}</strong></div><div className="card"><span>Receitas classificadas no banco</span><strong>{money(annualTotals.receitas_classificadas||0)}</strong></div><div className="card"><span>Despesas classificadas no banco</span><strong>{money(annualTotals.despesas_classificadas||0)}</strong></div></div>
   <section className="panel"><h3>Comparativo dos 12 meses — {year}</h3><div className="table-wrap"><table><thead><tr><th>Mês</th><th>Vendas brutas</th><th>Descontos</th><th>Taxas</th><th>Cancelamentos</th><th>Vendas líquidas</th><th>Contas pagas</th><th>Em aberto</th><th>Compras pagas</th><th>Saídas bancárias</th><th>Entradas bancárias</th><th>Receitas classificadas</th><th>Despesas classificadas</th><th>Recebido</th></tr></thead><tbody>
    {monthlyRows.map(r=><tr key={r._key}><td>{r.competencia}</td><td>{money(r.vendas_brutas)}</td><td>{money(r.descontos)}</td><td>{money(r.taxas)}</td><td>{money(r.cancelamentos)}</td><td>{money(r.vendas_liquidas)}</td><td>{money(r.contas_pagas)}</td><td>{money(r.contas_em_aberto)}</td><td>{money(r.compras)}</td><td>{money(r.despesas_bancarias)}</td><td>{money(r.entradas_bancarias)}</td><td>{money(r.receitas_classificadas)}</td><td>{money(r.despesas_classificadas)}</td><td>{money(r.receita_recebida)}</td></tr>)}
    <tr><th>Total do ano</th><th>{money(annualTotals.vendas_brutas||0)}</th><th>{money(annualTotals.descontos||0)}</th><th>{money(annualTotals.taxas||0)}</th><th>{money(annualTotals.cancelamentos||0)}</th><th>{money(annualTotals.vendas_liquidas||0)}</th><th>{money(annualTotals.contas_pagas||0)}</th><th>{money(annualTotals.contas_em_aberto||0)}</th><th>{money(annualTotals.compras||0)}</th><th>{money(annualTotals.despesas_bancarias||0)}</th><th>{money(annualTotals.entradas_bancarias||0)}</th><th>{money(annualTotals.receitas_classificadas||0)}</th><th>{money(annualTotals.despesas_classificadas||0)}</th><th>{money(annualTotals.receita_recebida||0)}</th></tr>
   </tbody></table></div></section>
  </>:view==="financial"?<>
   <div className="cards"><div className="card"><span>Entradas no banco</span><strong>{money(sum(bankIn,"amount"))}</strong></div><div className="card"><span>Saídas no banco</span><strong>{money(sum(bankOut,"amount"))}</strong></div><div className="card"><span>Saldo movimentado</span><strong>{money(sum(bankIn,"amount")-sum(bankOut,"amount"))}</strong></div><div className="card"><span>A conferir</span><strong>{bankTx.filter(x=>x.status!=="reconciled").length}</strong></div></div>
   <section className="panel"><h3>Extrato bancário por data efetiva</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Banco</th><th>Descrição</th><th>Classificação</th><th>Tipo</th><th>Valor</th><th>Conciliação</th></tr></thead><tbody>
    {bankTx.map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.bank_accounts?.name||"—"}</td><td>{x.description}</td><td>{x.classification||"—"}</td><td>{x.direction==="in"?"Entrada":"Saída"}</td><td>{money(x.amount)}</td><td>{x.status==="reconciled"?"Conferido":"A conferir"}</td></tr>)}{!bankTx.length&&<EmptyRow text="Nenhuma movimentação bancária no período."/>}
   </tbody></table></div></section>
   <section className="panel"><h3>Recebimentos por canal / forma de pagamento</h3><div className="table-wrap"><table><thead><tr><th>Forma de pagamento</th><th>Vendas</th><th>Vendas brutas</th><th>Vendas líquidas</th><th>Recebido vinculado</th></tr></thead><tbody>
    {byPayment.map(x=><tr key={x.method}><td>{x.method}</td><td>{x.count}</td><td>{money(x.gross)}</td><td>{money(x.net)}</td><td>{money(x.received)}</td></tr>)}{!byPayment.length&&<EmptyRow text="Nenhuma venda com forma de pagamento no período."/>}
   </tbody></table></div><p style={{fontSize:13,color:"var(--muted)"}}>Os valores de vendas e recebimentos são apresentados em colunas separadas para evitar dupla contagem.</p></section>
  </>:view==="sales"?<>
    <div className="cards"><div className="card"><span>Vendas encontradas</span><strong>{sales.length}</strong></div><div className="card"><span>Brutas</span><strong>{money(sum(sales,"gross_amount"))}</strong></div><div className="card"><span>Líquidas</span><strong>{money(sum(sales,"net_amount"))}</strong></div></div>
    <section className="panel"><h3>Vendas por plataforma / canal — {fmtMonth(month)}</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Canal</th><th>Cliente / identificação</th><th>Forma de pagamento</th><th>Bruta</th><th>Descontos</th><th>Taxas</th><th>Líquida</th></tr></thead><tbody>{sales.map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.channels?.name||data.channels.find(c=>c.id===x.channel_id)?.name||"—"}</td><td>{x.customer_name||x.external_id||"—"}</td><td>{x.payment_method||"—"}</td><td>{money(x.gross_amount)}</td><td>{money(x.discounts)}</td><td>{money(x.fees)}</td><td>{money(x.net_amount)}</td></tr>)}{!sales.length&&<EmptyRow text="Nenhuma venda encontrada para os filtros."/>}</tbody></table></div><p style={{fontSize:13,color:"var(--muted)"}}>Use o filtro Plataforma / canal para consultar iFood, BeeFood, WhatsApp, 99Food ou outros canais cadastrados.</p></section>
   </>:view==="revenue"?<>
    <div className="cards"><div className="card"><span>Receita bruta</span><strong>{money(sum(sales,"gross_amount"))}</strong></div><div className="card"><span>Descontos</span><strong>{money(sum(sales,"discounts"))}</strong></div><div className="card"><span>Taxas</span><strong>{money(sum(sales,"fees"))}</strong></div><div className="card"><span>Receita líquida</span><strong>{money(sum(sales,"net_amount"))}</strong></div><div className="card"><span>Recebido efetivamente</span><strong>{money(receivedTotal)}</strong></div></div>
    <section className="panel"><h3>Receitas — vendas brutas e líquidas</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Canal</th><th>Cliente / identificação</th><th>Bruta</th><th>Descontos</th><th>Taxas</th><th>Líquida</th></tr></thead><tbody>{sales.map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.channels?.name||data.channels.find(c=>c.id===x.channel_id)?.name||"—"}</td><td>{x.customer_name||x.external_id||"—"}</td><td>{money(x.gross_amount)}</td><td>{money(x.discounts)}</td><td>{money(x.fees)}</td><td>{money(x.net_amount)}</td></tr>)}{!sales.length&&<EmptyRow text="Nenhuma receita encontrada para os filtros."/>}</tbody></table></div><p style={{fontSize:13,color:"var(--muted)"}}>Receita líquida é diferente do valor já recebido; confira os recebimentos efetivos no relatório financeiro.</p></section>
   </>:view==="payables"?<>
    <div className="cards"><div className="card"><span>Contas encontradas</span><strong>{payables.length}</strong></div><div className="card"><span>Pagas</span><strong>{money(sum(payables.filter(x=>x.status==="paid"),"amount"))}</strong></div><div className="card"><span>Em aberto</span><strong>{money(sum(payables.filter(x=>x.status!=="paid"&&x.status!=="cancelled"),"amount"))}</strong></div></div>
    <section className="panel"><h3>Contas a pagar — {fmtMonth(month)}</h3><div className="table-wrap"><table><thead><tr><th>Vencimento</th><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Status</th><th>Valor</th></tr></thead><tbody>{payables.map(x=><tr key={x.id}><td>{dateBR(String(x.due_date||x.competence_date||x.fact_date||"").slice(0,10))}</td><td>{x.description||"—"}</td><td>{x.suppliers?.name||"—"}</td><td>{x.categories?.name||"—"}</td><td>{x.status||"—"}</td><td>{money(x.amount)}</td></tr>)}{!payables.length&&<EmptyRow text="Nenhuma conta encontrada para os filtros."/>}</tbody></table></div></section>
   </>:view==="expenses"?<>
    <div className="cards"><div className="card"><span>Despesas encontradas</span><strong>{payables.filter(x=>x.categories?.classification==="Despesas"||!x.categories).length}</strong></div><div className="card"><span>Despesas pagas</span><strong>{money(sum(payables.filter(x=>x.status==="paid"&&(x.categories?.classification==="Despesas"||!x.categories)),"amount"))}</strong></div><div className="card"><span>Despesas em aberto</span><strong>{money(sum(payables.filter(x=>x.status!=="paid"&&x.status!=="cancelled"&&(x.categories?.classification==="Despesas"||!x.categories)),"amount"))}</strong></div><div className="card"><span>Saídas bancárias</span><strong>{money(sum(bankTx.filter(x=>x.direction==="out"),"amount"))}</strong></div></div>
    <section className="panel"><h3>Despesas por descrição e categoria</h3><div className="table-wrap"><table><thead><tr><th>Vencimento</th><th>Descrição</th><th>Fornecedor</th><th>Categoria</th><th>Status</th><th>Valor</th></tr></thead><tbody>{payables.filter(x=>x.categories?.classification==="Despesas"||!x.categories).map(x=><tr key={x.id}><td>{dateBR(String(x.due_date||x.competence_date||x.fact_date||"").slice(0,10))}</td><td>{x.description||"—"}</td><td>{x.suppliers?.name||"—"}</td><td>{x.categories?.name||"Sem categoria"}</td><td>{x.status||"—"}</td><td>{money(x.amount)}</td></tr>)}{!payables.some(x=>x.categories?.classification==="Despesas"||!x.categories)&&<EmptyRow text="Nenhuma despesa encontrada para os filtros."/>}</tbody></table></div></section>
    <section className="panel"><h3>Saídas bancárias (em separado)</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Banco</th><th>Descrição</th><th>Classificação</th><th>Valor</th><th>Conciliação</th></tr></thead><tbody>{bankTx.filter(x=>x.direction==="out").map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.bank_accounts?.name||"—"}</td><td>{x.description||"—"}</td><td>{x.classification||"—"}</td><td>{money(x.amount)}</td><td>{x.status==="reconciled"?"Conferido":"A conferir"}</td></tr>)}{!bankTx.some(x=>x.direction==="out")&&<EmptyRow text="Nenhuma saída bancária neste período."/>}</tbody></table></div><p style={{fontSize:13,color:"var(--muted)"}}>As saídas bancárias ficam separadas das contas a pagar para evitar somar o mesmo gasto duas vezes.</p></section>
   </>:view==="purchases"?<>
    <div className="cards"><div className="card"><span>Compras encontradas</span><strong>{purchases.length}</strong></div><div className="card"><span>Compras pagas</span><strong>{money(sum(purchases.filter(x=>x.status==="paid"),"amount"))}</strong></div><div className="card"><span>Compras não pagas</span><strong>{money(sum(purchases.filter(x=>x.status!=="paid"&&x.status!=="cancelled"),"amount"))}</strong></div></div>
    <section className="panel"><h3>Compras / matéria-prima</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Fornecedor</th><th>Status</th><th>Valor</th></tr></thead><tbody>{purchases.map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||x.competence_date||"").slice(0,10))}</td><td>{x.description||"—"}</td><td>{x.suppliers?.name||"—"}</td><td>{x.status||"—"}</td><td>{money(x.amount)}</td></tr>)}{!purchases.length&&<EmptyRow text="Nenhuma compra encontrada para os filtros."/>}</tbody></table></div></section>
   </>:view==="other"?<>
    <div className="cards"><div className="card"><span>Outros lançamentos</span><strong>{bankTx.filter(x=>normText(x.classification).includes("outro")||normText(x.description).includes("outro")).length}</strong></div><div className="card"><span>Entradas</span><strong>{money(sum(bankTx.filter(x=>(normText(x.classification).includes("outro")||normText(x.description).includes("outro"))&&x.direction==="in"),"amount"))}</strong></div><div className="card"><span>Saídas</span><strong>{money(sum(bankTx.filter(x=>(normText(x.classification).includes("outro")||normText(x.description).includes("outro"))&&x.direction==="out"),"amount"))}</strong></div></div>
    <section className="panel"><h3>Outros lançamentos bancários</h3><div className="table-wrap"><table><thead><tr><th>Data</th><th>Banco</th><th>Descrição</th><th>Classificação</th><th>Tipo</th><th>Valor</th><th>Conciliação</th></tr></thead><tbody>{bankTx.filter(x=>normText(x.classification).includes("outro")||normText(x.description).includes("outro")).map(x=><tr key={x.id}><td>{dateBR(String(x.fact_date||"").slice(0,10))}</td><td>{x.bank_accounts?.name||"—"}</td><td>{x.description||"—"}</td><td>{x.classification||"—"}</td><td>{x.direction==="in"?"Entrada":"Saída"}</td><td>{money(x.amount)}</td><td>{x.status==="reconciled"?"Conferido":"A conferir"}</td></tr>)}{!bankTx.some(x=>normText(x.classification).includes("outro")||normText(x.description).includes("outro"))&&<EmptyRow text="Nenhum lançamento identificado como Outros neste período."/>}</tbody></table></div></section>
   </>:view==="payments"?<>
   <section className="panel"><h3>Vendas e recebimentos por forma de pagamento — {fmtMonth(month)}</h3><div className="table-wrap"><table><thead><tr><th>Forma de pagamento</th><th>Quantidade de vendas</th><th>Vendas brutas</th><th>Vendas líquidas</th><th>Recebido vinculado</th></tr></thead><tbody>{byPayment.map(x=><tr key={x.method}><td>{x.method}</td><td>{x.count}</td><td>{money(x.gross)}</td><td>{money(x.net)}</td><td>{money(x.received)}</td></tr>)}{!byPayment.length&&<EmptyRow text="Nenhum registro para os filtros selecionados."/>}</tbody></table></div></section>
  </>:<>
   <section className="panel"><h3>Produtos mais vendidos — {fmtMonth(month)}</h3><div className="table-wrap"><table><thead><tr><th>Posição</th><th>Produto / item</th><th>Quantidade vendida</th><th>Total registrado</th></tr></thead><tbody>{bestSellers.map((x,i)=><tr key={x.name}><td>{i+1}</td><td>{x.name}</td><td>{x.quantity}</td><td>{money(x.total)}</td></tr>)}{!bestSellers.length&&<EmptyRow text="Não há itens de venda no período selecionado."/>}</tbody></table></div><p style={{fontSize:13,color:"var(--muted)"}}>O ranking considera os itens associados às vendas não canceladas; pizzas meio a meio ou adicionais dependem de como foram cadastrados nos itens.</p></section>
  </>}
  <section className="panel"><h3>Conferência e qualidade dos dados</h3><p>Movimentos bancários a conferir no sistema: <b>{(data.bankTx||[]).filter(x=>x.status!=="reconciled").length}</b>.</p><p>Contas a pagar pendentes no sistema: <b>{(data.payables||[]).filter(x=>x.status!=="paid"&&x.status!=="cancelled").length}</b>.</p><p>Recebimentos pendentes no sistema: <b>{(data.receivables||[]).filter(x=>x.status!=="received"&&x.status!=="cancelled").length}</b>.</p><p style={{fontSize:13,color:"var(--muted)"}}>Este relatório é somente de leitura: não cria, altera ou exclui lançamentos. Vendas por competência e caixa/bancos por data efetiva são apresentados separadamente. Compras e contas são exibidas em linhas distintas para permitir conferência.</p></section>
 </main>
}
function Compras({data}){
 const [open,setOpen]=useState(false),[selected,setSelected]=useState(new Set()),[form,setForm]=useState({description:"",amount:"",fact_date:today(),competence_date:today(),supplier_id:"",payment_bank_account_id:"",status:"pending"});
 async function save(e){e.preventDefault();const amount=Number(form.amount||0);const {error}=await supabase.from("purchases").insert({...form,user_id:data.user.id,amount,supplier_id:form.supplier_id||null,payment_bank_account_id:form.payment_bank_account_id||null});if(error)alert(error.message);else{setOpen(false);data.reload()}}
 const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");const rows=(data.purchases||[]).filter(x=>!term||[x.description,x.suppliers?.name,x.status].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term)));const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));useEffect(()=>{setSelected(new Set())},[data.search]);function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)rows.forEach(x=>next.delete(x.id));else rows.forEach(x=>next.add(x.id));return next})}async function removeSelected(){const ids=rows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;if(!confirm(`Excluir ${ids.length} compra(s) selecionada(s)? Esta ação não poderá ser desfeita.`))return;const {error}=await supabase.from("purchases").delete().eq("user_id",data.user.id).in("id",ids);if(error){alert(error.message);return}setSelected(new Set());data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Compras / Matéria-prima</h2><p>Controle compras, fornecedor, competência e pagamento sem misturar com vendas.</p></div><button className="primary small" onClick={()=>setOpen(true)}><Plus size={16}/>Nova compra</button></div>
 <TableToolbar search={data.search} setSearch={data.setSearch} exportData={()=>downloadCSV(rows,"compras.csv")}/>
 <div className="filters" style={{marginTop:12,alignItems:"center"}}><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todas as {rows.length} compra(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelected}>Excluir selecionadas</button></div><div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Data</th><th>Competência</th><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Status</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar compra" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{dateBR(x.fact_date)}</td><td>{dateBR(x.competence_date)}</td><td>{x.description}</td><td>{x.suppliers?.name||"—"}</td><td>{money(x.amount)}</td><td>{x.status==="paid"?"Pago":"Pendente"}</td></tr>)}{!rows.length&&<EmptyRow text="Nenhuma compra registrada."/>}</tbody></table></div>
 {open&&<Modal title="Nova compra / matéria-prima" onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}><Field label="Descrição"><input required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field><Field label="Valor"><input required type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></Field><Field label="Data do fato"><input type="date" value={form.fact_date} onChange={e=>setForm({...form,fact_date:e.target.value})}/></Field><Field label="Competência"><input type="date" value={form.competence_date} onChange={e=>setForm({...form,competence_date:e.target.value})}/></Field><Field label="Fornecedor"><select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})}><option value="">Selecione</option>{data.suppliers.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Banco para pagamento"><select value={form.payment_bank_account_id} onChange={e=>setForm({...form,payment_bank_account_id:e.target.value})}><option value="">Ainda não pago</option>{data.banks.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><div className="form-actions"><button className="primary">Salvar compra</button></div></form></Modal>}</main>
}

function Despesas({data}){
 const [selected,setSelected]=useState(new Set());const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");
 const rows=(data.payables||[]).filter(x=>(x.categories?.classification==="Despesas"||!x.categories)&&(!term||[x.description,x.suppliers?.name,x.categories?.name,x.status].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term))));
 const total=rows.reduce((a,x)=>a+Number(x.amount||0),0),pending=rows.filter(x=>x.status!=="paid").reduce((a,x)=>a+Number(x.amount||0),0);const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)rows.forEach(x=>next.delete(x.id));else rows.forEach(x=>next.add(x.id));return next})}useEffect(()=>{setSelected(new Set())},[data.search]);async function removeSelected(){const ids=rows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;if(!confirm(`Excluir ${ids.length} despesa(s) selecionada(s)? Esta ação não poderá ser desfeita.`))return;const {error}=await supabase.from("payables").delete().eq("user_id",data.user.id).in("id",ids);if(error){alert(error.message);return}setSelected(new Set());data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Despesas</h2><p>Despesas por competência, vencimento e status. Pagamento bancário permanece separado para evitar dupla contagem.</p></div><button className="ghost" onClick={()=>downloadCSV(rows,"despesas.csv")}><Download size={16}/>CSV</button></div><div className="cards"><div className="card"><span>Total lançado</span><strong>{money(total)}</strong></div><div className="card"><span>A pagar</span><strong>{money(pending)}</strong></div></div><div className="filters" style={{marginTop:12,alignItems:"center"}}><div className="search"><Search size={16}/><input placeholder="Pesquisar despesa..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todas as {rows.length} despesa(s) filtrada(s)</label><span>{selected.size} selecionada(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelected}>Excluir selecionadas</button></div><div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Vencimento</th><th>Competência</th><th>Descrição</th><th>Categoria</th><th>Fornecedor</th><th>Valor</th><th>Status</th></tr></thead><tbody>{rows.map(x=><tr key={x.id}><td><input aria-label="Selecionar despesa" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td>{dateBR(x.due_date)}</td><td>{dateBR(x.competence_date)}</td><td>{x.description}</td><td>{x.categories?.name||"—"}</td><td>{x.suppliers?.name||"—"}</td><td>{money(x.amount)}</td><td>{x.status==="paid"?"Pago":"Pendente"}</td></tr>)}{!rows.length&&<EmptyRow text="Nenhuma despesa cadastrada."/>}</tbody></table></div></main>
}

function Cardapio({data}){
 const [open,setOpen]=useState(false),[editing,setEditing]=useState(null),[selected,setSelected]=useState(new Set());
 const [form,setForm]=useState({name:"",description:"",category_id:"",sale_price:"",price_p:"",price_m:"",price_g:"",price_f:"",cost_price:""});
 const term=String(data.search||"").trim().toLocaleLowerCase("pt-BR");const rows=(data.products||[]).filter(x=>x.active!==false&&(!term||[x.name,x.description,x.categories?.name].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(term))));
 const grouped=rows.reduce((acc,x)=>{const key=x.categories?.name||"Sem categoria";(acc[key]??=[]).push(x);return acc},{}); 
 const isSized=form.category_id&&data.categories.some(c=>c.id===form.category_id&&["Pizzas Tradicionais","Pizzas Especiais","Bordas Recheadas"].includes(c.name));
 function startNew(){setEditing(null);setForm({name:"",description:"",category_id:"",sale_price:"",price_p:"",price_m:"",price_g:"",price_f:"",cost_price:""});setOpen(true)}
 function startEdit(x){setEditing(x);setForm({name:x.name||"",description:x.description||"",category_id:x.category_id||"",sale_price:String(x.sale_price??""),price_p:String(x.price_p??""),price_m:String(x.price_m??""),price_g:String(x.price_g??""),price_f:String(x.price_f??""),cost_price:String(x.cost_price??"")});setOpen(true)}
 async function save(e){e.preventDefault();const p=form.category_id&&data.categories.find(c=>c.id===form.category_id)?.name;const sized=["Pizzas Tradicionais","Pizzas Especiais","Bordas Recheadas"].includes(p);const primary=sized?(form.price_p||form.price_m||form.price_g||form.price_f):form.sale_price;const payload={name:form.name.trim(),description:form.description.trim(),category_id:form.category_id||null,sale_price:Number(primary||0),price_p:sized&&form.price_p!==""?Number(form.price_p):null,price_m:sized&&form.price_m!==""?Number(form.price_m):null,price_g:sized&&form.price_g!==""?Number(form.price_g):null,price_f:sized&&form.price_f!==""?Number(form.price_f):null,cost_price:Number(form.cost_price||0),active:true};
   const q=editing?supabase.from("products").update(payload).eq("id",editing.id).eq("user_id",data.user.id):supabase.from("products").insert({...payload,user_id:data.user.id});
   const {error}=await q;if(error)alert(error.message);else{setOpen(false);data.reload()}
 }
 const allSelected=rows.length>0&&rows.every(x=>selected.has(x.id));useEffect(()=>{setSelected(new Set())},[data.search]);function toggleOne(id){setSelected(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next})}function toggleAll(){setSelected(prev=>{const next=new Set(prev);if(allSelected)rows.forEach(x=>next.delete(x.id));else rows.forEach(x=>next.add(x.id));return next})}async function removeSelected(){const ids=rows.filter(x=>selected.has(x.id)).map(x=>x.id);if(!ids.length)return;if(!confirm(`Desativar ${ids.length} item(ns) selecionado(s) do cardápio? Os itens deixam de aparecer para novas vendas, mas o histórico será preservado.`))return;const {error}=await supabase.from("products").update({active:false}).eq("user_id",data.user.id).in("id",ids);if(error){alert(error.message);return}setSelected(new Set());data.reload()} async function remove(x){if(!confirm("Excluir este item do cardápio? Ele será desativado para não apagar o histórico de vendas."))return;const {error}=await supabase.from("products").update({active:false}).eq("id",x.id).eq("user_id",data.user.id);if(error)alert(error.message);else data.reload()}
 return <main className="content"><div className="page-head"><div><h2>Cardápio</h2><p>Cardápio completo com descrição, tamanhos, preços e edição.</p></div><button className="primary small" onClick={startNew}><Plus size={16}/>Incluir item</button></div>
 <div className="filters"><div className="search"><Search size={16}/><input placeholder="Pesquisar produto..." value={data.search} onChange={e=>data.setSearch(e.target.value)}/></div><label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={allSelected} onChange={toggleAll}/>Selecionar todos os {rows.length} item(ns)</label><span>{selected.size} selecionado(s)</span><button className="danger small" disabled={!selected.size} onClick={removeSelected}>Desativar selecionados</button></div>
 {Object.entries(grouped).map(([category,items])=><section className="panel" key={category}><div className="section-title"><h3>{category}</h3><span>{items.length} item(ns)</span></div><div className="table-wrap"><table><thead><tr><th>Selecionar</th><th>Produto</th><th>Descrição</th><th>P</th><th>M</th><th>G</th><th>F</th><th>Custo</th><th>Ações</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><input aria-label="Selecionar item do cardápio" type="checkbox" checked={selected.has(x.id)} onChange={()=>toggleOne(x.id)}/></td><td><b>{x.name}</b></td><td>{x.description||"—"}</td><td>{x.price_p!=null?money(x.price_p):money(x.sale_price)}</td><td>{x.price_m!=null?money(x.price_m):"—"}</td><td>{x.price_g!=null?money(x.price_g):"—"}</td><td>{x.price_f!=null?money(x.price_f):"—"}</td><td>{money(x.cost_price)}</td><td><button className="icon-btn" title="Editar" onClick={()=>startEdit(x)}>✏️</button><button className="icon-btn" title="Desativar" onClick={()=>remove(x)}>🗑️</button></td></tr>)}</tbody></table></div></section>)}
 {!rows.length&&<section className="panel"><div className="empty-row">Nenhum item no cardápio.</div></section>}
 {open&&<Modal title={editing?"Editar item do cardápio":"Incluir item no cardápio"} onClose={()=>setOpen(false)}><form className="form-grid" onSubmit={save}>
 <Field label="Nome"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field> <Field label="Categoria"><select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{data.categories.filter(x=>["Pizzas Tradicionais","Pizzas Especiais","Bebidas","Bordas Recheadas"].includes(x.name)).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
 <Field label="Descrição"><textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></Field>
 {isSized?<><Field label="Preço P"><input type="number" step="0.01" value={form.price_p} onChange={e=>setForm({...form,price_p:e.target.value})}/></Field><Field label="Preço M"><input type="number" step="0.01" value={form.price_m} onChange={e=>setForm({...form,price_m:e.target.value})}/></Field><Field label="Preço G"><input type="number" step="0.01" value={form.price_g} onChange={e=>setForm({...form,price_g:e.target.value})}/></Field><Field label="Preço F"><input type="number" step="0.01" value={form.price_f} onChange={e=>setForm({...form,price_f:e.target.value})}/></Field></>:<Field label="Preço de venda"><input type="number" step="0.01" value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})}/></Field>}
 <Field label="Custo"><input type="number" step="0.01" value={form.cost_price} onChange={e=>setForm({...form,cost_price:e.target.value})}/></Field>
 <div className="form-actions"><button className="primary">{editing?"Salvar alterações":"Incluir item"}</button></div></form></Modal>}</main>
}
function Conciliacao({data}){
 const [selectedTx,setSelectedTx]=useState("");
 const [selectedSales,setSelectedSales]=useState([]);
 const [fees,setFees]=useState("0");
 const [adjustments,setAdjustments]=useState("0");
 const [channelFilter,setChannelFilter]=useState("");
 const [reconcileType,setReconcileType]=useState("sales");
 const [saving,setSaving]=useState(false);
 const [batches,setBatches]=useState([]);
 const [loadingBatches,setLoadingBatches]=useState(true);
 const pending=(data.bankTx||[]).filter(x=>x.status!=="reconciled"&&(reconcileType==="other"||x.direction==="in"));
 const tx=pending.find(x=>x.id===selectedTx);
 const loadBatches=async()=>{
   setLoadingBatches(true);
   const {data:rows,error}=await supabase.from("reconciliation_batches").select("*,channels(name),bank_transactions(description,fact_date,amount),reconciliation_batch_items(sale_id,matched_amount)").eq("user_id",data.user.id).order("created_at",{ascending:false});
   if(error)console.warn("Não foi possível carregar os repasses conciliados:",error);
   setBatches(rows||[]);
   setLoadingBatches(false);
 };
 useEffect(()=>{loadBatches()},[data.user.id,data.bankTx.length]);
 const usedSaleIds=new Set((batches||[]).flatMap(b=>(b.reconciliation_batch_items||[]).map(i=>i.sale_id)));
 const availableSales=(data.sales||[]).filter(s=>{
   if(s.status==="cancelled"||usedSaleIds.has(s.id))return false;
   const channelName=normalizeHeader(s.channels?.name||data.channels.find(c=>c.id===s.channel_id)?.name||"");
   if(channelFilter&&!channelName.includes(normalizeHeader(channelFilter)))return false;
   return true;
 }).sort((a,b)=>String(b.fact_date||"").localeCompare(String(a.fact_date||"")));
 const selected=availableSales.filter(s=>selectedSales.includes(s.id));
 const salesNet=selected.reduce((sum,s)=>sum+Number(s.net_amount||0),0);
 function suggestWeeklySales(){
   if(!tx)return alert("Selecione primeiro o depósito bancário.");
   if(tx.direction!=="in")return alert("A sugestão de repasse funciona para entradas bancárias.");
   const payoutDate=String(tx.fact_date||"").slice(0,10);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(payoutDate))return alert("Não consegui identificar a data do depósito.");
   const payoutDay=new Date(payoutDate+"T12:00:00");
   const day=payoutDay.getDay();
   const daysSinceMonday=(day+6)%7;
   const currentMonday=new Date(payoutDay);currentMonday.setDate(payoutDay.getDate()-daysSinceMonday);
   const weekStart=new Date(currentMonday);weekStart.setDate(currentMonday.getDate()-7);
   const weekEnd=new Date(currentMonday);weekEnd.setDate(currentMonday.getDate()-1);
   const toKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
   const start=toKey(weekStart),end=toKey(weekEnd);
   const hint=normalizeHeader((tx.description||"")+" "+(tx.bank_accounts?.name||""));
   const channelHints=["ifood","beefood","99food","whatsapp","direto"];
   const detected=channelHints.find(name=>hint.includes(normalizeHeader(name)));
   const detectedChannel=detected?data.channels.find(c=>normalizeHeader(c.name).includes(normalizeHeader(detected))):null;
   const candidates=(data.sales||[]).filter(s=>{
     const date=String(s.fact_date||s.competence_date||"").slice(0,10);
     if(!date||date<start||date>end||s.status==="cancelled"||usedSaleIds.has(s.id)||!(Number(s.net_amount||0)>0))return false;
     if(detectedChannel&&s.channel_id!==detectedChannel.id)return false;
     return true;
   }).sort((a,b)=>String(a.fact_date||"").localeCompare(String(b.fact_date||"")));
   if(!candidates.length)return alert("Não encontrei vendas líquidas não conciliadas de "+start+" a "+end+(detectedChannel?" no canal "+detectedChannel.name:"")+". Confira o canal e se as vendas dessa semana foram importadas.");
   setChannelFilter(detectedChannel?.name||"");
   setSelectedSales(candidates.map(s=>s.id));
   setFees("0");setAdjustments("0");
   alert("Sugestão carregada para "+start+" a "+end+": "+candidates.length+" venda(s), líquido total de "+money(candidates.reduce((sum,s)=>sum+Number(s.net_amount||0),0))+". Confira o valor esperado e a diferença antes de confirmar. "+(detectedChannel?"Canal identificado: "+detectedChannel.name+".":"Não identifiquei o canal pelo extrato; revise as vendas selecionadas."));
 }
 const feeValue=Number(fees||0);
 const adjustmentValue=Number(adjustments||0);
 const expectedNet=salesNet-feeValue+adjustmentValue;
 const difference=tx?Number(tx.amount||0)-expectedNet:0;
 const saleRows=availableSales.map(s=>{const checked=selectedSales.includes(s.id);return <tr key={s.id}><td><input type="checkbox" checked={checked} onChange={()=>toggleSale(s.id)}/></td><td>{dateBR(String(s.fact_date||"").slice(0,10))}</td><td>{s.channels?.name||data.channels.find(c=>c.id===s.channel_id)?.name||"—"}</td><td>{s.external_id||"Venda"}{s.payment_method?" • "+s.payment_method:""}</td><td>{money(s.gross_amount)}</td><td>{money(Number(s.fees||0)+Number(s.discounts||0))}</td><td>{money(s.net_amount)}</td></tr>});
 function toggleSale(id){setSelectedSales(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 function clearSelection(){setSelectedSales([]);setSelectedTx("");setFees("0");setAdjustments("0")}
 function changeReconcileType(value){setReconcileType(value);setSelectedTx("");setSelectedSales([]);setFees("0");setAdjustments("0")}
 async function markOther(){
   if(!tx)return alert("Selecione uma movimentação bancária.");
   if(!confirm("Marcar esta movimentação como Outros e como Conferida? Ela ficará registrada assim no extrato."))return;
   setSaving(true);
   try{
     const {error}=await supabase.from("bank_transactions").update({classification:"Outros",status:"reconciled",reference_type:"other",reference_id:null}).eq("id",tx.id).eq("user_id",data.user.id);
     if(error)throw error;
     clearSelection();await data.reload();
   }catch(error){alert(error?.message||"Não foi possível marcar a movimentação como Outros.")}finally{setSaving(false)}
 }
 function chooseTx(x){
   setSelectedTx(x.id);
   const desc=normalizeHeader(x.description||"");
   if(desc.includes("beefood"))setFees("1.99");else setFees("0");
 }
 async function createBatch(){
   if(!tx)return alert("Selecione primeiro a entrada bancária.");
   if(tx.direction!=="in")return alert("Para vincular vendas, selecione uma entrada bancária. Saídas podem ser classificadas como Outros.");
   if(!selected.length)return alert("Selecione pelo menos uma venda que pertence a esta entrada.");
   if(Math.abs(difference)>0.01&&!confirm("O valor do banco não fecha com as vendas selecionadas após taxas/ajustes. Deseja salvar mesmo assim para registrar a diferença?"))return;
   setSaving(true);
   try{
     const channelName=selected[0]?.channels?.name||data.channels.find(c=>c.id===selected[0]?.channel_id)?.name||null;
     const channelId=selected[0]?.channel_id||null;
     const {data:batch,error}=await supabase.from("reconciliation_batches").insert({user_id:data.user.id,bank_transaction_id:tx.id,channel_id:channelId,gross_amount:salesNet,fees:feeValue,adjustments:adjustmentValue,net_amount:Number(tx.amount||0),notes:channelName?("Repasse "+channelName):"Repasse"}).select("id").single();
     if(error)throw error;
     const links=selected.map(s=>({batch_id:batch.id,sale_id:s.id,matched_amount:Number(s.net_amount||0)}));
     const {error:linkError}=await supabase.from("reconciliation_batch_items").insert(links);
     if(linkError)throw linkError;
     for(const s of selected){
       const {data:recv,error:recvError}=await supabase.from("receivables").select("id").eq("sale_id",s.id).eq("user_id",data.user.id).limit(1);
       if(recvError)throw recvError;
       const receivedPayload={received_amount:Number(s.net_amount||0),received_date:String(tx.fact_date||"").slice(0,10)||today(),status:"received",bank_account_id:tx.bank_account_id};
       if(recv?.[0]){
         const {error:e}=await supabase.from("receivables").update(receivedPayload).eq("id",recv[0].id).eq("user_id",data.user.id);
         if(e)throw e;
       }else{
         const {error:e}=await supabase.from("receivables").insert({user_id:data.user.id,sale_id:s.id,description:"Recebimento vinculado à venda "+(s.external_id||""),competence_date:String(s.competence_date||s.fact_date||today()).slice(0,10),expected_date:String(s.competence_date||s.fact_date||today()).slice(0,10),amount:Number(s.net_amount||0),...receivedPayload,source:"reconciliation"});
         if(e)throw e;
       }
     }
     const {error:txError}=await supabase.from("bank_transactions").update({status:"reconciled",reference_type:"reconciliation_batch",reference_id:batch.id}).eq("id",tx.id).eq("user_id",data.user.id);
     if(txError)throw txError;
     clearSelection();await loadBatches();data.reload();
   }catch(error){alert(error?.message||"Não foi possível conciliar o repasse.")}finally{setSaving(false)}
 }
 async function undoBatch(batch){
   if(!confirm("Desfazer esta conciliação e devolver as vendas para pendente?"))return;   try{
     const items=batch.reconciliation_batch_items||[];
     for(const item of items){
       await supabase.from("receivables").update({received_amount:0,received_date:null,status:"pending",bank_account_id:null}).eq("sale_id",item.sale_id).eq("user_id",data.user.id);
     }
     const {error:e1}=await supabase.from("bank_transactions").update({status:"unreconciled",reference_type:null,reference_id:null}).eq("id",batch.bank_transaction_id).eq("user_id",data.user.id);
     if(e1)throw e1;
     const {error:e2}=await supabase.from("reconciliation_batches").delete().eq("id",batch.id).eq("user_id",data.user.id);
     if(e2)throw e2;
     await loadBatches();data.reload();
   }catch(error){alert(error?.message||"Não foi possível desfazer a conciliação.")}
 }
 return <main className="content">
  <div className="page-head"><div><h2>Conciliação</h2><p>Confira se depósitos bancários correspondem às vendas e registre diferenças. A conciliação vincula registros existentes e não cria nova receita. Movimentações sem relação com vendas podem ser marcadas como Outros.</p></div></div>
  <section className="panel">
   <div className="section-title"><h3>➕ Conferir movimentação</h3><span>{pending.length} movimentação(ões) pendente(s)</span></div>
   <div className="form-grid">
    <Field label="Como deseja conferir?"><select value={reconcileType} onChange={e=>changeReconcileType(e.target.value)}><option value="sales">Vincular entrada a venda(s)</option><option value="other">Outros — sem venda/conta vinculada</option></select></Field>
    <Field label={reconcileType==="sales"?"Entrada bancária":"Entrada ou saída bancária"}><select value={selectedTx} onChange={e=>{const x=pending.find(t=>t.id===e.target.value);x?chooseTx(x):setSelectedTx("")}}><option value="">Selecione a movimentação...</option>{pending.map(x=><option key={x.id} value={x.id}>{dateBR(String(x.fact_date||"").slice(0,10))} • {x.direction==="in"?"Entrada":"Saída"} • {money(x.amount)} • {x.description}</option>)}</select></Field>
    {reconcileType==="sales"&&<>
    <Field label="Canal da venda"><select value={channelFilter} onChange={e=>{setChannelFilter(e.target.value);setSelectedSales([])}}><option value="">Todos os canais, inclusive venda direta</option>{data.channels.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></Field>
    <Field label="Taxa deste repasse"><input type="number" step="0.01" value={fees} onChange={e=>setFees(e.target.value)} placeholder="Ex.: 1,99"/></Field>
    <Field label="Ajuste (+/-)"><input type="number" step="0.01" value={adjustments} onChange={e=>setAdjustments(e.target.value)} placeholder="0,00"/></Field>
   </>}
   </div>
   {reconcileType==="sales"&&<>
    <div className="summary-grid" style={{marginTop:16}}>
     <div><b>{money(salesNet)}</b><span>líquido das vendas selecionadas</span></div>
     <div><b>{money(feeValue)}</b><span>taxa deste repasse</span></div>
     <div><b>{money(expectedNet)}</b><span>valor esperado</span></div>
     <div><b>{money(difference)}</b><span>diferença banco × esperado</span></div>
    </div>
    {tx&&<div className="actions" style={{marginTop:16}}><button className="ghost" disabled={saving} onClick={suggestWeeklySales}>Sugerir vendas da semana anterior</button><span style={{fontSize:13,color:"var(--muted)"}}>Para repasses de quarta-feira, sugere vendas de segunda a domingo da semana anterior. É uma sugestão; revise os valores antes de vincular.</span></div>}
    <div className="table-wrap" style={{marginTop:16}}><table><thead><tr><th></th><th>Data</th><th>Canal</th><th>Descrição</th><th>Bruto</th><th>Taxas</th><th>Líquido</th></tr></thead><tbody>{saleRows}{!availableSales.length&&<EmptyRow text="Nenhuma venda disponível para vincular. As vendas diretas também aparecem aqui."/>}</tbody></table></div>
    <div className="actions" style={{marginTop:16}}><button className="primary" disabled={saving||!selected.length||!tx} onClick={createBatch}>{saving?"Conciliando...":"Vincular venda(s) e conferir entrada"}</button><button className="ghost" onClick={clearSelection}>Limpar</button></div>
    {tx&&<p className={Math.abs(difference)<=0.01?"success":"error"} style={{marginTop:12}}>{Math.abs(difference)<=0.01?"Fechamento conferido: o valor do banco bate com o esperado.":"Atenção: o banco e as vendas selecionadas têm uma diferença de "+money(difference)+"."}</p>}
   </>}
   {reconcileType==="other"&&<div className="actions" style={{marginTop:16}}><p>Use esta opção para transferências, aportes, ajustes ou qualquer entrada/saída que não seja venda nem conta. A classificação “Outros” e o status “Conferido” serão salvos no extrato.</p><button className="primary" disabled={saving||!tx} onClick={markOther}>{saving?"Salvando...":"Marcar como Outros e Conferido"}</button><button className="ghost" onClick={clearSelection}>Limpar</button></div>}
  </section>
  <section className="panel">
   <div className="section-title"><h3>Repasses já conciliados</h3></div>
   <div className="table-wrap"><table><thead><tr><th>Data</th><th>Canal</th><th>Vendas</th><th>Vendas líquidas</th><th>Taxa repasse</th><th>Recebido</th><th></th></tr></thead><tbody>{batches.map(b=><tr key={b.id}><td>{dateBR(String(b.bank_transactions?.fact_date||"").slice(0,10))}</td><td>{b.channels?.name||"—"}</td><td>{(b.reconciliation_batch_items||[]).length}</td><td>{money(b.gross_amount)}</td><td>{money(b.fees)}</td><td>{money(b.net_amount)}</td><td><button className="ghost small" onClick={()=>undoBatch(b)}>Desfazer</button></td></tr>)}{!batches.length&&!loadingBatches&&<EmptyRow text="Nenhum repasse conciliado ainda."/>}</tbody></table></div>
  </section>
 </main>
}
function normalizeHeader(v){return String(v??"").normalize("NFD").split("").filter(ch=>{const n=ch.charCodeAt(0);return n<768||n>879}).join("").toLowerCase().split("").map(ch=>{const n=ch.charCodeAt(0);return (n>=97&&n<=122)||(n>=48&&n<=57)?ch:" "}).join("").replaceAll("  "," ").trim()}
function parseMoney(v){if(typeof v==="number")return Number.isFinite(v)?v:0;let s=String(v??"").trim();if(!s)return 0;const negative=/^\s*\(.*\)\s*$/.test(s)||/\s-\s*$/.test(s);s=s.replace(/[\u00a0\u202f\s]/g,"").replace(/R\$|BRL|US\$|\$/gi,"").replace(/[()]/g,"").replace(/[^0-9,\.\-]/g,"");if(!s||!/[0-9]/.test(s))return 0;if(s.includes(",")&&s.includes(".")){if(s.lastIndexOf(",")>s.lastIndexOf("."))s=s.replace(/\./g,"").replace(",",".");else s=s.replace(/,/g,"")}else if(s.includes(",")){const parts=s.split(",");if(parts.length>2)s=parts.slice(0,-1).join("")+"."+parts[parts.length-1];else s=s.replace(",",".")}const n=Number(s);if(!Number.isFinite(n))return 0;return negative? -Math.abs(n):n}
function parseExcelDate(v){if(v instanceof Date&&!Number.isNaN(v.getTime()))return v.toISOString().slice(0,10);if(typeof v==="number"){const d=new Date(Math.round((v-25569)*86400*1000));return Number.isNaN(d.getTime())?today():d.toISOString().slice(0,10)}const s=String(v??"").trim();if(!s)return today();const br=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/);if(br){const [,d,m,y]=br;const day=Number(d),month=Number(m);if(day>=1&&day<=31&&month>=1&&month<=12)return y+"-"+m.padStart(2,"0")+"-"+d.padStart(2,"0")}const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);if(iso)return iso[1]+"-"+iso[2]+"-"+iso[3];const d=new Date(s);return Number.isNaN(d.getTime())?today():d.toISOString().slice(0,10)}
function headerIndex(headers,...names){const normalized=headers.map(normalizeHeader);for(const name of names){const i=normalized.indexOf(normalizeHeader(name));if(i>=0)return i}for(const name of names){const n=normalizeHeader(name);const i=normalized.findIndex(h=>h.includes(n)||n.includes(h));if(i>=0)return i}return -1}
function detectSource(headers){const h=headers.map(normalizeHeader).join(" ");if(h.includes("cliente")&&h.includes("pedido produtos")&&h.includes("valor bruto")&&h.includes("origem"))return "whatsapp";if((h.includes("id completo do pedido")||h.includes("valor liquido")||h.includes("total pago pelo cliente"))&&h.includes("ifood"))return "ifood";if((h.includes("ref ifood")||h.includes("situacao delivery")||h.includes("valor pago"))&&h.includes("numero pedido"))return "beefood";if(h.includes("id da transacao")||h.includes("nome do titular")||h.includes("bandeira")||h.includes("metodo de captura"))return "cartao";if(h.includes("movimentacao")||h.includes("saldo antes")||h.includes("nosso numero"))return "banco_ton";if(h.includes("data da transacao")||h.includes("categoria"))return "banco_ifood";return "banco_ifood"}
function parseCSVText(text,delimiter){const rows=[];let row=[],field="",quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'&&text[i+1]==='"'){field+='"';i++}else if(ch==='"')quoted=false;else field+=ch}else if(ch==='"'){quoted=true}else if(ch===delimiter){row.push(field);field=""}else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(field);if(row.some(v=>String(v??"").trim()!==""))rows.push(row);row=[];field=""}else field+=ch}row.push(field);if(row.some(v=>String(v??"").trim()!==""))rows.push(row);return rows}
async function parseWorkbook(file){const buf=await file.arrayBuffer();const bytes=new Uint8Array(buf);const isZipWorkbook=bytes.length>=4&&bytes[0]===0x50&&bytes[1]===0x4b&&bytes[2]===0x03&&bytes[3]===0x04;const isExcel=/\.(xlsx|xls)$/i.test(file.name)||file.type==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"||file.type==="application/vnd.ms-excel";if(isZipWorkbook||isExcel){const XLSX=await import("xlsx");const wb=XLSX.read(buf,{type:"array",cellDates:true,cellNF:true,cellText:true,raw:false});const ws=wb.Sheets[wb.SheetNames[0]];if(!ws)throw new Error("A planilha não contém uma aba com dados.");const sheetRows=XLSX.utils.sheet_to_json(ws,{header:1,defval:""});if(sheetRows.length&&sheetRows.every(row=>Array.isArray(row)&&row.length===1)){const embeddedText=sheetRows.map(row=>String(row[0]??"")).filter(v=>v.trim()!=="").join("\n");const firstCell=String(sheetRows[0]?.[0]??"").toLowerCase();if((firstCell.includes("data da transação")||firstCell.includes("data da transacao"))&&firstCell.includes("descrição")&&firstCell.includes("valor")){const embeddedRows=parseCSVText(embeddedText,",");if(embeddedRows.length&&embeddedRows[0].length>=3)return embeddedRows}}return sheetRows}const text=new TextDecoder("utf-8").decode(buf).replace(/^\uFEFF/,"");const first=text.split(/\r?\n/,1)[0]||"";let commas=0,semicolons=0,quoted=false;for(let i=0;i<first.length;i++){const ch=first[i];if(ch==='"'&&first[i+1]==='"'){i++;continue}if(ch==='"')quoted=!quoted;else if(!quoted&&ch===",")commas++;else if(!quoted&&ch===";")semicolons++}const commaRows=parseCSVText(text,",");const semicolonRows=parseCSVText(text,";");const scoreRows=(candidate)=>{if(!candidate.length)return -1;const widths=candidate.map(row=>row.length);const multi=widths.filter(width=>width>1).length;const maxWidth=Math.max(...widths);const consistent=widths.filter(width=>width===maxWidth).length;return multi*100+maxWidth*10+consistent};let rows=scoreRows(semicolonRows)>scoreRows(commaRows)?semicolonRows:commaRows;if(rows.length&&rows.every(row=>row.length===1)){const cells=rows.map(row=>String(row[0]??"").trim()).filter(Boolean);const hasEmbeddedCsv=cells.some(cell=>cell.includes(",")&&/[,;]\\s*["']?[^,;]+[,;]/.test(cell));if(hasEmbeddedCsv){const embeddedText=cells.join("\n");const embeddedComma=parseCSVText(embeddedText,",");const embeddedSemicolon=parseCSVText(embeddedText,";");const embedded=scoreRows(embeddedSemicolon)>scoreRows(embeddedComma)?embeddedSemicolon:embeddedComma;if(embedded.some(row=>row.length>1))rows=embedded;}}if(!rows.length)throw new Error("O arquivo CSV está vazio ou não pôde ser lido.");return rows}
function Dados({data}){
 const [source,setSource]=useState("ifood"),[preview,setPreview]=useState([]),[file,setFile]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[sheetSource,setSheetSource]=useState("");
 async function onFile(e){const f=e.target.files?.[0];if(!f)return;setFile(f);setMessage("");try{const rows=await parseWorkbook(f);const clean=rows.filter(r=>Array.isArray(r)&&r.some(v=>String(v??"").trim()!==""));setPreview(clean);const detected=detectSource(clean[0]||[]);setSheetSource(detected);if(source==="auto"||source==="ifood")setSource(detected)}catch(error){setPreview([]);setMessage("Não foi possível ler o Excel/CSV: "+(error?.message||"arquivo inválido."))}}
 function rowsForImport(){return preview.length>1?preview.slice(1).filter(r=>r.some(v=>String(v??"").trim()!=="")):[]}
 async function ensureImport(sourceName,fileName,count){const bytes=await file.arrayBuffer();const hashBuf=await crypto.subtle.digest("SHA-256",bytes);const hash=Array.from(new Uint8Array(hashBuf)).map(b=>b.toString(16).padStart(2,"0")).join("");const {data:existing,error:lookupError}=await supabase.from("imports").select("id,row_count,status").eq("user_id",data.user.id).eq("source",sourceName).eq("file_hash",hash).limit(1);if(lookupError)throw lookupError;if(existing?.length){const previous=existing[0];if(previous.status==="processing")return {duplicate:true};const canRetrySafely=["iFood","BeeFood","Banco TON","Banco IF Pago"].includes(sourceName);if(Number(previous.row_count||0)>0&&!canRetrySafely)return {duplicate:true};const {error}=await supabase.from("imports").update({file_name:fileName,row_count:count,status:"processing"}).eq("id",previous.id).eq("user_id",data.user.id);if(error)throw error;return {duplicate:false,id:previous.id}}const {data:imp,error}=await supabase.from("imports").insert({user_id:data.user.id,source:sourceName,file_name:fileName,row_count:count,status:"processing",file_hash:hash}).select("id").single();if(error)throw error;return {duplicate:false,id:imp.id}}
 async function finishImport(id,status,count){if(id)await supabase.from("imports").update({status,row_count:count}).eq("id",id)}
 function findBank(kind){if(kind==="bank_ton")return data.banks.find(b=>normalizeHeader(b.name).includes("ton"));return data.banks.find(b=>{const name=normalizeHeader(b.name).replace(/\s+/g,"");return name.includes("ifood")||name.includes("ifpago")})}
 function rowKey(row){return row.map(v=>String(v??"").trim()).join("|").toLowerCase()}
 async function importFile(){const rows=rowsForImport();if(!file){setMessage("ERRO NA IMPORTAÇÃO: selecione um arquivo CSV ou Excel.");return}if(!rows.length){setMessage("ERRO NA IMPORTAÇÃO: o arquivo foi lido, mas nenhuma linha de dados foi encontrada abaixo do cabeçalho.");return}setBusy(true);setMessage("");let importId=null;try{const headers=preview[0]||[];const type=source==="auto"?sheetSource:source;const sourceName=type==="ifood"?"iFood":type==="beefood"?"BeeFood":type==="whatsapp"?"WhatsApp":type==="cartao"?"Cartão":type==="bank_ton"?"Banco TON":"Banco IF Pago";const imp=await ensureImport(sourceName,file.name,rows.length);if(imp.duplicate){setMessage("Este arquivo já foi importado. Nenhum lançamento duplicado foi criado.");return}importId=imp.id;let inserted=0;
 if(type==="ifood"){const channel=data.channels.find(c=>normalizeHeader(c.name)==="ifood");if(!channel)throw new Error("Canal iFood não encontrado.");
 const dateIdx=headerIndex(headers,"data e hora do pedido"),grossIdx=headerIndex(headers,"valor dos itens"),paidIdx=headerIndex(headers,"total pago pelo cliente"),netIdx=headerIndex(headers,"valor liquido"),deliveryIdx=headerIndex(headers,"taxa de entrega paga pelo cliente"),idIdx=headerIndex(headers,"id completo do pedido"),payIdx=headerIndex(headers,"forma de pagamento"),statusIdx=headerIndex(headers,"status final do pedido");
 if(dateIdx<0||grossIdx<0||idIdx<0)throw new Error("Não identifiquei as colunas principais do relatório de vendas do iFood.");
 const sales=rows.map(r=>{const items=Math.abs(parseMoney(r[grossIdx])),paid=Math.abs(parseMoney(r[paidIdx])),reportedNet=parseMoney(r[netIdx]),delivery=Math.abs(parseMoney(r[deliveryIdx]));const gross=items+delivery;const discounts=Math.max(0,gross-paid);const fees=Math.max(0,paid-reportedNet);const fact=parseExcelDate(r[dateIdx]);return {user_id:data.user.id,channel_id:channel.id,external_id:"ifood:"+String(r[idIdx]??"").trim(),fact_date:new Date(fact+"T12:00:00").toISOString(),competence_date:fact,gross_amount:gross,delivery_fee:delivery,discounts,fees,cancellations:normalizeHeader(r[statusIdx]).includes("cancel")?gross:0,net_amount:reportedNet||Math.max(0,gross-discounts-fees),payment_method:String(r[payIdx]??"").trim()||null,status:normalizeHeader(r[statusIdx]).includes("cancel")?"cancelled":"confirmed",source:"ifood"}}).filter(x=>x.external_id!=="ifood:");
 const ids=sales.map(x=>x.external_id);const {data:old}=await supabase.from("sales").select("external_id").eq("user_id",data.user.id).in("external_id",ids);const oldSet=new Set((old||[]).map(x=>x.external_id));const fresh=sales.filter(x=>!oldSet.has(x.external_id));
 if(fresh.length){const {data:created,error}=await supabase.from("sales").insert(fresh).select("id,net_amount,competence_date,payment_method,source,status");if(error)throw error;const recv=(created||[]).filter(s=>s.status!=="cancelled").map(s=>({user_id:data.user.id,sale_id:s.id,description:"Venda iFood"+(s.payment_method?" • "+s.payment_method:""),competence_date:s.competence_date,expected_date:s.competence_date,amount:Number(s.net_amount||0),received_amount:0,status:"pending",source:"ifood",external_id:s.id}));if(recv.length){const {error:e}=await supabase.from("receivables").insert(recv);if(e)throw e}}inserted=fresh.length;await finishImport(importId,"completed",inserted);setMessage(inserted+" venda(s) do iFood importada(s). "+(sales.length-inserted)+" já existia(m) e foi(ram) ignorada(s).");
 }else if(type==="beefood"){const channel=data.channels.find(c=>normalizeHeader(c.name)==="beefood");if(!channel)throw new Error("Canal BeeFood não encontrado.");
 const dateIdx=headerIndex(headers,"data"),idIdx=headerIndex(headers,"id"),orderIdx=headerIndex(headers,"n pedido","nº pedido","numero pedido"),totalIdx=headerIndex(headers,"valor total"),paidIdx=headerIndex(headers,"valor pago"),discountIdx=headerIndex(headers,"descontos"),freightIdx=headerIndex(headers,"valor frete"),payIdx=headerIndex(headers,"tipo");
 if(dateIdx<0||totalIdx<0)throw new Error("Não identifiquei as colunas de data e valor total do BeeFood.");
 const sales=rows.map(r=>{const gross=Math.abs(parseMoney(r[totalIdx])),paid=Math.abs(parseMoney(r[paidIdx])),discount=Math.abs(parseMoney(r[discountIdx])),delivery=Math.abs(parseMoney(r[freightIdx])),date=parseExcelDate(r[dateIdx]);const rawId=String(r[idIdx]??"").trim(),order=String(r[orderIdx]??"").trim();const external="beefood:"+[date,order,rawId,gross.toFixed(2)].join("|");return {user_id:data.user.id,channel_id:channel.id,external_id:external,fact_date:new Date(date+"T12:00:00").toISOString(),competence_date:date,gross_amount:gross,delivery_fee:delivery,discounts:discount,fees:Math.max(0,gross-discount-(paid||gross-discount)),cancellations:0,net_amount:paid||Math.max(0,gross-discount),payment_method:String(r[payIdx]??"").trim()||null,status:normalizeHeader(r[headerIndex(headers,"situacao")]).includes("cancel")?"cancelled":"confirmed",source:"beefood"}}).filter(x=>x.gross_amount>0);
 const ids=sales.map(x=>x.external_id);const {data:old}=await supabase.from("sales").select("external_id").eq("user_id",data.user.id).in("external_id",ids);const oldSet=new Set((old||[]).map(x=>x.external_id));const fresh=sales.filter(x=>!oldSet.has(x.external_id));if(fresh.length){const {data:created,error}=await supabase.from("sales").insert(fresh).select("id,net_amount,competence_date,payment_method,source");if(error)throw error;const recv=(created||[]).map(s=>({user_id:data.user.id,sale_id:s.id,description:"Venda BeeFood"+(s.payment_method?" • "+s.payment_method:""),competence_date:s.competence_date,expected_date:s.competence_date,amount:Number(s.net_amount||0),received_amount:0,status:"pending",source:"beefood",external_id:s.id}));if(recv.length){const {error:e}=await supabase.from("receivables").insert(recv);if(e)throw e}}inserted=fresh.length;await finishImport(importId,"completed",inserted);setMessage(inserted+" venda(s) do BeeFood importada(s). "+(sales.length-inserted)+" já existia(m) e foi(ram) ignorada(s).");
 }else if(type==="whatsapp"){
 const dateIdx=headerIndex(headers,"data"),clientIdx=headerIndex(headers,"cliente"),phoneIdx=headerIndex(headers,"telefone"),orderIdx=headerIndex(headers,"pedido / produtos","pedido produtos","produtos"),paymentIdx=headerIndex(headers,"pagamento"),statusIdx=headerIndex(headers,"status"),deliveryTypeIdx=headerIndex(headers,"entrega"),freightIdx=headerIndex(headers,"frete"),discountIdx=headerIndex(headers,"desconto"),grossIdx=headerIndex(headers,"valor bruto"),serviceFeeIdx=headerIndex(headers,"taxa de servico"),commissionIdx=headerIndex(headers,"comissao ifood"),otherFeesIdx=headerIndex(headers,"outras taxas"),netIdx=headerIndex(headers,"valor liquido"),totalIdx=headerIndex(headers,"total"),notesIdx=headerIndex(headers,"observacoes"),addressIdx=headerIndex(headers,"endereco"),numberIdx=headerIndex(headers,"numero"),neighborhoodIdx=headerIndex(headers,"bairro"),complementIdx=headerIndex(headers,"complemento"),referenceIdx=headerIndex(headers,"referencia"),externalIdx=headerIndex(headers,"pedido externo");
 if(dateIdx<0||clientIdx<0||orderIdx<0||grossIdx<0)throw new Error("Não identifiquei as colunas obrigatórias do Excel do WhatsApp. Confira Data, Cliente, Pedido / Produtos e Valor bruto.");
 let channel=data.channels.find(c=>normalizeHeader(c.name)==="whatsapp");
 if(!channel){const {data:found,error:findError}=await supabase.from("channels").select("id,name").eq("user_id",data.user.id).ilike("name","WhatsApp").limit(1);if(findError)throw findError;channel=found?.[0];if(!channel){const {data:createdChannel,error:channelError}=await supabase.from("channels").insert({user_id:data.user.id,name:"WhatsApp",active:true}).select("id,name").single();if(channelError)throw channelError;channel=createdChannel}}
 const mapped=rows.map(r=>{
  const date=parseExcelDate(r[dateIdx]),customer=String(r[clientIdx]??"").trim(),phone=String(r[phoneIdx]??"").trim(),productsText=String(r[orderIdx]??"").trim(),payment=String(r[paymentIdx]??"").trim(),statusText=normalizeHeader(r[statusIdx]),gross=Math.abs(parseMoney(r[grossIdx])),discount=Math.abs(parseMoney(r[discountIdx])),deliveryFee=Math.abs(parseMoney(r[freightIdx])),fees=Math.abs(parseMoney(r[serviceFeeIdx]))+Math.abs(parseMoney(r[commissionIdx]))+Math.abs(parseMoney(r[otherFeesIdx])),reportedNet=netIdx>=0&&String(r[netIdx]??"").trim()!==""?parseMoney(r[netIdx]):(totalIdx>=0&&String(r[totalIdx]??"").trim()!==""?parseMoney(r[totalIdx]):gross-discount-fees),external=String(r[externalIdx]??"").trim(),parts=[date,normalizeHeader(customer),phone.replace(/\D/g,""),normalizeHeader(productsText),normalizeHeader(payment),gross.toFixed(2),Number(reportedNet||0).toFixed(2)],externalId="whatsapp:"+(external?"pedido:"+normalizeHeader(external):"linha:"+parts.join("|")),address=[String(r[addressIdx]??"").trim(),String(r[numberIdx]??"").trim()?("Nº "+String(r[numberIdx]).trim()):"",String(r[neighborhoodIdx]??"").trim(),String(r[complementIdx]??"").trim(),String(r[referenceIdx]??"").trim()?("Referência: "+String(r[referenceIdx]).trim()):""].filter(Boolean).join(", "),cancelled=statusText.includes("cancel");
  return {user_id:data.user.id,channel_id:channel.id,external_id:externalId,fact_date:new Date(date+"T12:00:00").toISOString(),competence_date:date,gross_amount:gross,delivery_fee:deliveryFee,discounts:discount,fees,cancellations:cancelled?gross:0,net_amount:Number.isFinite(reportedNet)?reportedNet:Math.max(0,gross-discount-fees),payment_method:payment||null,status:cancelled?"cancelled":"confirmed",source:"whatsapp",customer_name:customer||null,customer_phone:phone||null,customer_address:address||null,_products:productsText,_notes:String(r[notesIdx]??"").trim(),_deliveryType:String(r[deliveryTypeIdx]??"").trim(),_match:[date,normalizeHeader(customer),phone.replace(/\D/g,""),gross.toFixed(2),normalizeHeader(payment)].join("|")};
 }).filter(x=>x.gross_amount>0&&x.competence_date);
 const seenIds=new Set(),unique=mapped.filter(x=>{if(seenIds.has(x.external_id))return false;seenIds.add(x.external_id);return true});
 if(!unique.length)throw new Error("Nenhuma venda válida do WhatsApp foi encontrada. Confira as datas e os valores.");
 const minDate=unique.map(x=>x.competence_date).sort()[0],maxDate=unique.map(x=>x.competence_date).sort().slice(-1)[0];
 const {data:existing,error:existingError}=await supabase.from("sales").select("external_id,competence_date,fact_date,customer_name,customer_phone,gross_amount,payment_method").eq("user_id",data.user.id).gte("competence_date",minDate).lte("competence_date",maxDate);
 if(existingError)throw existingError;
 const existingIds=new Set((existing||[]).map(x=>x.external_id).filter(Boolean)),existingMatches=new Set((existing||[]).map(x=>[String(x.competence_date||String(x.fact_date||"").slice(0,10)).slice(0,10),normalizeHeader(x.customer_name),String(x.customer_phone||"").replace(/\D/g,""),Number(x.gross_amount||0).toFixed(2),normalizeHeader(x.payment_method)].join("|")));
 const fresh=unique.filter(x=>!existingIds.has(x.external_id)&&!existingMatches.has(x._match));
 if(fresh.length){
  const payload=fresh.map(({_products,_notes,_deliveryType,_match,...sale})=>sale);
  const {data:created,error}=await supabase.from("sales").insert(payload).select("id,external_id,net_amount,competence_date,payment_method,source,status,customer_name,gross_amount,delivery_fee");
  if(error)throw error;
  const originalByExternal=new Map(fresh.map(x=>[x.external_id,x]));
  const items=(created||[]).map(s=>{const original=originalByExternal.get(s.external_id);const itemTotal=Math.max(0,Number(s.gross_amount||0)-Number(s.delivery_fee||0));return {sale_id:s.id,product_name:original?([original._products,original._deliveryType?("Entrega: "+original._deliveryType):"",original._notes?("Observações: "+original._notes):""].filter(Boolean).join(" • ")||"Venda WhatsApp"):"Venda WhatsApp",quantity:1,unit_price:itemTotal,total_amount:itemTotal,item_type:"product",notes:original?original._notes||null:null}});
  if(items.length){const {error:itemError}=await supabase.from("sale_items").insert(items);if(itemError)throw itemError}
  const receivables=(created||[]).filter(x=>x.status!=="cancelled").map(x=>({user_id:data.user.id,sale_id:x.id,description:"Venda WhatsApp"+(x.customer_name?" — "+x.customer_name:"")+(x.payment_method?" • "+x.payment_method:""),competence_date:x.competence_date,expected_date:x.competence_date,amount:Number(x.net_amount||0),received_amount:0,status:"pending",source:"whatsapp",external_id:x.id}));
  if(receivables.length){const {error:recvError}=await supabase.from("receivables").insert(receivables);if(recvError)throw recvError}
 }
 inserted=fresh.length;await finishImport(importId,"completed",inserted);setMessage(inserted+" venda(s) do WhatsApp importada(s). "+(unique.length-inserted)+" já existia(m) ou era(m) repetida(s) e foi(ram) ignorada(s).");
 }else if(type==="bank_ifood"||type==="bank_ton"){const bank=findBank(type);if(!bank)throw new Error(type==="bank_ton"?"Não encontrei o banco TON em Configurações.":"Não encontrei o banco IF Pago/iFood Pago em Configurações.");
 const dateIdx=headerIndex(headers,"data da transação","data"),descIdx=headerIndex(headers,"descrição","movimentação","descricao"),amountIdx=headerIndex(headers,"valor"),typeIdx=headerIndex(headers,"tipo"),categoryIdx=headerIndex(headers,"categoria"),docIdx=headerIndex(headers,"nosso número","id","identificador");
 if(dateIdx<0||descIdx<0||amountIdx<0)throw new Error("Não identifiquei as colunas de data, descrição/movimentação e valor do banco.");
 const rowOccurrences=new Map();const mapped=rows.map(r=>{const raw=parseMoney(r[amountIdx]),kind=normalizeHeader((r[typeIdx]||"")+" "+(r[descIdx]||""));const direction=["saida","debito","enviado","pagamento","transferencia enviada","tarifa","taxa de antecipacao","retencao de credito","compra no debito"].some(x=>kind.includes(x))||raw<0?"out":"in";const baseKey=(type==="bank_ton"?"ton":"ifood")+"|"+rowKey(r);const occurrence=(rowOccurrences.get(baseKey)||0)+1;rowOccurrences.set(baseKey,occurrence);const key=baseKey+(occurrence>1?"|repeticao:"+occurrence:"");return {user_id:data.user.id,bank_account_id:bank.id,fact_date:new Date(parseExcelDate(r[dateIdx])+"T12:00:00").toISOString(),competence_date:parseExcelDate(r[dateIdx]),description:String(r[descIdx]||"Importado"),amount:Math.abs(raw),direction,classification:direction==="in"?"Receita":"Despesas",category_id:null,status:"unreconciled",external_id:"bank:"+key,source:type==="bank_ton"?"ton":"ifood_pago",_key:key}}).filter(x=>x.amount>0);
 if(!mapped.length)throw new Error("Nenhum lançamento válido foi reconhecido. Colunas detectadas: "+headers.map(v=>String(v??"")).join(" | ")+". Valores lidos na coluna identificada como valor: "+rows.slice(0,3).map(r=>JSON.stringify(r[amountIdx])).join(" | ")+". Confira se o CSV contém valores numéricos diferentes de zero.");
 const ids=mapped.map(x=>x.external_id);const {data:old}=await supabase.from("bank_transactions").select("external_id").eq("user_id",data.user.id).in("external_id",ids);const oldSet=new Set((old||[]).map(x=>x.external_id));const fresh=mapped.filter(x=>!oldSet.has(x.external_id)).map(({_key,...x})=>x);if(fresh.length){const {error}=await supabase.from("bank_transactions").insert(fresh);if(error)throw error}inserted=fresh.length;await finishImport(importId,"completed",inserted);setMessage(inserted+" movimento(s) do "+(type==="bank_ton"?"TON":"IF Pago")+" importado(s). "+(mapped.length-inserted)+" já existia(m) e foi(ram) ignorado(s).");
 }else{const card=data.cards[0];if(!card)throw new Error("Cadastre um cartão antes da importação.");
 const dateIdx=headerIndex(headers,"data da transação","data","data da compra"),descIdx=headerIndex(headers,"nome do titular","descrição","descricao"),amountIdx=headerIndex(headers,"valor"),idIdx=headerIndex(headers,"id da transação","id"),instIdx=headerIndex(headers,"parcelas");if(dateIdx<0||descIdx<0||amountIdx<0)throw new Error("Não identifiquei as colunas de data, descrição e valor do cartão.");
 const feeIdx=headerIndex(headers,"taxa"),discountIdx=headerIndex(headers,"desconto"),receivedIdx=headerIndex(headers,"valor recebido"),statusIdx=headerIndex(headers,"status"),holderIdx=headerIndex(headers,"nome do titular"),brandIdx=headerIndex(headers,"bandeira"),methodIdx=headerIndex(headers,"metodo de pagamento"),last4Idx=headerIndex(headers,"cartao ultimos 4 digitos"),captureIdx=headerIndex(headers,"metodo de captura"),cardTypeIdx=headerIndex(headers,"tipo de cartao"),serialIdx=headerIndex(headers,"numero de serie");
 const mapped=rows.map(r=>{const gross=Math.abs(parseMoney(r[amountIdx])),fee=Math.abs(parseMoney(r[feeIdx])),discount=Math.abs(parseMoney(r[discountIdx])),received=receivedIdx>=0?Math.abs(parseMoney(r[receivedIdx])):Math.max(0,gross-discount);return {user_id:data.user.id,card_account_id:card.id,fact_date:parseExcelDate(r[dateIdx]),competence_date:parseExcelDate(r[dateIdx]),description:String(r[holderIdx>=0?holderIdx:descIdx]||"Venda cartão importada"),category_id:null,total_amount:gross,gross_amount:gross,fee_amount:fee,discount_amount:discount,received_amount:received,transaction_status:String(r[statusIdx]??"").trim()||null,holder_name:String(r[holderIdx]??"").trim()||null,brand:String(r[brandIdx]??"").trim()||null,payment_method:String(r[methodIdx]??"").trim()||null,last4:String(r[last4Idx]??"").trim()||null,capture_method:String(r[captureIdx]??"").trim()||null,card_type:String(r[cardTypeIdx]??"").trim()||null,serial_number:String(r[serialIdx]??"").trim()||null,installments:Math.max(1,parseInt(String(r[instIdx]??"").split("").filter(ch=>ch>="0"&&ch<="9").join(""),10)||1),source:"excel",external_id:(String(r[idIdx]??"").trim()?("card:"+String(r[idIdx]).trim()):null)}}).filter(x=>x.total_amount>0);
 const ids=mapped.map(x=>x.external_id).filter(Boolean);let oldSet=new Set();if(ids.length){const {data:old}=await supabase.from("card_transactions").select("external_id").eq("user_id",data.user.id).in("external_id",ids);oldSet=new Set((old||[]).map(x=>x.external_id))}const fresh=mapped.filter(x=>!x.external_id||!oldSet.has(x.external_id));for(const t of fresh){const {data:created,error}=await supabase.from("card_transactions").insert(t).select("id").single();if(error)throw error;const n=t.installments,base=Math.floor(t.total_amount/n*100)/100;let acc=0;for(let k=1;k<=n;k++){const amount=k===n?Number((t.total_amount-acc).toFixed(2)):base;acc+=amount;const d=new Date(t.fact_date+"T12:00:00");d.setMonth(d.getMonth()+k-1);const due=new Date(d.getFullYear(),d.getMonth(),Number(card.due_day||10));await supabase.from("card_installments").insert({card_transaction_id:created.id,installment_number:k,due_date:due.toISOString().slice(0,10),amount,status:"open"})}inserted++}await finishImport(importId,"completed",inserted);setMessage(inserted+" compra(s) de cartão importada(s). "+(mapped.length-inserted)+" já existia(m) e foi(ram) ignorada(s).")}
 data.reload();
 }catch(error){if(importId){try{await finishImport(importId,"error",0)}catch(finishError){console.error("Não foi possível registrar a falha da importação:",finishError)}}const detail=[error?.message,error?.details,error?.hint,error?.code].filter(Boolean).map(String).filter((v,i,a)=>a.indexOf(v)===i).join(" — ");console.error("Falha na importação bancária:",error);setMessage("ERRO NA IMPORTAÇÃO: "+(detail||"falha inesperada. Abra o console para detalhes."))}finally{setBusy(false)}}
 return (
  <main className="content">
    <div className="page-head">
      <div>
        <h2>Dados / Importações / Backup</h2>
        <p>Importe Excel/CSV do iFood, BeeFood, WhatsApp, iFood Pago, TON e cartão de crédito sem duplicar lançamentos.</p>
      </div>
      <button className="ghost" onClick={()=>downloadCSV(data.bankTx,"backup-extrato.csv")}><Download size={16}/>Backup CSV</button>
    </div>
    <section className="panel">      <h3>Importar Excel / CSV</h3>
      <div className="form-grid">
        <Field label="Origem">
          <select value={source} onChange={e=>setSource(e.target.value)}>
            <option value="ifood">iFood — vendas</option>
            <option value="beefood">BeeFood — vendas</option>
            <option value="whatsapp">WhatsApp — vendas via Excel</option>
            <option value="bank_ifood">Banco — IF Pago</option>
            <option value="bank_ton">Banco — TON</option>
            <option value="cartao">Cartão de crédito — fatura</option>
            <option value="auto">Detectar automaticamente</option>
          </select>
        </Field>
        <Field label="Arquivo">
          <input type="file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" onChange={onFile}/>
        </Field>
      </div>
      {sheetSource && <p className="success">Formato identificado: {sheetSource==="ifood"?"iFood":sheetSource==="beefood"?"BeeFood":sheetSource==="whatsapp"?"WhatsApp — vendas":sheetSource==="cartao"?"Cartão":sheetSource==="bank_ton"?"Banco TON":"Banco IF Pago"}.</p>}
      {preview.length>0 && (
        <>
          <div className="table-wrap" style={{marginTop:16}}>
            <table>
              <thead><tr>{preview[0].map((h,i)=><th key={i}>{h||"—"}</th>)}</tr></thead>
              <tbody>{preview.slice(1,11).map((r,i)=><tr key={i}>{preview[0].map((_,j)=><td key={j}>{String(r[j]??"")}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <button className="primary" disabled={busy} onClick={importFile}>{busy?"Importando...":"Importar "+rowsForImport().length+" linhas"}</button>{message&&<div role="alert" className={message.startsWith("ERRO NA IMPORTAÇÃO:")||message.includes("não foi")?"error":"success"} style={{marginTop:12,padding:12,borderRadius:8,overflowWrap:"anywhere"}}>{message}</div>}
        </>
      )}
    </section>
    {message && <section className="panel"><div className={message.includes("Erro")||message.includes("não foi")?"error":"success"}>{message}</div></section>}
  </main>
 )
}
function TableToolbar({search,setSearch,exportData}){return <div className="filters"><div className="search"><Search size={16}/><input placeholder="Pesquisar..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="ghost" onClick={exportData}><Download size={16}/>CSV</button></div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Modal({title,onClose,children}){return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
function EmptyRow({text}){return <tr><td colSpan="9" className="empty-row">{text}</td></tr>}
function downloadCSV(rows,name){const clean=rows.map(r=>Object.fromEntries(Object.entries(r).filter(([k,v])=>typeof v!=="object"&&k!=="id")));const keys=[...new Set(clean.flatMap(r=>Object.keys(r)))];const csv=[keys.join(";"),...clean.map(r=>keys.map(k=>String(r[k]??"").replaceAll(";"," ")).join(";"))].join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=name;a.click();URL.revokeObjectURL(a.href)}

function useData(user){
 const [state,setState]=useState({banks:[],categories:[],channels:[],suppliers:[],cards:[],sales:[],bankTx:[],payables:[],receivables:[],manualExpenses:[],cashMovements:[],products:[],purchases:[],loading:true,error:""});
 const [search,setSearch]=useState(""),[bankFilter,setBankFilter]=useState(""),[payFilter,setPayFilter]=useState("");
 async function reload(){
  if(!user?.id||!supabase){setState(s=>({...s,loading:false,error:"Não foi possível acessar o Supabase."}));return}
  setState(s=>({...s,loading:true,error:""}));
  const uid=user.id;
  const queries=[
   ["bancos",()=>supabase.from("bank_accounts").select("*").eq("user_id",uid).eq("active",true).order("name")],
   ["categorias",()=>supabase.from("categories").select("*").eq("user_id",uid).eq("active",true).order("classification").order("name")],
   ["canais",()=>supabase.from("channels").select("*").eq("user_id",uid).eq("active",true).order("name")],
   ["fornecedores",()=>supabase.from("suppliers").select("*").eq("user_id",uid).eq("active",true).order("name")],
   ["cartões",()=>supabase.from("card_accounts").select("*").eq("user_id",uid).eq("active",true).order("name")],
   ["vendas",()=>supabase.from("sales").select("*,channels(name),sale_items(*)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(5000)],
   ["movimentos bancários",()=>supabase.from("bank_transactions").select("*,bank_accounts(name),categories(name)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(5000)],
   ["contas a pagar",()=>supabase.from("payables").select("*,suppliers(name),categories(name)").eq("user_id",uid).order("due_date",{ascending:true}).limit(5000)],
   ["recebimentos",()=>supabase.from("receivables").select("*").eq("user_id",uid).order("expected_date",{ascending:true}).limit(5000)],
   ["despesas manuais",()=>supabase.from("manual_expenses").select("*,categories(name)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(5000)],
   ["movimentos de caixa",()=>supabase.from("cash_movements").select("*").eq("user_id",uid).order("fact_date",{ascending:false}).limit(5000)],
   ["produtos",()=>supabase.from("products").select("*,categories(name)").eq("user_id",uid).eq("active",true).order("name")],
   ["compras",()=>supabase.from("purchases").select("*,suppliers(name),categories(name)").eq("user_id",uid).order("fact_date",{ascending:false}).limit(500)]
  ];
  try{
   const results=await Promise.all(queries.map(async([name,fn])=>{try{return [name,await fn()]}catch(error){return [name,{data:[],error}]} }));
   const failed=results.filter(([,r])=>r?.error);
   if(failed.length)console.warn("Consultas com erro:",failed.map(([name,r])=>({name,error:r.error?.message||String(r.error)})));
   const get=name=>results.find(([n])=>n===name)?.[1]?.data||[];
   setState({banks:get("bancos"),categories:get("categorias"),channels:get("canais"),suppliers:get("fornecedores"),cards:get("cartões"),sales:get("vendas"),bankTx:get("movimentos bancários"),payables:get("contas a pagar"),receivables:get("recebimentos"),manualExpenses:get("despesas manuais"),cashMovements:get("movimentos de caixa"),products:get("produtos"),purchases:get("compras"),loading:false,error:failed.length?"Alguns dados não puderam ser carregados ("+failed.length+" consulta(s)).":""});
  }catch(error){console.error("Erro ao carregar dados:",error);setState(s=>({...s,loading:false,error:error?.message||"Erro ao carregar seus dados."}))}
 }
 useEffect(()=>{reload()},[user?.id]);
 const filterText=x=>!search||JSON.stringify(x).toLowerCase().includes(search.toLowerCase());
 return {...state,reload,search,setSearch,bankFilter,setBankFilter,payFilter,setPayFilter,sales:state.sales.filter(filterText),bankTx:state.bankTx.filter(x=>(!bankFilter||x.bank_account_id===bankFilter)&&filterText(x)),payables:state.payables.filter(x=>(!payFilter||x.status===payFilter)&&filterText(x))};
}
export default function App(){ const [user,setUser]=useState(null),[active,setActive]=useState("dashboard"),[mobile,setMobile]=useState(false),data=useData(user||{id:""});
 useEffect(()=>{if(!supabase)return;let mounted=true;supabase.auth.getSession().then(({data})=>{if(mounted&&data.session?.user){setUser(data.session.user);seedUser(data.session.user).catch(error=>console.warn("Erro ao preparar dados iniciais:",error))}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(!mounted)return;setUser(s?.user??null);if(s?.user)seedUser(s.user).catch(error=>console.warn("Erro ao preparar dados iniciais:",error))});return()=>{mounted=false;subscription.unsubscribe()}},[]);
 async function logout(){await supabase?.auth.signOut();setUser(null)}
 if(!user)return <Login onLogin={setUser}/>;
 const current=modules.find(m=>m[0]===active), Icon=current?.[2];
 return <div className="app"><aside className={mobile?"sidebar open":"sidebar"}><div className="logo"><span>🍕</span><div><b>Pizzaria</b><small>GESTÃO</small></div><button className="close" onClick={()=>setMobile(false)}><X size={20}/></button></div><nav>{modules.map(([id,label,I])=><button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setMobile(false)}}><I size={19}/>{label}</button>)}</nav><button className="logout" onClick={logout}><LogOut size={18}/>Sair</button></aside>
 <div className="main"><header><button className="menu" onClick={()=>setMobile(true)}><Menu/></button><div className="header-title">{Icon&&<Icon size={18}/>} {current?.[1]}</div><div className="header-user">{user.email}</div></header>
 {data.loading?<main className="content"><section className="panel empty"><RefreshCw className="spin"/><h3>Carregando seus dados...</h3></section></main>:
 <ModuleErrorBoundary key={active}>{active==="dashboard"?<Dashboard data={data}/>:active==="vendas"?<Vendas data={{...data,user}}/>:active==="recebimentos"?<Recebimentos data={data}/>:active==="bancos"?<Bancos data={{...data,user}}/>:active==="cartoes"?<Cartoes data={{...data,user}}/>:active==="caixa"?<Caixa data={data}/>:active==="contas"?<Contas data={{...data,user}}/>:active==="compras"?<Compras data={{...data,user}}/>:active==="despesas"?<Despesas data={{...data,user}}/>:active==="cardapio"?<Cardapio data={{...data,user}}/>:active==="conciliacao"?<Conciliacao data={{...data,user}}/>:active==="dados"?<Dados data={{...data,user}}/>:active==="relatorios"?<Relatorios data={data}/>:<Cadastros data={{...data,user}}/>}</ModuleErrorBoundary>}
 </div></div>
}
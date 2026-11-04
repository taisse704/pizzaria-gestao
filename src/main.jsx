import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Identifica cada sistema na aba do navegador, sem alterar a aplicação de Vendas.
if (typeof window !== "undefined") {
  document.title = window.location.pathname.includes("/financeiro")
    ? "Gestão Financeira | Pizzaria"
    : "Pizzaria Gestão | Vendas";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
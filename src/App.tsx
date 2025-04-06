import { useState, useEffect } from "react";
import { Search, LoaderCircle, Moon, Sun } from "lucide-react";
import "./style.css";
import { toast } from "react-toastify";
import api from "./service/api";

interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function App() {
  const [input, setInput] = useState("");
  const [cep, setCep] = useState<CepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<CepData[]>(() => {
    const saved = localStorage.getItem("cepSearchHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const notify = (msg: string, toastType: string) =>
    toast(msg, { type: toastType });

  useEffect(() => {
    localStorage.setItem("cepSearchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  async function handleSearch() {
    if (input === "") {
      notify("Informe o CEP!", "warning");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<CepData>(`${input}/json`);

      if (response.data.erro) {
        notify("CEP não encontrado!", "error");
        setLoading(false);
        return;
      }

      setCep(response.data);
      setInput("");

      if (!searchHistory.some((item) => item.cep === response.data.cep)) {
        setSearchHistory((prev) => [response.data, ...prev.slice(0, 4)]);
      }

      notify("CEP encontrado com sucesso!", "success");
      setLoading(false);
    } catch (error) {
      notify("Ops, erro ao buscar!", "error");
      setInput("");
      setLoading(false);
    }
  }

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "dark" : "light"
    );
  };

  return (
    <div className="container">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <h1 className="title">Buscador De CEP</h1>

      <div className="containerInput">
        <input
          type="text"
          placeholder="Digite Um CEP..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <button
          className="buttonSearch"
          onClick={handleSearch}
        >
          {loading ? <LoaderCircle className="loading-icon" /> : <Search />}
        </button>
      </div>

      {cep && (
        <main className="main">
          {loading ? (
            <LoaderCircle className="svg"/>
          ) : (
            <>
              <h2>CEP: {cep.cep}</h2>
              <span>
                {cep.logradouro} <br />
              </span>
              <span>
                Complemento: {cep.complemento} <br />
              </span>
              <span>
                Bairro: {cep.bairro} <br />
              </span>
              <span>
                {cep.localidade} <br />
              </span>
              <span>Estado: {cep.uf}</span>
            </>
          )}
        </main>
      )}

      {searchHistory.length > 0 && (
        <div className="history">
          <h3>Últimas buscas:</h3>
          <ul>
            {searchHistory.map((item) => (
              <li
                key={item.cep}
                onClick={() => {
                  setInput(item.cep);
                  handleSearch();
                }}
              >
                {item.cep} - {item.localidade}/{item.uf}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { MatchReview } from "@/components/MatchReview";
import { ReportModal } from "@/components/ReportModal";
import { Input } from "@/components/ui/input";
import { useMatchReview  } from "@/hooks/useMatchReview";
import type { MatchEntry,ResultEntry } from "@/types/dataset";
import React, { useEffect, useState } from "react";
import BDDLogo from "@/assets/207344118.png";

const STORAGE_KEY = "match-review-progress";

const Home: React.FC = () => {
  const [data, setData] = useState<MatchEntry[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [randomize, setRandomize] = useState(false);
  const [initialResults, setInitialResults] = useState<ResultEntry[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [filename, setFilename] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== "string") throw new Error("Formato inválido");
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("O arquivo deve conter um array de entradas");

        setFilename(file.name);
        setData(parsed);
        setFileError(null);
      } catch (e) {
        console.error("Erro ao parsear JSON:", e);
        setFileError("Erro ao ler o arquivo JSON.");
      }
    };

    reader.readAsText(file);
  }

  // Restaurar progresso quando filename e data estiverem prontos
  useEffect(() => {
    if (!filename || !data) return;

    const saved = localStorage.getItem(`${STORAGE_KEY}-${filename}`);
    if (saved) {
      try {
        const parsedProgress = JSON.parse(saved);
        console.log(`parsedProgress.index => ${parsedProgress.index}`);

        setInitialResults(parsedProgress.results || []);
        setInitialIndex(parsedProgress.index || 0);
        setRandomize(parsedProgress.randomize || false);
      } catch (e) {
        console.warn("Erro ao restaurar progresso:", e);
      }
    } else {
      setInitialResults([]);
      setInitialIndex(0);
    }

    setRestored(true);
  }, [filename, data]);

  const {
    current,
    index,
    total,
    respond,
    results,
    isDone
  } = useMatchReview(
    data || [],
    randomize,
    initialResults,
    initialIndex
  );

  console.log(`index useMatchReview => ${index}`);

  // Salvar progresso
  useEffect(() => {
    if (!filename || !data || results.length === 0) return;

    const save = {
      results,
      index,
      randomize
    };
    localStorage.setItem(`${STORAGE_KEY}-${filename}`, JSON.stringify(save));
  }, [results, index, randomize, data, filename]);

  if (!restored && filename && data) return null;

  if (!data || data.length === 0) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center p-6 space-y-4 bg-[#f2ebe0]">
        <h1 className="text-2xl font-bold">Analisador de Matches Gherkin</h1>
        <img src={BDDLogo} alt="Logo" />

        <Input className="w-80 bg-white" type="file" accept=".json" onChange={handleFileUpload} />

        {fileError && <p className="text-red-600">{fileError}</p>}

        <button
          onClick={() => {
            if (filename) {
              localStorage.removeItem(`${STORAGE_KEY}-${filename}`);
            }
            window.location.reload();
          }}
          className="text-sm text-red-600 underline mt-4"
        >
          Limpar progresso salvo
        </button>
      </div>
    );
  }

  return (
    <div>
      {isDone ? (
        <ReportModal results={results} />
      ) : (
        current && <MatchReview entry={current} onAnswer={respond} index={index} total={total} />
      )}
    </div>
  );
};

export default Home;
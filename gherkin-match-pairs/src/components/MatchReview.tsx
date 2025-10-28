import type { MatchEntry } from "../types/dataset";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface Props {
  entry: MatchEntry;
  onAnswer: (correct: boolean) => void;
  index: number;
  total: number;
}

function detectLanguageFromExtension(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "";

  const LANGUAGE_MAP: Record<string, string[]> = {
    typescript: ["ts", "tsx"],
    javascript: ["js", "jsx", "mjs", "cjs"],
    java: ["java"],
    kotlin: ["kt", "kts"],
    scala: ["scala"],
    ruby: ["rb"],
    go: ["go"],
    lua: ["lua"],
    cpp: ["cpp", "cc", "cxx", "c++", "hpp", "h", "hxx", "h++"],
    ocaml: ["ml", "mli"],
    xml: ["xml"],
  };

  for (const [lang, exts] of Object.entries(LANGUAGE_MAP)) {
    if (exts.includes(extension)) return lang;
  }

  return "text"; // fallback
}

export function MatchReview({ entry, onAnswer, index, total }: Props) {
  const [lineLimit, setLineLimit] = useState(10);
  const featureLang = "gherkin";
  const matchedLang = detectLanguageFromExtension(entry.matched_file);

  function limitLines(content: string): string {
    const lines = content.split("\n");
    return lines.length <= lineLimit
      ? content
      : [...lines.slice(0, lineLimit), "# ... conteúdo truncado"].join("\n");
  }

  useEffect(() => {
    setLineLimit(10);
  }, [entry]);

  const featureLines = entry.feature_content?.split("\n") ?? [];
  const matchedLines = entry.matched_content?.split("\n") ?? [];
  const maxLines = Math.max(featureLines.length, matchedLines.length);
  const canShowMore = lineLimit < maxLines;

  if (!entry || !entry.feature_file || !entry.matched_file) {
    return <div className="text-red-500">⚠️ Entrada inválida. Verifique o dataset.</div>;
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <header className="fixed top-0 w-full h-10 bg-[#f2ebe0] flex items-center justify-center">
        <h1 className="font-normal text-2xl">
          Match <span className="font-semibold">{index + 1}/{total}</span>
        </h1>
      </header>

      <div className="space-y-2 mt-12 px-4">
        <p><strong>Feature File:</strong> {entry.feature_file}</p>
        <p><strong>Matched File:</strong> {entry.matched_file}</p>
      </div>

      <div className="w-full flex gap-x-2 px-4">
        <div className="w-1/2">
          <h3 className="font-semibold mt-4 mb-2">Conteúdo do Feature File:</h3>
          <SyntaxHighlighter
            language={featureLang}
            style={oneDark}
            wrapLongLines
            customStyle={{ maxHeight: 600, borderRadius: 8, fontSize: "0.85rem" }}
          >
            {limitLines(entry.feature_content || "# Sem conteúdo")}
          </SyntaxHighlighter>
        </div>

        <div className="w-1/2">
          <h3 className="font-semibold mt-4 mb-2">Código do Matched File:</h3>
          <SyntaxHighlighter
            language={matchedLang}
            style={oneDark}
            wrapLongLines
            customStyle={{ maxHeight: 600, borderRadius: 8, fontSize: "0.85rem" }}
          >
            {limitLines(entry.matched_content || "// Sem conteúdo")}
          </SyntaxHighlighter>
        </div>
      </div>

      {canShowMore && (
        <div className="text-center my-2">
          <Button variant="outline" onClick={() => setLineLimit((prev) => prev + 50)}>
            Mostrar Mais
          </Button>
        </div>
      )}

      <div className="fixed bottom-2 flex w-full pt-4 items-center justify-center gap-x-4">
        <Button className="bg-green-500 hover:bg-green-600 text-white text-xl px-20 py-6 rounded cursor-pointer" onClick={() => onAnswer(true)}>
          Correto
        </Button>
        <Button className="bg-red-500 hover:bg-red-600 text-white text-xl px-20 py-6 rounded cursor-pointer" onClick={() => onAnswer(false)}>
          Incorreto
        </Button>
      </div>
    </div>
  );
}

import type { ResultEntry } from "../types/dataset";
import { saveAs } from "file-saver";

export function ReportModal({ results }: { results: ResultEntry[] }) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const incorrect = total - correct;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  function downloadIncorrect() {
    const incorrectEntries = results.filter((r) => !r.correct);
    const blob = new Blob([JSON.stringify(incorrectEntries, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "respostas_incorretas.json");
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#f2ebe0]">
      <div className="p-8 w-4/5 h-4/5 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-between">
        <h2 className="text-2xl font-bold text-center text-gray-800">📊 Relatório Final</h2>

        <div className="space-y-2">
          <p className="text-lg"><strong>Total Avaliado:</strong> {total}</p>
          <p className="text-green-600"><strong>Corretos:</strong> {correct}</p>
          <p className="text-red-600"><strong>Incorretos:</strong> {incorrect}</p>
        </div>

        <div className="w-full">
          <p className="font-medium text-sm text-gray-700 mb-1">Precisão geral:</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-4 text-xs text-white text-center"
              style={{ width: `${percent}%` }}
            >
              {percent}%
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={downloadIncorrect}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow"
          >
            📥 Baixar Incorretos
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
          >
            🔄 Recomeçar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}

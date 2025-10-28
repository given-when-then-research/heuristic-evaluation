import { useMemo, useState, useEffect } from "react";
import type { MatchEntry,ResultEntry } from "../types/dataset";

export function computeDataHash(data: MatchEntry[]): string {
  const baseString = JSON.stringify(
    data.map(d => d.feature_file + d.matched_file).sort()
  );
  return btoa(baseString.slice(0, 500));
}

export function useMatchReview(
  data: MatchEntry[],
  randomize: boolean,
  initialResults: ResultEntry[] = [],
  initialIndex: number = 0
) {
  const safeLimit = data.length;

  const shuffled = useMemo(() => {
    const base = [...data];
    if (randomize) {
      for (let i = base.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [base[i], base[j]] = [base[j], base[i]];
      }
    }
    return base.slice(0, safeLimit);
  }, [data, safeLimit, randomize]);

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ResultEntry[]>([]);

  useEffect(() => {
    setIndex(initialIndex);
    setResults(initialResults);
  }, [initialIndex, initialResults, shuffled]);

  const isDone = index >= shuffled.length;
  const current = !isDone ? shuffled[index] : null;

  function respond(correct: boolean) {
    if (!isDone && current) {
      const entry: ResultEntry = {
        feature_file: current.feature_file,
        matched_file: current.matched_file,
        confidence: current.confidence,
        correct
      };
      setResults(prev => [...prev, entry]);
      setIndex(prev => prev + 1);
    }
  }

  return {
    current,
    index,
    total: shuffled.length,
    respond,
    results, // <- ResultEntry[]
    isDone,
    shuffled,
    hash: computeDataHash(data)
  };
}

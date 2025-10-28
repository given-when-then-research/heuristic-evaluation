export interface MatchReason {
    [key: string]: number;
}

export interface MatchEntry {
    feature_file: string;
    matched_file: string;
    confidence: number;
    reasons: MatchReason;
    feature_content: string;
    matched_content: string;
}

export type ResultEntry = {
  feature_file: string;
  matched_file: string;
  confidence: number;
  correct: boolean;
};
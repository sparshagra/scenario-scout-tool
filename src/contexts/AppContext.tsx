import { createContext, useContext, useState, ReactNode } from "react";

interface Citation {
  chunk: string;
  heading: string;
  line: number;
  quote: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

interface SearchResult {
  query: string;
  result: string;
  citations?: Citation[];
}

interface Highlight {
  text: string;
  explanation?: string;
}

interface Risk {
  text: string;
  risk_flag?: string;
}

interface HighlightsData {
  highlights: Highlight[];
  risks: Risk[];
}

interface ScoreData {
  scores: {
    cost: { score: number; why: string };
    timeline: { score: number; why: string };
    compliance: { score: number; why: string };
    design: { score: number; why: string };
    sustainability: { score: number; why: string };
  };
  final_score: number;
  strength: { what: string; why: string };
  weakness: { what: string; why: string };
  next_steps: Array<{
    step: string;
    why: string;
    impact: string;
    how_it_helps: string;
  }>;
}

interface AppContextType {
  documentId: string | null;
  setDocumentId: (id: string | null) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[] | ((prev: SearchResult[]) => SearchResult[])) => void;
  highlightsData: HighlightsData;
  setHighlightsData: (data: HighlightsData) => void;
  scoreData: ScoreData | null;
  setScoreData: (data: ScoreData | null) => void;
  adjustedScores: {
    cost: number;
    timeline: number;
    compliance: number;
    design: number;
    sustainability: number;
  } | null;
  setAdjustedScores: (scores: {
    cost: number;
    timeline: number;
    compliance: number;
    design: number;
    sustainability: number;
  } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightsData, setHighlightsData] = useState<HighlightsData>({
    highlights: [],
    risks: [],
  });
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [adjustedScores, setAdjustedScores] = useState<{
    cost: number;
    timeline: number;
    compliance: number;
    design: number;
    sustainability: number;
  } | null>(null);

  return (
    <AppContext.Provider
      value={{
        documentId,
        setDocumentId,
        messages,
        setMessages,
        searchResults,
        setSearchResults,
        highlightsData,
        setHighlightsData,
        scoreData,
        setScoreData,
        adjustedScores,
        setAdjustedScores,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

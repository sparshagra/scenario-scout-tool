import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2, AlertTriangle, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

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

const VisualInsights = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [data, setData] = useState<HighlightsData>({ highlights: [], risks: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ query: string; result: string }>>([]);

  const documentId = localStorage.getItem("documentId");

  useEffect(() => {
    const fetchHighlights = async () => {
      if (!documentId) {
        toast({
          title: "No Document",
          description: "Please upload a document first",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/highlights"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch highlights");
        }

        const highlightsData: HighlightsData = await response.json();
        setData(highlightsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load insights. Make sure the backend is running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, [documentId, toast]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !documentId) return;

    setSearchLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: searchQuery }),
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults((prev) => [
        ...prev,
        { query: searchQuery, result: data.answer },
      ]);
      setSearchQuery("");
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search document. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto p-4 max-w-6xl">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            AI Visual Insights
          </h1>
          <p className="text-muted-foreground">
            Discover key highlights and potential risks in your document
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Key Highlights Found
                  </p>
                  <p className="text-4xl font-bold text-success">
                    {data.highlights.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)] bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Risks Identified
                  </p>
                  <p className="text-4xl font-bold text-warning">
                    {data.risks.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Highlights Section */}
        <Card className="mb-8 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.highlights.length > 0 ? (
              <div className="space-y-4">
                {data.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-success/5 border border-success/20 hover:bg-success/10 transition-colors"
                  >
                    <p className="font-medium text-foreground mb-1">
                      {highlight.text}
                    </p>
                    {highlight.explanation && (
                      <p className="text-sm text-muted-foreground">
                        {highlight.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No highlights found in the document
              </p>
            )}
          </CardContent>
        </Card>

        {/* Risks Section */}
        <Card className="mb-8 shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Identified Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.risks.length > 0 ? (
              <div className="space-y-4">
                {data.risks.map((risk, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-warning/5 border border-warning/20 hover:bg-warning/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground mb-1">
                          {risk.text}
                        </p>
                        {risk.risk_flag && (
                          <p className="text-sm text-muted-foreground">
                            {risk.risk_flag}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No risks identified in the document
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search Chatbot */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Document Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl px-4 py-2 max-w-[80%]">
                          {result.query}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2 max-w-[80%]">
                          {result.result}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search document..."
                  disabled={searchLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {searchLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VisualInsights;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import Navigation from "@/components/Navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    chunk: string;
    heading: string;
    line: number;
    quote: string;
  }>;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { documentId, setDocumentId, messages, setMessages } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    // Add all selected files
    Array.from(files).forEach((file) => {
      formData.append("file", file);  
    });

    try {
      const response = await fetch("https://whatif-ragbased-chatbot.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setDocumentId(data.doc_id);
      setUploadedFile(Array.from(files).map(f => f.name).join(', '));
      
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Make sure the backend is running.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!documentId) {
      toast({
        title: "No Document",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("question", input);
      const response = await fetch("https://whatif-ragbased-chatbot.onrender.com/ask", {
        method: "POST",
        body: formData,
      }); 

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      
      // Parse the response to extract answer and citations
      let parsedData;
      try {
        parsedData = typeof data.answer === 'string' ? JSON.parse(data.answer) : data.answer;
      } catch {
        parsedData = { answer: data.answer, citations: [] };
      }
      
      // const assistantMessage: Message = {
      //   role: "assistant",
      //   content: parsedData.answer || data.answer,
      //   citations: parsedData.citations || []
      // };

      // Helper to extract key insights compactly
      const extractInsights = (obj: any): string => {
        if (!obj || typeof obj !== "object") return "";
        let out = "";

        const sections = ["cost_impact", "schedule_impact", "resource_impact", "recommended_mitigation"];
        for (const key of sections) {
          if (obj[key]?.analysis) {
            out += `\n\n💡 ${key.replace("_", " ").toUpperCase()}: ${obj[key].analysis}`;
            if (obj[key]?.why) out += `\n🧭 Why: ${obj[key].why}`;
          }
        }

        // Add key consequences (first 2)
        if (Array.isArray(obj.consequences) && obj.consequences.length > 0) {
          const topCons = obj.consequences.slice(0, 2);
          out += `\n\n⚠️ Key Consequences:`;
          for (const c of topCons) {
            out += `\n- ${c.what}: ${c.why}`;
          }
        }

        // Add alternative strategy (first one)
        if (Array.isArray(obj.alternative_strategies) && obj.alternative_strategies[0]) {
          const alt = obj.alternative_strategies[0];
          out += `\n\n🛠️ Alternative Strategy: ${alt.strategy}\nWhy: ${alt.why}`;
        }

        return out.trim();
      };

      const combinedContent = (() => {
        if (parsedData.answer) {
          const insights = extractInsights(parsedData);
          return `${parsedData.answer}\n\n${insights}`;
        }
        return JSON.stringify(parsedData, null, 2);
      })();

      const assistantMessage: Message = {
        role: "assistant",
        content: combinedContent,
        citations:
          parsedData.citations ||
          parsedData.cost_impact?.citations ||
          parsedData.recommended_mitigation?.citations ||
          []
      };





      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Make sure the backend is running.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto p-4 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Document Chat
          </h1>
          <p className="text-muted-foreground">
            Upload your documents and ask questions
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6 shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".pdf,.docx,.txt,.csv,.xlsx,.ifc,.bim,.dwg,.dxf,.jpg,.jpeg,.png"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </>
                )}
              </Button>
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 text-success" />
                  <span>{uploadedFile}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Supported formats: PDF, DOCX, TXT, CSV, XLSX, IFC, BIM, DWG, DXF, JPG, JPEG, PNG
            </p>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-4 shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Upload a document and start asking questions
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                    
                    {/* Show citations if available */}
                    {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted/50 border border-border">
                          <p className="text-xs font-semibold mb-2 text-muted-foreground">📄 Source References:</p>
                          <div className="space-y-1.5">
                            {message.citations.map((citation, idx) => (
                              <div key={idx} className="text-xs">
                                <p className="font-medium">{citation.chunk} - {citation.heading} (Line {citation.line})</p>
                                <p className="text-muted-foreground italic mt-0.5">"{citation.quote}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your document..."
                disabled={loading || !documentId}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim() || !documentId}
                size="icon"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => navigate("/scenario-tuning")}
            variant="outline"
            className="flex-1 h-16 border-2 hover:border-primary hover:bg-primary/5 transition-all"
            disabled={!documentId}
          >
            <div className="text-left">
              <div className="font-semibold">Scenario Tuning</div>
              <div className="text-xs text-muted-foreground">
                Adjust project parameters
              </div>
            </div>
          </Button>
          <Button
            onClick={() => navigate("/visual-insights")}
            variant="outline"
            className="flex-1 h-16 border-2 hover:border-accent hover:bg-accent/5 transition-all"
            disabled={!documentId}
          >
            <div className="text-left">
              <div className="font-semibold">AI Visual Insights</div>
              <div className="text-xs text-muted-foreground">
                View highlights and risks
              </div>
            </div>
          </Button>
        </div>

        {!documentId && (
          <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning-foreground">Upload a document to get started</p>
              <p className="text-muted-foreground mt-1">
                You need to upload at least one document before you can chat or access other features.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;

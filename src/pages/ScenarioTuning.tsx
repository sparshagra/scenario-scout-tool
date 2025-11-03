import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface ScoreData {
  final_score: number;
  parameters: {
    budget: number;
    timeline: number;
    workforce: number;
    market_cost: number;
  };
}

const ScenarioTuning = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [initialScore, setInitialScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [weights, setWeights] = useState({
    budget: 0.3,
    timeline: 0.2,
    workforce: 0.2,
    market_cost: 0.3,
  });
  const [values, setValues] = useState({
    budget: 50,
    timeline: 50,
    workforce: 50,
    market_cost: 50,
  });
  const [initialValues] = useState({
    budget: 50,
    timeline: 50,
    workforce: 50,
    market_cost: 50,
  });

  const documentId = localStorage.getItem("documentId");

  useEffect(() => {
    const fetchInitialData = async () => {
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
        const response = await fetch("http://127.0.0.1:8000/dashboard?mode=ai", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data: ScoreData = await response.json();
        setInitialScore(data.final_score);
        setCurrentScore(data.final_score);
        setWeights(data.parameters);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load scenario data. Make sure the backend is running.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [documentId, toast]);

  const recalculateScore = (newValues: typeof values) => {
    let scoreChange = 0;
    
    Object.keys(newValues).forEach((key) => {
      const paramKey = key as keyof typeof values;
      const change = newValues[paramKey] - initialValues[paramKey];
      scoreChange += weights[paramKey] * change;
    });

    const newScore = Math.max(0, Math.min(100, initialScore + scoreChange));
    setCurrentScore(Math.round(newScore));
  };

  const handleSliderChange = (param: keyof typeof values, value: number[]) => {
    const newValues = { ...values, [param]: value[0] };
    setValues(newValues);
    recalculateScore(newValues);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 75) return "from-success/20 to-success/5";
    if (score >= 50) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto p-4 max-w-4xl">
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
      
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Scenario Tuning
          </h1>
          <p className="text-muted-foreground">
            Adjust parameters to see how they affect project strength
          </p>
        </div>

        {/* Score Display */}
        <Card className={`mb-8 shadow-[var(--shadow-card)] bg-gradient-to-br ${getScoreGradient(currentScore)} border-2`}>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Project Strength Score
            </p>
            <p className={`text-6xl font-bold ${getScoreColor(currentScore)}`}>
              {currentScore}/100
            </p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  currentScore >= 75
                    ? "bg-success"
                    : currentScore >= 50
                    ? "bg-warning"
                    : "bg-destructive"
                }`}
                style={{ width: `${currentScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parameter Sliders */}
        <div className="grid gap-6">
          {/* Budget */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Budget</CardTitle>
                <span className="text-2xl font-bold text-primary">
                  {values.budget}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Slider
                value={[values.budget]}
                onValueChange={(value) => handleSliderChange("budget", value)}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adjust the budget allocation for this project
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Timeline</CardTitle>
                <span className="text-2xl font-bold text-primary">
                  {values.timeline}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Slider
                value={[values.timeline]}
                onValueChange={(value) => handleSliderChange("timeline", value)}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adjust the project timeline duration
              </p>
            </CardContent>
          </Card>

          {/* Workforce */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Workforce</CardTitle>
                <span className="text-2xl font-bold text-primary">
                  {values.workforce}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Slider
                value={[values.workforce]}
                onValueChange={(value) => handleSliderChange("workforce", value)}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adjust the workforce size and allocation
              </p>
            </CardContent>
          </Card>

          {/* Market Cost */}
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Market Cost</CardTitle>
                <span className="text-2xl font-bold text-primary">
                  {values.market_cost}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Slider
                value={[values.market_cost]}
                onValueChange={(value) => handleSliderChange("market_cost", value)}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Adjust market cost considerations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-secondary/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>How it works:</strong> Adjust the sliders above to see real-time impact on your project strength score. 
              The score is calculated based on weighted parameters from your uploaded document analysis.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ScenarioTuning;

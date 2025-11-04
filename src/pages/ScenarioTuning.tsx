import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

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
  parameters: {
    cost: number;
    timeline: number;
    compliance: number;
    design: number;
    sustainability: number;
  };
}

const ScenarioTuning = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [sliderValues, setSliderValues] = useState({
    cost: 3,
    timeline: 3,
    compliance: 3,
    design: 3,
    sustainability: 3,
  });
  const [mostImpactfulParam, setMostImpactfulParam] = useState<string | null>(null);

  const weights = {
    cost: 0.3,
    timeline: 0.2,
    compliance: 0.2,
    design: 0.1,
    sustainability: 0.2,
  };

  const documentId = localStorage.getItem("documentId");

  const fetchScoreData = async () => {
    if (!documentId) {
      toast({
        title: "No Document",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://whatif-ragbased-chatbot.onrender.com/dashboard?mode=ai", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data: ScoreData = await response.json();
      setScoreData(data);
      setCurrentScore(data.final_score);
      
      // Set initial slider values from API scores
      setSliderValues({
        cost: data.scores.cost.score,
        timeline: data.scores.timeline.score,
        compliance: data.scores.compliance.score,
        design: data.scores.design.score,
        sustainability: data.scores.sustainability.score,
      });

      toast({
        title: "Score Generated",
        description: `Project strength: ${data.final_score.toFixed(2)}/5.0`,
      });
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

  const recalculateScore = (newValues: typeof sliderValues) => {
    // Calculate new final score using weights
    const newScore = Object.keys(weights).reduce((total, param) => {
      const key = param as keyof typeof weights;
      return total + weights[key] * newValues[key];
    }, 0);

    setCurrentScore(newScore);

    // Find which parameter change had the most impact
    if (scoreData) {
      let maxImpact = 0;
      let maxParam = "";
      
      Object.keys(weights).forEach((param) => {
        const key = param as keyof typeof weights;
        const originalValue = scoreData.scores[key].score;
        const impact = Math.abs(weights[key] * (newValues[key] - originalValue));
        
        if (impact > maxImpact) {
          maxImpact = impact;
          maxParam = param;
        }
      });
      
      setMostImpactfulParam(maxImpact > 0 ? maxParam : null);
    }
  };

  const handleSliderChange = (param: keyof typeof sliderValues, value: number[]) => {
    const newValues = { ...sliderValues, [param]: value[0] };
    setSliderValues(newValues);
    recalculateScore(newValues);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-success";
    if (score >= 3) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 4) return "from-success/20 to-success/5";
    if (score >= 3) return "from-warning/20 to-warning/5";
    return "from-destructive/20 to-destructive/5";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Scenario Tuning
          </h1>
          <p className="text-muted-foreground">
            Generate AI-powered project analysis and adjust parameters
          </p>
        </div>

        {!scoreData && (
          <Card className="mb-8 shadow-[var(--shadow-card)]">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Generate an AI-powered evaluation of your project's strength across multiple parameters
              </p>
              <Button 
                onClick={fetchScoreData} 
                disabled={loading}
                size="lg"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing Document...
                  </>
                ) : (
                  "Generate Score"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {scoreData && (
          <>
            {/* Score Display */}
            <Card className={`mb-8 shadow-[var(--shadow-card)] bg-gradient-to-br ${getScoreGradient(currentScore)} border-2`}>
              <CardContent className="p-8 text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Project Strength Score
                </p>
                <p className={`text-6xl font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore.toFixed(2)}/5.0
                </p>
                <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentScore >= 4
                        ? "bg-success"
                        : currentScore >= 3
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${(currentScore / 5) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Strength & Weakness */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-[var(--shadow-card)] border-success/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-5 w-5" />
                    Strongest Aspect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{scoreData.strength.what}</h3>
                  <p className="text-sm text-muted-foreground">{scoreData.strength.why}</p>
                </CardContent>
              </Card>

              <Card className="shadow-[var(--shadow-card)] border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-5 w-5" />
                    Weakest Aspect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{scoreData.weakness.what}</h3>
                  <p className="text-sm text-muted-foreground">{scoreData.weakness.why}</p>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="mb-8 shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoreData.next_steps.map((step, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <h3 className="font-semibold mb-1">{index + 1}. {step.step}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{step.why}</p>
                      <div className="grid md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Impact:</span> {step.impact}
                        </div>
                        <div>
                          <span className="font-medium">How it helps:</span> {step.how_it_helps}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Parameter Sliders */}
            <Card className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <CardTitle>Adjust Parameters</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Move sliders to simulate "what-if" scenarios
                  {mostImpactfulParam && (
                    <span className="block mt-1 text-primary font-medium">
                      💡 {mostImpactfulParam.charAt(0).toUpperCase() + mostImpactfulParam.slice(1)} has the highest impact on score
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cost */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Cost</label>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${mostImpactfulParam === 'cost' ? 'text-primary' : ''}`}>
                        {sliderValues.cost.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/5</span>
                    </div>
                  </div>
                  <Slider
                    value={[sliderValues.cost]}
                    onValueChange={(value) => handleSliderChange("cost", value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scoreData.scores.cost.why}
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Timeline</label>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${mostImpactfulParam === 'timeline' ? 'text-primary' : ''}`}>
                        {sliderValues.timeline.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/5</span>
                    </div>
                  </div>
                  <Slider
                    value={[sliderValues.timeline]}
                    onValueChange={(value) => handleSliderChange("timeline", value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scoreData.scores.timeline.why}
                  </p>
                </div>

                {/* Compliance */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Compliance</label>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${mostImpactfulParam === 'compliance' ? 'text-primary' : ''}`}>
                        {sliderValues.compliance.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/5</span>
                    </div>
                  </div>
                  <Slider
                    value={[sliderValues.compliance]}
                    onValueChange={(value) => handleSliderChange("compliance", value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scoreData.scores.compliance.why}
                  </p>
                </div>

                {/* Design */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Design</label>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${mostImpactfulParam === 'design' ? 'text-primary' : ''}`}>
                        {sliderValues.design.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/5</span>
                    </div>
                  </div>
                  <Slider
                    value={[sliderValues.design]}
                    onValueChange={(value) => handleSliderChange("design", value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scoreData.scores.design.why}
                  </p>
                </div>

                {/* Sustainability */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Sustainability</label>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${mostImpactfulParam === 'sustainability' ? 'text-primary' : ''}`}>
                        {sliderValues.sustainability.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/5</span>
                    </div>
                  </div>
                  <Slider
                    value={[sliderValues.sustainability]}
                    onValueChange={(value) => handleSliderChange("sustainability", value)}
                    min={1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scoreData.scores.sustainability.why}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-secondary/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>How it works:</strong> The AI analyzes your document and scores it across 5 parameters (1-5 scale). 
                  Adjust sliders to see real-time impact using weighted calculation: Cost (30%), Timeline (20%), Compliance (20%), Design (10%), Sustainability (20%).
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default ScenarioTuning;

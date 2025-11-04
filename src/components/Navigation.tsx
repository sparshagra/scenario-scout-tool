import { NavLink } from "react-router-dom";
import { Bot, MessageSquare, Sliders, TrendingUp } from "lucide-react";

const Navigation = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    }`;

  return (
    <nav className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WHATIF
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <NavLink to="/chat" className={navLinkClass}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </NavLink>
            <NavLink to="/scenario-tuning" className={navLinkClass}>
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Scenario Tuning</span>
            </NavLink>
            <NavLink to="/visual-insights" className={navLinkClass}>
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Document Insights</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

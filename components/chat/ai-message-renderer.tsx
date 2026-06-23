import { type ReactNode } from "react";
import { Lightbulb, AlertTriangle, ListChecks } from "lucide-react";

interface Section {
  type: "quick_answer" | "details" | "tips" | "important" | "next_steps" | "text";
  content: string;
  steps?: string[];
}

function parseMessage(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;

  const sectionPattern = /^(🌾|📋|💡|⚠️|📅)\s*(.+?):/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.content += "\n";
      continue;
    }

    const match = trimmed.match(sectionPattern);
    if (match) {
      if (current) sections.push(current);
      const emoji = match[1];
      const rest = trimmed.slice(match[0].length).trim();

      if (emoji === "🌾") {
        current = { type: "quick_answer", content: rest };
      } else if (emoji === "📋") {
        current = { type: "details", content: rest };
      } else if (emoji === "💡") {
        current = { type: "tips", content: rest };
      } else if (emoji === "⚠️") {
        current = { type: "important", content: rest };
      } else if (emoji === "📅") {
        current = { type: "next_steps", content: rest, steps: [] };
      } else {
        current = { type: "text", content: rest };
      }
      continue;
    }

    if (current) {
      if (current.content) current.content += "\n";
      current.content += trimmed;
    } else {
      sections.push({ type: "text", content: trimmed });
    }
  }
  if (current) sections.push(current);

  for (const section of sections) {
    if (section.type === "next_steps") {
      const stepLines = section.content.split("\n");
      const steps: string[] = [];
      const nonStepLines: string[] = [];

      for (const line of stepLines) {
        const stepMatch = line.match(/^(\d+)[\.\)]\s+(.+)/);
        if (stepMatch) {
          steps.push(stepMatch[2]);
        } else {
          nonStepLines.push(line);
        }
      }

      if (steps.length > 0) {
        section.steps = steps;
        section.content = nonStepLines.join("\n").trim();
      }
    }
  }

  return sections;
}

function renderInlineText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*.+?\*\*)/);
  const result: ReactNode[] = [];
  let key = 0;

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      result.push(<strong key={key++}>{part.slice(2, -2)}</strong>);
    } else if (part) {
      result.push(<span key={key++}>{part}</span>);
    }
  }

  return result.length > 0 ? result : [text];
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <p key={i} className={i > 0 ? "mt-2" : ""}>
      {renderInlineText(line)}
    </p>
  ));
}

function QuickAnswerSection({ content }: { content: string }) {
  return (
    <div className="border-l-2 border-primary bg-primary/5 rounded-r-lg px-4 py-3 -ml-3 mb-4">
      <p className="text-[15px] font-medium leading-relaxed text-foreground">
        {renderInlineText(content)}
      </p>
    </div>
  );
}

function DetailsSection({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Details
      </p>
      <div className="text-sm leading-relaxed text-foreground">
        <MarkdownText text={content} />
      </div>
    </div>
  );
}

function TipsSection({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="border-l-2 border-green-500 bg-green-50/50 dark:bg-green-950/20 rounded-r-lg px-4 py-3 -ml-3 mb-4">
      <div className="flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed text-foreground">
          {renderInlineText(content)}
        </p>
      </div>
    </div>
  );
}

function ImportantSection({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="border-l-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-lg px-4 py-3 -ml-3 mb-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed text-foreground">
          {renderInlineText(content)}
        </p>
      </div>
    </div>
  );
}

function NextStepsSection({ content, steps }: { content: string; steps?: string[] }) {
  if (!content && (!steps || steps.length === 0)) return null;

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="w-4 h-4 text-primary" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Next Steps
        </p>
      </div>
      {content && (
        <p className="text-sm leading-relaxed text-foreground mb-2">
          {renderInlineText(content)}
        </p>
      )}
      {steps && steps.length > 0 && (
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                {renderInlineText(step)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function AiMessageRenderer({ content }: { content: string }) {
  const sections = parseMessage(content);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No response</p>;
  }

  if (sections.length === 1 && sections[0].type === "text") {
    return <p className="text-sm whitespace-pre-line leading-relaxed">{content}</p>;
  }

  return (
    <div className="space-y-1">
      {sections.map((section, i) => {
        switch (section.type) {
          case "quick_answer":
            return <QuickAnswerSection key={i} content={section.content} />;
          case "details":
            return <DetailsSection key={i} content={section.content} />;
          case "tips":
            return <TipsSection key={i} content={section.content} />;
          case "important":
            return <ImportantSection key={i} content={section.content} />;
          case "next_steps":
            return <NextStepsSection key={i} content={section.content} steps={section.steps} />;
          default:
            return section.content ? (
              <p key={i} className="text-sm leading-relaxed">
                {renderInlineText(section.content)}
              </p>
            ) : null;
        }
      })}
    </div>
  );
}

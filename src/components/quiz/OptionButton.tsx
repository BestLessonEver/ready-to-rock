import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}

export function OptionButton({ label, selected, onClick, multiSelect = false }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
        "hover:border-primary/50 hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card text-foreground"
      )}
    >
      <span className="font-medium">{label}</span>
      {selected && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
        </span>
      )}
    </button>
  );
}

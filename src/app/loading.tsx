import { Wrench } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
          <Wrench className="h-8 w-8 text-primary animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
        Loading TradeSlot...
      </p>
    </div>
  );
}

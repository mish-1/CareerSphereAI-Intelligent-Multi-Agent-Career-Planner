import { Progress } from "@/components/ui/progress";

export function SkillBars({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.label}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <Progress value={item.value} />
        </div>
      ))}
    </div>
  );
}

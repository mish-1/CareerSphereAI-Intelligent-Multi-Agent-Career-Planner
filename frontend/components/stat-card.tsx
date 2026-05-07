import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-foreground via-primary to-secondary" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
        </div>
        <Badge>{delta}</Badge>
      </div>
    </Card>
  );
}

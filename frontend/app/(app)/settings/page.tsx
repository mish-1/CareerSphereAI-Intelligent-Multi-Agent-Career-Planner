import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthPanel } from "@/components/auth-panel";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <CardDescription>Environment</CardDescription>
        <CardTitle>Deployment and API settings</CardTitle>
        <Input defaultValue="http://localhost:8000/api" readOnly />
        <Input defaultValue="Qdrant + PostgreSQL + Firebase" readOnly />
        <p className="text-sm text-muted-foreground">Set the frontend env file with the backend API URL and Firebase configuration before deployment.</p>
      </Card>

      <AuthPanel />
    </div>
  );
}

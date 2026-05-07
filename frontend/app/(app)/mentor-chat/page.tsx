import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const messages = [
  { role: "Mentor", text: "Pick one target role, then align your portfolio and resume to that role for the next 30 days." },
  { role: "Mentor", text: "Focus on one project that demonstrates architecture, reliability, and deployment." },
  { role: "You", text: "I feel underqualified for internships." },
  { role: "Mentor", text: "You need evidence, not perfection. Apply early, iterate fast, and let feedback improve the next round." },
];

export default function MentorChatPage() {
  return (
    <Card className="space-y-4">
      <CardDescription>Mentor agent</CardDescription>
      <CardTitle>Career mentorship chat</CardTitle>
      <div className="space-y-3 pt-2">
        {messages.map((message) => (
          <div key={message.text} className={`max-w-3xl rounded-2xl border px-4 py-3 ${message.role === "You" ? "ml-auto border-primary bg-primary/10" : "border-border bg-background/80"}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{message.role}</p>
            <p className="mt-2 text-sm leading-6">{message.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

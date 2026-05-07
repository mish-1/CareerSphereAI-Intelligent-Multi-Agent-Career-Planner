export function RoadmapTimeline({ items }: { items: { title: string; note: string }[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.title} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-sm text-background">{index + 1}</div>
            {index < items.length - 1 ? <div className="h-full w-px bg-border" /> : null}
          </div>
          <div className="pb-6">
            <h4 className="font-semibold">{item.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

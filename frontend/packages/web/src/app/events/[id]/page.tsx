export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Event Details</h1>
      <p className="text-muted-foreground">Event ID: {params.id}</p>
      {/* TODO: Implement event detail view */}
    </div>
  );
}

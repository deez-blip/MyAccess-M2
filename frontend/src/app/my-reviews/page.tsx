export default function MyReviewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-6 text-primary">Mes avis</h1>
      <div className="bg-card text-card-foreground rounded-lg border p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Vos avis seront affichés ici.</p>
      </div>
    </div>
  );
}

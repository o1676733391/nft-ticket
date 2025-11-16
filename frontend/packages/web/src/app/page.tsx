export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">
          NFT Ticket Platform
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Decentralized ticketing system powered by blockchain
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🎫 Browse Events</h3>
            <p className="text-muted-foreground">
              Discover upcoming events and purchase NFT tickets
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🏪 Marketplace</h3>
            <p className="text-muted-foreground">
              Buy and sell tickets securely on our marketplace
            </p>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">👤 Manage Tickets</h3>
            <p className="text-muted-foreground">
              View your tickets and generate QR codes for entry
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

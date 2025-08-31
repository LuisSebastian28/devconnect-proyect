function Catalog() {
    return (
        <div>
        <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Welcome to CrowdLend</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our enhanced navigation system with icons, badges, and responsive layouts. Try switching between
            different sections using the navigation buttons above.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Marketplace</h3>
              <p className="text-sm text-muted-foreground">Browse and discover new opportunities</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Project Explorer</h3>
              <p className="text-sm text-muted-foreground">Search and explore projects</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Dashboard</h3>
              <p className="text-sm text-muted-foreground">View your personal dashboard</p>
            </div>
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="font-semibold mb-2">Organizer</h3>
              <p className="text-sm text-muted-foreground">Organize and manage your content</p>
            </div>
          </div>
        </div>
      </main>
      </div>
    );
}

export default Catalog;
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-8 mt-16">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © {currentYear} RandyBeats. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-muted-foreground">Privacy Policy</span>
            <span className="text-muted-foreground">Terms of Service</span>
            <span className="text-muted-foreground">Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

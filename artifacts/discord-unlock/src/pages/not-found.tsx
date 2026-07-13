import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-primary mb-4">404</h1>
      <h2 className="text-2xl font-medium text-foreground mb-6">Page not found</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <span className="text-primary hover:text-primary/80 transition-colors cursor-pointer border-b border-primary/30 hover:border-primary/80 pb-0.5">
          Return to gateway
        </span>
      </Link>
    </div>
  );
}

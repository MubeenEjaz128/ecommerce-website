import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="text-5xl font-black tracking-tight text-text">Page not found</h1>
      <p className="max-w-xl text-muted">The route does not exist yet. Use the home link to return to the storefront.</p>
      <Link to="/" className="inline-flex rounded-full bg-text px-5 py-3 text-sm font-semibold text-canvas">
        Return home
      </Link>
    </section>
  );
}

export default NotFoundPage;
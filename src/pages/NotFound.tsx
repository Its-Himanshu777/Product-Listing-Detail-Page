import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto my-10 flex max-w-[520px] flex-col items-center gap-3 rounded-[14px] border border-line bg-white px-6 py-10 text-center">
      <p className="m-0 font-display text-[2.5rem] font-extrabold text-navy">
        404
      </p>
      <h1 className="m-0 font-display text-[1.375rem] font-bold">
        Page not found
      </h1>
      <p className="m-0 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        className="mt-2 inline-flex min-h-10 items-center justify-center rounded-[6px] bg-navy px-4 text-sm font-semibold text-white hover:bg-[#234366]"
        to="/"
      >
        ← Back to products
      </Link>
    </section>
  );
}

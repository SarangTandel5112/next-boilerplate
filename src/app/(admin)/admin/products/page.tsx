import Link from 'next/link';

// Temporary fallback page until the products module is restored.
// Remove this page-level placeholder when products development resumes.
export default function AdminProductsPage() {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-neutral-50 md:text-3xl">Products unavailable</h1>
      <p className="mt-2 text-sm text-neutral-300 md:text-base">
        Products module is currently not included in this build.
      </p>
      <p className="mt-4">
        <Link className="text-sm font-medium text-blue-300 hover:text-blue-200" href="/admin/brands">
          Go to brands
        </Link>
      </p>
    </section>
  );
}

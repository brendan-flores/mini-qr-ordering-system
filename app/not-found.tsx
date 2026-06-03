import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Page not found</h1>
      <p className="max-w-sm text-neutral-600">
        This page does not exist or is not available on this site.
      </p>
      <Link
        href="/menu-page"
        className="text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        Back to menu
      </Link>
    </main>
  );
}

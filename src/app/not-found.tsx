import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold font-serif mb-2">404 - Santuario no encontrado</h2>
      <p className="text-sm text-manifest-inkMuted mb-4">Esta dimensión o página no existe en este plano.</p>
      <Link href="/" className="px-4 py-2 rounded-xl primary-gradient-btn text-xs font-semibold">
        Volver al altar
      </Link>
    </div>
  );
}

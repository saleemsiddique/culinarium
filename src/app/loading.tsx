export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[var(--highlight)]/20 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[var(--highlight)] rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-gray-500 text-sm font-medium">Cargando...</p>
    </div>
  );
}

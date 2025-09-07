export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900">About LezerPrint</h1>
        <p className="mt-4 max-w-3xl text-gray-600">
          LezerPrint is an open-source 3D printer management system combined with a professional portfolio.
          It showcases modern web technologies, real-time capabilities, and a production-focused UX.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">Tech Stack</h2>
            <ul className="mt-2 list-disc pl-5 text-gray-700">
              <li>Next.js, React, TypeScript, Tailwind CSS</li>
              <li>TanStack Query, Zustand</li>
              <li>Socket.io, Axios</li>
            </ul>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold">Core Features</h2>
            <ul className="mt-2 list-disc pl-5 text-gray-700">
              <li>Live demo (read-only)</li>
              <li>Printer dashboard and camera</li>
              <li>File manager and history</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
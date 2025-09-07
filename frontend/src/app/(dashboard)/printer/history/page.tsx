import Link from 'next/link'

export default function PrinterHistoryRoutePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Printer History</h1>
        <p className="mt-2 text-gray-600">View your print jobs and statistics.</p>
        <p className="mt-4 text-blue-700">
          <Link href="/history" className="underline">Open History</Link>
        </p>
      </div>
    </main>
  )
}

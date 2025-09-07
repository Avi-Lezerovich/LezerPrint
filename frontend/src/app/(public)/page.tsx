import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function HomePage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
			{/* Hero */}
			<section className="container mx-auto px-4 pt-20 pb-12 text-center">
				<h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
					LezerPrint
				</h1>
				<p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
					3D Printer Management System & Professional Portfolio
				</p>

				<div className="mt-8 flex items-center justify-center gap-4">
					<Link
						href="/demo"
						className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700"
					>
						View Live Demo
					</Link>
					<Link
						href="/about"
						className="inline-flex items-center rounded-lg bg-gray-100 px-6 py-3 text-gray-800 font-semibold hover:bg-gray-200"
					>
						About the Project
					</Link>
				</div>
			</section>

			{/* Quick Stats */}
			<section className="container mx-auto px-4 pb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="rounded-xl bg-white p-6 shadow">
						<p className="text-sm text-gray-500">Live Status</p>
						<p className="mt-2 text-2xl font-semibold">
							<span className="inline-flex items-center gap-2 text-green-600">
								<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
								Online
							</span>
						</p>
					</div>
					<div className="rounded-xl bg-white p-6 shadow">
						<p className="text-sm text-gray-500">Total Print Hours</p>
						<p className="mt-2 text-2xl font-semibold">1,248h</p>
					</div>
					<div className="rounded-xl bg-white p-6 shadow">
						<p className="text-sm text-gray-500">Featured</p>
						<p className="mt-2 text-2xl font-semibold">LezerPrint System</p>
					</div>
				</div>
			</section>

			{/* Highlights */}
			<section className="container mx-auto px-4 pb-24">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="rounded-xl bg-white p-6 shadow">
						<h3 className="text-lg font-semibold">Real-time Monitoring</h3>
						<p className="mt-2 text-gray-600">WebSocket-driven status, temperature, and live camera.</p>
					</div>
					<div className="rounded-xl bg-white p-6 shadow">
						<h3 className="text-lg font-semibold">File Management</h3>
						<p className="mt-2 text-gray-600">Upload, preview, and organize STL/G-code with ease.</p>
					</div>
					<div className="rounded-xl bg-white p-6 shadow">
						<h3 className="text-lg font-semibold">History & Analytics</h3>
						<p className="mt-2 text-gray-600">Track success rate, time, and filament consumption.</p>
					</div>
				</div>
			</section>
		</main>
	)
}

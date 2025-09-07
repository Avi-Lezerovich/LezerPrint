export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            LezerPrint
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced 3D Printer Management System - Portfolio Project
          </p>
          
          <div className="flex gap-4 justify-center">
            <a
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Demo
            </a>
            <a
              href="/login"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Monitor your 3D printer in real-time with live data and webcam feed.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">File Management</h3>
              <p className="text-gray-600">Upload, organize, and manage your 3D files with 3D preview.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Print History</h3>
              <p className="text-gray-600">Track your print jobs and analyze performance metrics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
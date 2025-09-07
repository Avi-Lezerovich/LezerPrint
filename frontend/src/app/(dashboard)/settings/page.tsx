import SettingsManagement from '@/components/settings/SettingsManagement';

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Configure your printer, profiles, and preferences</p>
        </div>
        
        <SettingsManagement demoMode={true} />
      </div>
    </main>
  )
}

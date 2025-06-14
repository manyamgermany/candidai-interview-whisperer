
import { Button } from "@/components/ui/button";

export const SettingsLoader = ({
  loading,
  error,
  loadSettings
}: { loading: boolean, error: string | null, loadSettings: () => void }) => {
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSettings}>Try Again</Button>
        </div>
      </div>
    );
  }
  return null;
};

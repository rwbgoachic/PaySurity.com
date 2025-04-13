// Simple Test Page for Connectivity Debugging

export default function SimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Simple Test Page</h1>
        
        <div className="bg-green-100 p-4 rounded-md text-green-800 mb-4">
          <p className="font-medium">Connection Test</p>
          <p className="text-sm">If you can see this page, basic rendering is working.</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-md text-blue-800">
          <p className="font-medium">CSS Test</p>
          <p className="text-sm">If the colors and styling are visible, CSS is loading correctly.</p>
        </div>
      </div>
    </div>
  );
}
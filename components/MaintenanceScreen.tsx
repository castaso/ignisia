
import React from 'react';
import SettingsIcon from './icons/SettingsIcon';

const MaintenanceScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <SettingsIcon className="h-16 w-16 text-gray-400 animate-spin-slow mb-6" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Under Maintenance</h1>
      <p className="text-lg text-gray-600 max-w-md">
        Our application is currently undergoing scheduled maintenance. We should be back online shortly. Thank you for your patience!
      </p>
    </div>
  );
};

export default MaintenanceScreen;

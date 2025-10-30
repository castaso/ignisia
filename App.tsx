import React, { useState } from 'react';
import { User } from './types';
import HomeScreen from './components/HomeScreen';
import MaintenanceScreen from './components/MaintenanceScreen';
import { mockUser } from './services/odooService';
import { NotificationProvider } from './contexts/NotificationContext';

const App: React.FC = () => {
  const [isUnderMaintenance] = useState(false);

  if (isUnderMaintenance) {
    return <MaintenanceScreen />;
  }

  return (
    <NotificationProvider>
      <div className="App">
        <HomeScreen user={mockUser} />
      </div>
    </NotificationProvider>
  );
};

export default App;

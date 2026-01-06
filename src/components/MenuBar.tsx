import React from 'react';

interface MenuBarProps {
  onDisconnect: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onDisconnect }) => {
  return (
    <div style={{ 
      backgroundColor: '#e0e0e0', 
      padding: '12px 16px', 
      display: 'flex', 
      alignItems: 'center' 
    }}>
      <div style={{ flexGrow: 1 }} />
      <button onClick={onDisconnect}>Disconnect</button>
    </div>
  );
};

export default MenuBar;
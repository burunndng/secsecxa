
import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon }) => {
  const baseClasses = "flex-1 flex items-center justify-center gap-2 text-sm sm:text-base font-medium py-3 px-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyber-primary";
  const activeClasses = "bg-cyber-accent text-cyber-primary shadow-cyber";
  const inactiveClasses = "text-cyber-text-secondary hover:bg-cyber-secondary hover:text-cyber-accent";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default TabButton;

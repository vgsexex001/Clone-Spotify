import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import RightPanel from './RightPanel';
import PlayerBar from './PlayerBar';

export default function Layout() {
  const [activeTab, setActiveTab] = useState('Tudo');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowRightPanel(window.innerWidth >= 1200);
      setIsCompact(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex flex-1 gap-2 p-2 overflow-hidden">
        <Sidebar />

        <main className="flex-1 bg-sp-base rounded-lg overflow-y-auto overflow-x-hidden min-w-0">
          <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
          <Outlet context={{ isCompact }} />
        </main>

        {showRightPanel && (
          <RightPanel onClose={() => setShowRightPanel(false)} />
        )}
      </div>

      <PlayerBar />
    </div>
  );
}

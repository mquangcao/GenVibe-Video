import { useState } from 'react';

export const useNavigation = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState('generator');
    const [activeTab, setActiveTab] = useState('reference');

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleBackToGenerator = (stopSpeakingCallback) => {
        if (stopSpeakingCallback) {
            stopSpeakingCallback();
        }
        setCurrentView('generator');
    };

    const navigateToVideoEditor = () => {
        setCurrentView('videoEditor');
        setActiveTab('reference');
    };

    return {
        isSidebarOpen,
        currentView,
        activeTab,
        toggleSidebar,
        setActiveTab,
        handleBackToGenerator,
        navigateToVideoEditor
    };
};
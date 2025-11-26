import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsView = () => {
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = useState({
        autoDispatch: true,
        soundAlerts: true,
        biasDetection: true,
        refreshInterval: 5,
        mapZoom: 12,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSliderChange = (key: keyof typeof settings, value: number) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const saveSettings = () => {
        localStorage.setItem('communityShieldSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">System Settings</h2>
                    <p className="text-slate-500">Configure your Community Shield command center</p>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Appearance</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-slate-700">Dark Mode</label>
                                <p className="text-sm text-slate-500">Switch between light and dark themes</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    theme === 'dark' ? 'bg-cyan-600' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">General</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-slate-700">Auto-Dispatch Units</label>
                                <p className="text-sm text-slate-500">Automatically assign nearest unit to new incidents</p>
                            </div>
                            <button
                                onClick={() => handleToggle('autoDispatch')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.autoDispatch ? 'bg-cyan-600' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.autoDispatch ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-slate-700">Sound Alerts</label>
                                <p className="text-sm text-slate-500">Play audio notification for critical incidents</p>
                            </div>
                            <button
                                onClick={() => handleToggle('soundAlerts')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.soundAlerts ? 'bg-cyan-600' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.soundAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="font-medium text-slate-700">AI Bias Detection</label>
                                <p className="text-sm text-slate-500">Enable ethical AI oversight for incident analysis</p>
                            </div>
                            <button
                                onClick={() => handleToggle('biasDetection')}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.biasDetection ? 'bg-cyan-600' : 'bg-slate-300'
                                }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.biasDetection ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Display</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="font-medium text-slate-700 block mb-2">
                                Data Refresh Interval: {settings.refreshInterval}s
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={settings.refreshInterval}
                                onChange={(e) => handleSliderChange('refreshInterval', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>1s (Real-time)</span>
                                <span>30s (Slow)</span>
                            </div>
                        </div>

                        <div>
                            <label className="font-medium text-slate-700 block mb-2">
                                Default Map Zoom: {settings.mapZoom}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="16"
                                value={settings.mapZoom}
                                onChange={(e) => handleSliderChange('mapZoom', parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>8 (City)</span>
                                <span>16 (Street)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">System Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="text-slate-500">Version</label>
                            <p className="font-medium text-slate-700">1.0.0-beta</p>
                        </div>
                        <div>
                            <label className="text-slate-500">Database</label>
                            <p className="font-medium text-slate-700">Supabase (Connected)</p>
                        </div>
                        <div>
                            <label className="text-slate-500">AI Model</label>
                            <p className="font-medium text-slate-700">Llama 3.3 70B</p>
                        </div>
                        <div>
                            <label className="text-slate-500">Backend</label>
                            <p className="font-medium text-slate-700">FastAPI</p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={saveSettings}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        💾 Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;

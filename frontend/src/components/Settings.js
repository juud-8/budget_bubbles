import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];
const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'
];

const Settings = () => {
  const [settings, setSettings] = useState({
    dark_mode: false,
    notifications: true,
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifyMsg, setNotifyMsg] = useState('');

  // Dark mode effect
  useEffect(() => {
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.dark_mode]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/settings`)
      .then(res => {
        setSettings(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load settings');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put(`${API_BASE_URL}/api/settings`, settings)
      .then(res => {
        setSettings(res.data);
        setSaved(true);
        setLoading(false);
        if (settings.notifications) {
          setNotifyMsg('Notifications enabled!');
          setTimeout(() => setNotifyMsg(''), 2000);
        }
      })
      .catch(() => {
        setError('Failed to save settings');
        setLoading(false);
      });
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Dark Mode</label>
          <input
            type="checkbox"
            name="dark_mode"
            checked={settings.dark_mode}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Enable Notifications</label>
          <input
            type="checkbox"
            name="notifications"
            checked={settings.notifications}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Currency</label>
          <select
            name="currency"
            value={settings.currency}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            {CURRENCIES.map(cur => <option key={cur} value={cur}>{cur}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Language</label>
          <select
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">Time Zone</label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          disabled={loading}
        >
          Save
        </button>
        {saved && <div className="text-green-600 font-medium mt-2">Settings saved!</div>}
        {notifyMsg && <div className="text-blue-600 font-medium mt-2">{notifyMsg}</div>}
      </form>
    </div>
  );
};

export default Settings; 
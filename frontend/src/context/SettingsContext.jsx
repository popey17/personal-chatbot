import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const SettingsProvider = ({ children }) => {
  const [service, setService] = useState('openai');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const data = await response.json();
        if (data.ai_service) {
          setService(data.ai_service);
        }
      } catch (error) {
        console.error('Error fetching global settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateService = async (newService) => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_service', value: newService })
      });
      
      if (response.ok) {
        setService(newService);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating AI service:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ service, updateService, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

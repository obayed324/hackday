import React, { useEffect, useState } from 'react';
import { AgentContext } from './AgentContext';
import { getOrCreateDeviceId } from '../../utils/deviceFingerprint';
import { getOrCreateCodename } from '../../utils/codenameGenerator';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AgentProvider = ({ children }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-register agent on mount
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Get or create device ID
        const deviceId = await getOrCreateDeviceId();
        
        // Get or create codename
        const codename = getOrCreateCodename(deviceId);
        
        // Register/Get agent from server
        const response = await axios.post(`${API_BASE}/api/agents/register`, {
          deviceId,
          codename
        });
        
        setAgent(response.data.agent);
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize agent:', error);
        // Fallback: create local agent
        const deviceId = await getOrCreateDeviceId();
        const codename = getOrCreateCodename(deviceId);
        setAgent({
          agentId: deviceId,
          codename,
          deviceId,
          status: 'active',
          role: 'agent'
        });
        setLoading(false);
      }
    };

    initializeAgent();
  }, []);

  const agentInfo = {
    agent,
    loading,
    refreshAgent: async () => {
      const deviceId = await getOrCreateDeviceId();
      const codename = getOrCreateCodename(deviceId);
      try {
        const response = await axios.post(`${API_BASE}/api/agents/register`, {
          deviceId,
          codename
        });
        setAgent(response.data.agent);
      } catch (error) {
        console.error('Failed to refresh agent:', error);
      }
    }
  };

  return (
    <AgentContext.Provider value={agentInfo}>
      {children}
    </AgentContext.Provider>
  );
};

export default AgentProvider;

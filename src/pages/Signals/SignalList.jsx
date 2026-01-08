// Signal List Component
// Displays communication history with agent codenames and signal meanings

import React, { useEffect, useState } from "react";
import useSocket from "../../hooks/useSocket";
import useAgent from "../../hooks/useAgent";
import { getSignalCode } from "../../utils/signalCodes";

const SignalList = () => {
  const [signals, setSignals] = useState([]);
  const socket = useSocket();
  const { agent } = useAgent();

  // Load previous signals from backend on page load
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/signals`);
        const data = await response.json();
        setSignals(data.reverse()); // latest first
      } catch (error) {
        console.error('Failed to load signals:', error);
      }
    };
    loadSignals();
  }, []);

  // Listen for new real-time signals
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveSignal", (signal) => {
      setSignals((prev) => [signal, ...prev]);
    });

    socket.on("signalSent", (signal) => {
      // Add own sent signals to list
      setSignals((prev) => [signal, ...prev]);
    });

    return () => {
      socket.off("receiveSignal");
      socket.off("signalSent");
    };
  }, [socket]);

  // Render signal visual
  const renderSignalVisual = (signal) => {
    const style = {
      width: '40px',
      height: '40px',
      backgroundColor: signal.color === 'white' ? '#f0f0f0' : signal.color,
      border: signal.color === 'white' ? '2px solid #333' : 'none',
      borderRadius: signal.shape === 'circle' ? '50%' : '0',
      clipPath: signal.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                signal.shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                signal.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
      display: 'inline-block',
      marginRight: '10px',
      verticalAlign: 'middle'
    };
    return <div style={style}></div>;
  };

  // Get urgency badge color
  const getUrgencyBadge = (urgency) => {
    const colors = {
      critical: 'badge-error',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-success'
    };
    return colors[urgency] || 'badge-ghost';
  };

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Communication History</h2>
      
      {agent && (
        <div className="mb-4 p-3 bg-base-300 rounded">
          <span className="text-sm">Active Agents: </span>
          <span className="font-semibold">{signals.length > 0 ? new Set(signals.map(s => s.fromCodename)).size : 0}</span>
        </div>
      )}

      <div className="max-h-[60vh] overflow-y-auto space-y-3">
        {signals.length === 0 && (
          <p className="text-center text-gray-500 py-8">No signals yet. Send your first signal!</p>
        )}
        
        {signals.map((signal, i) => {
          const agentId = agent?.agentId?.toString() || agent?.deviceId;
          const isOwnSignal = agent && (signal.fromAgent === agentId || signal.fromAgent === agent.deviceId);
          const signalCode = getSignalCode(signal.codeId);
          
          return (
            <div
              key={i}
              className={`p-4 rounded-lg border ${
                isOwnSignal 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-base-100 border-base-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Signal Visual */}
                {renderSignalVisual(signal)}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-primary">
                      {signal.fromCodename || 'Unknown Agent'}
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="font-semibold">
                      {signal.toCodename || 'ALL'}
                    </span>
                    {signal.urgency && (
                      <span className={`badge badge-sm ${getUrgencyBadge(signal.urgency)}`}>
                        {signal.urgency}
                      </span>
                    )}
                  </div>
                  
                  <p className="font-semibold text-lg mb-1">
                    {signal.meaning || signalCode?.meaning || signal.codeId}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Code: {signal.codeId}</span>
                    <span>•</span>
                    <span>{signal.color} {signal.shape}</span>
                    <span>•</span>
                    <span>{signal.motion}</span>
                    <span>•</span>
                    <span>{signal.durationMs}ms</span>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignalList;

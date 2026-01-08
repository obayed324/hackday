// Visual Signal Form Component
// Users select Color + Shape + Motion + Duration to send signals

import React, { useState, useEffect } from "react";
import useSocket from "../../hooks/useSocket";
import useAgent from "../../hooks/useAgent";
import { SIGNAL_CODES, SIGNAL_OPTIONS, findSignalCode } from "../../utils/signalCodes";
import { getOrCreateDeviceId } from "../../utils/deviceFingerprint";

const SignalForm = () => {
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedShape, setSelectedShape] = useState('triangle');
  const [selectedMotion, setSelectedMotion] = useState('pulse');
  const [selectedDuration, setSelectedDuration] = useState(2000);
  const [targetAgent, setTargetAgent] = useState('broadcast'); // 'broadcast' or specific agent
  const [agents, setAgents] = useState([]);
  const [sending, setSending] = useState(false);
  
  const socket = useSocket();
  const { agent } = useAgent();

  // Load available agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/agents`);
        const data = await response.json();
        // Filter out current agent
        const otherAgents = data.filter(a => a.codename !== agent?.codename);
        setAgents(otherAgents);
      } catch (error) {
        console.error('Failed to load agents:', error);
      }
    };
    if (agent) {
      loadAgents();
    }
  }, [agent]);

  const sendSignal = async () => {
    if (!socket || !agent) {
      alert('Not connected or agent not initialized');
      return;
    }

    setSending(true);

    try {
      // Find matching signal code
      const signalCode = findSignalCode(selectedColor, selectedShape, selectedMotion, selectedDuration);
      
      if (!signalCode) {
        alert('Invalid signal combination. Please select a valid code.');
        setSending(false);
        return;
      }

      const deviceId = await getOrCreateDeviceId();

      // Get agent ID (handle both ObjectId string and deviceId)
      const fromAgentId = agent.agentId?.toString() || agent.deviceId;
      
      const signalData = {
        fromAgent: fromAgentId,
        fromCodename: agent.codename,
        toAgent: targetAgent === 'broadcast' ? null : targetAgent,
        toCodename: targetAgent === 'broadcast' ? 'ALL' : agents.find(a => (a.agentId?.toString() || a.deviceId) === targetAgent)?.codename,
        codeId: signalCode.codeId,
        color: selectedColor,
        shape: selectedShape,
        motion: selectedMotion,
        durationMs: selectedDuration,
        deviceId,
        timestamp: new Date().toISOString()
      };

      socket.emit("sendSignal", signalData);
      
      // Reset form after sending
      setTimeout(() => {
        setSending(false);
      }, 500);
    } catch (error) {
      console.error('Failed to send signal:', error);
      alert('Failed to send signal');
      setSending(false);
    }
  };

  // Preview the signal visually
  const getSignalPreviewStyle = () => {
    const baseStyle = {
      width: '80px',
      height: '80px',
      backgroundColor: selectedColor === 'white' ? '#f0f0f0' : selectedColor,
      border: selectedColor === 'white' ? '2px solid #333' : 'none',
      borderRadius: selectedShape === 'circle' ? '50%' : 
                   selectedShape === 'triangle' ? '0' : 
                   selectedShape === 'diamond' ? '0' : '0',
      clipPath: selectedShape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                selectedShape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                selectedShape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
      animation: selectedMotion === 'pulse' ? 'pulse 1s infinite' :
                 selectedMotion === 'flash' ? 'flash 0.5s infinite' :
                 selectedMotion === 'rotate' ? 'rotate 2s linear infinite' :
                 selectedMotion === 'bounce' ? 'bounce 1s infinite' : 'none',
      margin: '20px auto',
      display: 'block'
    };
    return baseStyle;
  };

  const selectedCode = findSignalCode(selectedColor, selectedShape, selectedMotion, selectedDuration);

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-4">Send Visual Signal</h2>
      
      {agent && (
        <div className="mb-4 p-3 bg-base-300 rounded">
          <span className="text-sm text-gray-600">Your Codename: </span>
          <span className="font-bold text-primary">{agent.codename}</span>
        </div>
      )}

      {/* Signal Preview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Signal Preview</h3>
        <div style={getSignalPreviewStyle()}></div>
        {selectedCode && (
          <div className="text-center mt-2">
            <p className="font-bold text-lg">{selectedCode.meaning}</p>
            <p className="text-sm text-gray-600">Code: {selectedCode.codeId}</p>
            <p className="text-xs text-gray-500">Urgency: {selectedCode.urgency.toUpperCase()}</p>
          </div>
        )}
        {!selectedCode && (
          <p className="text-center text-gray-500 mt-2">Invalid signal combination</p>
        )}
      </div>

      {/* Color Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_OPTIONS.colors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded ${
                selectedColor === color 
                  ? 'ring-2 ring-offset-2 ring-primary' 
                  : 'bg-base-300'
              }`}
              style={{
                backgroundColor: color === 'white' ? '#f0f0f0' : color,
                color: ['white', 'yellow'].includes(color) ? '#000' : '#fff',
                border: color === 'white' ? '1px solid #ccc' : 'none'
              }}
            >
              {color.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Shape Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Shape</label>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_OPTIONS.shapes.map(shape => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`px-4 py-2 rounded capitalize ${
                selectedShape === shape 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Motion Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Motion</label>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_OPTIONS.motions.map(motion => (
            <button
              key={motion}
              onClick={() => setSelectedMotion(motion)}
              className={`px-4 py-2 rounded capitalize ${
                selectedMotion === motion 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-300'
              }`}
            >
              {motion}
            </button>
          ))}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">
          Duration: {selectedDuration}ms
        </label>
        <input
          type="range"
          min="1000"
          max="3000"
          step="500"
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1s</span>
          <span>1.5s</span>
          <span>2s</span>
          <span>2.5s</span>
          <span>3s</span>
        </div>
      </div>

      {/* Target Agent Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Target</label>
        <select
          value={targetAgent}
          onChange={(e) => setTargetAgent(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="broadcast">Broadcast (All Agents)</option>
          {agents.map(a => {
            const agentId = a.agentId?.toString() || a.deviceId;
            return (
              <option key={agentId} value={agentId}>
                {a.codename}
              </option>
            );
          })}
        </select>
      </div>

      {/* Send Button */}
      <button
        onClick={sendSignal}
        disabled={!selectedCode || sending || !agent}
        className={`btn btn-primary w-full ${
          !selectedCode || sending || !agent ? 'btn-disabled' : ''
        }`}
      >
        {sending ? 'Sending...' : 'Send Signal'}
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default SignalForm;

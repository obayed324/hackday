// src/pages/Signals/Signals.jsx
import React from "react";
import SignalForm from "./SignalForm";
import SignalList from "./SignalList";
import useAgent from "../../hooks/useAgent";

const Signals = () => {
  const { agent, loading } = useAgent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Initializing agent identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2">🔐 Covert Communication System</h1>
          <p className="text-gray-600">Visual Signal-Based Command & Control</p>
          {agent && (
            <div className="mt-4 inline-block px-4 py-2 bg-primary/20 rounded-lg">
              <span className="text-sm text-gray-600">Agent Codename: </span>
              <span className="font-bold text-primary text-lg">{agent.codename}</span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signal Form */}
          <div>
            <SignalForm />
          </div>

          {/* Signal History */}
          <div>
            <SignalList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signals;

import { use } from 'react';
import { AgentContext } from '../context/AgentContext/AgentContext';

const useAgent = () => {
  const agentInfo = use(AgentContext);
  return agentInfo;
};

export default useAgent;

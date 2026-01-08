import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import router from './routes/router';
import AuthProvider from './context/AuthContext/AuthProvider';
import AgentProvider from './context/AgentContext/AgentProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';


const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AgentProvider>
          <RouterProvider router={router}></RouterProvider>
        </AgentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
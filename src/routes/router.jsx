import React from 'react';
import { createBrowserRouter } from "react-router";
import AuthLayout from '../layouts/AuthLayout';
import Register from '../pages/Auth/Register/Register';
import Login from '../pages/Auth/Login/Login';
import Signals from '../pages/Signals/Signals';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Signals, // Main covert communication interface
  },
  {
    path: '/signals',
    Component: Signals,
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: '/login',
        Component: Login
      },
      {
        path: '/register',
        Component: Register,
        loader: async () => {
          const districts = await fetch('/districts.json').then(res => res.json());
          const upazilas = await fetch('/upazilas.json').then(res => res.json());
          return { districts, upazilas };
        }
      }
    ]
  }
]);

export default router;
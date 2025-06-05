import React from 'react';
import { useAdmin } from '../context/AdminContext';

export default function AdminToggle() {
  const { isAdmin, setIsAdmin } = useAdmin();
  return (
    <button onClick={() => setIsAdmin(prev => !prev)} className="admin-toggle">
      {isAdmin ? 'Salir de Admin' : 'Entrar como Admin'}
    </button>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{
          fontSize: '4rem',
          color: '#ff9800',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>
        
        <h1 style={{
          color: '#333',
          marginBottom: '15px',
          fontSize: '2rem'
        }}>
          Acesso Negado
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Você não tem permissão para acessar esta página. 
          Entre em contato com o administrador do sistema.
        </p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link 
            to="/"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Ir para Home
          </Link>
          
          <Link 
            to="/login"
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
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
          fontSize: '6rem',
          color: '#4CAF50',
          marginBottom: '20px'
        }}>
          404
        </div>
        
        <h1 style={{
          color: '#333',
          marginBottom: '15px',
          fontSize: '2rem'
        }}>
          Página Não Encontrada
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Link 
          to="/"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '16px'
          }}
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

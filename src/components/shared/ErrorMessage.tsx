import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClose }) => {
  console.error('Error Details:', {
    message: error.message,
    code: error.code,
    details: error.details,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-header">
          {error.code && <span className="error-code">{error.code}</span>}
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <p className="error-message">{error.message}</p>
        {error.details && (
          <pre className="error-details">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
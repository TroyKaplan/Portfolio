import React from 'react';
import '../../styles/shared.css';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="error-message">{message}</div>
);

export default ErrorMessage; 
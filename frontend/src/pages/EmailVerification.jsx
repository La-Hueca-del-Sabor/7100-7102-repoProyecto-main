import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import './EmailVerification.css';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const params = useParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Obtener el token de la URL
                const token = window.location.pathname.split('/verify-email/')[1];
                
                console.log('Token a verificar:', token);
                
                if (!token) {
                    setStatus('error');
                    setMessage('Token de verificación no proporcionado');
                    return;
                }

                const response = await fetch(`http://localhost:3002/api/auth/verify-email/${token}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Respuesta del servidor:', response.status);
                const data = await response.json();
                console.log('Datos del servidor:', data);

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.error + (data.details ? `: ${data.details}` : ''));
                }
            } catch (error) {
                console.error('Error al verificar:', error);
                setStatus('error');
                setMessage('Error al conectar con el servidor');
            }
        };

        verifyEmail();
    }, []);

    return (
        <div className="verification-container">
            <div className="verification-card">
                <h1>Verificación de Correo</h1>
                
                {status === 'verifying' && (
                    <div className="verification-status">
                        <div className="spinner"></div>
                        <p>Verificando tu correo electrónico...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verification-status success">
                        <div className="success-icon">✓</div>
                        <p>{message}</p>
                        <Link to="/login" className="back-to-login">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verification-status error">
                        <div className="error-icon">✕</div>
                        <p>{message}</p>
                        <Link to="/login" className="back-to-login">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification; 
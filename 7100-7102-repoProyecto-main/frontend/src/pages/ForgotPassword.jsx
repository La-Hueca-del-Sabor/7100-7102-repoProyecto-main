import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // Reutilizamos los estilos del login

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3002/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: email })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setEmail(''); // Limpiar el campo de correo
            } else {
                setError(data.error || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError('Error al conectar con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="login-container">
                <div className="login-content">
                    <div className="login-form-section">
                        <div className="login-wrapper">
                            <h1 className="login-title">Recuperar Contraseña</h1>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Ingresa tu correo electrónico"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {message && (
                                    <div className="alert alert-success" role="alert">
                                        {message}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    className="login-btn"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                                </button>

                                <p className="login-wrapper-footer-text">
                                    <Link to="/login">Volver al inicio de sesión</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 
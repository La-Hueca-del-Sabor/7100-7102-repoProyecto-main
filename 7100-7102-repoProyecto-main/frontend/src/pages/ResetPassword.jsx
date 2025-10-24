import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Login.css'; // Reutilizamos los estilos del login

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud mínima
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3002/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Error al restablecer la contraseña');
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
                            <h1 className="login-title">Restablecer Contraseña</h1>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="newPassword">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ingresa tu nueva contraseña"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirma tu nueva contraseña"
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
                                    {isLoading ? 'Procesando...' : 'Restablecer Contraseña'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword; 
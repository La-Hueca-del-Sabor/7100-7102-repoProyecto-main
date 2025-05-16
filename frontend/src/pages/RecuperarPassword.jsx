import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; // Reusing the login styles

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email) => {
    return email.includes('@');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailValue = e.target.email.value.trim();

    if (!validateEmail(emailValue)) {
      setEmailError('El correo debe contener un @ válido.');
      setSuccessMessage('');
      return;
    }

    setEmailError('');
    // Here you would typically call an API to send a password reset email
    // For now, we'll just show a success message
    setSuccessMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
    setEmail('');
  };

  return (
    <main>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6 login-section-wrapper">
            <div className="brand-wrapper">
              {/* If you have a logo, use it here */}
              <h3>Mi Restaurante</h3>
            </div>
            <div className="login-wrapper my-auto">
              <h1 className="login-title">Recuperar Contraseña</h1>
              {successMessage ? (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                  <div className="mt-3">
                    <Link to="/login" className="btn btn-primary">Volver al inicio de sesión</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="form-control"
                      placeholder="email@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {emailError && <small className="text-danger">{emailError}</small>}
                  </div>

                  <button name="recover" id="recover" className="btn btn-block login-btn mb-4" type="submit">
                    Enviar instrucciones
                  </button>

                  <p className="login-card-footer-text">
                    <Link to="/login" className="text-reset">Volver al inicio de sesión</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
          <div className="col-sm-6 px-0 d-none d-sm-block">
            {/* If you have a login image, use it here */}
            <div className="bg-primary h-100 d-flex align-items-center justify-content-center">
              <h2 className="text-white">Recupera el acceso a tu cuenta</h2>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RecuperarPassword;
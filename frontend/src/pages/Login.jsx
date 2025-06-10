import React, { useState } from 'react';
import './Login.css';
import loginImage from '../assets/login.jpg';
import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [backendError, setBackendError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return email.includes('@');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    let valid = true;

    if (!validateEmail(email)) {
      setEmailError('El correo debe contener un @ válido.');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (valid) {
      try {
        const response = await fetch('http://localhost:3002/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          setBackendError(data.error || 'Error desconocido');
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.roleName);

          switch (data.roleName) {
            case 'mesero':
              navigate('/mesero');
              break;
            case 'caja':
              navigate('/caja');
              break;
            case 'cocina':
              navigate('/cocina');
              break;
            case 'gerente':
              navigate('/gerencia');
              break;
            default:
              setBackendError('Rol desconocido: ' + data.roleName);
          }
        }
      } catch (err) {
        setBackendError('No se pudo conectar con el servidor');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="login-container">
        <div className="login-content">
          <div className="login-form-section">
            <div className="login-wrapper">
              <div className="text-center mb-4">
              </div>
              <h1 className="login-title">Bienvenido</h1>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                  {emailError && <small className="text-danger">{emailError}</small>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                      className="form-control"
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="input-group-text"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {passwordError && <small className="text-danger">{passwordError}</small>}
                </div>

                {backendError && (
                  <div className="alert alert-danger" role="alert">
                    {backendError}
                  </div>
                )}

                <button type="submit" className="login-btn">
                  Iniciar Sesión
                </button>
              </form>

              <a href="#!" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>

              <p className="login-wrapper-footer-text">
                ¿No tienes una cuenta?{' '}
                <a href="#!">Regístrate aquí</a>
              </p>
            </div>
          </div>
          <div className="login-image-section">
            <img src={loginImage} alt="login" className="login-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

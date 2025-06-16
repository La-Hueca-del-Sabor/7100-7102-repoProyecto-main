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

  // Estados para el modal de registro
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    nombres: '',
    correo: '',
    password: '',
    confirmPassword: '',
    role_id: ''
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerSuccess, setRegisterSuccess] = useState('');

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    
    // Validaciones
    if (!registerData.nombres.trim()) {
      errors.nombres = 'El nombre es requerido';
    }
    if (!registerData.correo.trim() || !validateEmail(registerData.correo)) {
      errors.correo = 'Ingrese un correo válido';
    }
    if (registerData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (registerData.password !== registerData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!registerData.role_id) {
      errors.role_id = 'Seleccione un rol';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: registerData.nombres,
          correo: registerData.correo,
          password: registerData.password,
          role_id: parseInt(registerData.role_id)
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setRegisterSuccess(data.message);
        // Limpiar el formulario después de 3 segundos y cerrar el modal
        setTimeout(() => {
          setShowRegisterModal(false);
          setRegisterSuccess('');
          setRegisterData({
            nombres: '',
            correo: '',
            password: '',
            confirmPassword: '',
            role_id: ''
          });
          setRegisterErrors({});
        }, 3000);
      } else {
        setRegisterErrors({
          submit: data.error || 'Error al registrar usuario'
        });
      }
    } catch (err) {
      setRegisterErrors({
        submit: 'No se pudo conectar con el servidor'
      });
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
                <a href="#!" onClick={(e) => {
                  e.preventDefault();
                  setShowRegisterModal(true);
                }}>Regístrate aquí</a>
              </p>
            </div>
          </div>
          <div className="login-image-section">
            <img src={loginImage} alt="login" className="login-img" />
          </div>
        </div>
      </div>

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Registro de Usuario</h2>
              <button 
                type="button" 
                className="close-button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegisterErrors({});
                  setRegisterSuccess('');
                  setRegisterData({
                    nombres: '',
                    correo: '',
                    password: '',
                    confirmPassword: '',
                    role_id: ''
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Nombres</label>
                <input
                  type="text"
                  className="form-control"
                  value={registerData.nombres}
                  onChange={(e) => setRegisterData({...registerData, nombres: e.target.value})}
                  placeholder="Ingrese sus nombres"
                />
                {registerErrors.nombres && (
                  <small className="text-danger">{registerErrors.nombres}</small>
                )}
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={registerData.correo}
                  onChange={(e) => setRegisterData({...registerData, correo: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
                {registerErrors.correo && (
                  <small className="text-danger">{registerErrors.correo}</small>
                )}
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  placeholder="Ingrese su contraseña"
                />
                {registerErrors.password && (
                  <small className="text-danger">{registerErrors.password}</small>
                )}
              </div>

              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  placeholder="Confirme su contraseña"
                />
                {registerErrors.confirmPassword && (
                  <small className="text-danger">{registerErrors.confirmPassword}</small>
                )}
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  className="form-control"
                  value={registerData.role_id}
                  onChange={(e) => setRegisterData({...registerData, role_id: e.target.value})}
                >
                  <option value="">Seleccione un rol</option>
                  <option value="2">Mesero</option>
                  <option value="3">Cocinero</option>
                  <option value="4">Cajero</option>
                </select>
                {registerErrors.role_id && (
                  <small className="text-danger">{registerErrors.role_id}</small>
                )}
              </div>

              {registerErrors.submit && (
                <div className="alert alert-danger" role="alert">
                  {registerErrors.submit}
                </div>
              )}

              {registerSuccess && (
                <div className="alert alert-success" role="alert">
                  {registerSuccess}
                </div>
              )}

              <button type="submit" className="login-btn">
                Registrarse
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

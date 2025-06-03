import React, { useState } from 'react';
import './Login.css';
import loginImage from '../assets/login.jpg';
import logo from '../assets/logo.svg';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


const Login = () => {

  console.log()
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
          // Mostrar el rol recibido para depuración
          console.log('Rol recibido:', data);

          // Usar el campo correcto del backend: roleName
          const userRole = data.roleName;
          
          // Guardar el token y el rol en localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.roleName);
          
          // Añadir logs de depuración
          console.log('Token guardado:', data.token);
          console.log('Rol guardado:', data.roleName);
          console.log('Verificación de localStorage:', localStorage.getItem('role'));

          switch (userRole) {
            case 'mesero':
              navigate('/mesero');
              break;
            case 'caja':
              navigate('/caja');
              break;
            case 'cocina':
              navigate('/cocina');
              break;
            case 'gerente': // Debe ser 'gerente', no 'gerencia'
              navigate('/gerencia');
              break;
            default:
              setBackendError('Rol desconocido: ' + userRole);
          }
        }
      } catch (err) {
        setBackendError('No se pudo conectar con el backend');
      }
    }
  };

  return (
    <main>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6 login-section-wrapper">
            <div className="brand-wrapper">
              <img src={logo} alt="logo" className="logo" />
            </div>
            <div className="login-wrapper my-auto">
              <h1 className="login-title">Iniciar Sesión</h1>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    placeholder="email@ejemplo.com"
                    required
                  />
                  {emailError && <small className="text-danger">{emailError}</small>}
                </div>

                <div className="form-group mb-4">
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
                      <span
                        className="input-group-text"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                  </div>
                  {passwordError && <small className="text-danger">{passwordError}</small>}
                </div>

                <input
                  name="login"
                  id="login"
                  className="btn btn-block login-btn"
                  type="submit"
                  value="Iniciar Sesión"
                />
                {backendError && <div className="text-danger mt-2">{backendError}</div>}
              </form>

              <a href="#!" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </a>
              <p className="login-wrapper-footer-text">
                ¿No tienes una cuenta?{' '}
                <a href="#!" className="text-reset">
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
          <div className="col-sm-6 px-0 d-none d-sm-block">
            <img src={loginImage} alt="login" className="login-img" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;

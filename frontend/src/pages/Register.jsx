import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'mesero', label: 'Mesero' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'caja', label: 'Caja' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    let formIsValid = true;

    // Validación de nombre
    if (!formData.nombre.trim()) {
      tempErrors.nombre = "El nombre es requerido";
      formIsValid = false;
    }

    // Validación de email
    if (!formData.email) {
      tempErrors.email = "El correo electrónico es requerido";
      formIsValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "El correo electrónico no es válido";
      formIsValid = false;
    }

    // Validación de contraseña
    if (!formData.password) {
      tempErrors.password = "La contraseña es requerida";
      formIsValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "La contraseña debe tener al menos 6 caracteres";
      formIsValid = false;
    }

    // Validación de confirmación de contraseña
    if (!formData.confirmPassword) {
      tempErrors.confirmPassword = "Debe confirmar la contraseña";
      formIsValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Las contraseñas no coinciden";
      formIsValid = false;
    }

    // Validación de rol
    if (!formData.rol) {
      tempErrors.rol = "Debe seleccionar un rol";
      formIsValid = false;
    }

    setErrors(tempErrors);
    return formIsValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Aquí iría la lógica para enviar los datos al servidor
      console.log("Datos de registro:", formData);
      
      // Simulación de registro exitoso
      alert("Registro exitoso!");
      navigate('/login');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <main className="d-flex align-items-center min-vh-100 py-3 py-md-0">
      <div className="container">
        <div className="card register-card">
          <div className="row no-gutters">
            <div className="col-md-5">
              <img src="/images/login.jpg" alt="login" className="register-card-img" />
            </div>
            <div className="col-md-7">
              <div className="card-body">
                <div className="brand-wrapper">
                  <img src="/images/logo.png" alt="logo" className="logo" />
                </div>
                <p className="register-card-description">Crear una nueva cuenta</p>
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input 
                      type="text" 
                      name="nombre" 
                      id="nombre" 
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} 
                      placeholder="Ingrese su nombre completo"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="email" 
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <div className="password-wrapper">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        id="password" 
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                        placeholder="Ingrese su contraseña"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button 
                        type="button" 
                        className="toggle-password" 
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirmar contraseña</label>
                    <div className="password-wrapper">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword" 
                        id="confirmPassword" 
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} 
                        placeholder="Confirme su contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button 
                        type="button" 
                        className="toggle-password" 
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                  
                  <div className="form-group mb-3">
                    <label htmlFor="rol" className="form-label">Seleccione su rol</label>
                    <select 
                      name="rol" 
                      id="rol" 
                      className={`form-select ${errors.rol ? 'is-invalid' : ''}`}
                      value={formData.rol}
                      onChange={handleChange}
                    >
                      <option value="">Seleccione un rol</option>
                      {roles.map(rol => (
                        <option key={rol.value} value={rol.value}>{rol.label}</option>
                      ))}
                    </select>
                    {errors.rol && <div className="invalid-feedback">{errors.rol}</div>}
                  </div>
                  
                  <button className="btn btn-block register-btn mb-4" type="submit">
                    Registrarse
                  </button>
                </form>
                <p className="register-card-footer-text">
                  ¿Ya tienes una cuenta? <Link to="/login" className="text-reset">Iniciar sesión</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
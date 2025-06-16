-- Crear tabla usuarios_pendientes
CREATE TABLE IF NOT EXISTS public.usuarios_pendientes (
    id BIGSERIAL PRIMARY KEY,
    nombres TEXT NOT NULL,
    correo VARCHAR(255) NOT NULL CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES public.roles(id),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) DEFAULT 'pendiente',
    email_verificado BOOLEAN DEFAULT FALSE,
    token_verificacion TEXT,
    token_expiracion TIMESTAMP WITH TIME ZONE,
    CONSTRAINT usuarios_pendientes_correo_unique UNIQUE (correo)
); 
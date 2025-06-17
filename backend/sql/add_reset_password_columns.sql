-- Agregar columnas para el restablecimiento de contraseña
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiracion TIMESTAMP; 
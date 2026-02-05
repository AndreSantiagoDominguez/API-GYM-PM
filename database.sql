-- API-GYM-PM - Base de Datos MySQL
-- Descripción: Sistema de administración de gimnasios

DROP DATABASE IF EXISTS api_gym_pm;
CREATE DATABASE api_gym_pm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE api_gym_pm;

-- TABLA: roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (nombre, descripcion) VALUES
('super_admin', 'Dueño de la aplicación - Control total del sistema'),
('admin', 'Administrador de gimnasio - Gestiona su gimnasio asignado'),
('empleado', 'Empleado de gimnasio - Puede registrar clientes'),
('cliente', 'Cliente del gimnasio - Usuario final');

-- TABLA: gyms
CREATE TABLE gyms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABLA: users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    activo BOOLEAN DEFAULT TRUE,
    rol_id INT NOT NULL,
    gym_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_users_rol FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_users_gym FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol_id);
CREATE INDEX idx_users_gym ON users(gym_id);

SELECT 'Base de datos creada exitosamente!' AS mensaje;

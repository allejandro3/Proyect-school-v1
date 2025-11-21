-- 1. Usuarios (Tabla personas)
-- Roles: super-admin, admin (profesor), user (padre), estudiante

INSERT INTO personas (cedula, nombre, email, password, role) VALUES
('1001', 'Super Admin', 'super@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'super-admin'),
('2001', 'Profesor Admin', 'profe@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'admin'),
('3001', 'Padre User', 'padre@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'user'),
('4001', 'Estudiante Uno', 'estudiante1@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'estudiante'),
('4002', 'Estudiante Dos', 'estudiante2@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'estudiante'),
('4003', 'Estudiante Tres', 'estudiante3@school.com', '$2a$10$n/8lXz.OeW3VJPwpjw1gwO8MWnmAnesHqJprpooEfOXv9Jl3.GJ.6', 'estudiante');

-- 2. Estudiantes (Tabla estudiantes)
-- Vincula la cédula de personas con un grado

INSERT INTO estudiantes (cedula, grado) VALUES
('4001', '10-A'),
('4002', '10-A'),
('4003', '11-B');

-- 3. Materias (Tabla materias)

INSERT INTO materias (nombre) VALUES
('Matemáticas'),
('Español'),
('Ciencias'),
('Historia');

-- 4. Logros / Notas (Tabla logros)
-- Se asume que los IDs de estudiantes y materias se generan secuencialmente o se buscan.
-- Para este script SQL de ejemplo, usaremos subconsultas para obtener los IDs correctos.

-- Notas para Estudiante Uno (10-A)
INSERT INTO logros (estudiante_id, materia_id, l_h, j_v, logros) VALUES
((SELECT id FROM estudiantes WHERE cedula = '4001'), (SELECT id FROM materias WHERE nombre = 'Matemáticas'), 4, 4.5, 'Excelente comprensión de álgebra'),
((SELECT id FROM estudiantes WHERE cedula = '4001'), (SELECT id FROM materias WHERE nombre = 'Ciencias'), 3, 3.8, 'Buen desempeño en laboratorio');

-- Notas para Estudiante Dos (10-A)
INSERT INTO logros (estudiante_id, materia_id, l_h, j_v, logros) VALUES
((SELECT id FROM estudiantes WHERE cedula = '4002'), (SELECT id FROM materias WHERE nombre = 'Matemáticas'), 4, 2.5, 'Debe reforzar conceptos básicos'),
((SELECT id FROM estudiantes WHERE cedula = '4002'), (SELECT id FROM materias WHERE nombre = 'Español'), 3, 4.0, 'Buena redacción');

-- Notas para Estudiante Tres (11-B)
INSERT INTO logros (estudiante_id, materia_id, l_h, j_v, logros) VALUES
((SELECT id FROM estudiantes WHERE cedula = '4003'), (SELECT id FROM materias WHERE nombre = 'Historia'), 2, 5.0, 'Trabajo final sobresaliente');

Credenciales de Prueba
Aquí tienes los usuarios de prueba generados. La contraseña para TODOS es: 123

1. Super Admin
Email: super@school.com
Cédula: 1001

Rol: Acceso total al sistema.
2. Admin (Profesor)
Email: profe@school.com
Cédula: 2001

Rol: Puede gestionar notas y estudiantes.
3. Usuario (Padre)
Email: padre@school.com
Cédula: 3001
Rol: Puede ver boletines de sus acudidos.

4. Estudiantes
Estos usuarios están registrados en el sistema, pero normalmente no inician sesión (depende de tu implementación). Sus datos se usan para generar boletines.

Estudiante 1: estudiante1@school.com (Cédula: 4001) - Grado 10-A
Estudiante 2: estudiante2@school.com (Cédula: 4002) - Grado 10-A
Estudiante 3: estudiante3@school.com (Cédula: 4003) - Grado 11-B
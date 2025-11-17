const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Servir login.html al acceder a /login vía GET para evitar error "Cannot GET /login"
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// --- CONEXIÓN A LA BASE DE DATOS ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_database'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos MySQL.');
});

// --- RUTAS DE LA API ---

// Ruta para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { cedula, username, email, password } = req.body;

    if (!cedula || !username || !email || !password) {
        return res.status(400).json({ message: 'Por favor, completa todos los campos.' });
    }

    // Determinar el rol basado en el email
    let role = 'user';
    if (email.endsWith('@admin.school.com')) {
        role = 'admin';
    } else if (email.endsWith('@superadmin.school.com')) {
        role = 'super-admin';
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error al encriptar la contraseña.' });
        }

        const query = 'INSERT INTO personas (cedula, nombre, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [cedula, username, email, hash, role], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'El nombre de usuario, email o la cédula ya existen.' });
                }
                console.error('Error al registrar:', err);
                return res.status(500).json({ message: 'Error al registrar el usuario.' });
            }
            return res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        });
    });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, introduce un email y contraseña.' });
    }

const query = 'SELECT * FROM personas WHERE email = ? AND role != "estudiante"';
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error al verificar la contraseña.' });
            }

            if (isMatch) {
                const roleMap = {
                    'user': 'Padre',
                    'admin': 'Maestro',
                    'super-admin': 'Director'
                };

                const userData = {
                    username: user.username,
                    cedula: user.cedula,
                    email: user.email,
                    role: roleMap[user.role] || user.role
                };

                // Redirigir según el rol
                let redirectTo = 'dashboard.html'; // Por defecto para padres
                if (user.role === 'admin') {
                    redirectTo = 'admin.html';
                } else if (user.role === 'super-admin') {
                    redirectTo = 'super-admin.html';
                }

                return res.status(200).json({
                    message: `Login de ${roleMap[user.role] || 'Usuario'} exitoso.`,
                    redirectTo: redirectTo,
                    user: userData
                });
            } else {
                return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
            }
        });
    });
});

// Ruta de login para estudiantes
app.post('/student-login', (req, res) => {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
        return res.status(400).json({ message: 'Por favor, introduce cédula y contraseña.' });
    }

    const query = 'SELECT p.*, e.grado FROM personas p LEFT JOIN estudiantes e ON p.cedula = e.cedula WHERE p.cedula = ? AND (p.role = "estudiante" OR p.role IS NULL OR p.role = "")';
    db.query(query, [cedula], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error en el servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Cédula o contraseña incorrectos.' });
        }

        const student = results[0];

        bcrypt.compare(password, student.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error al verificar la contraseña.' });
            }

            if (isMatch) {
                const studentData = {
                    username: student.username || student.nombre,
                    cedula: student.cedula,
                    nombre: student.nombre,
                    grado: student.grado,
                    role: 'estudiante'
                };

                return res.status(200).json({
                    message: 'Login de estudiante exitoso.',
                    redirectTo: 'student-grades.html',
                    user: studentData
                });
            } else {
                return res.status(401).json({ message: 'Cédula o contraseña incorrectos.' });
            }
        });
    });
});

app.get('/api/student-records', (req, res) => {
    const { subject, grado, targeta_identidad } = req.query;

    let query = `
        SELECT 
            l.id,
            p.nombre AS student_name,
            m.nombre AS subject,
            e.grado,
            l.logros,
            l.l_h AS I_H,
            l.j_v AS J_V,
            p.cedula AS targeta_identidad
        FROM logros l
        JOIN estudiantes e ON l.estudiante_id = e.id
        JOIN personas p ON e.cedula = p.cedula
        JOIN materias m ON l.materia_id = m.id
    `;

    const values = [];
    const conditions = [];

    if (subject) {
        conditions.push('m.nombre = ?');
        values.push(subject);
    }

    if (grado) {
        conditions.push('e.grado = ?');
        values.push(grado);
    }

    if (targeta_identidad) {
        conditions.push('p.cedula = ?');
        values.push(targeta_identidad);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.nombre, m.nombre';

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Error al obtener los registros:", err);
            return res.status(500).json({ message: 'Error en el servidor al obtener los registros.' });
        }
        console.log('Raw data from database:', results);

        const modifiedResults = results.map(record => ({
            id: record.id,
            student_name: record.student_name,
            subject: record.subject,
            grado: record.grado,
            logros: record.logros,
            I_H: record.I_H,
            J_V: record.J_V,
            targeta_identidad: record.targeta_identidad
        }));

        console.log('Modified data sent to frontend:', modifiedResults);
        res.status(200).json(modifiedResults);
    });
});

app.get('/api/boletines/:grado', (req, res) => {
    const { grado } = req.params;
    console.log('Received request for boletines with grado:', grado);

    const query = `
        SELECT 
            p.nombre AS student_name,
            p.cedula AS targeta_identidad,
            e.grado,
            m.nombre AS materia,
            l.l_h AS I_H,
            l.j_v AS J_V,
            l.logros
        FROM logros l
        JOIN estudiantes e ON l.estudiante_id = e.id
        JOIN personas p ON e.cedula = p.cedula
        JOIN materias m ON l.materia_id = m.id
        WHERE e.grado = ?
        ORDER BY p.nombre, m.nombre
    `;

    db.query(query, [grado], (err, results) => {
        if (err) {
            console.error("Error al obtener los registros para los boletines:", err);
            return res.status(500).json({ message: 'Error en el servidor al obtener los registros.' });
        }
        console.log('Query results:', results);

        if (results.length === 0) {
            console.log('No students found for grado:', grado);
            return res.status(200).json([]);
        }

        const students = {};
        results.forEach(record => {
            const studentId = record.targeta_identidad;
            if (!students[studentId]) {
                students[studentId] = {
                    student_name: record.student_name,
                    targeta_identidad: record.targeta_identidad,
                    grado: record.grado,
                    records: []
                };
            }
            students[studentId].records.push({
                subject: record.materia,
                I_H: record.I_H,
                J_V: record.J_V,
                logros: record.logros
            });
        });

        const studentsArray = Object.values(students);
        console.log('Students array to be sent:', studentsArray);

        res.status(200).json(studentsArray);
    });
});

app.get('/api/boletin/:cedula', (req, res) => {
    const { cedula } = req.params;

    const query = `
        SELECT 
            p.nombre AS student_name,
            p.cedula AS targeta_identidad,
            e.grado,
            m.nombre AS materia,
            l.l_h AS I_H,
            l.j_v AS J_V,
            l.logros
        FROM logros l
        JOIN estudiantes e ON l.estudiante_id = e.id
        JOIN personas p ON e.cedula = p.cedula
        JOIN materias m ON l.materia_id = m.id
        WHERE p.cedula = ?
        ORDER BY m.nombre
    `;

    db.query(query, [cedula], (err, results) => {
        if (err) {
            console.error("Error al obtener el boletín del estudiante:", err);
            return res.status(500).json({ message: 'Error en el servidor al obtener el boletín.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontró un estudiante con esa cédula.' });
        }

        const studentData = {
            student_name: results[0].student_name,
            targeta_identidad: results[0].targeta_identidad,
            grado: results[0].grado,
            records: []
        };

        results.forEach(record => {
            studentData.records.push({
                subject: record.materia,
                I_H: record.I_H,
                J_V: record.J_V,
                logros: record.logros
            });
        });

        res.status(200).json(studentData);
    });
});

// --- RUTAS DE GESTIÓN DE USUARIOS (PARA SUPER-ADMIN) ---

// NOTA: Estas rutas deberían estar protegidas para ser accesibles solo por super-administradores.

// Obtener todos los usuarios
app.get('/api/users', (req, res) => {
const query = 'SELECT cedula, nombre, email, role FROM personas';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ message: 'Error en el servidor al obtener usuarios.' });
        }
        const users = results.map(user => ({
            cedula: user.cedula,
            nombre: user.nombre || user.username,
            email: user.email,
            role: user.role || 'estudiante'
        }));
        res.status(200).json(users);
    });
});

// Crear un nuevo usuario
app.post('/api/users', (req, res) => {
    const { cedula, username, email, password, role } = req.body;

    if (!cedula || !username || !email || !password || !role) {
        return res.status(400).json({ message: 'Por favor, completa todos los campos requeridos.' });
    }

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: 'Error al encriptar la contraseña.' });

        const query = 'INSERT INTO personas (cedula, nombre, email, password, role) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [cedula, username, email, hash, role], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'El nombre de usuario, email o la cédula ya existen.' });
                }
                console.error('Error al crear usuario:', err);
                return res.status(500).json({ message: 'Error al registrar el usuario.' });
            }
            res.status(201).json({ message: 'Usuario creado exitosamente.' });
        });
    });
});

// Actualizar el rol de un usuario
app.put('/api/users/:cedula/role', (req, res) => {
    const { cedula } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: 'El rol es requerido.' });

    if (!['user', 'admin', 'super-admin', 'estudiante'].includes(role)) {
        return res.status(400).json({ message: 'Rol no válido.' });
    }

    const query = 'UPDATE personas SET role = ? WHERE cedula = ?';

    db.query(query, [role, cedula], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al actualizar el rol del usuario.' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
        res.status(200).json({ message: 'Rol de usuario actualizado exitosamente.' });
    });
});

// Eliminar un usuario
app.delete('/api/users/:cedula', (req, res) => {
    const { cedula } = req.params;
const query = 'DELETE FROM personas WHERE cedula = ?';
    db.query(query, [cedula], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error al eliminar el usuario.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    });
});

// Ruta para actualizar un registro de nota
app.put('/api/student-records/:id', (req, res) => {
    const { id } = req.params;
    console.log('PUT /api/student-records/:id called with id=', id, 'body=', req.body);
    // Expecting fields: grado, logros, I_H, J_V, optionally subject (name of materia)
    const { grado, logros, I_H, J_V, subject } = req.body;

    // Helper to run the update once we know whether we need to change materia_id
    function runUpdate(materiaId) {
        // Build query dynamically depending on whether materiaId was resolved
        let query = 'UPDATE logros SET logros = ?, l_h = ?, j_v = ?';
        const values = [logros, I_H, J_V];
        if (typeof materiaId !== 'undefined' && materiaId !== null) {
            query += ', materia_id = ?';
            values.push(materiaId);
        }
        query += ' WHERE id = ?';
        values.push(id);

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al actualizar el registro (logros):', err);
                return res.status(500).json({ message: 'Error en el servidor al actualizar el registro.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'No se encontró un registro con ese ID.' });
            }
            res.status(200).json({ message: 'Registro actualizado exitosamente.' });
        });
    }

    // If a subject (materia name) was provided, resolve its id first
    if (subject) {
        const materiaQuery = 'SELECT id FROM materias WHERE nombre = ? LIMIT 1';
        db.query(materiaQuery, [subject], (err, results) => {
            if (err) {
                console.error('Error al buscar la materia:', err);
                return res.status(500).json({ message: 'Error en el servidor al resolver la materia.' });
            }
            if (!results || results.length === 0) {
                return res.status(400).json({ message: 'Materia no encontrada. Usa un nombre de materia válido.' });
            }
            const materiaId = results[0].id;
            runUpdate(materiaId);
        });
    } else {
        // No subject provided — just update the numeric/text fields
        runUpdate(null);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
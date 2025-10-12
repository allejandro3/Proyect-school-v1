# School Management System

A comprehensive web-based school management system built with Node.js backend and vanilla JavaScript frontend. The system provides role-based access control for parents, teachers, and directors to manage student grades, view report cards, and handle administrative tasks.

## Features

### User Management
- **Role-based Authentication**: Support for multiple user roles (Parents, Teachers, Directors)
- **Secure Registration**: User registration with email domain-based role assignment
- **Password Security**: bcrypt hashing for secure password storage
- **Session Management**: Client-side session storage for user state

### Grade Management
- **Grade Editing**: Teachers can filter and edit student grades by subject and grade level
- **Grade Records**: Store achievements (logros), hours (I.H), and evaluation scores (J.V)
- **Subject Management**: Support for multiple subjects per student

### Report Cards (Boletines)
- **Individual Report Cards**: Parents can view their child's report card by ID
- **Bulk Report Generation**: Teachers and directors can generate report cards for entire grades
- **Performance Classification**: Automatic performance levels (Bajo, Básico, Alto, Superior)
- **Print-Ready**: Optimized layouts for printing report cards

### Administrative Features
- **User Management**: Super administrators can create, edit, and delete users
- **Role Assignment**: Change user roles dynamically
- **Grade Filtering**: Advanced filtering by subject, grade, and student ID

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **Vanilla JavaScript** - Client-side logic
- **Font Awesome** - Icons

### Database
- **MySQL** - Relational database
- **Tables**: personas, estudiantes, logros, materias

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/allejandro3/Proyect-school-v1.git
   cd school-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**
   - Create a MySQL database named `school_database`
   - Import the database schema (if provided) or create tables manually:
     ```sql
     -- Example table structures
     CREATE TABLE personas (
       cedula VARCHAR(20) PRIMARY KEY,
       nombre VARCHAR(100),
       username VARCHAR(50),
       email VARCHAR(100) UNIQUE,
       password VARCHAR(255),
       role ENUM('estudiante', 'user', 'admin', 'super-admin')
     );

     CREATE TABLE estudiantes (
       id INT AUTO_INCREMENT PRIMARY KEY,
       cedula VARCHAR(20),
       nombre VARCHAR(100),
       grado VARCHAR(10),
       FOREIGN KEY (cedula) REFERENCES personas(cedula)
     );

     CREATE TABLE materias (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombre VARCHAR(100)
     );

     CREATE TABLE logros (
       id INT AUTO_INCREMENT PRIMARY KEY,
       estudiante_id INT,
       materia_id INT,
       logros TEXT,
       l_h INT, -- I.H (hours)
       j_v DECIMAL(3,2), -- J.V (evaluation score)
       FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
       FOREIGN KEY (materia_id) REFERENCES materias(id)
     );
     ```

4. **Configure Database Connection**
   Update the database credentials in `backend/server.js`:
   ```javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'your_mysql_user',
     password: 'your_mysql_password',
     database: 'school_database'
   });
   ```

5. **Start the Server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on http://localhost:3000

## Usage

### User Registration
- Visit http://localhost:3000
- Click "Registrarse" (Register)
- Fill in the registration form
- Role is automatically assigned based on email domain:
  - `@admin.school.com` → Teacher (admin)
  - `@superadmin.school.com` → Director (super-admin)
  - Others → Parent (user)

### Login and Navigation
- Login with email and password
- Redirected to appropriate dashboard based on role:
  - **Parents**: View child report cards
  - **Teachers**: Edit grades and generate report cards
  - **Directors**: Full administrative access

### API Endpoints

#### Authentication
- `POST /register` - Register new user
- `POST /login` - User login

#### Grade Management
- `GET /api/student-records` - Get grade records (with filters)
- `PUT /api/student-records/:id` - Update grade record

#### Report Cards
- `GET /api/boletines/:grado` - Get report cards for grade
- `GET /api/boletin/:cedula` - Get individual student report card

#### User Management (Super Admin)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:cedula/role` - Update user role
- `DELETE /api/users/:cedula` - Delete user

## Project Structure

```
school-management-system/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── package-lock.json
├── frontend/
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Parent dashboard
│   ├── admin.html         # Teacher dashboard
│   ├── super-admin.html   # Director dashboard
│   ├── manage-users.html  # User management
│   ├── edit-grades.html   # Grade editing
│   ├── view-boletines.html # Report card viewer
│   ├── select-grade.html  # Grade selection
│   └── styles.css         # Global styles
└── README.md
```

## Database Schema

### personas (Users)
- cedula (PK)
- nombre
- username
- email (UNIQUE)
- password (hashed)
- role

### estudiantes (Students)
- id (PK)
- cedula (FK → personas.cedula)
- nombre
- grado

### materias (Subjects)
- id (PK)
- nombre

### logros (Achievements/Grades)
- id (PK)
- estudiante_id (FK → estudiantes.id)
- materia_id (FK → materias.id)
- logros (TEXT)
- l_h (INT) - Instructional Hours
- j_v (DECIMAL) - Evaluation Score

## Security Features

- Password hashing with bcrypt
- Role-based access control
- Session-based authentication
- Input validation and sanitization
- CORS configuration for API security

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

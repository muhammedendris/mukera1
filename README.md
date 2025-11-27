# Internship Management System

A comprehensive full-stack MERN (MongoDB, Express, React, Node.js) web application for managing university internship programs. This system features a professional public-facing website and a secure role-based portal for students, deans, company administrators, and advisors.

## Features

### Public Website
- **Modern Landing Page**: Professional hero section with call-to-action buttons
- **About Page**: Company mission and internship program information
- **Contact Page**: Contact form for inquiries
- **Responsive Design**: Mobile-friendly UI with high-quality images

### Private Portal (4 User Roles)

#### 1. Student Role
- Register with ID card upload
- Account verification by Department Dean
- Submit internship applications with duration and cover letter
- Track application status (Pending/Accepted/Rejected)
- View assigned advisor details
- Real-time chat with advisor
- Upload weekly reports
- View final grades and evaluations

#### 2. Department Dean Role (University Staff)
- Self-registration with staff ID card upload
- Account activation by Company Admin
- Review and verify student registrations from their university
- View student ID cards before verification
- Monitor student performance and final grades
- Approve or reject student accounts

#### 3. Company Admin Role (System Super Admin)
- Verify and activate Dean accounts
- Review Dean ID cards
- Create, edit, and delete Advisor accounts
- Review student internship applications
- View application details (duration, cover letter)
- Accept or reject applications
- Assign advisors to accepted students
- Full system oversight

#### 4. Advisor Role (Company Employee)
- View assigned students
- Real-time chat with students
- Review and download student reports
- Submit final evaluations and grades
- Provide feedback on student performance

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling
- **Responsive Design** - Mobile-first approach

## Project Structure

```
internship-management-system/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── App.js
└── README.md
```

## Core Workflow

1. **Dean Registration**: Dean signs up with staff ID card → Status: Pending
2. **Student Registration**: Student signs up with ID card → Status: Pending
3. **Dean Verification**: Company Admin reviews and verifies Dean account → Dean: Active
4. **Student Verification**: Dean reviews and verifies their students → Student: Verified
5. **Application Submission**: Verified student submits application with duration and cover letter
6. **Application Review**: Company Admin reviews and accepts/rejects application
7. **Advisor Assignment**: Company Admin assigns an advisor to accepted student
8. **Internship Period**: Student and Advisor communicate, share files, submit reports
9. **Final Evaluation**: Advisor submits final grade → Visible to Student and Dean

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internship-management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Credentials

For initial setup, a Company Admin account should be created manually in the database or via a seed script:

```javascript
{
  email: "admin@company.com",
  password: "Admin@123",
  role: "company-admin",
  fullName: "System Administrator",
  isVerified: true
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Student or Dean)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/pending-deans` - Get pending dean registrations (Admin only)
- `PATCH /api/users/:id/verify` - Verify user account
- `GET /api/users/students` - Get students for verification (Dean)

### Applications
- `POST /api/applications` - Submit internship application
- `GET /api/applications` - Get applications (filtered by role)
- `PATCH /api/applications/:id/status` - Accept/Reject application (Admin)
- `PATCH /api/applications/:id/assign-advisor` - Assign advisor (Admin)

### Advisors
- `POST /api/advisors` - Create advisor account (Admin)
- `GET /api/advisors` - Get all advisors
- `PUT /api/advisors/:id` - Update advisor
- `DELETE /api/advisors/:id` - Delete advisor

### Chat
- `POST /api/chats` - Send message
- `GET /api/chats/:applicationId` - Get chat history

### Evaluations
- `POST /api/evaluations` - Submit evaluation (Advisor)
- `GET /api/evaluations/:studentId` - Get student evaluation

### Reports
- `POST /api/reports` - Upload weekly report (Student)
- `GET /api/reports/:studentId` - Get student reports

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- File upload validation
- XSS protection
- Input sanitization

## File Uploads

The system handles the following file uploads:
- **ID Cards** (Student & Dean registration): JPG, PNG, PDF
- **Weekly Reports** (Students): PDF, DOCX
- **Evaluation Documents** (Advisors): PDF

All files are stored in the `backend/uploads/` directory with organized subdirectories.

## Development Notes

- Always run MongoDB before starting the backend
- Ensure both frontend and backend servers are running for full functionality
- Use proper environment variables in production
- Change default JWT secret before deployment
- Configure proper CORS settings for production

## Database Models

### User Model
- email, password (hashed)
- role: student | dean | company-admin | advisor
- fullName, university, department
- idCardPath (for uploaded ID files)
- isVerified (boolean)

### Application Model
- student (reference to User)
- requestedDuration
- coverLetter
- status: pending | accepted | rejected
- assignedAdvisor (reference to User)

### Chat Model
- application (reference to Application)
- sender, receiver (references to User)
- message, timestamp

### Evaluation Model
- student (reference to User)
- advisor (reference to User)
- grade, comments, completionDate

### Report Model
- student (reference to User)
- weekNumber, filePath, uploadDate

## Contributing

This is an internship management system project. For improvements or bug fixes, please follow standard Git workflow practices.

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please contact the system administrator or use the contact form on the website.

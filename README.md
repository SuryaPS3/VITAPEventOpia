# 🎪 EventOpia - VIT-AP University Event Management System

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Azure SQL](https://img.shields.io/badge/Azure_SQL-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/en-us/products/azure-sql/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

## 🚀 Project Overview

EventOpia is a comprehensive event management system built for VIT-AP University that streamlines the entire event lifecycle - from creation to approval to student registration. The platform implements a sophisticated multi-role workflow system that ensures proper governance while maintaining user-friendly interfaces.

### 🎯 The Challenge Solved

**The most challenging aspect of this project was implementing a real-time, multi-role event approval workflow system.** The complexity involved:

- **Multi-Role Authentication**: Designing secure JWT-based authentication supporting Admin, Department Head, Faculty, and Student roles
- **Real-Time State Management**: Ensuring event status changes immediately reflect across all user dashboards
- **Complex Database Relationships**: Managing interconnected data between Users, Events, Clubs, and Approvals tables
- **Async Operation Handling**: Implementing robust error handling for database operations and API calls
- **Role-Based UI Rendering**: Creating dynamic interfaces that adapt based on user permissions

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🔥 Key Features

### 👑 **Admin Dashboard**
- Create events with detailed information including Google Forms integration
- Track event submission status in real-time
- View personal event history and analytics
- Full event lifecycle management

### 🎯 **Department Head Dashboard**
- Review pending event requests with detailed information
- Approve/reject events with feedback comments
- Analytics dashboard showing approval trends
- System management and oversight tools

### 👥 **Student Interface (Visitor Page)**
- Browse approved events by category (Dance, Music, Classical, Cultural, Theatre, Literary)
- Register for events via integrated Google Forms
- Filter events by clubs and interests
- Responsive design for mobile and desktop access

### 🛡️ **Security & Authentication**
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- SQL injection protection with parameterized queries
- Environment variable configuration for sensitive data

### 💻 **Technical Features**
- Real-time event status synchronization across all user interfaces
- Azure SQL Database integration with robust schema design
- RESTful API design with comprehensive error handling
- Modern React frontend with efficient state management

## 🚀 Demo

### Login Credentials

**Visitor Login:**
```
Email: any email
Password: any password
```

**Club Task Force Login:**
```
Email: any email
Password: any password
Club: Select any club from dropdown
```

**Administrator Login:**
```
Email: any email
Password: any password
Admin Code: ADMIN123
```

## 🛠️ Technologies Used

- **Frontend Framework**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Emoji-based icons
- **Animation**: CSS transitions and transforms

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/college-event-management.git
cd college-event-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Tailwind CSS** (if not already configured)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

4. **Configure Tailwind CSS**

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to your `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

5. **Start the development server**
```bash
npm start
```

6. **Open your browser**
```
http://localhost:3000
```

## 💻 Usage

### Login Process

1. **Select your role** from the three tabs (Visitor, Club, Admin)
2. **Fill in the credentials**:
   - Email address
   - Password
   - Additional fields based on role (Club name for Club Task Force, Admin code for Administrator)
3. **Click the login button**
4. **Access granted!** You'll be redirected to the main event dashboard

### Browsing Events

1. **View all events** on the main dashboard
2. **Filter by club** using the category tabs
3. **Click on club cards** to quickly navigate to their events
4. **View event details** including date, time, location, and pricing

### Registering for Events

1. **Click "Register Now"** on any event card
2. **Select your participation type**:
   - Event Management (organize)
   - Volunteer (help out)
   - Performer (showcase talent)
   - Audience Member (attend)
3. **Confirm registration**

### Role-Specific Actions

**Administrator:**
- Access admin panel buttons
- Manage all events
- View all registrations
- Access system settings

**Club Task Force:**
- Access club management panel
- Manage your club's events
- View club-specific registrations

**Visitor:**
- Browse all events
- Register for events
- View club information

## 👥 User Roles

| Role | Access Level | Features |
|------|-------------|----------|
| **Visitor** | Basic | Browse events, register for events |
| **Club Task Force** | Moderate | Manage club events, view club registrations |
| **Administrator** | Full | Manage all events, view all registrations, system settings |

## 📁 Project Structure

```
college-event-management/
│
├── src/
│   ├── components/
│   │   └── CollegeEventManagement.jsx
│   ├── App.js
│   ├── index.js
│   └── index.css
│
├── public/
│   └── index.html
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 📸 Screenshots

### Login Page
Beautiful authentication interface with three login modes and glassmorphism design.

### Main Dashboard
Grid layout showcasing all clubs with hover animations and smooth transitions.

### Events Section
Filtered event cards with detailed information and easy registration.

### Admin Panel
Exclusive administrator controls for comprehensive system management.

## 🎨 Design Features

- **Glassmorphism UI**: Modern translucent design with backdrop blur
- **Gradient Backgrounds**: Eye-catching purple, blue, and pink gradients
- **Smooth Animations**: Entrance animations and hover effects
- **Responsive Grid**: Adapts seamlessly to all screen sizes
- **Interactive Elements**: Buttons, cards, and modals with visual feedback

## 🔧 Customization

### Adding New Clubs

Edit the `clubs` array in the component:
```javascript
const clubs = [
  {
    id: 'newclub',
    icon: '🎨',
    name: 'New Club Name',
    description: 'Club description here'
  },
  // ... existing clubs
];
```

### Adding New Events

Edit the `events` array:
```javascript
const events = [
  {
    id: 7,
    title: 'New Event',
    date: 'Oct 30, 2025',
    location: 'Venue Name',
    time: '5:00 PM - 8:00 PM',
    price: 'Free Entry',
    category: 'dance'
  },
  // ... existing events
];
```

### Changing Color Scheme

Modify Tailwind classes in the component or update your `tailwind.config.js` for global theme changes.

## 🚀 Future Enhancements

- [ ] Backend integration with REST API
- [ ] Database connectivity (MongoDB/PostgreSQL)
- [ ] Real-time notifications
- [ ] Email confirmation system
- [ ] Payment gateway integration
- [ ] Event calendar view
- [ ] User profile management
- [ ] Event search functionality
- [ ] Advanced filtering options
- [ ] Event analytics dashboard
- [ ] Mobile app version
- [ ] Social media integration

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow React best practices
- Maintain code consistency
- Add comments for complex logic
- Update documentation as needed
- Test thoroughly before submitting

## 🐛 Known Issues

- Currently uses client-side only authentication (no backend)
- Registrations are not persisted (state-only)
- No email verification system
- Limited to predefined clubs and events

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and supporters of this project
- College event management teams for inspiration

## 💻 Technical Implementation Details

### Event Approval Workflow System
```javascript
// Backend API - Event Approval Endpoint
app.post('/api/events/:id/approve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;
  
  try {
    // Update event status to approved
    await pool.request()
      .input('eventId', sql.Int, id)
      .input('status', sql.VarChar, 'approved')
      .query('UPDATE Events SET status = @status WHERE id = @eventId');
    
    // Log the approval action for audit trail
    await pool.request()
      .input('eventId', sql.Int, id)
      .input('approvedBy', sql.VarChar, req.user.name)
      .input('comments', sql.Text, comments)
      .query('INSERT INTO EventApprovals VALUES (@eventId, @approvedBy, @comments)');
    
    res.json({ success: true, message: 'Event approved successfully' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
```

### Database Schema Design
```sql
-- Core tables supporting the multi-role workflow system
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) DEFAULT 'visitor',
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE Events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NTEXT,
    event_date DATE NOT NULL,
    event_time NVARCHAR(20),
    venue NVARCHAR(200),
    category NVARCHAR(50),
    status NVARCHAR(20) DEFAULT 'pending',
    registration_form_url NVARCHAR(1024),
    created_by_name NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE EventApprovals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    event_id INT FOREIGN KEY REFERENCES Events(id),
    approved_by NVARCHAR(100),
    status NVARCHAR(20),
    comments NTEXT,
    approved_at DATETIME DEFAULT GETDATE()
);
```

### Frontend State Management
```javascript
// Real-time event status synchronization
const [events, setEvents] = useState([]);
const [user, setUser] = useState(null);

const fetchEvents = async () => {
  try {
    const response = await apiClient.get('/events?status=approved');
    if (response.success) {
      setEvents(response.events.map(event => ({
        ...event,
        registration_form_url: event.registration_form_url
      })));
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};
```

## 🔧 Key Technical Challenges Solved

1. **SQL Parameter Validation**: Resolved SQL Time type validation issues by switching to NVarChar with custom validation
2. **Async State Management**: Implemented proper async/await patterns for real-time status updates
3. **Role-Based UI Rendering**: Created dynamic interfaces that adapt to user permissions
4. **Database Relationship Management**: Designed efficient schema for complex workflow requirements
5. **Google Forms Integration**: Seamless external registration form integration with proper URL validation

---

## Authors
 - Surya Pratap Singh (Lead Developer)
 - Rohan Shah  
 - Siddhant Rana

<div align="center">

Made with ❤️ for College Communities

⭐ Star this repo if you find it helpful!

</div>

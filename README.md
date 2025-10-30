# 🎭 College Event Management System

A modern, responsive web application for managing college events with role-based authentication and beautiful UI built with React and Tailwind CSS.

![React](https://img.shields.io/badge/React-18.0+-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

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
- [Documentation](#documentation)

## ✨ Features

### 🔐 Authentication System
- **Three-tier login system**:
  - 👥 Visitor Access
  - 🎯 Club Task Force Access
  - 👑 Administrator Access
- Role-based access control
- Secure logout functionality
- Form validation

### 🎪 Event Management
- Browse events by category (Dance, Music, Drama, Literary, etc.)
- Detailed event information (date, time, location, pricing)
- Event registration with multiple participation types:
  - Event Management
  - Volunteer
  - Performer
  - Audience Member

### 🏛️ Club Management
- 6 Different club categories:
  - 💃 Dance Club
  - 🎸 Western Music Club
  - 🎻 Classical Music Club
  - 🇮🇳 Hindi Association Club
  - 🎭 Drama Club
  - 📚 Literary Society

### 🎨 User Interface
- Modern glassmorphism design
- Smooth animations and transitions
- Responsive layout (mobile, tablet, desktop)
- Interactive hover effects
- Beautiful gradient backgrounds
- Modal dialogs for registration

### 🛠️ Role-Specific Features
- **Administrators**: Full system control panel
- **Club Task Force**: Club-specific event management
- **Visitors**: Event browsing and registration

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

---

## 📚 Documentation

### GitHub Profile README Guide
Want to create an awesome GitHub profile README? Check out our comprehensive guide:

👉 **[How to Add a README.md to Your GitHub Profile](docs/GITHUB_PROFILE_README.md)**

This guide includes:
- Step-by-step instructions for creating a profile README
- Customization ideas and templates
- Best practices and tips
- Tools and resources
- Examples and inspiration

---

## Authors
 - Surya Pratap Singh
 - Rohan Shah
 - Siddhant Rana

<div align="center">

Made with ❤️ for College Communities

⭐ Star this repo if you find it helpful!

</div>

# React Firebase Booking System

A modern, real-time booking system built with React and Firebase. Create, manage, and visualize bookings with a beautiful, responsive interface.

<img width="1917" height="1008" alt="image" src="https://github.com/user-attachments/assets/1c3107d3-1da7-419a-8485-6aca40fbee60" />

<img width="1850" height="960" alt="image" src="https://github.com/user-attachments/assets/82326506-1454-4309-bba7-325e40b5c984" />

<img width="1850" height="960" alt="image" src="https://github.com/user-attachments/assets/75c1adf6-faaa-43c4-89db-1aab69e96727" />

<img width="1904" height="1032" alt="image" src="https://github.com/user-attachments/assets/8227c2a8-1236-4218-a770-2931b228d49f" />


![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Authentication** - Email/Password and Google OAuth
- **Dashboard** - Overview with statistics and upcoming meetings
- **Calendar View** - Visual monthly calendar with booking indicators
- **Booking Management** - Create, edit, delete, and filter bookings
- **Search & Filter** - Find bookings by title, attendees, or status
- **Real-time Updates** - Live synchronization across all users
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with Tailwind CSS

## Demo

[Live Demo](https://your-app-url.web.app) | [Screenshots](#screenshots)

## Table of Contents

- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Usage](#usage)
- [Features](#features-detailed)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexalghisi/react-firebase-booking.git
   cd react-firebase-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS** (if not already installed)
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Configure Tailwind** (update `tailwind.config.js`)
   ```javascript
   module.exports = {
     content: ["./src/**/*.{js,jsx,ts,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```

5. **Set up Firebase** (see [Firebase Setup](#firebase-setup))

6. **Start the development server**
   ```bash
   npm start
   ```

7. **Open your browser** to `http://localhost:3000`

## Firebase Setup

### 1. Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Choose your Google Analytics preferences

### 2. Enable Authentication

1. Navigate to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** for development
4. Choose your preferred location

### 4. Get Configuration

1. Go to **Project Settings** → **General**
2. In the "Your apps" section, click the web icon `</>`
3. Register your app with a nickname
4. Copy the Firebase configuration object

### 5. Configure Your App

Create or update `src/firebase/config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

### 6. Set Up Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         request.auth.token.email in resource.data.attendees);
      
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
      
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## Usage

### Creating a Booking

1. **Sign in** to your account
2. Click the **"+ New Booking"** button
3. Fill in the booking details:
   - Title (required)
   - Date and time (required)
   - Duration
   - Attendees (email addresses)
   - Description
4. Click **"Create Booking"**

### Managing Bookings

- **View all bookings** in the "All Bookings" tab
- **Edit bookings** by clicking the edit icon
- **Delete bookings** by clicking the trash icon
- **Filter by status** using the dropdown
- **Search** by title or attendee email

### Calendar View

- Navigate between months using arrow buttons
- Click **"Today"** to go to current month
- View booking indicators on calendar days
- Create new bookings directly from calendar

## Features Detailed

### Dashboard
- **Statistics Cards** - Total bookings, today's meetings, monthly count
- **Upcoming Bookings** - Next 5 scheduled meetings
- **Today's Schedule** - All meetings for current day

### Authentication
- **Email/Password** registration and login
- **Google OAuth** integration
- **Protected routes** - automatic redirects
- **User session** management

### Booking System
- **CRUD Operations** - Create, read, update, delete
- **Form Validation** - Client-side validation with error messages
- **Status Management** - Confirmed, pending, cancelled
- **Attendee Management** - Multiple email addresses
- **Duration Options** - 15 minutes to 3 hours

### Real-time Features
- **Live Updates** - Changes sync across all users instantly
- **Firestore Listeners** - Automatic UI updates
- **Optimistic Updates** - Immediate UI feedback

## Project Structure

```
src/
├── components/
│   ├── AllBookings.jsx      # Table view with search/filter
│   ├── BookingModal.jsx     # Create/edit booking form
│   ├── Calendar.jsx         # Monthly calendar view
│   ├── Home.jsx             # Dashboard with stats
│   ├── LoadingSpinner.jsx   # Loading component
│   ├── Login.jsx            # Authentication forms
│   ├── Navigation.jsx       # App navigation bar
│   ├── StatsCard.jsx        # Statistics display card
│   ├── TodaysSchedule.jsx   # Today's meetings widget
│   └── UpcomingBookings.jsx # Upcoming meetings widget
├── context/
│   └── BookingContext.js    # React Context for state
├── firebase/
│   └── config.js            # Firebase configuration
├── App.js                   # Main app component
├── index.js                 # React entry point
└── index.css                # Global styles + Tailwind
```

## Built With

- **[React](https://reactjs.org/)** - Frontend framework
- **[Firebase](https://firebase.google.com/)** - Backend and authentication
- **[Firestore](https://firebase.google.com/products/firestore)** - Real-time database
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router](https://reactrouter.com/)** - Navigation and routing
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)** - Firebase React hooks

## Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Netlify

1. Build your project: `npm run build`
2. Upload the `build` folder to Netlify
3. Configure environment variables if needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Firebase team for the excellent backend services
- React team for the amazing frontend framework
- Tailwind CSS for the beautiful utility classes
- Lucide for the gorgeous icons

## Support

If you have any questions or run into issues:

1. Check the [Issues](https://github.com/alexalghisi/react-firebase-booking/issues) page
2. Create a new issue with detailed information
3. Join our [Discord community](https://discord.gg/your-discord) (if applicable)

---

**Made with care by [Alex Alghisi](https://github.com/alexalghisi)**

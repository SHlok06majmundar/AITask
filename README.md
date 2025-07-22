# AITask - Intelligent Team Task Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge)](https://clerk.com/)

## 🚀 Overview

AITask is a cutting-edge team task management platform that combines powerful AI assistance with intuitive collaboration tools. Built for modern teams who need intelligent task organization, real-time collaboration, and data-driven productivity insights.

## ✨ Key Features

### 🤖 AI-Powered Productivity
- **Intelligent Assistant** - AI-powered chat assistant using Google Gemini API for task optimization and productivity insights
- **Smart Analytics** - Real-time performance metrics and intelligent recommendations
- **Automated Insights** - AI-driven task prioritization and time management suggestions

### � Advanced Team Collaboration
- **Role-Based Access Control** - Owner, Admin, and Member roles with granular permissions
- **Real-Time Task Boards** - Live kanban boards with instant updates
- **Team Task Management** - Dedicated team workspace with collaborative features
- **Member Invitations** - Seamless team building with invite system

### 📊 Comprehensive Task Management
- **Dual Task Systems** - Personal tasks and team tasks with different workflows
- **Progress Tracking** - Visual progress indicators and completion metrics
- **Time Tracking** - Built-in time logging with session management
- **Priority Management** - Four-tier priority system (Low, Medium, High, Urgent)
- **Status Workflows** - Customizable task statuses (Todo, In Progress, Review, Completed)

### 💡 Smart Features
- **Real-Time Updates** - Live synchronization across all connected clients
- **Notification System** - Instant notifications for task updates and comments
- **Activity Logging** - Comprehensive audit trail for all actions
- **Comment System** - Threaded comments with rich user interactions
- **Calendar Integration** - Task scheduling and event management

### 🎨 Modern User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark/Light Mode** - Automatic theme switching with user preferences
- **Professional UI** - Clean, intuitive interface built with Tailwind CSS
- **Breadcrumb Navigation** - Clear navigation hierarchy
- **Loading States** - Smooth user experience with proper loading indicators

## 🛠 Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, customizable icons
- **Sonner** - Toast notifications

### Backend & Database
- **MongoDB** - NoSQL database for scalable data storage
- **Next.js API Routes** - Serverless API endpoints
- **Clerk Authentication** - Secure user authentication and management

### AI & Integration
- **Google Gemini API** - Advanced AI for task assistance and insights
- **Real-time Polling** - Live data synchronization

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **TypeScript Config** - Strict type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- MongoDB database (local or cloud)
- Clerk account for authentication
- Google AI API key for Gemini integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aitask.git
   cd aitask
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Database
   MONGODB_URI=your_mongodb_connection_string

   # AI Integration
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Database Setup**
   The application will automatically create the necessary MongoDB collections:
   - `profiles` - User profiles
   - `tasks` - Personal tasks
   - `team_tasks` - Team tasks
   - `team_members` - Team membership data
   - `activities` - Activity logs
   - `notifications` - User notifications

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
aitask/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication pages
│   │   ├── sign-in/            # Sign in page
│   │   └── sign-up/            # Sign up page
│   ├── api/                     # API routes
│   │   ├── activities/         # Activity logging
│   │   ├── ai/                 # AI assistant endpoints
│   │   ├── analytics/          # Analytics data
│   │   ├── calendar/           # Calendar management
│   │   ├── notifications/      # Notification system
│   │   ├── tasks/              # Personal task management
│   │   ├── team/               # Team management
│   │   └── users/              # User management
│   ├── ai/                     # AI assistant page
│   ├── analytics/              # Analytics dashboard
│   ├── assistant/              # AI assistant interface
│   ├── calendar/               # Calendar view
│   ├── onboarding/             # User onboarding
│   ├── settings/               # User settings
│   ├── tasks/                  # Personal tasks
│   ├── team/                   # Team dashboard
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home dashboard
├── components/                  # Reusable components
│   ├── auth/                   # Authentication components
│   ├── ui/                     # UI component library
│   ├── ai-assistant.tsx        # AI chat interface
│   ├── dashboard-header.tsx    # Main header component
│   ├── sidebar.tsx             # Navigation sidebar
│   ├── task-board.tsx          # Personal task board
│   ├── team-task-board.tsx     # Team task board
│   └── ...                     # Other components
├── hooks/                      # Custom React hooks
├── lib/                        # Utility libraries
│   ├── mongodb.ts             # Database connection
│   └── utils.ts               # Utility functions
├── public/                     # Static assets
└── styles/                     # Additional styles
```

## 🔗 API Endpoints

### Authentication & Users
- `GET/POST /api/users/sync` - User profile synchronization
- `GET /api/profiles` - User profiles

### Personal Tasks
- `GET/POST /api/tasks` - Personal task management
- `GET/PUT/DELETE /api/tasks/[id]` - Individual task operations

### Team Management
- `GET/POST /api/team/tasks` - Team task operations
- `GET/PUT/DELETE /api/team/tasks/[id]` - Individual team task operations
- `POST /api/team/tasks/[id]/comments` - Task comments
- `POST /api/team/tasks/[id]/time` - Time tracking
- `GET /api/team/my-members` - Team member data

### AI & Analytics
- `POST /api/ai/chat` - AI assistant chat
- `GET /api/ai/insights` - AI-powered insights
- `GET /api/analytics` - Performance analytics

### Notifications & Activities
- `GET /api/notifications` - User notifications
- `GET /api/activities` - Activity feed

## 👥 User Roles & Permissions

### Owner
- Full system access
- Can create, edit, and delete any tasks
- Team member management
- System configuration

### Admin
- Task creation and management
- Team member invitations
- Analytics access
- Limited system settings

### Member
- View and comment on tasks
- Update assigned task status
- Time tracking
- Personal task management

## 🔧 Features in Detail

### Personal Task Management
- Create and manage individual tasks
- Kanban board interface
- Priority and status management
- Real-time updates

### Team Collaboration
- Shared team workspace
- Role-based task assignments
- Collaborative editing (owners only)
- Team progress tracking

### AI Assistant
- Natural language task queries
- Productivity recommendations
- Intelligent task prioritization
- Performance insights

### Analytics Dashboard
- Real-time productivity metrics
- Task completion rates
- Time tracking analytics
- Team performance insights

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret
MONGODB_URI=your_production_mongodb_uri
GEMINI_API_KEY=your_production_gemini_key
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write descriptive commit messages
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/aitask/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aitask/discussions)
- **Email**: support@aitask.dev

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for seamless authentication
- [MongoDB](https://mongodb.com/) for reliable data storage
- [Google AI](https://ai.google.dev/) for powerful AI integration
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

---

**Built with ❤️ for productive teams worldwide**

*AITask - Where Intelligence Meets Productivity*

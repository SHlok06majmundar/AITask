# SyncSphere - Advanced Task Management Platform

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shlok06majmundars-projects/v0-sync-sphere-concept)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/lFKrbG5hVYN)

## Overview

SyncSphere is a comprehensive task management platform designed for modern teams. Built with Next.js 15, it offers real-time collaboration, intelligent task organization, and advanced productivity features.

## Features

### 🚀 Core Features
- **Real-time Task Management** - Live updates across all team members
- **Team Collaboration** - Invite members, assign tasks, track progress
- **Smart Calendar** - Integrated scheduling with event management
- **Advanced Analytics** - Productivity insights and performance metrics
- **Productivity Assistant** - Intelligent task suggestions and optimization

### 🛠 Technical Features
- **Next.js 15** with App Router
- **MongoDB** for data persistence
- **Clerk Authentication** for secure user management
- **Real-time Updates** with live polling
- **Responsive Design** optimized for all devices
- **Dark/Light Mode** with system preference detection

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Clerk account for authentication

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/syncsphere-task-manager.git
cd syncsphere-task-manager
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Configure the following variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Environment Variables

Required environment variables for production:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MONGODB_URI`

## Project Structure

\`\`\`
syncsphere-task-manager/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Main application pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── styles/               # Global styles
\`\`\`

## Key Pages

- **Dashboard** (`/`) - Overview of tasks and recent activity
- **Tasks** (`/tasks`) - Kanban board for task management
- **Team** (`/team`) - Team member management and invitations
- **Calendar** (`/calendar`) - Event scheduling and management
- **Analytics** (`/analytics`) - Productivity metrics and insights
- **Assistant** (`/assistant`) - Productivity helper and task optimization
- **Settings** (`/settings`) - User preferences and account management

## API Routes

- `/api/tasks` - Task CRUD operations
- `/api/team` - Team management
- `/api/calendar` - Event management
- `/api/chat` - Productivity assistant
- `/api/insights` - Analytics and recommendations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

Built with ❤️ using Next.js, MongoDB, and modern web technologies.

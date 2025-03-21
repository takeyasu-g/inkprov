# Inkprov - Collaborative Story Writing Platform

Inkprov is a modern web application that enables users to collaboratively create and share stories in real-time. The platform combines the spontaneity of improvisation with structured story-writing, allowing multiple contributors to work together on creative writing projects.

## Features

### Core Functionality

- **Collaborative Writing Sessions**: Create and join writing sessions where multiple users can contribute to a story
- **Real-time Story Creation**: Write and view story contributions as they happen
- **Story Management**: Browse, create, and participate in various writing projects
- **User Profiles**: Personalized profiles with customizable avatars and bios

### User Experience

- **Modern UI/UX**: Clean, intuitive interface built with React and Tailwind CSS
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Real-time Updates**: Instant updates and notifications for story contributions
- **Rich Text Editing**: Comfortable writing experience with modern text editing capabilities

### Account Management

- **User Authentication**: Secure login and registration system
- **Profile Customization**: Update username, bio, and profile picture
- **Content Preferences**: Toggle mature content visibility
- **Account Security**: Secure account deletion with confirmation steps

## Technology Stack

### Frontend

- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation
- Zod for form validation

### Backend

- Supabase for backend services
- PostgreSQL database
- Edge Functions for serverless operations
- Real-time subscriptions

### Authentication

- Supabase Auth
- JWT token-based authentication
- Protected routes and API endpoints

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project

### Environment Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd inkprov
```

2. Install dependencies:

```bash
cd frontend
npm install
```

3. Create a `.env` file in the frontend directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_API_BASE_URL=your_api_base_url
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── navigation_pages/ # Main page components
│   │   ├── ui/            # Reusable UI components
│   │   └── writing_pages/ # Writing-related components
│   ├── contexts/          # React contexts
│   ├── styles/           # Global styles and Tailwind config
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and API calls
├── public/              # Static assets
└── package.json        # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

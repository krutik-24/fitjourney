# FitConnect - Comprehensive Fitness & Social App

## Overview

FitConnect is a full-stack fitness application that combines social networking features with AI-powered personalization. The app helps users track their fitness progress, connect with others, and receive personalized workout and meal recommendations. It's built as a modern web application using React, TypeScript, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for development and production builds
- **Component Library**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Database Provider**: Neon (serverless PostgreSQL)

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle migrations in `./migrations`
- **Session Storage**: PostgreSQL sessions table for auth persistence

## Key Components

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Management**: Server-side sessions stored in PostgreSQL
- **User Management**: Automatic user creation/updates via auth flow
- **Security**: JWT tokens, secure cookies, CSRF protection

### Database Schema
- **Users**: Profile info, fitness goals, BMI data, preferences
- **Workouts**: AI-generated and custom workout plans
- **Posts**: Social media posts with user interactions
- **Streaks**: Daily workout streak tracking
- **Workout Completions**: Historical completion data
- **Sessions**: Authentication session storage

### AI Integration
- **Workout Generation**: AI-powered personalized workout plans
- **Meal Planning**: Custom meal recommendations (planned feature)
- **API Integration**: Ready for DeepSeek API integration
- **Personalization**: Based on user BMI, goals, and preferences

### Social Features
- **Community Feed**: User posts and achievements
- **Leaderboard**: Streak-based ranking system
- **User Profiles**: Public profiles with stats and achievements
- **Post Interactions**: Like and share functionality

### Fitness Tracking
- **BMI Calculator**: Real-time BMI calculation and categorization
- **Workout Calendar**: Visual calendar for completion tracking
- **Progress Charts**: Statistics and trend visualization
- **Streak System**: Daily workout streak counting

## Data Flow

1. **User Authentication**: Replit Auth → Session Creation → User Profile Setup
2. **Workout Generation**: User Profile → AI API → Personalized Workout → Database Storage
3. **Progress Tracking**: Workout Completion → Streak Update → Statistics Calculation
4. **Social Interaction**: Post Creation → Community Feed → User Engagement
5. **Data Persistence**: All interactions stored in PostgreSQL via Drizzle ORM

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Client-side routing
- **express**: Web server framework

### UI Dependencies
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant handling

### Authentication
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **Environment**: Replit with custom domains support

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Database**: Same Neon instance with environment variables

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPLIT_DOMAINS**: Allowed domains for CORS (required)
- **ISSUER_URL**: OpenID Connect issuer (defaults to Replit)

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types and utilities
2. **Type Safety**: Full TypeScript coverage with shared schema validation
3. **Database Choice**: PostgreSQL for ACID compliance and complex queries
4. **Authentication**: Replit Auth for seamless platform integration
5. **State Management**: React Query for server state, local state for UI
6. **Styling**: Tailwind + shadcn/ui for consistent, maintainable design
7. **AI Integration**: Modular design ready for multiple AI providers
8. **Social Features**: Built-in community features for user engagement
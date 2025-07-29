# IGCSE Mock Test Platform

![IGCSE Mock Test Platform](https://via.placeholder.com/800x400?text=IGCSE+Mock+Test+Platform)

An interactive educational platform designed to help students prepare for their IGCSE exams through realistic test simulations with immediate feedback. The platform prioritizes simplicity, ease of use, and efficiency while providing a systematic and adaptive practice experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The IGCSE Mock Test Platform is a web application that simulates IGCSE exams in a realistic environment. It provides students with:

- Subject-specific mock exams with timing constraints
- Multiple question types (multiple choice, short answer, essay)
- Immediate feedback and detailed explanations
- Progress tracking and performance analytics
- Personalized learning paths

The platform also offers features for parents and teachers to monitor student progress and provide support.

## ✨ Features

### Student Portal

- **Exam Simulation**: Take timed mock exams that simulate real IGCSE test conditions
- **Multiple Subjects**: Access tests for Mathematics, Physics, Chemistry, Biology, English, and more
- **Immediate Feedback**: Get instant results with detailed explanations for each question
- **Progress Tracking**: Monitor improvement over time with detailed analytics
- **Personalized Dashboard**: View performance metrics, upcoming exams, and study recommendations
- **Error Management**: Identify knowledge gaps and receive targeted practice

### Parent Portal

- Real-time progress monitoring
- Performance analytics dashboard
- Exam schedule viewing
- Downloadable progress reports

### Teacher/Admin Portal

- User management system
- Performance monitoring
- Custom practice set creation
- Class-wide analytics

## 🛠️ Tech Stack

### Frontend
- **React**: For building the user interface
- **Vite**: Build tool for fast development
- **Tailwind CSS**: For custom styling
- **Supabase Auth**: For authentication and user management

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework for building the API
- **TypeScript**: For type-safe backend development
- **Supabase**: PostgreSQL database and authentication
- **Supabase JS Client**: For database operations and auth

### DevOps
- **Git**: Version control
- **Vercel**: Full-stack deployment (frontend + serverless backend)
- **ESLint/Prettier**: Code quality and formatting

## 📂 Project Structure

The project root is now organized for clarity and maintainability. Only essential files remain in the root; all scripts, documentation, and data are organized into dedicated subdirectories.

```
IGCSE-web/
├── backend/                # Express backend API
├── config/                 # Deployment and backend config files
├── data/                   # All data and resources
│   ├── exam-bank/          # IGCSE question bank (all subjects)
│   └── reports/            # Data analysis and import reports
├── docs/                   # Project documentation
│   ├── feedback/           # Feedback and review docs
│   ├── misc/               # Miscellaneous docs
│   ├── planning/           # Project planning docs
│   ├── requirements/       # PRDs and requirements
│   ├── testing/            # Test documentation
│   └── tools/              # Tool and workflow docs
├── frontend/               # React frontend application
├── igcse_mock_test/        # Next.js application
├── node_modules/           # Node.js dependencies
├── scripts/                # All scripts organized by purpose
│   ├── ai/                 # AI-related scripts
│   ├── analysis/           # Data analysis scripts
│   ├── config/             # Script configuration files
│   ├── data-migration/     # Data migration/import scripts
│   └── testing/            # Test and utility scripts
├── backups/                # Backup and legacy files
├── .cursor/                # Cursor AI workspace files
├── .git/                   # Git version control
├── .vercel/                # Vercel deployment config
├── .gitignore              # Git ignore rules
├── .windsurfrules          # Cursor/IDE rules
├── LICENSE                 # License file
├── package.json            # Project dependencies
├── package-lock.json       # Dependency lock file
├── README.md               # Main project documentation
├── vercel.json             # Vercel deployment config
├── vite.config.js          # Vite config (if needed for root-level builds)
```

**Key Points:**
- All scripts are now in `scripts/` (organized by function)
- All documentation is in `docs/` (organized by type)
- All data/resources are in `data/`
- Backups and legacy files are in `backups/`
- Config files for deployment and backend are in `config/`
- The root directory is clean and easy to navigate

For more details on the cleanup and organization process, see `.cursor/cleanup-plan.md`.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/weiyouc/IGCSE-web.git
   cd IGCSE-web
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the Settings > API page

4. Create environment files:

   **Backend** - Create `/backend/.env`:
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **Frontend** - Create `/frontend/.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3001/api
   ```

5. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the migration scripts from `/supabase/migrations/`

6. Start the development servers:
   ```bash
   # Start backend
   cd backend
   npm run dev

   # In a new terminal, start frontend
   cd frontend
   npm run dev
   ```

7. Open your browser and navigate to:
   - React Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

### Environment Setup Notes

- The backend uses TypeScript and requires compilation
- Supabase handles all authentication and database operations
- No local database setup required - everything runs on Supabase cloud

## 💻 Development

### Project Structure

The project is divided into two main components:

1. **Backend (`/backend`)**: Express API server with TypeScript
   - Controllers: API route handlers for Supabase operations
   - Routes: Express route definitions
   - Middleware: Supabase authentication middleware
   - Lib: Supabase client and database types
   - App.ts: Main application setup
   - Server.ts: Server entry point

2. **Frontend (`/frontend`)**: React application with Vite
   - Components: Reusable UI elements
   - Pages: Page layouts and routes
   - Context: Supabase authentication context
   - Services: API communication layer
   - Lib: Supabase client configuration
   - Assets: Images, icons, etc.

### Available Scripts

- `npm run dev`: Starts both frontend and backend in development mode
- `npm run frontend`: Starts only the frontend
- `npm run backend`: Starts only the backend
- `npm run install-all`: Installs dependencies for root, frontend, and backend

#### Backend-specific Scripts

From the `/backend` directory:
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

#### Frontend-specific Scripts

From the `/frontend` directory:
- `npm run build`: Builds the production-ready app
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

#### Next.js-specific Scripts

From the `/igcse_mock_test` directory:
- `npm run build`: Builds the production-ready Next.js app
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

### Testing the Mock Test Functionality

1. Navigate to the Exam Simulation section by clicking the "Exam Simulation" button in the navbar
2. Select your preferred subject (Mathematics, Physics, Chemistry, etc.)
3. Choose the number of questions (5, 10, 20, etc.)
4. Answer the questions within the time limit
5. Submit your answers to see your results

## 👥 User Roles

The platform supports the following user roles:

1. **Student**: Can take tests, view results, and track progress
2. **Parent**: Can monitor student progress and performance
3. **Teacher**: Can create tests, monitor student performance, and provide feedback
4. **Admin**: Has full access to system configuration and user management

## 📚 API Documentation

The backend API provides the following endpoints:

### Authentication (Supabase-based)
- `POST /api/auth/register`: Register a new user via Supabase
- `POST /api/auth/login`: Log in an existing user via Supabase
- `POST /api/auth/logout`: Log out the current user
- `GET /api/auth/user`: Get the current authenticated user

### Dashboard
- `GET /api/dashboard/stats`: Get user statistics and progress

### Subjects
- `GET /api/subjects`: Get all available subjects
- `GET /api/subjects/:id`: Get a specific subject details

### Courses
- `GET /api/courses`: Get all courses
- `GET /api/courses/:id`: Get a specific course
- `POST /api/courses/enroll`: Enroll in a course

See the [API documentation](docs/api.md) for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for IGCSE students worldwide

---

# IGCSE 模拟考试平台 (中文版)

![IGCSE 模拟考试平台](https://via.placeholder.com/800x400?text=IGCSE+Mock+Test+Platform)

一个交互式教育平台，旨在通过逼真的考试模拟和即时反馈，帮助学生准备 IGCSE 考试。该平台优先考虑简单性、易用性和效率，同时提供系统性和适应性的练习体验。

## 📋 目录

- [概述](#概述)
- [功能](#功能)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [开始使用](#开始使用)
- [开发](#开发)
- [用户角色](#用户角色)
- [API 文档](#api-文档)
- [贡献](#贡献)
- [许可证](#许可证)

## 🌟 概述

IGCSE 模拟考试平台是一个模拟 IGCSE 考试真实环境的 Web 应用程序。它为学生提供：

- 特定科目的模拟考试，有时间限制
- 多种题型（选择题、简答题、论述题）
- 即时反馈和详细解释
- 进度跟踪和表现分析
- 个性化学习路径

该平台还为家长和教师提供监控学生进度和提供支持的功能。

## ✨ 功能

### 学生门户

- **考试模拟**：参加模拟真实 IGCSE 考试条件的定时模拟考试
- **多科目**：访问数学、物理、化学、生物、英语等科目的考试
- **即时反馈**：获得即时结果，并附有每个问题的详细解释
- **进度跟踪**：通过详细分析监控学习进展
- **个性化仪表板**：查看表现指标、即将到来的考试和学习建议
- **错误管理**：识别知识差距并获得有针对性的练习

### 家长门户

- 实时进度监控
- 表现分析仪表板
- 查看考试安排
- 可下载的进度报告

### 教师/管理员门户

- 用户管理系统
- 表现监控
- 创建自定义练习集
- 班级范围的分析

## 🛠️ 技术栈

### 前端
- **Next.js**：用于服务器端渲染和静态站点生成
- **React**：用于构建用户界面
- **Chakra UI**：用于一致、可访问设计的组件库
- **Tailwind CSS**：用于自定义样式
- **Framer Motion**：用于动画和过渡

### 后端
- **Node.js**：JavaScript 运行时
- **Express**：用于构建 API 的 Web 框架
- **TypeScript**：类型安全的后端开发
- **Supabase**：PostgreSQL 数据库和身份验证
- **Supabase JS Client**：数据库操作和身份验证

### DevOps
- **Git**：版本控制
- **ESLint/Prettier**：代码质量和格式化
- **Concurrently**：用于同时运行多个命令

## 📂 项目结构

The project root is now organized for clarity and maintainability. Only essential files remain in the root; all scripts, documentation, and data are organized into dedicated subdirectories.

```
IGCSE-web/
├── backend/                # Express backend API
├── config/                 # Deployment and backend config files
├── data/                   # All data and resources
│   ├── exam-bank/          # IGCSE question bank (all subjects)
│   └── reports/            # Data analysis and import reports
├── docs/                   # Project documentation
│   ├── feedback/           # Feedback and review docs
│   ├── misc/               # Miscellaneous docs
│   ├── planning/           # Project planning docs
│   ├── requirements/       # PRDs and requirements
│   ├── testing/            # Test documentation
│   └── tools/              # Tool and workflow docs
├── frontend/               # React frontend application
├── igcse_mock_test/        # Next.js application
├── node_modules/           # Node.js dependencies
├── scripts/                # All scripts organized by purpose
│   ├── ai/                 # AI-related scripts
│   ├── analysis/           # Data analysis scripts
│   ├── config/             # Script configuration files
│   ├── data-migration/     # Data migration/import scripts
│   └── testing/            # Test and utility scripts
├── backups/                # Backup and legacy files
├── .cursor/                # Cursor AI workspace files
├── .git/                   # Git version control
├── .vercel/                # Vercel deployment config
├── .gitignore              # Git ignore rules
├── .windsurfrules          # Cursor/IDE rules
├── LICENSE                 # License file
├── package.json            # Project dependencies
├── package-lock.json       # Dependency lock file
├── README.md               # Main project documentation
├── vercel.json             # Vercel deployment config
├── vite.config.js          # Vite config (if needed for root-level builds)
```

**Key Points:**
- All scripts are now in `scripts/` (organized by function)
- All documentation is in `docs/` (organized by type)
- All data/resources are in `data/`
- Backups and legacy files are in `backups/`
- Config files for deployment and backend are in `config/`
- The root directory is clean and easy to navigate

For more details on the cleanup and organization process, see `.cursor/cleanup-plan.md`.

## 🚀 开始使用

### 先决条件

- Node.js (v18 或更高版本)
- npm 或 yarn
- Supabase 账户（用于数据库和身份验证）

### 安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/IGCSE-web.git
   cd IGCSE-web
   ```

2. 安装依赖项：
   ```bash
   npm run install-all
   ```

3. 在根目录创建一个 `.env` 文件并添加以下内容：
   ```
   # Backend
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/igcse-web
   JWT_SECRET=your_jwt_secret
   
   # Frontend
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 打开浏览器并导航至：
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 💻 开发

### Project Structure

The project is divided into two main components:

1. **Backend (`/backend`)**: Express API server with TypeScript
   - Controllers: API route handlers for Supabase operations
   - Routes: Express route definitions
   - Middleware: Supabase authentication middleware
   - Lib: Supabase client and database types
   - App.ts: Main application setup
   - Server.ts: Server entry point

2. **Frontend (`/frontend`)**: React application with Vite
   - Components: Reusable UI elements
   - Pages: Page layouts and routes
   - Context: Supabase authentication context
   - Services: API communication layer
   - Lib: Supabase client configuration
   - Assets: Images, icons, etc.

### Available Scripts

- `npm run dev`: Starts both frontend and backend in development mode
- `npm run frontend`: Starts only the frontend
- `npm run backend`: Starts only the backend
- `npm run install-all`: Installs dependencies for root, frontend, and backend

#### Backend-specific Scripts

From the `/backend` directory:
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

#### Frontend-specific Scripts

From the `/frontend` directory:
- `npm run build`: Builds the production-ready app
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

#### Next.js-specific Scripts

From the `/igcse_mock_test` directory:
- `npm run build`: Builds the production-ready Next.js app
- `npm run start`: Starts the production server
- `npm run dev`: Starts the development server with hot-reloading

### 测试模拟考试功能

1. 点击导航栏中的"考试模拟"按钮，导航至考试模拟部分
2. 选择您喜欢的科目（数学、物理、化学等）
3. 选择问题数量（5、10、20 等）
4. 在时限内回答问题
5. 提交答案以查看结果

## 👥 用户角色

平台支持以下用户角色：

1. **学生**：可以参加考试、查看结果和跟踪进度
2. **家长**：可以监控学生的进度和表现
3. **教师**：可以创建考试、监控学生表现并提供反馈
4. **管理员**：拥有对系统配置和用户管理的完全访问权限

## 📚 API 文档

后端 API 提供以下端点：

### 身份验证
- `POST /api/auth/register`：注册新用户
- `POST /api/auth/login`：登录现有用户
- `GET /api/auth/me`：获取当前用户的个人资料

### 测验
- `GET /api/quizzes`：获取所有测验
- `GET /api/quizzes/:id`：获取特定测验
- `
[English](#english) | [简体中文](#简体中文)

---

<h2 id="english">Plan & Focus</h2>

A modern, clean, and functional focus timer and task management application designed to help you stay productive, manage daily tasks, and track your focus hours. Built with React, Tailwind CSS, and Firebase.

### Features

- **🍅 Focus Timer**: A distraction-free timer to help you concentrate on your current task. Features subtle audio chimes for focus session transitions.
- **✅ Task Management**: Organize, prioritize, and check off your daily tasks simply and efficiently.
- **📊 Statistics & Insights**: Visualize your productivity trends and focus hours over time using interactive charts.
- **📋 Daily Reports**: Review your accomplishments, see your daily scoring, and track the trophies you've earned.
- **🔐 Secure Authentication**: User sign-up, login, and secure sessions powered by Firebase Authentication.
- **☁️ Cloud Sync**: Seamless data persistence using Firebase Firestore keeps your tasks, focus time, and configurations in sync across your devices.

### Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, Lucide React (for iconography)
- **Routing**: React Router DOM v7
- **Database Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Data Visualization**: Recharts

### Getting Started

#### Prerequisites

- Node.js (v18 or higher recommended)
- An active Firebase Project

#### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <your-repo-url>
   cd plan-and-focus
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   Ensure you place your `firebase-applet-config.json` file in the root directory. This file should contain your project's configuration credentials.

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Build the application for production:
   ```bash
   npm run build
   ```

### Project Structure

- `/components` - Shared UI components (App Layouts, Auth Provider, etc.)
- `/pages` - Core application views (`TimerPage`, `TasksPage`, `StatsPage`, `ReportPage`, `SettingsPage`)
- `/services` - Services that handle interactions with Firebase and underlying data persistence
- `/utils` - Generic utility functions and helpers (e.g., audio playback logic)

---

<h2 id="简体中文">Plan & Focus (专注与计划)</h2>

一款现代、简洁、实用的专注计时器和任务管理应用，旨在帮助您保持高效、管理日常任务并追踪您的专注时间。基于 React、Tailwind CSS 和 Firebase 构建。

### 核心功能

- **🍅 专注计时器**: 无干扰的计时器，助您全神贯注于当前任务。包含用于专注时段切换的提示音。
- **✅ 任务管理**: 简单高效地组织、设定优先级并完成您的每日任务。
- **📊 统计与洞察**: 使用交互式图表可视化您的生产力趋势和专注时间。
- **📋 每日报告**: 回顾您的成就，查看每日评分，并收集您获得的成就奖杯。
- **🔐 安全认证**: 由 Firebase Authentication 提供支持的用户注册、登录和安全会话管理。
- **☁️ 云端同步**: 使用 Firebase Firestore 实现无缝数据持久化，在各个设备之间实时同步您的任务、专注时间和配置。

### 技术栈

- **前端核心**: React 19, TypeScript, Vite
- **系统样式**: Tailwind CSS, Lucide React (图标库)
- **路由管理**: React Router DOM v7
- **后端数据库**: Firebase Firestore
- **身份认证**: Firebase Auth
- **数据可视化**: Recharts

### 快速开始

#### 环境要求

- Node.js (推荐 v18 或更高版本)
- 一个配置好的 Firebase 项目

#### 安装步骤

1. 克隆仓库并进入项目目录：
   ```bash
   git clone <your-repo-url>
   cd plan-and-focus
   ```

2. 安装相关依赖：
   ```bash
   npm install
   ```

3. 配置 Firebase：
   请确保将您的 `firebase-applet-config.json` 文件放置在项目根目录。该文件应包含您项目的配置凭证。

4. 启动本地开发服务器：
   ```bash
   npm run dev
   ```

5. 构建生产版本：
   ```bash
   npm run build
   ```

### 项目结构

- `/components` - 共享的 UI 组件 (如布局、Auth Provider 等)
- `/pages` - 核心应用视图 (`TimerPage`, `TasksPage`, `StatsPage`, `ReportPage`, `SettingsPage`)
- `/services` - 处理 Firebase 交互和底层数据持久化的服务
- `/utils` - 通用工具函数和辅助函数 (如音频播放逻辑)

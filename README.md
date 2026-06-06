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

### Random Task Active Scheduler Architecture

To allow completely replicating this scheduling engine in another project, below is the complete decoupled breakdown of the core components, data flow, states, and functionality:

#### 1. Core Architecture & Data Flow (`src/types.ts` & `src/App.tsx`)
This is a pure client-side application (no backend) where core states are managed at the top-most level and automatically persisted to the browser's `localStorage`.
- **Task Object**: Contains only `{ id: string; title: string }` (no `completed` status; tasks are always available in the library).
- **AppSettings**: Contains timing preferences `{ pomodoroMinutes: number; timeSliceMinutes: number; breakMinutes: number; isSoundEnabled: boolean }`.
- **AppState**: An enum string `'idle' | 'running' | 'break'`.
- **Top-Level State Allocation**: `App.tsx` maintains the `tasks` and `settings` state. It renders two main components: `TaskLibrary` (receives `tasks` and mutator methods) and `ActiveScheduler` (receives `tasks` array and `settings`).

#### 2. Task Library Component (`src/components/TaskLibrary.tsx`)
Manages the "Task Pool". This component processes no timing logic, strictly focusing on mutating the `tasks` array.
- **Adding Tasks**: The top contains a text input and submit button (listens to Enter key or form `onSubmit`). Creates a new object with a generated UUID and appends it to the `tasks` array.
- **Task List Display**: Renders all listed tasks wrapping long titles. Each task shows a default "QUEUED" status tag.
- **Edit Functionality**: Displays `[ EDIT ]` on hover. Clicking switches the row to an auto-focused text input. Hitting Enter or `[ SAVE ]` updates the `tasks` state; hitting Esc or `[ CANCEL ]` discards changes.
- **Delete Functionality**: Displays `[ DEL ]` on hover. Clicking filters the task out of the array.
- **Empty State**: Displays a clear empty library indication (e.g. `[ LIBRARY EMPTY ]`) when the array is empty.

#### 3. Active Scheduler Engine (`src/components/ActiveScheduler.tsx`)
The core engine handling time slicing, Pomodoro lifecycles, and random task dispatching logic.
- **Internal State**:
  - `appState`: Tracks the execution status (`idle` / `running` / `break`).
  - `pomodoroLeft`: Global cycle countdown (also repurposed for break countdown), in seconds.
  - `sliceLeft`: Micro-task time slice countdown, in seconds.
  - `currentTask`: A reference to the currently drawn `Task` object.
- **Core Execution Logic (using a 1-second `setInterval` tick)**:
  - **Running State**: Decrements both `pomodoroLeft` and `sliceLeft` every second.
    - **Task Switch** (`sliceLeft <= 1`): Current slice ends. Plays the slice audio chime, randomly picks a new task from `tasks` (if >= 2 tasks exist, excludes the immediately previous task to prevent back-to-back duplicates), and resets `sliceLeft`.
    - **Trigger Break** (`pomodoroLeft <= 1`): Global cycle ends. Plays the break chime, switches app state to `'break'`, resets the break countdown, and clears the current task.
  - **Break State**: Only the break countdown runs. Once reaching zero, plays the work chime, switches back to `'idle'`, and resets all timers to default configs.
- **UI Rendering**:
  - **Idle Phase**: Displays a large `[ START GLOBAL CYCLE ]` button. Prevents starting if `tasks` is empty. Upon starting, initializes timers, draws the first random task, and switches to `running`.
  - **Running Phase**: Shows the active task title at the top. The center features a massive `sliceLeft` timer (MM:SS). Below it, a smaller `pomodoroLeft` countdown and a progress bar based on the slice countdown. Options to `[ PAUSE / RESUME ]` or immediately `[ HALT ]` (returns to idle and clears the task).
  - **Break Phase**: Title reads "Break Time" with the main display showing remaining break time.

#### 4. Settings Panel (`src/components/SettingsPanel.tsx`)
Provides parameter configuration, accessible via a settings icon in the Active Scheduler.
- Allows modifying the following (applying immediately or via an `[ APPLY ]` action):
  - Global Cycle (Minutes): Full Pomodoro duration.
  - Time Slice (Minutes): Duration of each sub-task slice.
  - Break Time (Minutes): Fixed break duration after a global cycle.

#### 5. Frontend Audio Synthesis (`src/utils/audio.ts`)
Relies entirely on the native `window.AudioContext` for procedural sound generation, eliminating external media asset dependencies entirely.
- `playNotificationSound('slice')`: Emits a rapid sci-fi rising square-wave double beep to quickly capture attention when a task switches.
- `playNotificationSound('break')`: Emits a sine-wave sequence of three descending, relaxing tones to signal completion of work.
- `playNotificationSound('work')`: Emits an energetic, fast-rising three-note triangle-wave sequence to signal the start of a new loop.

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

### 随机任务时间分片调度器 (Random Task Active Scheduler)

为了在其他项目中完全复刻此调度引擎，以下是核心组件、数据流、状态和功能的完整剥离解析：

#### 1. 核心架构与数据流 (`src/types.ts` & `src/App.tsx`)
这是一个纯客户端架构（无后端），核心状态在最顶层管理，并自动持久化同步到浏览器的 `localStorage` 中。
- **Task (任务对象)**: 只包含 `{ id: string; title: string }`（任务无完成状态，在库中永远可用）。
- **AppSettings (设置对象)**: 包含时间偏好 `{ pomodoroMinutes: number; timeSliceMinutes: number; breakMinutes: number; isSoundEnabled: boolean }`。
- **AppState (应用状态)**: 枚举字符串类型 `'idle' | 'running' | 'break'`。
- **顶层状态分配**: `App.tsx` 维护 `tasks` 和 `settings` 状态。渲染两大主要组件板块：`TaskLibrary`（传入 `tasks` 与修改 `tasks` 的方法） 和 `ActiveScheduler`（传入 `tasks` 数组与 `settings` 配置）。

#### 2. 任务库组件 (`src/components/TaskLibrary.tsx`)
负责管理“任务池”。该组件不处理任何时间逻辑，仅专注于对 `tasks` 数组的增删改。
- **新增任务**: 顶部包含文本输入框和提交按钮，监听 Enter 键或表单 onSubmit。创建新对象赋 UUID，并入 `tasks` 数组。
- **任务列表展示**: 渲染所有在列任务，标题换行。每个任务旁显示一个 "QUEUED"（准备就绪）状态标签。
- **编辑功能**: 悬停时显示 `[ EDIT ]`。点击后切换为输入框模式且自动聚焦。按 Enter 或 `[ SAVE ]` 存入，Esc 或 `[ CANCEL ]` 取消。
- **删除功能**: 悬停时显示 `[ DEL ]`，点击将该任务从数组中剔除。
- **空状态处理**: `tasks` 为空时，显示明确的空库提示（如 `[ LIBRARY EMPTY ]`）。

#### 3. 动态调度器 (`src/components/ActiveScheduler.tsx`)
应用的核心引擎区，处理时间分片、Pomodoro 生命期和随机派发逻辑。
- **内部状态**:
  - `appState`: 记录目前的执行状态 (`idle` / `running` / `break`)。
  - `pomodoroLeft`: 全局周期计数（包含休息期间的倒计时），单位为秒。
  - `sliceLeft`: 时间分片的计数，单位为秒。
  - `currentTask`: 当前正在执行的 `Task` 对象引用。
- **三大运行核心逻辑**:
  - **Running 状态阶段**: 每秒同时递减 `pomodoroLeft` 和 `sliceLeft`。
    - **触发任务切换** (`sliceLeft <= 1`)：当前分片结束。播放 slice 提示音，从 `tasks` 中随机抽取一个新任务（如果有 >=2 个任务，排除当前刚做完的以防连续重复）。重置 `sliceLeft`。
    - **触发休息** (`pomodoroLeft <= 1`)：大周期完成。播放 break 提示音。切换至 `'break'`，重置休息倒计时，清空当前任务。
  - **Break 状态阶段**: 只运行休息倒计时。触底后播放 work 提示音，状态回 `'idle'`，重置所有计时器。
- **界面渲染**:
  - **Idle 阶段**: 显示 `[ START GLOBAL CYCLE ]`。点击前检查 `tasks` 是否为空，空则阻止；否则切入 `running` 抓取首个随机任务。
  - **Running 阶段**: 顶部显示当前任务标题，中间显示巨大的 `sliceLeft`。下方显示较小的 `pomodoroLeft` 和进度条。提供 `[ PAUSE / RESUME ]`（启停）与 `[ HALT ]`（直接中断回退到 idle 并清空任务）。
  - **Break 阶段**: 标题显示 “Break Time”，主时间显示剩余休息时间。

#### 4. 设置面板 (`src/components/SettingsPanel.tsx`)
提供配置调参入口，由 ActiveScheduler 触发的悬浮窗或抽屉。
- 可以修改以下数值（修改后立刻生效或通过 `[ APPLY ]` 按钮回调应用）：
  - Global Cycle (Minutes): 完整的 Pomodoro 时长。
  - Time Slice (Minutes): 每个子任务切片的持续时间。
  - Break Time (Minutes): 全局周期结束后的固定休息时间。

#### 5. 纯前端合成音效 (`src/utils/audio.ts`)
完全不依赖第三方媒体文件，使用原生的 `window.AudioContext` 来合成提示音引擎（避免静态资源加载问题）。
- `playNotificationSound('slice')`: 使用方波 (square) 发出非常快速的科幻式上升双高频短音，用于唤醒注意力。
- `playNotificationSound('break')`: 使用正弦波 (sine) 连续发出三个音高的下降缓冲音阶，听起来像完成工作的放松声。
- `playNotificationSound('work')`: 使用三角波 (triangle) 发出三个音阶快速上升能量音符，提示可以开启下一个循环。

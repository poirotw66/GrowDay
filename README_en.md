# 🌱 GrowDay - Habit Tracker App

<div align="center">

![GrowDay Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

**Build good habits with adorable virtual pets! Check in daily and watch your companion grow.**

[繁體中文](./README.md) | [English](#)

</div>

---

## ✨ Features

### 🐾 Virtual Pet System
- **Pet Evolution**: From egg to fully grown, pets evolve as you check in daily
- **Multiple Pets**: Collect pets with different colors and attributes
- **Generations**: Retire pets at max level to gain permanent bonuses and start new generations

### 📅 Calendar Check-in
- **Multiple Themes**: Minimalist, hand-drawn, Chinese New Year, Japanese, American styles
- **Custom Stamps**: Choose your favorite icons and colors for check-ins
- **Visual Progress**: Clear monthly calendar view to track daily habits

### 🏆 Achievement System
- **Rich Achievements**: Unlock various milestones and earn coin rewards
- **Achievement Compendium**: View all achievement progress and unlock conditions

### 📊 Statistics & Analytics
- **Current Streak**: Track your current consecutive check-in days
- **Monthly Count**: View check-ins for the current month
- **Best Record**: Record your longest consecutive streak
- **Statistics Charts**: Visualize habit formation trends

### 🎯 Goal Setting
- **Custom Goals**: Set daily, weekly, or monthly goals for habits
- **Progress Tracking**: Monitor goal completion in real-time

### 🔔 Reminder Feature
- **Daily Reminders**: Set reminder times so you never forget to check in
- **Browser Notifications**: Desktop notification support

### 🌍 World Map
- **Multiple Areas**: Unlock different themed world areas
- **Decoration System**: Purchase and place furniture to build your unique world
- **Pet Placement**: Place retired pets in your world

### 🎨 Personalization
- **Dark Mode**: Support for light/dark theme switching
- **Multi-Habit Management**: Track multiple habits simultaneously
- **Data Backup**: Export/import data to backup your progress anytime

---

## 🚀 Quick Start

### Requirements

- **Node.js** 18+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/GrowDay.git
   cd GrowDay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   
   Visit `http://localhost:3000` to start using

### Development Commands

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests (once)
npm run test:run

# Test coverage
npm run test:coverage

# Lint code
npm run lint

# Auto-fix code
npm run lint:fix

# Format code
npm run format
```

---

## 📦 Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier

---

## 🌐 Deploy to GitHub Pages

### Automatic Deployment (Recommended)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Configure GitHub Pages**
   - Go to Repository **Settings** → **Pages**
   - **Build and deployment** → **Source**: Select **GitHub Actions**

3. **Trigger deployment**
   - Pushing to `main` branch will automatically trigger deployment
   - Or manually run: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

4. **Access your site**
   
   After deployment completes, your site will be available at:
   ```
   https://<your-github-username>.github.io/GrowDay/
   ```
   
   > 💡 If your repository name is different, the path will automatically match the repository name

---

## 📱 PWA Support

GrowDay supports Progressive Web App (PWA), allowing you to:

- 📲 **Install to device**: Install as an app on your phone or computer
- 🔌 **Offline usage**: Some features work offline
- 🔔 **Push notifications**: Receive daily reminder notifications

---

## 🎮 User Guide

### Create Your First Habit

1. After opening the app, enter a habit name (e.g., reading, exercise, water)
2. Choose your pet egg color (fire, water, grass, purple)
3. Select check-in stamp icon and color
4. Start checking in daily and watch your pet grow!

### Pet Evolution Stages

- **Egg Stage** (Lv.1-4): Pet is still in the egg
- **Baby Stage** (Lv.5-9): Pet begins to grow
- **Child Stage** (Lv.10-19): Pet gradually matures
- **Adult Stage** (Lv.20+): Pet reaches perfect form

### Pet Retirement

When your pet reaches Lv.30, you can choose to retire:

- ✨ Gain **permanent coin bonus +10%**
- 🏛️ Pet enters the Hall of Fame
- 🥚 Habit inherits will, hatching a new generation pet

---

## 💡 What Features Could Be Added?

We maintain a [Feature Ideas list](./docs/FEATURE_IDEAS.md) covering gamification, analytics, reminders, world decorations, personalization, i18n, accessibility, and more—with difficulty and suggested priority. Feel free to check it out or contribute ideas.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit an Issue or Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

<div align="center">

**Build a better you, one day at a time 🌱**

Made with ❤️ by GrowDay Team

</div>

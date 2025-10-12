# 🎯 Darts Game - 501

A modern web application for playing 501 darts with friends, built with Nuxt 4 and Vue 3.

## Features

- **Two-player 501 darts game**
- **Player name setup** - Enter names for both players
- **Score tracking** - Real-time score updates with visual indicators
- **Turn-based gameplay** - Automatic focus switching between players
- **Score history** - Track all previous scores for each player
- **Game validation** - Prevents invalid scores and busts
- **Responsive design** - Works on desktop and mobile devices
- **Modern UI** - Beautiful dark theme with dartboard-inspired colors

## Game Rules

- Each player starts with 501 points
- Players take turns throwing 3 darts
- Enter the total score for each turn (0-180)
- First player to reach exactly 0 wins
- Cannot finish on 1 (bust rule)
- Cannot go below 0

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## How to Play

1. **Setup**: Enter names for both players and click "Start Game"
2. **Playing**: The active player enters their score and presses Enter or clicks "Submit Score"
3. **Scoring**: Enter the total points scored in that turn (0-180)
4. **Winning**: First player to reach exactly 0 points wins!

## Technology Stack

- **Nuxt 4** - Vue.js framework
- **Vue 3** - Progressive JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

## Project Structure

```
darts/
├── components/
│   └── DartsGame.vue      # Main game component
├── assets/
│   └── css/
│       └── main.css       # Global styles
├── app.vue                # Root component
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

Enjoy playing darts! 🎯

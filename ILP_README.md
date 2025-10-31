# ILP - Integral Life Practice

A modern, beautiful web application for tracking and managing your Integral Life Practice across four key modules: Body, Mind, Spirit, and Shadow Work.

![ILP App](https://img.shields.io/badge/Built%20with-React%20%2B%20Vite-blue)
![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔍 Browse Practices
- **Body Module**: Sleep, resistance training, zone 2 cardio
- **Mind Module**: Deep learning, meditation
- **Spirit Module**: Gratitude practice, nature exposure
- **Shadow Module**: 3-2-1 Process for shadow work

Each practice includes:
- Time commitment per week
- ROI (Return on Investment) rating
- Detailed "Why" explanation
- Step-by-step "How" instructions

### 📚 Stack Builder
- Choose from pre-configured stacks:
  - 🟢 **Beginner**: High ROI, minimal time (~3.5h/week)
  - 🟡 **Intermediate**: Mental & spiritual depth (~8.7h/week)
  - 🔴 **Advanced**: Comprehensive with shadow work (~7.2h/week)
- Or build your custom stack by selecting individual practices
- View total weekly time commitment

### ✅ Daily Tracker
- Track completion of daily practices
- Visual progress bar
- Add notes to each practice session
- Check off completed practices
- See completion percentage

### 🌙 Shadow Work Tools
- **3-2-1 Process**: A guided journaling process to integrate shadow projections
  - Step 1: Identify the trigger
  - Step 2: Face It (3rd person description)
  - Step 3: Talk To It (2nd person dialogue)
  - Step 4: Be It (1st person embodiment)
  - Step 5: Integration (actionable insights)
- Session history tracking
- Emotion intensity rating

### 📱 Responsive Design
- Beautiful dark theme with gradient accents
- Mobile-friendly with hamburger menu
- Tablet and desktop optimized layouts
- Smooth animations and transitions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher

### Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd ilp-react-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

The app will automatically reload when you make changes to the code (hot module replacement).

## 📦 Available Scripts

### `npm run dev`
Starts the development server with hot reload at `http://localhost:3000`

### `npm run build`
Creates an optimized production build in the `dist/` folder:
- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging

### `npm run preview`
Preview the production build locally before deployment

## 🏗️ Project Structure

```
ilp-react-app/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── ILPApp.jsx  # Main ILP application component
│   ├── index.css       # Global styles with Tailwind directives
│   └── main.jsx        # Application entry point
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts      # Vite configuration
```

## 🎨 Technology Stack

- **React 18.3**: Modern React with hooks
- **Vite 6.2**: Lightning-fast build tool and dev server
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Lucide React**: Beautiful, consistent icons
- **PostCSS**: CSS processing with autoprefixer

## 🎯 Usage Guide

### Getting Started

1. **Browse Practices**: Start by exploring available practices in each module
2. **Build Your Stack**: Select a starter stack or create your own
3. **Track Daily**: Use the tracker to mark practices complete each day
4. **Shadow Work**: Explore the 3-2-1 process when you encounter triggers

### Best Practices

- Start with the **Beginner Stack** if you're new
- Focus on **consistency** over perfection
- Use the **notes field** to track insights
- Do **shadow work** when you notice strong reactions to people/situations
- Review your **time commitment** regularly and adjust as needed

### Tips for Success

- **Sleep** is the foundation - prioritize it first
- **Gratitude** has exceptional ROI for minimal time
- **Zone 2 cardio** can be combined with nature exposure
- **Meditation** compounds over time - start small (5 min)
- **3-2-1 Process** is most effective when emotions are fresh

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production assets.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository to Vercel
3. Vercel will auto-detect Vite and deploy

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Build command: `npm run build`
2. Publish directory: `dist`

### Deploy to GitHub Pages

1. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Update `vite.config.ts` with base path:
   ```js
   base: '/your-repo-name/'
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## 🛠️ Customization

### Adding New Practices

Edit `src/components/ILPApp.jsx` and add to the `practices` object:

```jsx
body: [
  {
    id: 'your-practice',
    name: 'Your Practice Name',
    description: 'Short description',
    why: 'Why this practice matters',
    timePerWeek: 2, // hours
    roi: 'HIGH', // EXTREME, VERY HIGH, or HIGH
    how: [
      'Step 1',
      'Step 2',
      'Step 3'
    ]
  }
]
```

### Customizing Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      'primary': '#your-color',
      'secondary': '#your-color',
    }
  }
}
```

### Modifying Layout

The app uses Tailwind's responsive utilities:
- `md:` for tablet and up
- `lg:` for desktop and up

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is occupied, Vite will automatically try 3001, 3002, etc.

### Module Not Found

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Check Node.js version:
```bash
node --version  # Should be 16+
```

### Hot Reload Not Working

Try restarting the dev server:
```bash
# Stop with Ctrl+C
npm run dev
```

## 📚 Learn More

### ILP Framework
- [Integral Life Practice Book](https://integrallife.com)
- [Ken Wilber's Integral Theory](https://www.kenwilber.com)

### Technical Documentation
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feat/new-feature`
7. Open a Pull Request

### Guidelines
- Follow existing code style
- Keep components modular
- Add comments for complex logic
- Test on mobile and desktop
- Update documentation as needed

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

- **Issues**: [Create a GitHub issue](https://github.com/yourusername/ilp-react-app/issues)
- **Discussions**: Use GitHub Discussions for questions
- **Email**: your-email@example.com

## 🎉 Acknowledgments

- **Integral Life Practice** framework by Ken Wilber et al.
- **Lucide** for beautiful icons
- **Tailwind CSS** for utility-first styling
- **Vite** team for the amazing build tool

---

**Built with ❤️ for personal growth and integral development**

## 🗺️ Roadmap

- [ ] Local storage persistence
- [ ] Export/import practice data
- [ ] Weekly/monthly analytics
- [ ] Habit streaks
- [ ] Practice reminders/notifications
- [ ] Multi-language support
- [ ] Community practice sharing
- [ ] Integration with calendar apps
- [ ] Advanced shadow work tools
- [ ] Practice journaling with markdown

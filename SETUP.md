# ILP React App - Quick Setup Guide

## ✅ Setup Complete

The Integral Life Practice (ILP) React app has been successfully set up with all required features.

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm 8.x or higher

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✨ What's Included

### Application Features
- ✅ **Browse Tab**: Browse practices across 4 modules (Body, Mind, Spirit, Shadow)
- ✅ **Stack Tab**: Choose pre-configured stacks or build custom practice stacks
- ✅ **Tracker Tab**: Track daily practice completion with progress visualization
- ✅ **Shadow Tab**: 3-2-1 Process for shadow work with session history
- ✅ **Responsive Design**: Mobile-friendly with hamburger menu
- ✅ **Dark Theme**: Beautiful gradient-based dark theme

### Technology Stack
- ✅ React 18.3.1
- ✅ Vite 6.2 (fast build tool with HMR)
- ✅ Tailwind CSS 3.4 (with dark mode support)
- ✅ lucide-react (for icons)
- ✅ PostCSS + Autoprefixer

### Project Structure
```
/
├── src/
│   ├── components/
│   │   └── ILPApp.jsx       # Main ILP component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles + Tailwind directives
├── public/
│   └── vite.svg             # Favicon
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.ts           # Vite configuration
└── .gitignore               # Git ignore patterns
```

### Configuration Files
- ✅ `package.json` - All dependencies installed
- ✅ `tailwind.config.js` - Tailwind with dark mode support
- ✅ `postcss.config.js` - PostCSS processing
- ✅ `vite.config.ts` - Vite dev server on port 3000
- ✅ `.gitignore` - Excludes node_modules, dist, .env files

## 🎯 Verification

### Development Server
```bash
npm run dev
```
- Opens on http://localhost:3000
- Hot module replacement (HMR) works
- Changes auto-reload in browser

### Production Build
```bash
npm run build
```
- Creates optimized bundle in `dist/` folder
- Minified JS and CSS
- Gzip sizes displayed

### Features Test
1. **Browse**: Click practices to add to stack
2. **Stack**: Select beginner/intermediate/advanced stacks
3. **Tracker**: Toggle practices complete, add notes
4. **Shadow**: Start 3-2-1 session, complete all 5 steps
5. **Mobile**: Test hamburger menu on narrow viewport

## 📖 Documentation

- **Full README**: See [ILP_README.md](ILP_README.md) for comprehensive documentation
- **Deployment Guide**: Includes Vercel, Netlify, and GitHub Pages instructions
- **Customization**: How to add practices and customize colors

## 🎉 Success Criteria Met

- ✅ `npm install` successfully installs all dependencies
- ✅ `npm run dev` starts development server with hot reload
- ✅ `npm run build` creates optimized production bundle
- ✅ App renders correctly with all tabs functional
- ✅ 3-2-1 modal works properly
- ✅ Responsive design works on mobile and desktop
- ✅ README includes clear setup and deployment instructions

## 🔧 Troubleshooting

### Port Already in Use
Vite will automatically try ports 3001, 3002, etc.

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Check Node.js version:
```bash
node --version  # Should be 16.x or higher
```

## 📚 Next Steps

1. Run `npm run dev` to start developing
2. Read [ILP_README.md](ILP_README.md) for full documentation
3. Customize practices in `src/components/ILPApp.jsx`
4. Deploy using Vercel, Netlify, or GitHub Pages

---

**Setup completed successfully! 🎊**

# The Sewing Circle v2.0.2

A modern React-based website promoting community engagement and human connection through meaningful interactions and collaborative growth.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Setup
```bash
# Navigate to project directory
cd AC_SewingCircle/v2.0.2

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ✨ What's New in v2.0.2

### 🎯 Major Updates
- **Full Viewport Experience**: All sections now use full screen height for immersive browsing
- **Updated Navigation**: Reflects new section structure (Vision → About Us, Impact → Vision)
- **Local Image Integration**: All event images now use local assets for better performance
- **Enhanced Event Slider**: Auto-advancing slider with smooth transitions and improved UX
- **Comprehensive Documentation**: Detailed technical documentation and code comments

### 🔄 Section Changes
1. **About Us** (formerly Vision) - Our story and historical context
2. **Core Objectives** - Five pillars of our movement
3. **Vision** (formerly Impact) - Long-term goals and national network plans
4. **Future Integration** - AI technology roadmap and PhD collaborations
5. **Community Engagement** - Activities and recent events showcase
6. **Contact Us** (formerly Join the Movement) - Direct contact approach

### 🎠 Event Slider Features
- Auto-advances every 5 seconds
- Shows 3 events on desktop, 1 on mobile
- Smooth left-sliding transitions
- Interactive dot navigation
- Event counter for better UX
- Local images organized by month

## 🛠️ Technical Highlights

### Performance Optimizations
- Throttled scroll handling (~60fps)
- Lazy loading images
- React.memo for component optimization
- Efficient state management
- Optimized bundle size

### Responsive Design
- Mobile-first approach
- Touch-friendly interactions
- Adaptive layouts for all screen sizes
- Optimized image loading

### Code Quality
- Comprehensive commenting throughout
- Clean component architecture
- Accessibility improvements
- Error handling and diagnostics

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.jsx   # Updated navigation bar
│   ├── EventSlider.jsx  # New auto-advancing slider
│   └── ...             # Other components
├── image/              # Local event images
│   ├── April/          # April 2024 events
│   ├── December/       # December 2024 events
│   ├── February/       # February 2024 events
│   ├── June/           # June 2024 events
│   └── October/        # October 2024 events
├── App.jsx             # Main application
└── ...
```

## 🎨 Design System

### Color Palette
- **Primary**: Slate (950, 900, 800)
- **Accents**: Cyan (400, 500), Purple (300, 500), Blue (300, 600)
- **Text**: White, Slate variants for hierarchy

### Typography
- **Headings**: Bold, large scales (4xl-6xl)
- **Body**: Readable slate tones
- **Interactive**: Hover states and transitions

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ❌ Internet Explorer (not supported)

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Recommended Hosting
- **Netlify**: Automatic Git deployments
- **Vercel**: React-optimized hosting
- **GitHub Pages**: Free static hosting

## 📖 Documentation

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🤝 Contributing

1. Follow existing code style and conventions
2. Add comments for complex logic
3. Test on multiple screen sizes
4. Ensure accessibility compliance
5. Update documentation as needed

## 📞 Support

For technical issues or questions about the codebase, refer to the comprehensive documentation or contact the development team.

---

**Version**: 2.0.2  
**Last Updated**: December 29, 2024  
**Framework**: React + Vite  
**Styling**: Custom CSS
# The Sewing Circle v2.0.2 - Technical Documentation

## Overview

The Sewing Circle is a modern React-based website designed to promote community engagement and human connection. This version (v2.0.2) features a complete redesign with full viewport sections, improved navigation, local image integration, and enhanced user experience.

## 🚀 Key Features

### ✨ Full Viewport Experience
- All major sections utilize `min-h-screen` for immersive full viewport height
- Smooth scrolling navigation between sections
- Responsive design optimized for all screen sizes

### 🎯 Section Structure
1. **Hero Section** - Landing area with main call-to-action
2. **About Us** - Our story and mission (formerly "Vision")
3. **Core Objectives** - Five pillars of our movement
4. **Vision** - Long-term goals and impact (formerly "Impact")
5. **Future Integration** - AI technology plans
6. **Community Engagement** - Activities and recent events
7. **Contact Us** - Direct contact form (formerly "Join the Movement")

### 🖼️ Local Image Integration
- All event images now use local assets from `src/image/` folder
- Images organized by month folders (April, December, February, June, October)
- Optimized loading with lazy loading and proper alt text

### 🎠 Enhanced Event Slider
- Auto-advancing slider with 5-second intervals
- Smooth transitions with improved performance
- Shows 3 events on desktop, 1 on mobile
- Interactive dot navigation
- Event counter for better UX

## 📁 Project Structure

```
AC_SewingCircle/v2.0.2/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx          # Updated navigation with new section names
│   │   ├── EventSlider.jsx         # New auto-advancing event slider
│   │   ├── Hero.jsx               # Landing section
│   │   ├── FeatureCard.jsx        # Reusable feature cards
│   │   ├── Modal.jsx              # Contact modal
│   │   ├── Reveal.jsx             # Animation component
│   │   ├── Testimonials.jsx       # Customer testimonials
│   │   ├── UpcomingEvents.jsx     # Events modal
│   │   └── FloatingEventsButton.jsx # Floating action button
│   ├── image/                     # Local image assets
│   │   ├── April/                 # April event images
│   │   ├── December/              # December event images
│   │   ├── February/              # February event images
│   │   ├── June/                  # June event images
│   │   └── October/               # October event images
│   ├── config/
│   │   └── emailjs.js            # Email configuration
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Global styles and custom CSS
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
└── DOCUMENTATION.md             # This file
```

## 🛠️ Technical Implementation

### Performance Optimizations

#### 1. Throttled Scroll Handling
```javascript
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};
```
- Limits scroll event handling to ~60fps for better performance
- Prevents excessive re-renders during scroll

#### 2. Lazy Loading Images
```javascript
<img 
  src={event.coverImage}
  alt={`${event.name} - ${event.date}`}
  className="w-full h-full object-cover"
  loading="lazy"
/>
```
- Images load only when needed
- Improves initial page load time

#### 3. React.memo Usage
```javascript
const EventSlider = React.memo(() => {
  // Component logic
});
```
- Prevents unnecessary re-renders
- Optimizes component performance

### State Management

The application uses React hooks for state management:

```javascript
const [isScrolled, setIsScrolled] = useState(false);           // Navigation styling
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu
const [isModalOpen, setIsModalOpen] = useState(false);        // Contact modal
const [isEventsOpen, setIsEventsOpen] = useState(false);      // Events modal
```

### Event Slider Implementation

#### Auto-Advancing Logic
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  }, 5000);

  return () => clearInterval(interval);
}, [events.length]);
```

#### Responsive Display
- **Desktop**: Shows 3 events in a row
- **Mobile**: Shows 1 event at a time
- **Transitions**: Smooth 1-second duration with ease-in-out timing

## 🎨 Styling & Design

### Color Scheme
- **Primary Background**: `bg-slate-950` (Very dark blue-gray)
- **Secondary Background**: `bg-slate-900` (Dark blue-gray)
- **Accent Colors**: 
  - Cyan: `text-cyan-400`, `bg-cyan-500`
  - Purple: `text-purple-300`, `bg-purple-500`
  - Blue: `text-blue-300`, `bg-blue-600`

### Typography
- **Headings**: Bold, large sizes (4xl to 6xl)
- **Body Text**: `text-slate-300` for readability
- **Accent Text**: `text-slate-400` for secondary information

### Animations
- **Reveal Component**: Staggered animations with customizable delays
- **Hover Effects**: Scale transforms and color transitions
- **Scroll Animations**: Smooth transitions based on scroll position

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default styles (< 768px)
- **Tablet**: `md:` prefix (≥ 768px)
- **Desktop**: `lg:` and `xl:` prefixes (≥ 1024px, ≥ 1280px)

### Mobile Optimizations
- Hamburger menu for navigation
- Single-column layouts
- Touch-friendly button sizes
- Optimized image sizes

## 🔧 Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation
```bash
cd AC_SewingCircle/v2.0.2
npm install
```

### Development Server
```bash
npm run dev
```
- Starts Vite development server
- Hot module replacement enabled
- Available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output in `dist/` folder
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- Test before deployment

## 🧪 Testing

### Component Testing
- Test files located in `src/test/`
- Uses Vitest testing framework
- Run tests: `npm run test`

### Manual Testing Checklist
- [ ] Navigation works on all screen sizes
- [ ] Event slider auto-advances every 5 seconds
- [ ] All images load properly
- [ ] Modal functionality works
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Smooth scrolling between sections
- [ ] Contact form submission

## 🚀 Deployment

### Build Process
1. Run `npm run build`
2. Upload `dist/` folder contents to web server
3. Configure server for SPA routing (if needed)

### Recommended Hosting
- **Netlify**: Automatic deployments from Git
- **Vercel**: Optimized for React applications
- **GitHub Pages**: Free hosting for static sites

## 🔄 Version Changes (v2.0.1 → v2.0.2)

### Major Updates
1. **Navigation Bar**: Updated to reflect new section names
   - "Vision" → "About Us"
   - "Impact" → "Vision"
   - "Get Involved" → "Contact Us"

2. **Full Viewport Sections**: All major sections now use `min-h-screen`
   - About Us, Objectives, Vision, Future, Community sections

3. **Local Image Integration**: Replaced external URLs with local images
   - Organized by month folders
   - Improved loading performance
   - Better offline experience

4. **Enhanced Event Slider**: 
   - Smoother transitions
   - Auto-advancing functionality
   - Better responsive behavior
   - Event counter and improved navigation

5. **Content Updates**:
   - About Us: New historical context and mission statement
   - Vision: Comprehensive long-term goals
   - Future Plans: Detailed AI integration roadmap
   - Community: Enhanced engagement description

6. **Performance Improvements**:
   - Removed unused imports
   - Optimized component rendering
   - Better image loading strategies

### Code Quality Improvements
- Comprehensive commenting throughout codebase
- Better component organization
- Improved accessibility features
- Enhanced error handling

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Image Optimization**: Local images could be further optimized for web
2. **Accessibility**: Some areas could benefit from additional ARIA labels
3. **SEO**: Meta tags and structured data could be enhanced

### Future Enhancements
1. **Image Optimization**: Implement WebP format and responsive images
2. **Animation Library**: Consider Framer Motion for more complex animations
3. **Internationalization**: Add multi-language support
4. **Dark/Light Mode**: Theme switching capability
5. **Progressive Web App**: Add PWA features for offline functionality

## 📞 Support & Maintenance

### Code Maintenance
- Regular dependency updates recommended
- Monitor for security vulnerabilities
- Performance audits using Lighthouse

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Legacy Support**: IE11 not supported (uses modern CSS features)

### Performance Monitoring
- Use browser dev tools for performance analysis
- Monitor Core Web Vitals
- Regular accessibility audits

---

## 📝 Developer Notes

### Code Style Guidelines
- Use functional components with hooks
- Implement React.memo for performance-critical components
- Follow consistent naming conventions
- Add comprehensive comments for complex logic

### Component Architecture
- Keep components small and focused
- Use custom hooks for shared logic
- Implement proper prop validation
- Maintain clear component hierarchies

### Best Practices Implemented
- ✅ Responsive design first
- ✅ Performance optimization
- ✅ Accessibility considerations
- ✅ Clean code structure
- ✅ Comprehensive documentation
- ✅ Error boundary handling
- ✅ Semantic HTML structure

---

*Last Updated: December 28, 2024*
*Version: 2.0.2*
*Maintainer: Development Team*
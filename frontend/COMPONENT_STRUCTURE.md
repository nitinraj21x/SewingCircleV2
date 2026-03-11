# Component Structure Documentation

## Overview

The AC_SewingCircle v2.0.3 project has been restructured to organize components by website sections for better maintainability and understanding. This document outlines the new folder structure and component organization.

## Folder Structure

```
src/components/
├── navigation/           # Navigation Bar Section
│   ├── Navigation.jsx    # Main navigation component
│   └── index.js         # Export file
├── hero/                # Hero Section
│   ├── Hero.jsx         # Hero landing component
│   └── index.js         # Export file
├── about/               # About Us Section
│   ├── AboutSection.jsx # About us content
│   └── index.js         # Export file
├── objectives/          # Core Objectives Section
│   ├── ObjectivesSection.jsx # Main objectives component
│   ├── FeatureCard.jsx  # Individual objective cards
│   └── index.js         # Export file
├── vision/              # Vision Section
│   ├── VisionSection.jsx # Vision content and stats
│   └── index.js         # Export file
├── future/              # Future Integration Section
│   ├── FutureSection.jsx # AI integration plans
│   └── index.js         # Export file
├── testimonials/        # Community Voices Section
│   ├── Testimonials.jsx # Testimonials carousel
│   └── index.js         # Export file
├── community/           # Community Engagement Section
│   ├── CommunitySection.jsx # Main community content
│   ├── EventSlider.jsx  # Recent events slider
│   ├── UpcomingEvents.jsx # Events modal
│   ├── FloatingEventsButton.jsx # Floating action button
│   └── index.js         # Export file
├── contact/             # Contact Us Section
│   ├── ContactSection.jsx # Contact content
│   ├── Modal.jsx        # Contact form modal
│   └── index.js         # Export file
├── footer/              # Footer Section
│   ├── Footer.jsx       # Footer component
│   └── index.js         # Export file
└── shared/              # Shared/Utility Components
    ├── Section.jsx      # Reusable section wrapper
    ├── Reveal.jsx       # Animation reveal component
    └── index.js         # Export file
```

## Component Mapping

### Website Sections to Components

| Website Section | Component Location | Main Component |
|----------------|-------------------|----------------|
| Navigation Bar | `navigation/` | `Navigation.jsx` |
| Hero/Landing | `hero/` | `Hero.jsx` |
| About Us | `about/` | `AboutSection.jsx` |
| Core Objectives | `objectives/` | `ObjectivesSection.jsx` |
| Vision | `vision/` | `VisionSection.jsx` |
| Future Integration | `future/` | `FutureSection.jsx` |
| Community Voices | `testimonials/` | `Testimonials.jsx` |
| Community Engagement | `community/` | `CommunitySection.jsx` |
| Contact Us | `contact/` | `ContactSection.jsx` |
| Footer | `footer/` | `Footer.jsx` |

### Shared Components

| Component | Purpose | Used By |
|-----------|---------|---------|
| `Section.jsx` | Reusable section wrapper with consistent styling | Multiple sections |
| `Reveal.jsx` | Animation component for scroll-triggered reveals | All sections |

### Specialized Components

| Component | Purpose | Section |
|-----------|---------|---------|
| `FeatureCard.jsx` | Individual objective cards with hover effects | Objectives |
| `EventSlider.jsx` | Recent events showcase | Community |
| `UpcomingEvents.jsx` | Events modal with upcoming events | Community |
| `FloatingEventsButton.jsx` | Floating action button for events | Global |
| `Modal.jsx` | Contact form modal | Contact |

## Import Structure

### Clean Imports with Index Files

Each folder contains an `index.js` file that exports all components from that section:

```javascript
// Example: components/navigation/index.js
export { default as Navigation } from './Navigation';
```

### App.jsx Import Pattern

```javascript
// Organized imports by section
import { Navigation } from './components/navigation';
import { Hero } from './components/hero';
import { AboutSection } from './components/about';
// ... etc
```

### Cross-Component Imports

Components import shared utilities using relative paths:

```javascript
// From any component to shared
import Reveal from '../shared/Reveal';
import Section from '../shared/Section';
```

## Benefits of This Structure

### 1. **Logical Organization**
- Components are grouped by their website section
- Easy to locate components when working on specific sections
- Clear separation of concerns

### 2. **Maintainability**
- Related components are co-located
- Easy to understand component relationships
- Simplified debugging and updates

### 3. **Scalability**
- Easy to add new components to existing sections
- Clear pattern for adding new sections
- Modular architecture supports team development

### 4. **Developer Experience**
- Intuitive folder navigation
- Clear component naming conventions
- Consistent import patterns

## File Naming Conventions

### Components
- **PascalCase** for component files: `NavigationBar.jsx`
- **Descriptive names** that indicate purpose: `ContactSection.jsx`
- **Section suffix** for main section components: `AboutSection.jsx`

### Folders
- **lowercase** with descriptive names: `navigation/`, `community/`
- **Singular form** preferred: `hero/` not `heroes/`
- **Clear section mapping**: folder name matches website section

### Index Files
- Always named `index.js`
- Export components using named exports
- Maintain consistent export patterns

## Testing Structure

Test files are co-located with their components:

```
vision/
├── CaseStudySlider.jsx
├── CaseStudySlider.test.jsx  # Tests for CaseStudySlider
└── index.js
```

## Migration Notes

### From v2.0.2 to v2.0.3

1. **Moved all components** from flat structure to organized folders
2. **Updated all import paths** to use new structure
3. **Created section-specific components** by extracting from App.jsx
4. **Added index files** for clean imports
5. **Maintained all functionality** while improving organization

### Breaking Changes

- Import paths have changed for all components
- Some components were extracted from App.jsx into separate files
- File locations have moved to new folder structure

## Future Considerations

### Adding New Sections

1. Create new folder in `components/`
2. Add main section component
3. Create `index.js` export file
4. Update App.jsx imports
5. Add to this documentation

### Component Guidelines

- Keep components focused on single responsibilities
- Use shared components for common functionality
- Follow established naming conventions
- Co-locate related components and tests
- Maintain clean import/export patterns

## Conclusion

This restructured component organization provides a solid foundation for the AC_SewingCircle project, making it more maintainable, scalable, and developer-friendly while preserving all existing functionality.
# Responsive Font System Update

## Changes Made

The website's font sizing has been updated from fixed `rem` units with media queries to a fully responsive system using CSS `clamp()` function and viewport units (`vw`, `vh`).

### Key Improvements

1. **Viewport-Relative Scaling**: Fonts now scale smoothly with both screen width and height
2. **Fluid Typography**: No more abrupt jumps at breakpoints - fonts scale continuously
3. **Better Mobile Experience**: Fonts automatically adjust for smaller screens
4. **Improved Readability**: Larger screens get appropriately larger text

### Technical Implementation

#### CSS Custom Properties Added
- `--font-base`: Base font size for body text
- `--font-nav-brand`: Navigation brand/logo text
- `--font-nav-link`: Navigation menu links
- `--font-section-title`: Main section headings
- `--font-section-subtitle`: Section subheadings
- `--font-card-title`: Card titles
- `--font-card-description`: Card descriptions
- And many more for specific components

#### Formula Used
```css
font-size: clamp(min-size, preferred-size, max-size);
```

Where:
- `min-size`: Minimum font size (for very small screens)
- `preferred-size`: Viewport-relative size (e.g., `2vw + 0.5rem`)
- `max-size`: Maximum font size (for very large screens)

#### Example
```css
--font-section-title: clamp(1.5rem, 5vw + 1rem, 4.5rem);
```

This means:
- Minimum: 1.5rem (24px)
- Scales with: 5% of viewport width + 1rem
- Maximum: 4.5rem (72px)

### Components Updated

1. **Navigation**
   - Brand logo text
   - Menu links
   - CTA button
   - Mobile menu

2. **Section Headers**
   - Main titles
   - Subtitles

3. **Cards**
   - Titles
   - Descriptions

4. **About Section**
   - Body text
   - Tags

5. **Community Section**
   - Area titles
   - Descriptions

6. **Events Section**
   - Event titles
   - Meta information
   - Descriptions

7. **Vision Section**
   - Statistics numbers
   - Labels

8. **AI Demo Section**
   - Badge text
   - Chat messages
   - Demo titles

9. **Text Utilities**
   - All `.text-*` classes now responsive

### Testing

To test the responsive fonts:

1. Open the website in a browser
2. Resize the browser window from very small (320px) to very large (1920px+)
3. Observe how fonts scale smoothly without abrupt changes
4. Test on different devices and screen sizes

### Browser Support

The `clamp()` function is supported in:
- Chrome 79+
- Firefox 75+
- Safari 13.1+
- Edge 79+

For older browsers, the fonts will fall back to the minimum size specified in the clamp function.

### Benefits

1. **Better UX**: Fonts are always appropriately sized for the screen
2. **Reduced CSS**: No need for multiple media queries for font sizes
3. **Future-proof**: Automatically works on any screen size
4. **Performance**: Smoother scaling without layout shifts
5. **Accessibility**: Better readability across all devices

## Files Modified

- `src/index.css`: Updated all font-size declarations to use responsive variables
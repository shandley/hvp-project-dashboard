# Dark/Light Mode Testing Plan

## Overview
This document outlines the testing approach for verifying the correct functioning of the dark/light mode theme system across all components of the HVP Dashboard.

## Testing Objectives
- Verify that all UI components properly apply theme styles in both light and dark modes
- Ensure transitions between themes are smooth and visually pleasing
- Confirm that theme preference is correctly persisted between sessions
- Test edge cases such as initial load, dynamic content, and visualization rendering

## Testing Approach

### 1. Component Testing

#### Header Component
- Verify header background color changes appropriately in each theme
- Check header text and metric values have proper contrast
- Confirm theme toggle button has correct icon for current theme
- Ensure header shadow is visible but not excessive in both themes

#### Sidebar Component
- Verify sidebar background color matches theme
- Ensure text and icons have proper contrast in both themes
- Check active item highlighting in both themes
- Verify hover states are visible but not jarring

#### FilterPanel Component
- Confirm panel background and borders match theme
- Verify dropdown selects and buttons have appropriate styling
- Check filter labels and values have proper contrast
- Test interactive elements (dropdown focus, hover states)

#### Dashboard Container
- Verify main background color changes appropriately
- Check spacing and layout consistency between themes

#### Visualization Components
- Test each visualization type in both themes:
  - Geographic Distribution: Check map colors, markers, and tooltips
  - Sample Distribution: Verify chart colors, legends, and tables
  - Project Timeline: Check timeline elements, colors, and status indicators
  - Network Relationships: Verify node colors, links, and interactive elements
- Ensure data remains equally visible in both themes
- Check tooltip and interactive element styling

### 2. Interaction Testing

#### Theme Toggle
- Verify clicking theme toggle button changes the theme
- Ensure theme changes apply to all visible components
- Check that transition animations are smooth

#### Initial Load
- Test initial load with no saved preference (should default to system preference)
- Test initial load with saved light preference
- Test initial load with saved dark preference

#### Theme Persistence
- Change theme, refresh page, verify theme persists
- Change theme, close browser, reopen, verify theme persists
- Test in multiple browsers to ensure localStorage works properly

### 3. Cross-browser Testing
- Chrome
- Firefox
- Safari
- Edge

### 4. Device Testing
- Desktop (large screen)
- Tablet (medium screen)
- Mobile (small screen)

## Testing Checklist

### Global Elements
- [ ] Theme toggle button correctly toggles theme
- [ ] Theme persists after page refresh
- [ ] System preference detection works correctly
- [ ] All text has sufficient contrast in both themes
- [ ] Animations are smooth and not jarring

### Header Component
- [ ] Background color changes appropriately
- [ ] Text and metrics have proper contrast
- [ ] Theme toggle icon reflects current theme
- [ ] Header shadow is visible but not excessive

### Sidebar Component
- [ ] Background color matches theme
- [ ] Text and icons have proper contrast
- [ ] Active item highlighting is visible
- [ ] Hover states are visible but not jarring

### FilterPanel Component
- [ ] Background and borders match theme
- [ ] Dropdowns and buttons have appropriate styling
- [ ] Filter labels and values have proper contrast
- [ ] Interaction states are clearly visible

### Visualization Components
- [ ] Geographic Distribution: All elements are visible in both themes
- [ ] Sample Distribution: Charts and legends are clear in both themes
- [ ] Project Timeline: Timeline elements are distinct in both themes
- [ ] Network Relationships: Nodes and links are visible in both themes
- [ ] All tooltips and hover states function correctly

## Issue Reporting
When a problem is identified, document:
1. The component affected
2. The theme where the issue occurs
3. Steps to reproduce
4. Expected vs. actual result
5. Screenshot if possible

## Conclusion
Upon successful completion of this testing plan, the dark/light mode feature will be verified as fully functional across all dashboard components, providing a seamless and visually consistent experience regardless of user theme preference.
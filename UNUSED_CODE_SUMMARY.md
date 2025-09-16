# Unused Code Summary

This document summarizes all the unused code that has been identified and marked in the application.

## CSS Files

### style.css
- Navigation styles that are overridden by Bootstrap classes

### dark-mode.css
- Custom background and text color styles that are overridden by Bootstrap classes
- Card header styles that are overridden by Bootstrap classes
- Button link hover styles for elements that are not used in the application

### print.css
- Float clearing styles for a clearfix class that is not used
- Styles for empty certification sections that are not generated

## JavaScript Files

### public/js/script.js
- No unused code identified (minimal file with service worker registration)

### views/layouts/main.handlebars
- `openPDF` function that is no longer used as PDF generation is handled differently

### app-no-server.js
- Debug route (`/debug`) that is commented out
- Range, max, and subtract Handlebars helpers that are not used in templates
- Simple routes (`/simple`, `/simple-pdf`, `/pdf`, `/working-pdf`) that are commented out

### routes/index.js
- Temporary route to create profile and jobs tables
- Test PDF routes (`/test-pdfkit`, `/test-pdf`) for development/testing
- Test route to debug HTML rendering (`/test-html-simple/:id`)

### routes/simple.js
- Simple route for testing array handling (`/jobs-simple/:id`)

### routes/simple-pdf.js
- Simple PDF test route (`/simple-pdf-test`)

### routes/pdf-simple.js
- Simple, reliable PDF generation route (`/pdf-simple/:id`)

### routes/working-pdf.js
- Working PDF route that sends buffer correctly (`/working-pdf/:id`)

## Standalone JavaScript Files

### create-temp-account.js
- Script for creating temporary accounts that is not referenced anywhere

### create-migrations-table.js
- Script for creating migrations table that is not referenced anywhere

## Images

### public/js/icon-144.png
- This icon is used and referenced in manifest.json

## Summary

All unused code has been marked with comments indicating that it is unused. This includes:

1. **Development/Test Routes**: Several routes that were created for testing purposes during development but are no longer needed in production
2. **Unused CSS Styles**: Styles that are either overridden by Bootstrap classes or target elements that don't exist
3. **Unused JavaScript Functions**: Functions that are no longer called or referenced anywhere in the application
4. **Unused Helper Functions**: Handlebars helpers that are defined but not used in any templates
5. **Unused Standalone Scripts**: Utility scripts that are not referenced in package.json or anywhere else

By marking this code as unused, it's easier to identify what can be safely removed in the future if desired, while maintaining the ability to understand what the code was originally intended for.
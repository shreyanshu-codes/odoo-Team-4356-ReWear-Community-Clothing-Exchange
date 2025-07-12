# **App Name**: ReWeave

## Core Features:

- Secure Authentication: User authentication: Secure signup and login using email and password, managed via localStorage.  Email validation ensures valid format and password strength.
- Interactive Landing Experience: Dynamic Landing Page: Features a hero section, calls-to-action buttons ('Start Swapping', 'Browse Items', 'List an Item'), and a carousel of featured clothing items.
- Intuitive User Dashboard: Personalized User Dashboard: Displays user details, points balance, a list of uploaded items with status, and swap history. Provides easy navigation to edit profile, list items, and browse.
- Comprehensive Item Display: Detailed Item Page: Showcases clothing items with an image gallery, comprehensive descriptions (category, type, size, condition), uploader info, and actions like 'Swap Request' and 'Redeem via Points'. Clearly indicates item availability.
- Effortless Item Listing: Simplified Item Submission:  A form allowing users to upload images and provide details for new items. Includes validation for required fields and image formats.
- Robust Moderation Tools: Admin Moderation Panel:  Provides admin users with tools to moderate item listings (approve/reject), remove inappropriate items, and view user details. Access is restricted to users with 'admin' role.

## Style Guidelines:

- Primary color: Soft forest green (#90EE90) to symbolize nature and sustainability.
- Background color: Light beige (#F5F5DC), offering a neutral and clean base.
- Accent color: Muted mustard yellow (#E4D00A), used for call-to-action buttons to highlight user interaction points.
- Font: 'Inter' sans-serif for headings and body text. Note: currently only Google Fonts are supported.
- Use minimalist vector icons related to clothing and sustainability for clarity and visual appeal.
- Mobile-first, responsive layout using Tailwind CSS grid and flex classes. Card-based design for user dashboard and item listings to ensure content is easily digestible.
- Subtle carousel transitions on the landing page using Tailwind CSS transitions to enhance user experience without being intrusive.
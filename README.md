# StyleCanvas - Fashion Outfit Builder

A modern, interactive web application for creating and styling fashion outfits with drag-and-drop functionality.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

- **Drag & Drop Interface** - Intuitive clothing item selection
- **Outfit Building** - Combine multiple clothing items on canvas
- **Save Outfits** - Store your favorite combinations
- **Shopping Integration** - Add complete outfits to cart
- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Clean, professional interface with smooth animations

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon library
- **Toast Notifications** - User feedback system

## 📁 Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # Reusable UI components
│   ├── style-canvas/   # Main outfit builder
│   └── ui/            # Base UI components
├── hooks/              # Custom React hooks
└── lib/               # Utility functions
```

## 🎨 Customization

- Add new clothing items in `initialClothingItems` array
- Modify styling with Tailwind classes
- Extend functionality with additional features

## 📝 Additional Notes

- Images are stored in `public/images/` directory
- Uses Next.js Image component for optimization
- Includes TypeScript for better development experience

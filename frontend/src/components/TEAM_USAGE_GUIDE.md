# Meet Our Team Component - Usage Guide

## 📦 Files Created

1. **MeetOurTeam.js** - React component with custom CSS
2. **MeetOurTeam.css** - Custom CSS styling
3. **MeetOurTeamTailwind.js** - React component with Tailwind CSS classes

---

## 🚀 How to Use

### Option 1: Using Custom CSS Version

1. Import the component in your page:
```jsx
import MeetOurTeam from './components/MeetOurTeam';
```

2. Use it in your JSX:
```jsx
function AboutPage() {
  return (
    <div>
      <MeetOurTeam />
    </div>
  );
}
```

### Option 2: Using Tailwind CSS Version

1. Import the Tailwind version:
```jsx
import MeetOurTeamTailwind from './components/MeetOurTeamTailwind';
```

2. Use it in your JSX:
```jsx
function AboutPage() {
  return (
    <div>
      <MeetOurTeamTailwind />
    </div>
  );
}
```

---

## 👥 Team Members Included

The component includes **8 Ethiopian professionals**:

1. **Abebe Kebede** - Chief Executive Officer
2. **Tigist Alemu** - Chief Technology Officer
3. **Yohannes Tadesse** - Lead Developer
4. **Almaz Tesfaye** - HR Manager
5. **Mekonnen Haile** - Operations Director
6. **Selam Girma** - Marketing Manager
7. **Dawit Amare** - Product Manager
8. **Hiwot Bekele** - Finance Director

---

## ✨ Features

✅ **8 Team Members** with Ethiopian names
✅ **Professional Placeholder Images** from Unsplash
✅ **Responsive Grid Layout** (1-4 columns based on screen size)
✅ **Hover Effects** - Image zoom and bio overlay
✅ **Smooth Animations** - Fade-in on load with staggered delay
✅ **Mobile Friendly** - Fully responsive design
✅ **Two Styling Options** - CSS or Tailwind CSS

---

## 🎨 Customization

### To Add/Remove Team Members:

Edit the `teamMembers` array in the component:

```jsx
const teamMembers = [
  {
    id: 1,
    name: "Your Name",
    role: "Your Role",
    image: "https://source.unsplash.com/400x400/?african,business,person",
    bio: "Your bio description"
  },
  // Add more members...
];
```

### To Change Colors:

**CSS Version** - Edit `MeetOurTeam.css`:
- Line 6: Background gradient
- Line 28: Title underline color
- Line 117: Overlay color
- Line 159: Role text color

**Tailwind Version** - Edit class names in `MeetOurTeamTailwind.js`:
- `bg-gradient-to-br from-gray-50 to-gray-200` - Background
- `from-teal-500 to-teal-600` - Title underline
- `from-teal-600/95` - Overlay
- `text-teal-600` - Role text

---

## 📱 Responsive Breakpoints

- **Mobile** (< 480px): 1 column
- **Tablet** (480px - 768px): 1-2 columns
- **Desktop** (768px - 1200px): 2-3 columns
- **Large Desktop** (> 1200px): 4 columns

---

## 🖼️ Image Sources

Images use Unsplash's source API with specific keywords:
- `african,business,man,professional`
- `african,business,woman,tech`
- etc.

**To use real images**, replace the `image` URL with your actual image paths.

---

## 🎯 Browser Support

✅ Chrome, Firefox, Safari, Edge (latest versions)
✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

Enjoy your new team section! 🎉

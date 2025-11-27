# Internship Management System - Design Specification
## Cutting-Edge Minimalist UI/UX Design

---

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Global Navigation](#global-navigation)
3. [Student Dashboard](#student-dashboard)
4. [Advisor Dashboard](#advisor-dashboard)
5. [Company Admin Dashboard](#company-admin-dashboard)
6. [Shared Components](#shared-components)
7. [Responsive Behavior](#responsive-behavior)
8. [Component Library: Radix UI + Tailwind CSS](#component-library)

---

## Design System Foundation

### Color Palette
```css
/* Primary Colors */
--white: #FFFFFF;           /* Backgrounds, cards */
--black: #000000;           /* Primary text, headings */
--blue-accent: #007BFF;     /* CTAs, active states, progress */

/* Grayscale */
--gray-900: #1A1A1A;        /* Secondary text */
--gray-700: #4A4A4A;        /* Tertiary text, labels */
--gray-400: #9E9E9E;        /* Disabled states, placeholders */
--gray-200: #E8E8E8;        /* Borders, dividers */
--gray-100: #F5F5F5;        /* Subtle backgrounds */
--gray-50: #FAFAFA;         /* Hover states */

/* Semantic Colors */
--success: #00C853;         /* Accepted, completed */
--warning: #FF9800;         /* Pending, in-progress */
--error: #FF3D00;           /* Rejected, errors */
--info: #F7FAFF;            /* Blue tint backgrounds */
```

### Typography System
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
--text-xs: 11px;       /* Helper text, timestamps */
--text-sm: 13px;       /* Labels, secondary text */
--text-base: 15px;     /* Body text, form inputs */
--text-lg: 17px;       /* Emphasized body text */
--text-xl: 20px;       /* Section headings */
--text-2xl: 28px;      /* Page titles */
--text-3xl: 36px;      /* Dashboard headings */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius
```css
--radius-sm: 6px;      /* Buttons, badges */
--radius-md: 10px;     /* Cards, inputs */
--radius-lg: 16px;     /* Large cards, modals */
--radius-full: 9999px; /* Avatars, pills */
```

### Shadows
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
--shadow-blue: 0 4px 16px rgba(0, 123, 255, 0.16);
```

---

## Global Navigation

### Top Navigation Bar

**Desktop (>1024px):**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]          Dashboard  Applications  Reports       [👤▾]   │ 64px height
└─────────────────────────────────────────────────────────────────┘
  240px           Center-aligned links                    200px

Background: #FFFFFF
Border-bottom: 1px solid #E8E8E8
Position: Fixed, z-index: 1000
```

**Component Breakdown:**

1. **Logo Area (Left - 240px)**
   - Padding: 0 24px
   - Logo: "IMS" or company name
   - Font: 24px / 700, color: #000000
   - Clickable → Home/Dashboard

2. **Navigation Links (Center)**
   - Display: Flex, gap: 40px
   - Link Style:
     ```
     Font: 15px / 500
     Color: #4A4A4A (inactive)
     Color: #000000 (active)
     Padding: 22px 0
     Border-bottom: 2px solid transparent
     Active: border-bottom #007BFF
     Hover: color #000000, transition 0.2s
     ```

   **Student Links:** Dashboard, My Application, Submit Report, Chat
   **Advisor Links:** Dashboard, My Students, Evaluations, Chat
   **Admin Links:** Dashboard, Applications, Reports, Team, Settings

3. **User Menu (Right - 200px)**
   ```
   [🔔] [Avatar Circle] [Name] [▾]

   Notification Bell:
   - 32px × 32px icon button
   - Blue dot indicator (8px) if notifications exist
   - Hover: background #F5F5F5

   Avatar:
   - 36px circle
   - Background: #007BFF
   - White initials (14px / 600)

   Dropdown:
   - Trigger: Name + Chevron
   - Menu items: Profile, Settings, Logout
   ```

**Mobile (<768px):**
```
┌─────────────────────────────────────┐
│ [☰]     IMS Logo         [👤]      │ 56px height
└─────────────────────────────────────┘

Hamburger opens full-screen slide-in menu
```

---

## Student Dashboard

### Layout Grid (Desktop 1440px)
```
┌──────────────────────────────────────────────────────────────────┐
│  Student Dashboard                                    [👋 Hello!] │ ← Greeting
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Application     │  │ Progress        │  │ Reports         │  │ ← Stats Row
│  │ Status          │  │ 45%             │  │ Submitted       │  │
│  │ ACCEPTED        │  │ ████▒▒▒▒▒       │  │ 5/12 weeks      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────┐  ┌──────────────────┐   │
│  │                                    │  │                  │   │
│  │  Internship Progress Tracker      │  │  Quick Actions   │   │
│  │  [Visual Timeline/Chart]          │  │                  │   │ ← Main Content
│  │                                    │  │  • Submit Report │   │
│  │                                    │  │  • View Advisor  │   │
│  └────────────────────────────────────┘  │  • Check Chat    │   │
│                                           └──────────────────┘   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Recent Reports                                           │  │
│  │  [Table: Week | Title | Status | Feedback]                │  │ ← Reports Table
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Padding: 40px
Gap: 24px
Max-width: 1440px
```

### 1. Page Header
```
┌─────────────────────────────────────────────────────────────┐
│  Student Dashboard                           Hello, John    │
│  Track your internship progress                             │
└─────────────────────────────────────────────────────────────┘

Height: 100px
Padding: 40px 40px 24px

Left Side:
- Title: 36px / 700, #000000, letter-spacing: -0.5px
- Subtitle: 15px / 400, #4A4A4A, margin-top: 8px

Right Side:
- Greeting: 17px / 500, #000000
- Current date: 13px / 400, #4A4A4A
```

### 2. Stats Cards Row (3 Cards)

**Card Dimensions:**
- Width: calc(33.33% - 16px)
- Height: 160px
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Border-radius: 10px
- Padding: 24px
- Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)
- Transition: all 0.2s ease
- Hover: transform translateY(-2px), shadow-md

**Card 1: Application Status**
```
┌──────────────────────────┐
│ [Icon]  Application      │ ← Label (13px / 500, #4A4A4A)
│                          │
│ ACCEPTED                 │ ← Status (24px / 700, #000000)
│                          │
│ ✓ Advisor Assigned       │ ← Meta info (13px / 400, #00C853)
│   Dr. Sarah Johnson      │   (15px / 500, #000000)
└──────────────────────────┘

Icon: 40px × 40px container
- Background: #F7FAFF
- Border-radius: 8px
- Icon: 20px, #007BFF
```

**Card 2: Progress Tracker (Gamified)**
```
┌──────────────────────────┐
│ [Icon]  Your Progress    │
│                          │
│ 45%                      │ ← Large percentage (28px / 700)
│ ██████████▒▒▒▒▒▒▒▒▒▒     │ ← Progress bar
│                          │
│ 5 of 12 weeks completed  │ ← Detail (13px / 400)
└──────────────────────────┘

Progress Bar:
- Height: 8px
- Border-radius: 4px
- Background: #F5F5F5
- Fill: Linear gradient (#007BFF to #0056D9)
- Animation: Width transition 0.6s ease
```

**Card 3: Reports Submitted**
```
┌──────────────────────────┐
│ [Icon]  Reports          │
│                          │
│ 5/12                     │ ← Count (28px / 700)
│                          │
│ Last: Week 5             │ ← Last submission
│ 2 days ago               │   (13px / 400, #4A4A4A)
└──────────────────────────┘
```

### 3. Progress Tracker Visualization (Main Feature)

**Large Card (col-span-8 of 12):**
```
┌────────────────────────────────────────────────────────┐
│  Internship Progress Timeline        [View Details →] │ ← Header
├────────────────────────────────────────────────────────┤
│                                                        │
│  Week 1    Week 2    Week 3    Week 4    Week 5      │
│    ✓        ✓        ✓        ✓        ✓            │
│    ●────────●────────●────────●────────●─────○──○──○ │ ← Timeline
│                                         ↑             │
│                                    You are here       │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Week 5: API Integration Testing                │ │ ← Current Week
│  │  Submitted: 2 days ago                           │ │   Detail Card
│  │  Status: ✓ Reviewed by Advisor                   │ │
│  │  Feedback: "Excellent progress on authentication"│ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  [Upload Week 6 Report]  [View All Reports]          │ ← Actions
└────────────────────────────────────────────────────────┘

Dimensions:
- Height: 420px
- Padding: 32px

Timeline Component:
- Completed weeks: Blue filled circles (16px)
- Current week: Blue with pulse animation
- Future weeks: Gray outline circles (16px)
- Connecting line: 2px, #E8E8E8
- Completed line: 2px, #007BFF
```

**Timeline Node States:**
```css
/* Completed */
circle: 16px, background #007BFF, border 2px #FFFFFF
checkmark: white, 10px

/* Current (Active) */
circle: 20px, background #007BFF
pulse ring animation: 0 0 0 8px rgba(0, 123, 255, 0.2)

/* Future (Pending) */
circle: 16px, background #FFFFFF, border 2px #E8E8E8
```

### 4. Quick Actions Sidebar (col-span-4)

```
┌────────────────────────────┐
│  Quick Actions             │
├────────────────────────────┤
│                            │
│  ┌──────────────────────┐  │
│  │ + Submit Report      │  │ ← Primary Action
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 📧 Message Advisor    │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ 📊 View Progress     │  │
│  └──────────────────────┘  │
│                            │
│  ─────────────────────────│
│                            │
│  Upcoming Deadline         │
│  Week 6 Report            │
│  Due in 5 days            │
│                            │
└────────────────────────────┘

Height: 420px (matches progress card)
Padding: 24px

Action Buttons:
- Width: 100%
- Height: 48px
- Border-radius: 8px
- Font: 15px / 600
- Margin-bottom: 12px

Primary (Submit):
- Background: #007BFF
- Color: #FFFFFF
- Hover: background #0056D9, shadow-blue

Secondary:
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Color: #000000
- Hover: border #007BFF, color #007BFF
```

### 5. Recent Reports Table

```
┌─────────────────────────────────────────────────────────────────┐
│  Recent Reports                                    [View All →] │
├─────────────────────────────────────────────────────────────────┤
│  Week  │  Title                    │  Status    │  Feedback     │
├────────┼───────────────────────────┼────────────┼───────────────┤
│   5    │  API Integration Testing  │  ✓ Reviewed│  View         │
│   4    │  Database Schema Design   │  ✓ Reviewed│  View         │
│   3    │  User Auth Implementation │  ✓ Reviewed│  View         │
└─────────────────────────────────────────────────────────────────┘

Table Styling:
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Border-radius: 10px
- Padding: 24px

Header Row:
- Height: 44px
- Background: #FAFAFA
- Font: 13px / 600, uppercase, letter-spacing: 0.5px
- Color: #4A4A4A
- Border-bottom: 1px solid #E8E8E8

Data Rows:
- Height: 60px
- Border-bottom: 1px solid #F5F5F5
- Hover: background #FAFBFF
- Font: 15px / 400

Week Column:
- Width: 80px
- Font: 17px / 600, #000000

Status Badge:
- Reviewed: background #E8F5E9, color #2E7D32
- Pending: background #FFF3E0, color #EF6C00
- Padding: 4px 12px, border-radius: 12px
- Font: 13px / 500
```

---

## Advisor Dashboard

### Layout Overview
```
┌──────────────────────────────────────────────────────────────────┐
│  Advisor Dashboard                              Dr. Sarah Johnson │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Assigned     │  │ Pending      │  │ Reports      │          │ ← Stats
│  │ Students     │  │ Reviews      │  │ This Week    │          │
│  │    12        │  │     8        │  │     15       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  My Students - Progress Overview                         │   │
│  │  [Student Cards with Progress Bars]                      │   │ ← Student Grid
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Recent Report Submissions - Pending Review              │   │
│  │  [Table with Review Actions]                             │   │ ← Reports Table
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 1. Students Overview Grid

**Grid Layout:**
- Display: Grid
- Columns: repeat(auto-fill, minmax(360px, 1fr))
- Gap: 20px
- Margin-bottom: 32px

**Student Card:**
```
┌─────────────────────────────────────────────────┐
│  [Avatar] John Smith               [Chat Icon] │ ← Header
│           john.smith@university.edu             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Progress: 45%                      5/12 weeks │ ← Progress
│  ██████████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒               │
│                                                 │
│  Last Report: Week 5                           │
│  Submitted: 2 days ago                         │ ← Metadata
│  Status: ⚠ Pending Review                      │
│                                                 │
│  [Review Report]  [View Progress]              │ ← Actions
└─────────────────────────────────────────────────┘

Dimensions:
- Min-width: 360px
- Height: 280px
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Border-radius: 10px
- Padding: 24px
- Hover: shadow-md, border-color #007BFF

Avatar:
- 48px circle
- Background: gradient or image
- Initials: 18px / 600, #FFFFFF

Progress Bar:
- Same styling as student dashboard
- Height: 6px
- Margin: 16px 0

Status Indicators:
- Pending Review: #FF9800, yellow dot
- Up to Date: #00C853, green checkmark
- Overdue: #FF3D00, red warning
```

### 2. Reports Pending Review Table

```
┌─────────────────────────────────────────────────────────────────────┐
│  Reports Pending Review (8)                          [Filter ▾]    │
├─────────────────────────────────────────────────────────────────────┤
│  Student         │  Week  │  Title              │  Submitted  │     │
├──────────────────┼────────┼─────────────────────┼─────────────┼─────┤
│  John Smith      │   5    │  API Integration    │  2 days ago │ [→] │
│  Sarah Williams  │   4    │  Database Design    │  3 days ago │ [→] │
│  Mike Johnson    │   6    │  Frontend Dev       │  1 day ago  │ [→] │
└─────────────────────────────────────────────────────────────────────┘

Row Actions (→):
- Click to open review modal
- Hover: background #F7FAFF

Priority Indicators:
- Red dot (3+ days old)
- Yellow dot (2-3 days)
- No indicator (fresh)
```

### 3. Report Review Modal

**Modal Overlay:**
- Background: rgba(0, 0, 0, 0.5)
- Backdrop blur: 4px

**Modal Content:**
```
┌─────────────────────────────────────────────────────────┐
│  Review Report - Week 5                          [×]    │ 900px width
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Student: John Smith                                    │
│  Submitted: March 15, 2025                             │
│  Title: API Integration Testing                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Description:                                    │   │
│  │  This week I focused on implementing the REST   │   │
│  │  API endpoints for user authentication...       │   │ ← Report Content
│  │  [Scrollable content area]                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  📎 Attached File: week5_report.pdf  [Download]        │
│                                                         │
│  ─────────────────────────────────────────────────────│
│                                                         │
│  Your Feedback                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Text Area - Min 50 characters]                 │   │
│  │                                                  │   │ ← Feedback Input
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Cancel]                    [Submit Feedback]         │
└─────────────────────────────────────────────────────────┘

Modal Dimensions:
- Width: 900px
- Max-height: 90vh
- Background: #FFFFFF
- Border-radius: 16px
- Padding: 40px
- Shadow: 0 20px 60px rgba(0, 0, 0, 0.2)

Textarea:
- Min-height: 120px
- Border: 1px solid #E8E8E8
- Border-radius: 8px
- Padding: 16px
- Font: 15px / 1.5
- Focus: border #007BFF, shadow
```

---

## Company Admin Dashboard

### Layout Overview
```
┌──────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                    Jane Anderson │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Pending    │  │ Accepted   │  │ Active     │  │ Total     │ │ ← Stats
│  │ Apps       │  │ This Month │  │ Interns    │  │ Reports   │ │
│  │    24      │  │     18     │  │     45     │  │    187    │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                   │
│  ┌────────────────────────────────┐  ┌───────────────────────┐  │
│  │  Applications by Status        │  │  Intern Progress      │  │
│  │  [Donut Chart]                 │  │  [Distribution Chart] │  │ ← Charts
│  └────────────────────────────────┘  └───────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pending Applications                        [Filter ▾]   │   │
│  │  [Application Cards with Accept/Reject Actions]          │   │ ← Applications
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 1. Application Review Card

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  John Smith                        Submitted 3d ago│
│            john.smith@mit.edu                               │
│            MIT - Computer Science                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Requested Duration: 12 weeks                              │
│  Start Date: Flexible                                      │
│                                                             │
│  Cover Letter:                                             │
│  I am a senior computer science student with strong...    │
│  [Show More]                                               │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  [View Details]  [Reject]  [Accept Application →]         │
└─────────────────────────────────────────────────────────────┘

Dimensions:
- Width: 100%
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Border-radius: 10px
- Padding: 28px
- Margin-bottom: 16px

Action Buttons:
View Details: Secondary style
Reject: Border 1px #FF3D00, color #FF3D00
Accept: Background #007BFF, color #FFFFFF
```

### 2. Accept Application Modal

**Critical Feature: Setting Internship Duration**
```
┌──────────────────────────────────────────────────────┐
│  Accept Application - John Smith             [×]    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Student Details                                     │
│  • Name: John Smith                                  │
│  • University: MIT                                   │
│  • Requested Duration: 12 weeks                      │
│                                                      │
│  ──────────────────────────────────────────────────│
│                                                      │
│  Internship Configuration                           │
│                                                      │
│  Internship Duration (weeks) *                      │
│  ┌────────────────────────────────────────────┐     │
│  │  12                                    ▾   │     │ ← Number Input
│  └────────────────────────────────────────────┘     │
│  This determines the weekly report requirements     │
│                                                      │
│  Start Date (optional)                              │
│  ┌────────────────────────────────────────────┐     │
│  │  Select date...                        📅  │     │ ← Date Picker
│  └────────────────────────────────────────────┘     │
│                                                      │
│  Assign Advisor (optional)                          │
│  ┌────────────────────────────────────────────┐     │
│  │  Select advisor...                     ▾   │     │ ← Dropdown
│  └────────────────────────────────────────────┘     │
│                                                      │
│  ──────────────────────────────────────────────────│
│                                                      │
│  Progress Tracking Preview                          │
│  Student will submit: 12 weekly reports             │
│  Progress updates automatically: +8.33% per report  │
│                                                      │
│  [Cancel]                    [Accept & Notify]      │
└──────────────────────────────────────────────────────┘

Modal Width: 600px
Validation: Internship duration required (min: 1 week)
```

### 3. Analytics Charts

**Applications Donut Chart:**
```
┌────────────────────────────────┐
│  Applications Overview         │
├────────────────────────────────┤
│          ████                  │
│       ███    ███               │
│      ██  45%   ██              │ ← Donut Chart
│      ██        ██              │   Center: Total count
│       ███    ███               │
│          ████                  │
│                                │
│  ● Pending (24) - 45%         │ ← Legend
│  ● Accepted (18) - 34%        │
│  ● Rejected (11) - 21%        │
└────────────────────────────────┘

Chart Colors:
Pending: #FF9800 (Warning)
Accepted: #00C853 (Success)
Rejected: #E8E8E8 (Gray)

Chart Library: Recharts or Visx
```

**Progress Distribution Bar Chart:**
```
┌────────────────────────────────┐
│  Intern Progress Distribution  │
├────────────────────────────────┤
│                                │
│  100%  ████ (8)                │
│  75%   ██████ (12)             │ ← Horizontal Bars
│  50%   ████ (15)               │
│  25%   ██ (6)                  │
│  0%    ████ (4)                │
│                                │
└────────────────────────────────┘

Bars:
- Height: 32px
- Background: #F5F5F5
- Fill: #007BFF
- Border-radius: 4px
- Gap: 12px
```

---

## Shared Components

### 1. Form Elements

**Text Input:**
```css
height: 48px;
padding: 12px 16px;
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 8px;
font: 15px / 400 'Inter';
color: #000000;
transition: all 0.2s ease;

/* States */
:focus {
  border-color: #007BFF;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

:hover {
  border-color: #9E9E9E;
}

::placeholder {
  color: #9E9E9E;
}

:disabled {
  background: #F5F5F5;
  color: #9E9E9E;
  cursor: not-allowed;
}

.error {
  border-color: #FF3D00;
}
```

**Label:**
```css
font: 14px / 500 'Inter';
color: #000000;
margin-bottom: 8px;
display: block;

.required::after {
  content: ' *';
  color: #FF3D00;
}
```

**Textarea:**
```css
min-height: 120px;
padding: 12px 16px;
border: 1px solid #E8E8E8;
border-radius: 8px;
font: 15px / 1.6 'Inter';
resize: vertical;
transition: all 0.2s ease;

:focus {
  border-color: #007BFF;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

**Select Dropdown (Radix UI Select):**
```
┌─────────────────────────────────┐
│  Select option...           ▾  │ ← Trigger
└─────────────────────────────────┘

Trigger opens:

┌─────────────────────────────────┐
│  Option 1                       │
│  Option 2                   ✓   │ ← Selected
│  Option 3                       │
│  Option 4                       │
└─────────────────────────────────┘

Dropdown Menu:
- Background: #FFFFFF
- Border: 1px solid #E8E8E8
- Border-radius: 8px
- Shadow: 0 8px 24px rgba(0, 0, 0, 0.12)
- Max-height: 320px
- Overflow-y: auto

Options:
- Height: 40px
- Padding: 8px 16px
- Hover: background #F7FAFF
- Selected: background #F7FAFF, checkmark icon
```

### 2. Buttons

**Primary Button:**
```css
height: 48px;
padding: 12px 24px;
background: #007BFF;
color: #FFFFFF;
border: none;
border-radius: 8px;
font: 15px / 600 'Inter';
cursor: pointer;
transition: all 0.2s ease;
white-space: nowrap;

:hover {
  background: #0056D9;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.24);
}

:active {
  transform: translateY(0);
  box-shadow: none;
}

:disabled {
  background: #E8E8E8;
  color: #9E9E9E;
  cursor: not-allowed;
  transform: none;
}
```

**Secondary Button:**
```css
background: #FFFFFF;
color: #000000;
border: 1px solid #E8E8E8;
/* Other properties same as primary */

:hover {
  border-color: #007BFF;
  color: #007BFF;
  background: #FFFFFF;
}
```

**Danger/Reject Button:**
```css
background: #FFFFFF;
color: #FF3D00;
border: 1px solid #FF3D00;

:hover {
  background: #FF3D00;
  color: #FFFFFF;
}
```

**Icon Button:**
```css
width: 40px;
height: 40px;
padding: 0;
display: flex;
align-items: center;
justify-content: center;
background: transparent;
border: 1px solid #E8E8E8;
border-radius: 8px;

:hover {
  background: #F5F5F5;
  border-color: #007BFF;
}
```

### 3. Badges & Status Indicators

**Status Badge:**
```css
padding: 4px 12px;
border-radius: 12px;
font: 13px / 500 'Inter';
display: inline-flex;
align-items: center;
gap: 6px;
white-space: nowrap;

/* Variants */
.accepted {
  background: #E8F5E9;
  color: #2E7D32;
}

.pending {
  background: #FFF3E0;
  color: #EF6C00;
}

.rejected {
  background: #FFEBEE;
  color: #C62828;
}

.reviewed {
  background: #E3F2FD;
  color: #1565C0;
}
```

**Progress Badge:**
```css
padding: 6px 14px;
border-radius: 16px;
font: 14px / 600 'Inter';
background: #F7FAFF;
color: #007BFF;
border: 1px solid #007BFF;
```

### 4. Progress Bars

**Linear Progress Bar:**
```html
<div class="progress-container">
  <div class="progress-bar" style="width: 45%"></div>
</div>
```

```css
.progress-container {
  width: 100%;
  height: 8px;
  background: #F5F5F5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007BFF 0%, #0056D9 100%);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* Animated shimmer effect */
.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

**Circular Progress (for gamification):**
```html
<svg viewBox="0 0 100 100" class="circular-progress">
  <circle cx="50" cy="50" r="45" class="bg-circle"></circle>
  <circle cx="50" cy="50" r="45" class="progress-circle"
          style="stroke-dashoffset: 141"></circle>
  <text x="50" y="50" class="percentage">45%</text>
</svg>
```

```css
.circular-progress {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
}

.bg-circle {
  fill: none;
  stroke: #F5F5F5;
  stroke-width: 8;
}

.progress-circle {
  fill: none;
  stroke: #007BFF;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283; /* 2 * π * 45 */
  transition: stroke-dashoffset 0.6s ease;
}

.percentage {
  transform: rotate(90deg) translate(0, 50px);
  font: 20px / 700 'Inter';
  text-anchor: middle;
  fill: #000000;
}
```

### 5. Modals (Radix UI Dialog)

**Modal Overlay:**
```css
position: fixed;
inset: 0;
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
z-index: 9998;
animation: fadeIn 0.2s ease;
```

**Modal Content:**
```css
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
background: #FFFFFF;
border-radius: 16px;
padding: 40px;
max-width: 90vw;
max-height: 90vh;
overflow-y: auto;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
z-index: 9999;
animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Sizes */
.modal-sm { width: 480px; }
.modal-md { width: 720px; }
.modal-lg { width: 960px; }
```

**Modal Header:**
```css
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 24px;
padding-bottom: 20px;
border-bottom: 1px solid #E8E8E8;

h2 {
  font: 24px / 600 'Inter';
  color: #000000;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #4A4A4A;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: #F5F5F5;
  color: #000000;
}
```

### 6. Cards

**Base Card:**
```css
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 10px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
transition: all 0.2s ease;

:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Interactive cards (clickable) */
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  border-color: #007BFF;
  box-shadow: 0 4px 16px rgba(0, 123, 255, 0.12);
}

.card-interactive:active {
  transform: translateY(0);
}
```

### 7. Tables

**Table Container:**
```css
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 10px;
overflow: hidden;
```

**Table:**
```css
width: 100%;
border-collapse: collapse;

thead {
  background: #FAFAFA;
}

th {
  padding: 14px 20px;
  font: 13px / 600 'Inter';
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4A4A4A;
  text-align: left;
  border-bottom: 1px solid #E8E8E8;
}

td {
  padding: 16px 20px;
  font: 15px / 400 'Inter';
  color: #000000;
  border-bottom: 1px solid #F5F5F5;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #FAFBFF;
}

/* Compact variant */
.table-compact td,
.table-compact th {
  padding: 12px 16px;
}
```

### 8. File Upload

**Upload Area:**
```html
<div class="upload-area">
  <input type="file" id="file-upload" hidden />
  <label for="file-upload" class="upload-label">
    <svg class="upload-icon">📄</svg>
    <span class="upload-text">Click to upload or drag and drop</span>
    <span class="upload-hint">PDF, DOC, DOCX (Max 10MB)</span>
  </label>
</div>
```

```css
.upload-area {
  border: 2px dashed #E8E8E8;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #007BFF;
  background: #FAFBFF;
}

.upload-area.drag-over {
  border-color: #007BFF;
  background: #F7FAFF;
  border-style: solid;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #007BFF;
}

.upload-text {
  display: block;
  font: 15px / 600 'Inter';
  color: #000000;
  margin-bottom: 8px;
}

.upload-hint {
  display: block;
  font: 13px / 400 'Inter';
  color: #4A4A4A;
}
```

**Uploaded File Preview:**
```html
<div class="file-preview">
  <svg class="file-icon">📄</svg>
  <div class="file-info">
    <span class="file-name">week5_report.pdf</span>
    <span class="file-size">2.4 MB</span>
  </div>
  <button class="file-remove">×</button>
</div>
```

```css
.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #F7FAFF;
  border: 1px solid #007BFF;
  border-radius: 8px;
  margin-top: 12px;
}

.file-icon {
  width: 32px;
  height: 32px;
  color: #007BFF;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font: 14px / 500 'Inter';
  color: #000000;
}

.file-size {
  font: 12px / 400 'Inter';
  color: #4A4A4A;
}

.file-remove {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #4A4A4A;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.file-remove:hover {
  background: #FF3D00;
  color: #FFFFFF;
}
```

---

## Responsive Behavior

### Breakpoints
```css
/* Mobile */
@media (max-width: 767px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }

/* Large Desktop */
@media (min-width: 1440px) { ... }
```

### Mobile Adaptations (<768px)

**Navigation:**
```
┌─────────────────────────────────┐
│ [☰]     IMS Logo         [👤]  │ 56px height
└─────────────────────────────────┘

Hamburger Menu (Full-screen overlay):
┌─────────────────────────────────┐
│  [×]                            │
│                                 │
│  Dashboard                      │
│  Applications                   │
│  Reports                        │
│  Settings                       │
│                                 │
│  ───────────────────────────────│
│                                 │
│  Logout                         │
└─────────────────────────────────┘

Background: #FFFFFF
Animation: Slide from left
Width: 100%
```

**Grid Changes:**
- All cards: width 100%
- Stack vertically
- Padding: 16px (reduced from 40px)
- Gap: 16px (reduced from 24px)

**Stats Cards:**
```
┌────────────────────┐
│ [Icon] Status      │
│ ACCEPTED           │ ← Reduced height: 120px
│ ✓ Advisor Assigned │
└────────────────────┘

Full width, stack vertically
Margin-bottom: 12px
```

**Progress Tracker:**
```
┌──────────────────────────────┐
│  Progress Timeline           │
│                              │
│  Week 1  Week 2  Week 3  →  │ ← Horizontal scroll
│    ✓      ✓       ✓         │
│                              │
│  45% Complete                │
│  ████████▒▒▒▒▒▒▒▒            │
│                              │
│  [Submit Report]             │
└──────────────────────────────┘

Simplified timeline
Horizontal scroll for weeks
Single action button
```

**Tables:**
```
┌──────────────────────────────────┐
│  Recent Reports            [⋮]  │
├──────────────────────────────────┤
│  Week 5                          │
│  API Integration Testing         │
│  ✓ Reviewed • 2 days ago        │
│  [View]                          │
├──────────────────────────────────┤
│  Week 4                          │
│  Database Design                 │
│  ✓ Reviewed • 3 days ago        │
│  [View]                          │
└──────────────────────────────────┘

Transform to card layout
Stack information vertically
Single action per row
```

**Forms:**
- Inputs: height 44px (reduced from 48px)
- Buttons: Full width, height 44px
- Stack all form elements vertically
- Increased touch targets (min 44px)

**Modals:**
```
Mobile Modal (Full Screen):
┌─────────────────────────────────┐
│  [←] Review Report              │ 56px header
├─────────────────────────────────┤
│                                 │
│  [Scrollable content]           │ Full height
│                                 │
│                                 │
├─────────────────────────────────┤
│  [Submit Feedback]              │ 72px footer
└─────────────────────────────────┘

Width: 100vw
Height: 100vh
Border-radius: 0
Back arrow instead of X
Fixed footer for actions
```

### Tablet Adaptations (768px - 1023px)

**Grid:**
- 2 columns for stats cards
- Progress tracker: full width
- Tables: full width with all columns

**Sidebar:**
- Collapsible (hamburger icon)
- 64px collapsed width (icons only)
- 240px expanded on click

### Touch Interactions (Mobile/Tablet)

```css
/* Increase interactive element sizes */
@media (hover: none) {
  button {
    min-height: 44px;
    min-width: 44px;
  }

  a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  /* Remove hover states, use active */
  .card:active {
    transform: scale(0.98);
  }

  button:active {
    transform: scale(0.96);
  }
}
```

---

## Component Library: Radix UI + Tailwind CSS

### Recommended Stack

**Core Libraries:**
```json
{
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-progress": "^1.0.3",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "tailwindcss": "^3.4.0",
  "recharts": "^2.10.0",
  "date-fns": "^3.0.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.4"
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        blue: {
          accent: '#007BFF',
          hover: '#0056D9',
        },
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          400: '#9E9E9E',
          700: '#4A4A4A',
          900: '#1A1A1A',
        },
        success: '#00C853',
        warning: '#FF9800',
        error: '#FF3D00',
        info: '#F7FAFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '11px',
        sm: '13px',
        base: '15px',
        lg: '17px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.12)',
        blue: '0 4px 16px rgba(0, 123, 255, 0.16)',
      },
    },
  },
  plugins: [],
};
```

### Example Component Implementation

**Progress Card Component:**
```jsx
import * as Progress from '@radix-ui/react-progress';

export const ProgressCard = ({ progress, totalWeeks, completedWeeks }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-accent" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          Your Progress
        </span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-black">
          {progress}%
        </span>
      </div>

      <Progress.Root
        className="relative overflow-hidden bg-gray-100 rounded h-2"
        value={progress}
      >
        <Progress.Indicator
          className="bg-gradient-to-r from-blue-accent to-blue-hover h-full transition-all duration-600 ease-out"
          style={{ width: `${progress}%` }}
        />
      </Progress.Root>

      <div className="mt-3">
        <span className="text-sm text-gray-700">
          {completedWeeks} of {totalWeeks} weeks completed
        </span>
      </div>
    </div>
  );
};
```

**Accept Application Modal:**
```jsx
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const acceptSchema = z.object({
  internshipDurationWeeks: z.number().min(1, 'Duration must be at least 1 week'),
  startDate: z.date().optional(),
  advisorId: z.string().optional(),
});

export const AcceptApplicationModal = ({ application, open, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      internshipDurationWeeks: 12,
    }
  });

  const onSubmit = async (data) => {
    // API call to accept application
    await fetch(`/api/applications/${application._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'accepted',
        internshipDurationWeeks: data.internshipDurationWeeks,
      }),
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-10 w-[600px] max-h-[90vh] overflow-y-auto shadow-lg z-[9999]">
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
            <Dialog.Title className="text-2xl font-semibold text-black">
              Accept Application - {application.student.fullName}
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-sm hover:bg-gray-100 transition-colors">
              ×
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Internship Duration (weeks) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                {...register('internshipDurationWeeks', { valueAsNumber: true })}
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:border-blue-accent focus:outline-none focus:ring-3 focus:ring-blue-accent/10 transition-all"
              />
              {errors.internshipDurationWeeks && (
                <p className="mt-2 text-sm text-error">
                  {errors.internshipDurationWeeks.message}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-700">
                This determines the weekly report requirements
              </p>
            </div>

            <div className="p-4 bg-info border border-blue-accent/20 rounded-lg">
              <h4 className="text-base font-semibold text-black mb-2">
                Progress Tracking Preview
              </h4>
              <p className="text-sm text-gray-700">
                Student will submit: {watchDuration || 12} weekly reports
              </p>
              <p className="text-sm text-gray-700">
                Progress updates automatically: +{(100 / (watchDuration || 12)).toFixed(1)}% per report
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 h-12 px-6 border border-gray-200 rounded-lg text-base font-semibold text-black hover:border-blue-accent hover:text-blue-accent transition-all"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="flex-1 h-12 px-6 bg-blue-accent text-white rounded-lg text-base font-semibold hover:bg-blue-hover hover:-translate-y-0.5 hover:shadow-blue transition-all"
              >
                Accept & Notify
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

---

## Performance Optimizations

### Code Splitting
```jsx
import { lazy, Suspense } from 'react';

// Lazy load dashboard components
const StudentDashboard = lazy(() => import('./dashboards/StudentDashboard'));
const AdvisorDashboard = lazy(() => import('./dashboards/AdvisorDashboard'));
const AdminDashboard = lazy(() => import('./dashboards/AdminDashboard'));

// Loading skeleton
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-16 bg-gray-100 rounded-md" />
    <div className="grid grid-cols-3 gap-6">
      <div className="h-40 bg-gray-100 rounded-md" />
      <div className="h-40 bg-gray-100 rounded-md" />
      <div className="h-40 bg-gray-100 rounded-md" />
    </div>
  </div>
);

// Usage
<Suspense fallback={<DashboardSkeleton />}>
  <StudentDashboard />
</Suspense>
```

### Image Optimization
```jsx
// Use Next.js Image or similar
import Image from 'next/image';

<Image
  src={avatarUrl}
  alt="User avatar"
  width={36}
  height={36}
  className="rounded-full"
  loading="lazy"
/>
```

### Memoization
```jsx
import { memo, useMemo } from 'react';

const ProgressCard = memo(({ progress, totalWeeks }) => {
  const completedWeeks = useMemo(
    () => Math.floor((progress / 100) * totalWeeks),
    [progress, totalWeeks]
  );

  return (/* ... */);
});
```

---

## Accessibility Checklist

- [x] All interactive elements keyboard accessible
- [x] Focus visible on all focusable elements
- [x] ARIA labels on icon buttons
- [x] Semantic HTML (nav, main, section, article)
- [x] Color contrast ratio ≥ 4.5:1
- [x] Form labels properly associated
- [x] Error messages announced to screen readers
- [x] Modal focus trap implemented
- [x] Loading states announced
- [x] Alt text on all images

---

## Animation Guidelines

**Page Transitions:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-enter {
  animation: fadeIn 0.3s ease;
}
```

**Micro-interactions:**
- Button hover: 0.2s ease
- Card hover: 0.2s ease
- Progress bar fill: 0.6s cubic-bezier(0.4, 0, 0.2, 1)
- Modal enter: 0.3s cubic-bezier(0.4, 0, 0.2, 1)

**Loading States:**
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #F5F5F5 0%,
    #E8E8E8 50%,
    #F5F5F5 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

---

## Implementation Priority

### Phase 1: Core Foundation
1. Design system setup (Tailwind config)
2. Global navigation component
3. Base components (buttons, inputs, cards)
4. Layout containers

### Phase 2: Dashboard Shells
1. Student dashboard layout
2. Advisor dashboard layout
3. Admin dashboard layout
4. Responsive navigation

### Phase 3: Feature Components
1. Progress tracker visualization
2. Application cards
3. Report submission form
4. Review modals

### Phase 4: Data Integration
1. Connect to backend APIs
2. Real-time updates
3. Optimistic UI updates
4. Error handling

### Phase 5: Polish
1. Loading states
2. Empty states
3. Error states
4. Animations
5. Accessibility audit
6. Performance optimization

---

This design specification provides a complete blueprint for implementing a cutting-edge, minimalist Internship Management System. The design prioritizes clarity, usability, and the gamified progress tracking feature you've implemented.

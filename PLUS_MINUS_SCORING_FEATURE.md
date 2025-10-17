# Plus/Minus Player Scoring Feature & App Updates

## Summary of Changes

### 🎯 **Plus/Minus Scoring Buttons**
Added quick scoring buttons to each player component for easy point management during gameplay.

#### **Functionality:**
- **Plus Button (+)**: Adds question points + bonus points (if any) to the player
- **Minus Button (-)**: Subtracts only the base question points (no bonus deduction)
- **Manual Entry**: Still preserved - users can manually type scores as before
- **Context-Aware**: Buttons only appear when a question is active

#### **Visual Design:**
- **Position**: Plus button on left, minus button on right of each player component
- **Icons**: Custom SVG icons (plus-icon.svg, minus-icon.svg) 
- **Size**: Responsive sizing (6x6 on mobile, 7x7 on larger screens)
- **Interaction**: Hover scale effect for better UX
- **Tooltips**: Show exactly what points will be added/removed

### 📱 **App Branding Updates**

#### **Page Title & Meta:**
- **Title**: "Jeopardy: The Brandsmen Edition"
- **Description**: "Jeopardy: The Brandsmen Edition an inside-joke-filled quiz night where the team tests trivia chops, laughs loud, and battles for bragging rights."
- **Updated**: Open Graph and Twitter meta tags

#### **Favicon:**
- **Updated**: HTML references to `/favicon.png` instead of `/favicon.ico`
- **Manual Action**: You need to copy your `favicon.png` file to `/public/favicon.png`

## Technical Implementation

### **Files Created:**
1. `src/assets/plus-icon.svg` - Plus button icon
2. `src/assets/minus-icon.svg` - Minus button icon  
3. `COPY_FAVICON.md` - Instructions for favicon setup

### **Files Modified:**

#### **PlayerScores.tsx**
- Added `currentQuestion` prop to interface
- Imported SVG icons
- Added `handlePlusClick()` and `handleMinusClick()` functions
- Added conditional rendering of plus/minus buttons
- Positioned buttons absolutely on left/right sides

#### **GameContainer.tsx & QuestionModal.tsx**
- Passed `currentQuestion` prop to PlayerScores component
- Ensures buttons only show when question is active

#### **index.html**
- Updated title and meta description
- Changed favicon reference to `.png`
- Updated Open Graph and Twitter meta tags

## User Experience

### **Before:**
- Manual score calculation required
- Had to add question points + bonus points mentally
- Risk of calculation errors

### **After:**
- **One-click scoring**: Plus button adds total points (base + bonus)
- **One-click penalties**: Minus button subtracts base points only
- **Smart logic**: Bonus points only added with plus, never subtracted with minus
- **Manual override**: Users can still manually edit scores
- **Visual feedback**: Tooltips show exactly what will happen

## Usage Instructions

### **During Gameplay:**
1. **Correct Answer**: Click the **plus (+)** button next to player's name
   - Automatically adds question points + any bonus points
2. **Wrong Answer**: Click the **minus (-)** button next to player's name  
   - Subtracts only the base question points (no bonus deduction)
3. **Manual Adjustment**: Click on score number to manually edit if needed

### **Button Visibility:**
- Buttons appear only when a question is selected/active
- Buttons disappear when no question is active
- Works in both main game view and question modal

## Testing

### **Test Scenarios:**
1. **Basic Question (no bonus)**: Plus adds 200, minus subtracts 200
2. **Question with Bonus**: Plus adds 200+50=250, minus subtracts only 200
3. **Manual Override**: Can still manually type scores
4. **Responsive**: Buttons scale properly on mobile/desktop
5. **Tooltips**: Hover shows what points will be added/removed

### **Edge Cases Handled:**
- No current question = no buttons shown
- Missing onScoreChange callback = buttons disabled
- Bonus points = 0 or undefined = treated as no bonus

This enhancement significantly speeds up gameplay and reduces calculation errors while maintaining all existing functionality!
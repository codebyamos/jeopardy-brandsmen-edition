# Player Scores Width Constraint Fix

## Problem
Player components were growing too wide on large screens, causing:
1. Players area width exceeding the game board width
2. Horizontal scrolling in modal dialogs
3. Poor visual proportion on large displays

## Root Causes
1. No maximum width constraint on individual player components
2. Excessive gap spacing on xl screens (`xl:gap-8`)
3. Large padding and font sizes without upper limits
4. Modal PlayerScores not respecting container constraints

## Solutions Applied

### 1. Player Component Size Limits
- **Added**: `max-w-[140px]` to prevent excessive width growth
- **Reduced**: Padding from `lg:px-6` to `lg:px-4` 
- **Reduced**: Minimum width from `lg:min-w-[120px]` to `lg:min-w-[100px]`
- **Reduced**: Font size from `lg:text-lg` to `lg:text-base`

### 2. Container Constraints  
- **Added**: `w-full max-w-full px-2` to the flex container
- **Removed**: `xl:gap-8` excessive spacing, keeping max at `lg:gap-4`
- **Added**: `w-full` to ensure proper width distribution

### 3. Input Field Optimization
- **Reduced**: Width from `clamp(3rem,6vw,8rem)` to `clamp(3rem,8vw,6rem)`
- **Maintained**: Responsive scaling but with stricter upper limit

### 4. Modal-Specific Fix
- **Wrapped**: PlayerScores in modal with `max-w-full overflow-x-auto`
- **Prevents**: Component overflow causing horizontal scroll

## Result
- Player components now respect container boundaries
- No more horizontal scrolling in modals
- Better visual proportion across all screen sizes
- Maintains readability while preventing excessive growth
- Responsive behavior preserved for smaller screens

## Technical Changes

### PlayerScores.tsx
```tsx
// Container
<div className="flex flex-wrap lg:flex-nowrap gap-1 sm:gap-2 md:gap-3 lg:gap-4 justify-center overflow-x-auto lg:overflow-x-visible w-full max-w-full px-2">

// Individual components  
<div className="... lg:px-4 py-1 sm:py-2 md:py-3 lg:py-3 ... min-w-[70px] sm:min-w-[80px] md:min-w-[90px] lg:min-w-[100px] max-w-[140px]">

// Input fields
style={{ backgroundColor: '#2c5b69', width: 'clamp(3rem,8vw,6rem)' }}
```

### QuestionModal.tsx
```tsx
<div className="w-full max-w-full overflow-x-auto">
  <PlayerScores ... />
</div>
```
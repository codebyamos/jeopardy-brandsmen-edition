# Player Scores Responsive Layout Fix

## Problem
In smaller browser windows, player score components were wrapping to multiple rows, pushing some players to the bottom and creating a poor user experience.

## Solution
Modified the responsive behavior to:
1. **Keep all players in one row on screens larger than 1024px (xl breakpoint)**
2. **Only allow wrapping on tablets and smaller (1024px and below)**
3. **Make components progressively smaller on smaller screens**
4. **Add horizontal scrolling as fallback for very small screens**

## Changes Made

### Container Layout
- **Before**: `flex flex-wrap` (always allowed wrapping)
- **After**: `flex flex-wrap lg:flex-nowrap` (wrap below 1024px, no wrap above)
- **Added**: `overflow-x-auto lg:overflow-x-visible` (horizontal scroll fallback below lg)

### Component Sizing (Progressive scaling)
| Screen Size | Padding | Min-Width | Font Size |
|-------------|---------|-----------|-----------|
| xs (default) | `px-2 py-1` | `min-w-[70px]` | `text-xs` |
| sm (640px+) | `px-3 py-2` | `min-w-[80px]` | `text-sm` |
| md (768px+) | `px-4 py-3` | `min-w-[90px]` | `text-base` |
| lg (1024px+) | `px-6 py-4` | `min-w-[120px]` | `text-lg` *(restored original size)* |

### Avatar Sizing
- **xs**: `w-4 h-4`
- **sm**: `w-5 h-5` 
- **md+**: `w-6 h-6`

### Gap Between Players
- **xs**: `gap-1`
- **sm**: `gap-2`
- **md**: `gap-3`
- **lg**: `gap-4`
- **xl**: `gap-8`

### Flex Behavior
- **Below lg**: `flex-shrink` (allows wrapping to multiple rows)
- **lg and above**: `lg:flex-shrink-0` (prevents shrinking, keeps single row)

## Responsive Breakpoints
- **Mobile (< 640px)**: Very compact, **wraps to multiple rows**
- **Small (640px - 767px)**: Slightly larger, **wraps to multiple rows**
- **Medium (768px - 1023px)**: Moderate size, **wraps to multiple rows**
- **Large (1024px+)**: **Original full size components**, **single row only**

## Result
- **Below 1024px**: Players wrap to 2, 3, 4, or as many rows as needed
- **Above 1024px**: Players stay in one row regardless of count
- Components scale appropriately for each screen size
- Horizontal scrolling provides fallback if single row doesn't fit
- Better space utilization across all screen sizes
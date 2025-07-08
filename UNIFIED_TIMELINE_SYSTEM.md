# Unified Timeline System - Activity-Based Feed Sorting

## Overview

Implemented a unified timeline system that displays content based on the most recent activity date, whether that's creation or an update. This creates a true chronological feed of content activity.

## How It Works

### Central Timeline Logic

The default "Activity" sort now uses this logic:

1. **For each post**: Compare `dateUpdated` (if exists) vs `dateCreated`
2. **Use the most recent date** as the "activity date"
3. **Sort by activity date** descending (most recent first)

### Example Scenario

You described this perfect example:

- **Post A**: Created last week (July 1, 2025)
- **Post B**: Created a month ago (June 1, 2025), updated yesterday (July 6, 2025)

**Result**: Post B appears first because its activity date (July 6) is more recent than Post A's activity date (July 1).

## Implementation Details

### API Changes (`feed.json.ts`)

```javascript
if (sort === 'activity' || sort === 'newest' || sort === 'updated') {
  // Unified timeline: use most recent activity date (updated OR created)
  const aActivityDate = new Date(a.data.dateUpdated || a.data.dateCreated || '').getTime();
  const bActivityDate = new Date(b.data.dateUpdated || b.data.dateCreated || '').getTime();
  return bActivityDate - aActivityDate; // Most recent activity first
}
```

### UI Updates

- **Default sort**: Changed from "Created" to "Activity" (⚡ icon)
- **Sort options**: Activity, Created, A→Z
- **Backward compatibility**: "newest" maps to "activity"

### Date Display Logic

Posts now show:

- **Recently updated old posts**: `Mar 15, 2023 → Jul 6, 2025` (arrow format)
- **Recently created posts**: `2 days ago`
- **Recently updated recent posts**: `Updated yesterday`

## Benefits

### For Content Discovery

- **Fresh updates surface immediately**: Recently revised content gets prominence
- **Active projects stay visible**: Ongoing work doesn't get buried
- **Natural content lifecycle**: Creation and updates treated equally

### For Content Creators

- **Incentivizes updates**: Refreshing old content brings it back to the top
- **Reflects real activity**: The feed matches actual work patterns
- **Living document approach**: Encourages iterative content improvement

### For Readers

- **Most relevant content first**: Recently active content is likely most current
- **Better content quality**: Updated posts often contain improved information
- **Continuous discovery**: Regular visitors see new activity consistently

## Technical Implementation

### Sort Options Available

1. **Activity** (⚡): Unified timeline (default)
2. **Created** (📅): Traditional creation date sorting  
3. **A→Z** (🔤): Alphabetical by title

### Fallback Logic

- If `dateUpdated` doesn't exist → use `dateCreated`
- If neither exists → treat as epoch (appears last)
- Urgent posts always appear first regardless of dates

### Files Modified

- `src/pages/api/feed.json.ts` - API sorting logic
- `src/components/islands/Feed.jsx` - Client-side defaults
- `src/components/islands/NavbarMenu*.jsx` - Sort option labels
- `src/pages/*/index.astro` - Static page sorting
- All pagination routes - Consistent behavior

## Example Feed Order

With the unified timeline, your feed might look like:

1. **"Old Project"** - Created Jan 2023, Updated today → Shows at top
2. **"Fresh Post"** - Created yesterday → Shows second  
3. **"Recent Update"** - Created last week, Updated 3 days ago → Shows third
4. **"Older Fresh"** - Created last month, no updates → Shows fourth

This creates a much more dynamic and relevant content experience!

## Testing

Visit the main feed to see posts ordered by their most recent activity. The test posts demonstrate:

- Old post with recent update appears prominently
- Recently created posts follow
- Arrow format shows evolution timeline clearly

The system now truly reflects a **living, breathing content timeline** rather than just a creation log.

# LockScreen Calendar Shortcut

This script for the Scriptable app generates minimalistic wallpapers for iPhone featuring a yearly calendar, event display, and current year progress.

## Description

The script automatically scans your iOS calendars, filters them by a special prefix, and displays events on a yearly grid. Event colors are taken directly from iOS Calendar settings.

![Preview](screenshots/preview.png)

## Features

- **Auto-Adaptation**: Adapts to your iPhone's screen size.
- **Native Colors**: Uses colors set in the Calendar app.
- **Filtering**: Displays only calendars with a specific prefix (default `*`) to keep the screen uncluttered.
- **Event Priority**: When events overlap, priority is determined alphabetically by calendar name or randomly. You can control this by adding prefixes like `*1`, `*2` to calendar names.
- **Manual Dates**: Ability to add significant dates manually via config.
- **Statistics**: Shows days remaining in the year and completion percentage.

## Installation and Setup

### 1. Script Preparation
1. Install [Scriptable](https://apps.apple.com/us/app/scriptable/id1405459188) from the App Store.
2. Create a new script, name it (e.g., `LockScreenCalendar`), and copy the code from `script.js`. *(Optional if using the direct paste method in step 2.3)*
3. In iOS settings (Calendar), rename existing calendars (or create new ones) that you want to display by adding `*` to the beginning (e.g., `*Work`, `*Holidays`). Ensure they contain some events.

### 2. Create Shortcut
1. Open the "Shortcuts" app.
2. Create a new shortcut.
3. Add the **Run Script** action (Scriptable) and select the created script (or paste the script code directly into the parameter).
4. Add the **Set Wallpaper** action.
   - In the image field, select "Output" from the previous step.
   - Select "Lock Screen".
   - **Important**: Disable "Show Preview" and "Crop to Subject" by expanding the action settings.

![Shortcut Setup](screenshots/shortcut.png)

### 3. Automation
To update the wallpaper automatically every morning:
1. Go to the "Automation" tab in the Shortcuts app.
2. Create a new "Personal Automation".
3. Select the **Time of Day** condition, e.g., 08:00 daily.
4. Add the **Run Shortcut** action and select the shortcut created earlier.
5. Disable "Ask Before Running" and "Notify When Run" so it happens in the background.

![Automation Setup](screenshots/automation.png)

> **Note**: Add the shortcut in the "Do" section.

## Configuration

You can customize the settings at the beginning of the `script.js` file:

```javascript
const CONFIG = {
  // Calendar Key (only calendars starting with this character will be shown)
  calendarPrefix: "*", 

  // Start of week: 0 = Sunday, 1 = Monday
  firstDayOfWeek: 1,

  // Manual significant dates (format "MM-DD")
  manualSignificantDates: [], // Example: ["01-01", "12-31"]
  
  // Layer sorting when events overlap (true = alphabetical)
  sortByName: true,

  // Interface Colors
  colors: {
    bg: new Color("#000000"),        // Background
    pastDay: new Color("#ffffff", 0.95), // Past days
    futureDay: new Color("#2c2c2e"),     // Future days
    today: new Color("#ff3b30"),         // Today
    significant: new Color("#FFD60A"),   // Color for manual dates
    text: new Color("#98989d"),          // Month text
    highlightText: new Color("#ff9f0a")  // Stats text
  },
  // ...
};
```

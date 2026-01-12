// Year Progress Wallpaper v25 (Zero-Config: Native Colors & Prefix)
// by agaragou
// https://github.com/agaragou/LockScreen-Calendar-ShortCut
const CONFIG = {
  // --- USER CONFIGURATION ---
  // The script will ONLY find calendars starting with this character.
  // Rename calendars on your iPhone (e.g., "*Vacation", "*Shifts").
  // Colors are taken directly from iOS Calendar settings!
  calendarPrefix: "*",

  // Manual significant dates (if you don't want to use a calendar)
  // Format: "MM-DD"
  manualSignificantDates: [], // Example: ["01-01", "12-31"]

  // Sort priority: Which event is drawn on top if they overlap?
  // true = Alphabetical (e.g. "1.Holiday" covers "2.Work")
  // false = Random (depends on system order)
  sortByName: true,

  // Interface Colors
  colors: {
    bg: new Color("#000000"),
    pastDay: new Color("#ffffff", 0.95),
    futureDay: new Color("#2c2c2e"),
    today: new Color("#ff3b30"),
    significant: new Color("#FFD60A"), // For manualSignificantDates
    text: new Color("#98989d"),
    highlightText: new Color("#ff9f0a")
  },

  // Design Ratios (Auto-Scale)
  ratios: {
    topPadding: 0.335,
    spacing: 30.5,
    radius: 0.3,
    monthGap: 2.1,
    colGap: 1.6
  }
};

// --- 1. AUTO-DETECT SCREEN SIZE ---
const screen = Device.screenSize();
const width = screen.width;
const height = screen.height;

const PADDING_TOP = height * CONFIG.ratios.topPadding;
const DOT_SPACING = width / CONFIG.ratios.spacing;
const DOT_RADIUS = DOT_SPACING * CONFIG.ratios.radius;
const MONTH_GAP = DOT_SPACING * CONFIG.ratios.monthGap;
const COL_GAP = DOT_SPACING * CONFIG.ratios.colGap;

// --- 2. AUTO-SCAN CALENDARS ---
const date = new Date();
const currentYear = date.getFullYear();

async function fetchAutoCalendars() {
  let calendarsList = [];
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

  try {
    const allCalendars = await Calendar.forEvents();

    // Filter calendars by prefix
    let targetCalendars = allCalendars.filter(c => c.title.startsWith(CONFIG.calendarPrefix));

    // Sort by name for priority control
    if (CONFIG.sortByName) {
      targetCalendars.sort((a, b) => a.title.localeCompare(b.title));
    }

    for (let cal of targetCalendars) {
      const events = await CalendarEvent.between(startOfYear, endOfYear, [cal]);

      calendarsList.push({
        name: cal.title,
        color: cal.color, // GET COLOR DIRECTLY FROM IOS
        events: events.map(e => ({
          start: e.startDate,
          end: e.endDate
        }))
      });
    }
  } catch (e) { console.log("Error: " + e.message); }

  return calendarsList;
}

const activeCalendarsData = await fetchAutoCalendars();

// --- 3. DRAWING ---
const ctx = new DrawContext();
ctx.size = new Size(width, height);
ctx.respectScreenScale = true;
ctx.opaque = true;
ctx.setFillColor(CONFIG.colors.bg);
ctx.fillRect(new Rect(0, 0, width, height));

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentMonth = date.getMonth();
const currentDay = date.getDate();

function getDayColor(month, day) {
  const monthStr = (month + 1).toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  const dateString = `${monthStr}-${dayStr}`;

  const isPast = (month < currentMonth) || (month === currentMonth && day < currentDay);
  const isToday = (month === currentMonth && day === currentDay);

  // 1. Priority: Today
  if (isToday) return CONFIG.colors.today;

  // 2. Priority: Manual Dates
  if (CONFIG.manualSignificantDates.includes(dateString)) return CONFIG.colors.significant;

  const dayStart = new Date(currentYear, month, day, 0, 0, 0);
  const dayEnd = new Date(currentYear, month, day, 23, 59, 59);

  // 3. Priority: Calendars
  // Check the list. Since it's sorted, the first match wins.
  for (let calData of activeCalendarsData) {
    for (let event of calData.events) {
      if (event.start <= dayEnd && event.end >= dayStart) {
        return calData.color; // Use calendar's native color
      }
    }
  }

  // 4. Background
  if (isPast) return CONFIG.colors.pastDay;
  return CONFIG.colors.futureDay;
}

const monthBlockWidth = (6 * DOT_SPACING) + (DOT_RADIUS * 2);
const totalCalendarWidth = (3 * monthBlockWidth) + (2 * COL_GAP);
const startX = (width - totalCalendarWidth) / 2;

const fontSizeMonth = width * 0.022;
const fontSizeStats = width * 0.028;

for (let m = 0; m < 12; m++) {
  const colIndex = m % 3;
  const rowIndex = Math.floor(m / 3);

  const blockX = startX + (colIndex * (monthBlockWidth + COL_GAP));
  const rowHeight = (6 * DOT_SPACING) + (fontSizeMonth * 2) + MONTH_GAP;
  const blockY = PADDING_TOP + (rowIndex * rowHeight);

  ctx.setTextColor(CONFIG.colors.text);
  ctx.setFont(Font.boldSystemFont(fontSizeMonth));
  ctx.setTextAlignedLeft();
  ctx.drawText(monthNames[m], new Point(blockX - (DOT_SPACING * 0.1), blockY - (DOT_SPACING * 1.2)));

  const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
  let firstDayWeek = new Date(currentYear, m, 1).getDay();
  let startOffset = (firstDayWeek === 0) ? 6 : firstDayWeek - 1;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayIndex = (startOffset + d - 1);
    const gridX = dayIndex % 7;
    const gridY = Math.floor(dayIndex / 7);
    const dotX = blockX + (gridX * DOT_SPACING);
    const dotY = blockY + (gridY * DOT_SPACING);

    const fillColor = getDayColor(m, d);
    ctx.setFillColor(fillColor);
    ctx.fillEllipse(new Rect(dotX, dotY, DOT_RADIUS * 2, DOT_RADIUS * 2));
  }
}

// --- STATS ---
const startOfYear = new Date(currentYear, 0, 1);
const endOfYear = new Date(currentYear + 1, 0, 1);
const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
const daysPassed = Math.ceil(Math.abs(date - startOfYear) / (1000 * 60 * 60 * 24));
const daysLeft = Math.floor(totalDays - daysPassed);
const percentPassed = Math.floor((daysPassed / totalDays) * 100);

const singleBlockHeight = (6 * DOT_SPACING) + (fontSizeMonth * 2) + MONTH_GAP;
const statsY = PADDING_TOP + (4 * singleBlockHeight) - (MONTH_GAP * 1.5);
const statsRect = new Rect(0, statsY, width, fontSizeStats * 3);

ctx.setTextAlignedCenter();
ctx.setFont(Font.boldSystemFont(fontSizeStats));
ctx.setTextColor(CONFIG.colors.highlightText);
ctx.drawTextInRect(`${daysLeft} days left  •  ${percentPassed}%`, statsRect);

// --- OUTPUT ---
const image = ctx.getImage();
const fm = FileManager.local();
const path = fm.joinPath(fm.temporaryDirectory(), "wallpaper_auto.png");
fm.writeImage(path, image);

Script.setShortcutOutput(path);
Script.complete();
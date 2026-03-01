// Extracted utility functions for unit testing (FR9)

/**
 * Pivot flat usage entries into Recharts shape for graph display.
 * Groups by 'DD MMM' date format and accumulates hours per tool.
 *
 * @param {Array} entries - Raw usage entries from API
 * @returns {Array} - Pivoted array suitable for Recharts <LineChart> or <BarChart>
 */
export function pivotUsageData(entries) {
  const map = {};
  for (const e of entries) {
    const dateObj = new Date(e.date);
    // Ensure consistent formatting for test environments
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (!map[dateStr]) map[dateStr] = { date: dateStr, _raw: dateObj.getTime() };
    map[dateStr][e.tool] = (map[dateStr][e.tool] || 0) + e.hours;
  }
  return Object.values(map).sort((a, b) => a._raw - b._raw);
}

/**
 * Compute high-level statistics based on flat usage data.
 *
 * @param {Array} rawEntries - Raw usage entries from API
 * @returns {Object} { total, avg, topTool, days }
 */
export function computeStats(rawEntries) {
  if (!rawEntries || rawEntries.length === 0)
    return { total: 0, avg: 0, topTool: '—', days: 0 };
    
  const total = rawEntries.reduce((s, e) => s + e.hours, 0);
  const days = new Set(rawEntries.map(e => new Date(e.date).toDateString())).size;
  
  const toolTotals = {};
  for (const e of rawEntries) toolTotals[e.tool] = (toolTotals[e.tool] || 0) + e.hours;
  
  const topTool = Object.entries(toolTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  
  return { 
    total: total.toFixed(1), 
    avg: (total / days).toFixed(1), 
    topTool, 
    days 
  };
}

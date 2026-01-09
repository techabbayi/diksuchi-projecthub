# Analytics System Documentation

## Overview

The ProjectHUB Analytics System provides comprehensive tracking and analytics for:
- **Website Page Views**: Track all page visits, traffic sources, devices, and geographic locations
- **Project Views**: Monitor how many times each project is viewed
- **Project Downloads**: Track download metrics, success rates, and unique downloaders
- **Page Analytics**: Detailed analytics for specific pages including scroll depth, bounce rate, and engagement

## Installation & Setup

### 1. Install Required Dependencies

The backend uses the following packages for analytics:
- `ua-parser-js`: For parsing user agent information
- `geoip-lite`: For geographic location lookup
- `uuid`: For generating unique identifiers

Install these in the backend:

```bash
cd backend
npm install ua-parser-js geoip-lite uuid
```

### 2. Install Frontend Chart Library

For the analytics dashboard visualization:

```bash
cd frontend
npm install recharts
```

### 3. Update Backend Server Configuration

Add the analytics middleware to your `server.js`:

```javascript
import { trackPageVisit } from './middleware/analytics.js';

// Add this early in the middleware stack (after body parser but before routes)
app.use(trackPageVisit);
```

### 4. Import and Use Analytics Middleware in Routes

#### For Project Views
Add tracking when displaying project details:

```javascript
import { trackInteraction, trackProjectView } from '../middleware/analytics.js';

router.get('/projects/:id', trackInteraction('view'), async (req, res) => {
    // ... your code to fetch project ...\n    await trackProjectView(req.params.id, req);\n    // ... rest of your code ...\n});
```

#### For Project Downloads
Add tracking when users download projects:

```javascript
import { trackInteraction, trackProjectDownload } from '../middleware/analytics.js';

router.post('/projects/:id/download', trackInteraction('download'), async (req, res) => {
    try {\n        // ... your download logic ...\n        
        // Track the download\n        await trackProjectDownload(req.params.id, {\n            success: true,\n            type: 'zip', // or 'github'\n            size: downloadSize, // in bytes\n            fileName: 'project.zip'\n        }, req);\n        \n        // ... send file to user ...\n    } catch (error) {\n        // Track failed download\n        await trackProjectDownload(req.params.id, {\n            success: false\n        }, req);\n    }\n});
```

## API Endpoints

### 1. Comprehensive Analytics
**GET** `/api/admin/analytics`

Query Parameters:
- `timeframe`: '7d', '30d', '90d', '1y' (default: '30d')
- `startDate`: ISO date string
- `endDate`: ISO date string

Returns:
- Overview stats (page views, project views, downloads, conversion rates)
- Website analytics (daily trends, top pages, traffic sources, devices, countries)
- Project analytics (top projects by views and downloads, daily interactions)
- AI usage stats
- Database statistics
- Revenue data

### 2. Project-Specific Analytics
**GET** `/api/admin/analytics/projects?projectId=<projectId>`

Returns:
- Project information and current analytics
- View analytics (daily breakdown with unique users)
- Download analytics (daily breakdown with success rates)
- Device breakdown
- Geographic breakdown
- Traffic source breakdown
- Browser breakdown

### 3. Page-Specific Analytics
**GET** `/api/admin/analytics/pages?page=<page>`

Returns:
- Page visit analytics by day
- Device breakdown
- Geographic breakdown
- Traffic sources
- Browser breakdown
- Hourly distribution
- Scroll depth statistics

### 4. Browse Projects Page Analytics
**GET** `/api/admin/analytics/browse-projects`

Returns:
- Summary statistics (total visits, bounce rate, session duration)
- Daily page visit trends
- Device breakdown
- Geographic breakdown
- Traffic source analysis
- Hourly time distribution

## Models

### Analytics Model
Tracks individual view/download events with:
- Event type (view, download, page_visit)
- Resource information (project ID, page)
- User information (ID, IP, session)
- Device info (browser, OS, device type)
- Geographic data (country, city)
- Traffic source (referrer, source, medium)
- Metadata and timing information

**Features**:
- Automatic expiration after 2 years (GDPR compliance)
- Static methods for quick analysis: `getProjectViews()`, `getProjectDownloads()`, `getPageViews()`
- Comprehensive indexes for fast queries

### PageVisit Model
Tracks detailed page visit information:
- Page and route information
- Visit session tracking
- User authentication status
- Device and browser details
- Referrer and traffic source
- Geographic location
- Visit behavior (duration, scroll depth, bounces)
- Engagement metrics (clicks, form submissions)
- Performance metrics (page load time, TTFB)
- A/B testing support
- Goal conversion tracking

**Features**:
- 2-year automatic expiration for privacy
- Static methods: `getPageAnalytics()`, `getTopPages()`, `getTrafficSources()`
- Multiple time-based indexes for efficient querying

### Project Model (Updated)
Enhanced analytics fields:
- `views`: Total views (backward compatible)
- `downloads`: Total downloads (backward compatible)
- `uniqueViews`: Unique viewer count
- `uniqueDownloads`: Unique downloader count
- `analytics` object containing:
  - Daily/weekly/monthly view and download counts
  - Last viewed/downloaded timestamps
  - Top countries, devices, and traffic sources
  - Conversion rate
  - Average session duration
  - Bounce rate

**New Instance Methods**:
- `incrementViews(isUnique)`: Increment view counter
- `incrementDownloads(isUnique)`: Increment download counter
- `updateConversionRate()`: Recalculate conversion metrics
- `updateAnalyticsFromData(analyticsData)`: Bulk update analytics

**New Static Methods**:
- `getTrending(timeframe, limit)`: Get trending projects for a timeframe
- `resetPeriodCounters(period)`: Reset daily/weekly/monthly counters

## Frontend Component

### AnalyticsPage Component
Location: `frontend/src/pages/AnalyticsPage.jsx`

Features:
- **Overview Tab**: Key metrics dashboard
  - Page views and unique visitors
  - Project views and unique viewers
  - Download metrics
  - Conversion rate
  - Revenue breakdown
  
- **Website Analytics Tab**: Website-wide metrics
  - Daily page view trends
  - Top pages ranking
  - Traffic source distribution
  - Device breakdown
  - Top countries
  
- **Project Analytics Tab**: Individual project analysis
  - Project selector
  - View and download analytics
  - Device breakdown
  - Geographic regions
  
- **Browse Projects Tab**: Specific page analytics
  - Browse page summary stats
  - Daily visit trends
  - Device distribution
  - Geographic breakdown
  - Visitor type breakdown

## Usage Examples

### Track a Project View
```javascript
import { trackProjectView } from '../middleware/analytics.js';

// In your project details route
await trackProjectView(projectId, req);
```

### Track a Download
```javascript
import { trackProjectDownload } from '../middleware/analytics.js';

await trackProjectDownload(projectId, {
    success: true,
    type: 'zip',
    size: fileSizeInBytes,
    fileName: 'project.zip'
}, req);
```

### Get Project Analytics Data
```javascript
// Frontend
const response = await fetch('/api/admin/analytics/projects?projectId=' + projectId);
const data = await response.json();
const { viewAnalytics, downloadAnalytics, breakdown } = data.data;
```

### Analyze Timeframe
```javascript
// Fetch analytics for last 30 days
const response = await fetch('/api/admin/analytics?timeframe=30d');

// Or custom date range
const response = await fetch('/api/admin/analytics?startDate=2024-01-01&endDate=2024-12-31');
```

## Best Practices

1. **Data Privacy**: The system respects privacy by:
   - Automatically expiring analytics data after 2 years
   - Not storing sensitive user information beyond IP and session
   - Allowing anonymous tracking

2. **Performance**: 
   - Analytics are recorded asynchronously to avoid slowing down requests
   - Multiple indexes optimize query performance
   - Use appropriate date ranges to limit data processing

3. **Security**:
   - All analytics endpoints require admin authentication
   - Data aggregation hides individual user details
   - Geographic data is approximate based on IP lookup

4. **Maintenance**:
   - Set up a scheduled job to clean old analytics (see `cleanupAnalyticsData()`)
   - Monitor database size, especially the Analytics and PageVisit collections
   - Regularly review top traffic sources and referring domains

## Scheduled Tasks

### Daily Cleanup (Optional)
Run this job daily to maintain database performance:

```javascript
import { cleanupAnalyticsData } from './middleware/analytics.js';

// Run at 2 AM every day
schedule.scheduleJob('0 2 * * *', async () => {
    await cleanupAnalyticsData(730); // 2 years
});
```

### Reset Period Counters (Optional)
Reset daily/weekly/monthly counters:

```javascript
import Project from './models/Project.js';

// Reset daily at midnight
schedule.scheduleJob('0 0 * * *', async () => {
    await Project.resetPeriodCounters('daily');
});

// Reset weekly on Sunday
schedule.scheduleJob('0 0 * * 0', async () => {
    await Project.resetPeriodCounters('weekly');
});

// Reset monthly on 1st
schedule.scheduleJob('0 0 1 * *', async () => {
    await Project.resetPeriodCounters('monthly');
});
```

## Troubleshooting

### Analytics Not Recording
1. Check that middleware is imported and used in `server.js`
2. Verify `trackInteraction()` is used in your routes
3. Check browser console for any errors
4. Ensure database connection is active

### Missing Geographic Data
- Geographic lookup requires internet connectivity
- Local IPs (127.0.0.1, 192.168.x.x) are marked as "Local"
- GeoIP data may be inaccurate for some regions

### Large Database Size
- Run cleanup job to remove old data
- Consider archiving analytics monthly
- Adjust TTL from 2 years to a shorter period if needed

## Future Enhancements

Potential additions:
- Real-time analytics dashboard with WebSocket updates
- Custom event tracking for specific user actions
- Predictive analytics and anomaly detection
- Integration with Google Analytics
- A/B testing framework
- Advanced segmentation and cohort analysis
- Export analytics to CSV/PDF

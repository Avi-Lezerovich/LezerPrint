# 📖 User Manual

*Complete guide to using LezerPrint for 3D printer management*

---

## 📖 Table of Contents

- [Getting Started](#-getting-started)
- [Dashboard Overview](#-dashboard-overview)
- [File Management](#-file-management)
- [Print Job Management](#-print-job-management)
- [Real-Time Monitoring](#-real-time-monitoring)
- [Camera Controls](#-camera-controls)
- [G-code Terminal](#-g-code-terminal)
- [Analytics Dashboard](#-analytics-dashboard)
- [Settings Management](#-settings-management)
- [User Account](#-user-account)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Getting Started

### First Time Access

1. **Open LezerPrint** in your web browser: http://localhost:3000
2. **Create an account** by clicking "Register" 
3. **Fill out the registration form** with your details
4. **Verify your email** (if email verification is enabled)
5. **Sign in** with your credentials
6. **Explore the dashboard** and familiarize yourself with the interface

### Understanding User Roles

LezerPrint has three user roles with different permissions:

| Role | Permissions |
|------|-------------|
| **Viewer** | View files, jobs, and analytics only |
| **Operator** | All Viewer permissions + control printer, manage jobs |
| **Admin** | All permissions + user management, system settings |

### Navigation Overview

- **Dashboard** - Main overview and quick actions
- **Files** - Upload and manage 3D models and G-code
- **Jobs** - Monitor and control print jobs
- **Analytics** - View performance metrics and insights
- **Camera** - Live printer monitoring
- **Terminal** - Direct G-code communication
- **Settings** - Configure printer and preferences

---

## 📊 Dashboard Overview

The dashboard provides a comprehensive overview of your 3D printing activities.

### Main Widgets

#### Printer Status Card
- **Current State**: Shows if printer is idle, printing, paused, or has errors
- **Temperature Display**: Real-time hotend and bed temperatures
- **Position Information**: Current X, Y, Z coordinates
- **Quick Actions**: Emergency stop, pause/resume buttons

#### Recent Activity
- **Latest Print Jobs**: Shows status of recent prints
- **File Uploads**: Recently uploaded models
- **System Events**: Important notifications and alerts

#### Quick Stats
- **Total Prints**: Your lifetime print count
- **Success Rate**: Percentage of successful prints
- **Total Print Time**: Cumulative printing hours
- **Material Used**: Total filament consumption

### Real-Time Updates

The dashboard automatically updates with:
- Live printer status changes
- Temperature fluctuations
- Print progress updates
- New notifications

### Quick Actions

From the dashboard you can:
- **Start a print job** by clicking on queued jobs
- **Upload new files** using the quick upload button
- **Access camera feed** for monitoring
- **View detailed analytics** by clicking stat cards

---

## 📁 File Management

### Supported File Types

Currently supported upload formats:

| Format | Description | Use Case |
|--------|-------------|----------|
| **STL** | Standard 3D model format | Most common for 3D printing |
| **G-code** | Printer instruction files | Pre-sliced models ready to print |

Planned (not yet enabled in uploads): **OBJ**, **3MF**

### Uploading Files

#### Using the Upload Interface

1. **Navigate to Files** section
2. **Click "Upload File"** or drag files to the upload area
3. **Select your file** from your computer
4. **Add optional tags** and description
5. **Choose upload folder** (optional organization)
6. **Click "Upload"** to start the process

#### Upload Progress

- **Progress bar** shows upload completion
- **File validation** checks format and size
- **Thumbnail generation** for supported formats
- **Metadata extraction** for file information

### File Organization

#### Folder Structure
- **Models** - Raw 3D model files (STL)
- **G-code** - Sliced files ready for printing
- **Archives** - Completed or old files
- **Shared** - Files shared with other users

#### File Information

Each file displays:
- **Thumbnail preview** (for 3D models)
- **File size** and format
- **Upload date** and time
- **Print count** (how many times printed)
- **Estimated print time** (for G-code files)
- **Material requirements**

### File Actions

#### Individual File Options
- **Preview** - 3D preview for model files
- **Download** - Download original file
- **Duplicate** - Create a copy
- **Move** - Change folder location
- **Share** - Share with other users
- **Delete** - Permanently remove file

#### Bulk Operations
- **Select multiple files** using checkboxes
- **Bulk delete** selected files
- **Bulk move** to different folder
- **Bulk download** as ZIP archive

### File Details View

Click any file to see detailed information:

#### Model Information
- **Dimensions** - X, Y, Z size in mm
- **Volume** - Model volume in cubic mm
- **Surface area** - Total surface area
- **Triangle count** - Mesh complexity
- **Material estimate** - Approximate filament needed

#### Print History
- **Previous prints** using this file
- **Success/failure rates** for this model
- **Average print time** across all prints
- **Notes and comments** from previous prints

---

## 🖨️ Print Job Management

### Creating Print Jobs

#### From 3D Models (STL)
1. **Select your model** from the files list
2. **Click "Print"** button
3. **Choose print profile** (material and quality settings)
4. **Review estimated time** and material usage
5. **Add job to queue** or start immediately
6. **Monitor progress** in real-time

#### From G-code Files
1. **Select G-code file** from files list
2. **Review print parameters** embedded in file
3. **Verify compatibility** with your printer
4. **Start print** immediately or queue for later

### Print Queue Management

#### Queue Overview
- **Job priority** - High, normal, low priority levels
- **Estimated times** for each job
- **Material requirements** per job
- **Queue position** and expected start time

#### Queue Actions
- **Reorder jobs** by dragging and dropping
- **Change priority** of queued jobs
- **Cancel jobs** before they start
- **Edit job settings** while in queue

### Job Monitoring

#### Real-Time Progress
- **Completion percentage** updated continuously
- **Time remaining** estimates
- **Current layer** information
- **Print speed** and feed rate

#### Temperature Monitoring
- **Hotend temperature** with target and actual
- **Bed temperature** tracking
- **Chamber temperature** (if equipped)
- **Temperature history** graphs

#### Status Indicators

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Queued** | Waiting to start | Cancel, reorder, edit |
| **Preparing** | Heating, homing | Cancel only |
| **Printing** | Active printing | Pause, cancel, adjust |
| **Paused** | Print temporarily stopped | Resume, cancel |
| **Completed** | Print finished successfully | Review, reprint |
| **Failed** | Print stopped due to error | Review, restart |
| **Cancelled** | Manually cancelled | Review, restart |

### Job Controls

#### During Printing
- **Pause/Resume** - Temporarily stop and restart
- **Cancel** - Stop print and clear bed
- **Adjust speed** - Change print speed (50-200%)
- **Adjust flow** - Modify extrusion rate
- **Emergency stop** - Immediate halt for safety

#### Temperature Control
- **Set hotend target** - Adjust nozzle temperature
- **Set bed target** - Change bed temperature
- **Preheat presets** - Quick temperature settings
- **Cool down** - Turn off all heaters

---

## 📡 Real-Time Monitoring

### Live Status Updates

LezerPrint provides real-time monitoring through WebSocket connections:

#### Printer State
- **Current operation** - What the printer is doing now
- **Position tracking** - Live X, Y, Z coordinates
- **Speed information** - Current movement speeds
- **Tool status** - Active tool and settings

#### Environmental Monitoring
- **Temperature trends** - Historical temperature data
- **Power consumption** - Energy usage tracking
- **Noise levels** - Operational sound monitoring
- **Vibration detection** - Movement stability

### Progress Tracking

#### Print Progress
- **Layer completion** - Current layer vs total layers
- **Time tracking** - Elapsed and remaining time
- **Material usage** - Filament consumed vs estimated
- **Quality indicators** - Real-time quality assessment

#### Performance Metrics
- **Print speed** - Actual vs planned speeds
- **Temperature stability** - Heating consistency
- **Movement accuracy** - Positioning precision
- **Error detection** - Automatic problem identification

### Alerts and Notifications

#### Automatic Alerts
- **Print completion** - Job finished notification
- **Error conditions** - Problems requiring attention
- **Maintenance reminders** - Scheduled maintenance due
- **Material warnings** - Low filament or quality issues

#### Notification Delivery
- **In-app notifications** - Browser notifications
- **Email alerts** - Important status updates
- **Mobile push** - Critical alerts on mobile devices
- **Dashboard indicators** - Visual status indicators

---

## 📹 Camera Controls

### Live Camera Feed

#### Video Stream
- **High-quality stream** - Up to 1080p resolution
- **Multiple angles** - Switch between camera views
- **Zoom controls** - Digital zoom and pan
- **Fullscreen mode** - Dedicated monitoring view

#### Stream Settings
- **Resolution selection** - Adjust quality vs bandwidth
- **Frame rate control** - Smooth vs efficient streaming
- **Night vision** - Enhanced low-light viewing
- **Stream recording** - Save monitoring sessions

### Snapshot Features

#### Manual Snapshots
- **Capture current view** - Save current camera image
- **Annotate snapshots** - Add notes and markings
- **Share snapshots** - Send to team members
- **Snapshot history** - Browse previous captures

#### Automatic Capture
- **Layer photos** - Automatic shots at each layer
- **Time-lapse creation** - Compile layer photos into video
- **Progress documentation** - Visual print progression
- **Quality monitoring** - Compare against references

### Timelapse Creation

#### Setup
1. **Enable timelapse** before starting print
2. **Set capture interval** (layer-based or time-based)
3. **Choose video quality** and compression
4. **Start recording** with print job

#### Processing
- **Automatic compilation** after print completion
- **Video optimization** for sharing and storage
- **Multiple formats** - MP4, GIF, WebM options
- **Quality settings** - Resolution and compression balance

#### Sharing and Storage
- **Download videos** to your device
- **Share via link** with others
- **Cloud storage** integration
- **Social media** ready formats

---

## 💻 G-code Terminal

### Terminal Interface

#### Command Input
- **Command line** - Type G-code commands directly
- **Command history** - Navigate previous commands with arrows
- **Auto-completion** - Suggestions for common commands
- **Syntax highlighting** - Color-coded command formatting

#### Response Display
- **Real-time responses** - Immediate printer feedback
- **Color-coded output** - Success/error/warning indicators
- **Scrollable history** - View previous command results
- **Export logs** - Save command history for analysis

### Common G-code Commands

#### Basic Movement
```gcode
G28         ; Home all axes
G1 X10 Y10  ; Move to position X=10, Y=10
G1 Z5 F300  ; Move Z-axis to 5mm at 300mm/min
```

#### Temperature Control
```gcode
M104 S200   ; Set hotend temperature to 200°C
M140 S60    ; Set bed temperature to 60°C
M105        ; Get current temperatures
```

#### Print Control
```gcode
M24         ; Start/resume print
M25         ; Pause print
M226        ; Wait for user input
```

### Macro System

#### Predefined Macros
- **Home All Axes** - G28 command with safety checks
- **Preheat PLA** - Standard PLA temperature settings
- **Preheat ABS** - ABS material temperatures
- **Cool Down** - Turn off all heaters
- **Auto Bed Level** - Automatic bed leveling sequence

#### Custom Macros
1. **Create new macro** using the macro editor
2. **Add G-code commands** in sequence
3. **Test macro** with dry run option
4. **Save and name** your custom macro
5. **Assign hotkey** for quick access

#### Macro Management
- **Edit existing macros** to modify commands
- **Import/export** macro libraries
- **Share macros** with other users
- **Backup macros** for safety

### Safety Features

#### Command Validation
- **Syntax checking** before sending commands
- **Safety warnings** for potentially dangerous commands
- **Confirmation prompts** for destructive operations
- **Emergency stop** always available

#### Protection Systems
- **Temperature limits** - Prevent overheating
- **Movement bounds** - Stay within print area
- **Collision detection** - Avoid crashes
- **Power protection** - Safe power-off procedures

---

## 📈 Analytics Dashboard

### Overview Metrics

#### Key Performance Indicators
- **Total Prints** - Lifetime print count
- **Success Rate** - Percentage of successful prints
- **Average Print Time** - Mean duration per job
- **Material Efficiency** - Waste percentage and cost analysis
- **Machine Utilization** - Printer uptime statistics

#### Time-Based Analysis
- **Daily/Weekly/Monthly** trends
- **Peak usage hours** identification
- **Seasonal patterns** in printing activity
- **Productivity trends** over time

### Detailed Analytics

#### Print Performance
- **Success/Failure Ratios** by time period
- **Print Duration Analysis** - Actual vs estimated times
- **Quality Scores** - Print quality ratings and trends
- **Rework Statistics** - Failed prints requiring reprints

#### Material Usage
- **Filament Consumption** by type and color
- **Cost Analysis** - Material costs and trends
- **Waste Tracking** - Failed prints and material loss
- **Inventory Management** - Current stock levels

#### Equipment Performance
- **Printer Uptime** - Operational time vs downtime
- **Maintenance History** - Service intervals and costs
- **Error Analysis** - Common failure modes
- **Performance Degradation** - Efficiency trends

### Charts and Visualizations

#### Chart Types
- **Line Charts** - Trends over time
- **Bar Charts** - Comparative data
- **Pie Charts** - Distribution analysis
- **Area Charts** - Cumulative metrics
- **Heat Maps** - Usage patterns

#### Interactive Features
- **Zoom and pan** on time-series data
- **Drill-down** capabilities for detailed analysis
- **Filter options** by date, material, user
- **Export options** - PNG, PDF, CSV formats

### Reports and Exports

#### Automated Reports
- **Daily summaries** - Yesterday's activity
- **Weekly reports** - Performance summaries
- **Monthly analytics** - Comprehensive analysis
- **Custom periods** - User-defined date ranges

#### Export Options
- **PDF reports** - Professional formatted documents
- **CSV data** - Raw data for external analysis
- **Chart images** - High-resolution graphics
- **Excel workbooks** - Formatted spreadsheets

---

## ⚙️ Settings Management

### Printer Configuration

#### Basic Settings
- **Printer Name** - Identify your printer
- **Build Volume** - Maximum print dimensions (X, Y, Z)
- **Nozzle Diameter** - Default extruder size
- **Filament Diameter** - Standard 1.75mm or 3.0mm
- **Max Temperatures** - Safety limits for hotend and bed

#### Advanced Settings
- **Steps per mm** - Motor calibration values
- **Acceleration** - Movement acceleration limits
- **Jerk Settings** - Maximum instantaneous speed changes
- **Endstop Configuration** - Homing sensor settings
- **Probe Settings** - Auto-leveling probe configuration

### Print Profiles

#### Material Profiles
- **PLA Profile** - Optimized for PLA filament
- **ABS Profile** - Settings for ABS printing
- **PETG Profile** - PETG-specific parameters
- **TPU Profile** - Flexible filament settings
- **Custom Materials** - User-defined profiles

#### Quality Profiles
- **Draft Quality** - Fast, lower quality prints
- **Standard Quality** - Balanced speed and quality
- **High Quality** - Slow, high-detail printing
- **Ultra Quality** - Maximum detail settings

#### Profile Management
- **Create new profiles** based on existing ones
- **Import profiles** from other users or systems
- **Export profiles** for sharing or backup
- **Default profile** selection for new jobs

### User Preferences

#### Interface Settings
- **Theme Selection** - Light, dark, or system theme
- **Language** - Interface language preferences
- **Timezone** - Local time display
- **Units** - Metric or imperial measurements
- **Notification Preferences** - Alert settings

#### Dashboard Customization
- **Widget layout** - Arrange dashboard components
- **Default views** - Set preferred starting pages
- **Quick actions** - Customize shortcut buttons
- **Chart preferences** - Default chart types and ranges

### System Settings (Admin Only)

#### User Management
- **Add new users** with role assignment
- **Modify user permissions** and roles
- **Deactivate users** without deleting data
- **Reset passwords** for user accounts
- **Audit logs** - Track user activities

#### System Configuration
- **File storage** - Upload directory and limits
- **Database backup** - Automated backup schedules
- **Log retention** - Log file management
- **Performance tuning** - System optimization
- **Security settings** - Authentication and access control

---

## 👤 User Account

### Profile Management

#### Personal Information
- **Username** - Display name for the system
- **Email Address** - Contact and notification email
- **Full Name** - Complete name for reports
- **Profile Picture** - Avatar for identification
- **Contact Information** - Phone and additional details

#### Security Settings
- **Change Password** - Update account password
- **Two-Factor Authentication** - Enable 2FA for security
- **Login History** - Review recent access
- **Active Sessions** - Manage logged-in devices
- **API Keys** - Generate keys for external access

### Preferences

#### Notification Settings
- **Email Notifications** - Choose which emails to receive
- **Browser Notifications** - Enable desktop alerts
- **Mobile Push** - Configure mobile app notifications
- **Frequency Settings** - How often to receive updates

#### Display Preferences
- **Date Format** - Choose date display format
- **Time Format** - 12-hour or 24-hour time
- **Number Format** - Decimal separators and currency
- **Language** - Interface language selection

### Account Statistics

#### Usage Summary
- **Account Creation** - When you joined LezerPrint
- **Total Prints** - Your lifetime print count
- **Success Rate** - Your print success percentage
- **Total Hours** - Cumulative printing time
- **Materials Used** - Total filament consumption

#### Activity History
- **Recent Logins** - Last access times and locations
- **File Uploads** - Recent file activity
- **Print Jobs** - Recent printing history
- **System Interactions** - Settings changes and actions

---

## 🚨 Troubleshooting

### Common Issues

#### Connection Problems

**Symptom**: Cannot connect to LezerPrint
- **Check network connection** - Ensure internet/network access
- **Verify URL** - Confirm correct address (http://localhost:3000)
- **Clear browser cache** - Remove stored data that might conflict
- **Try different browser** - Test with Chrome, Firefox, Safari
- **Check firewall** - Ensure ports 3000/3001 are not blocked

**Symptom**: Frequent disconnections
- **Check WiFi stability** - Ensure strong, stable connection
- **Review browser extensions** - Disable ad blockers or VPN
- **Update browser** - Use latest browser version
- **Check server status** - Verify backend is running

#### Upload Issues

**Symptom**: File uploads fail
 - **Check file size** - Ensure under 100MB limit (default)
- **Verify file format** - Must be STL or G-code
- **Check disk space** - Ensure sufficient storage available
- **Try smaller file** - Test with a simpler model
- **Clear browser cache** - Remove temporary files

**Symptom**: Slow upload speeds
- **Check internet speed** - Run speed test
- **Close other applications** - Free up bandwidth
- **Upload during off-peak** - Avoid high-traffic times
- **Try wired connection** - Ethernet vs WiFi

#### Print Job Problems

**Symptom**: Print jobs won't start
- **Check printer connection** - Verify communication
- **Verify file integrity** - Ensure G-code is valid
- **Check material** - Ensure filament is loaded
- **Review temperatures** - Verify heating works
- **Clear print queue** - Remove stuck jobs

**Symptom**: Inaccurate time estimates
- **Update print profiles** - Calibrate for your printer
- **Check slicer settings** - Verify speed settings match
- **Monitor actual times** - System learns from history
- **Report discrepancies** - Help improve estimates

### Error Messages

#### Authentication Errors
- **"Invalid credentials"** - Check username and password
- **"Session expired"** - Log out and log back in
- **"Access denied"** - Contact admin for permissions

#### File Errors
- **"File too large"** - Reduce file size or split model
- **"Invalid format"** - Convert to supported format
- **"Corrupted file"** - Re-export from original source

#### Printer Errors
- **"Printer not responding"** - Check physical connections
- **"Temperature error"** - Verify heating elements
- **"Position error"** - Check for mechanical issues

### Getting Help

#### Self-Service Resources
- **FAQ Section** - Common questions and answers
- **Video Tutorials** - Step-by-step guides
- **Community Forum** - User discussions and tips
- **Documentation** - Complete feature documentation

#### Support Channels
- **GitHub Issues** - Report bugs and request features
- **Email Support** - Direct assistance for complex issues
- **Community Chat** - Real-time help from other users
- **Documentation** - Comprehensive guides and references

#### Reporting Issues

When reporting problems, include:
1. **Detailed description** of the issue
2. **Steps to reproduce** the problem
3. **Browser and version** information
4. **Error messages** (exact text or screenshots)
5. **File types** involved (if applicable)
6. **Expected vs actual** behavior

---

## 📚 Additional Resources

### Learning Materials
- [**Getting Started Guide**](GETTING_STARTED.md) - Quick setup
- [**Installation Guide**](INSTALLATION.md) - Detailed setup
- [**API Reference**](API_REFERENCE.md) - Developer information
- [**Troubleshooting Guide**](TROUBLESHOOTING.md) - Problem solving

### Community
- **GitHub Repository** - Source code and issues
- **Discussion Forum** - User community
- **Feature Requests** - Suggest improvements
- **Bug Reports** - Report problems

### Updates
- **Release Notes** - What's new in each version
- **Upgrade Guide** - How to update your installation
- **Migration Guide** - Moving from other systems
- **Compatibility** - Supported browsers and devices

---

**Need more help?** Check our [**FAQ**](FAQ.md) or [**Troubleshooting Guide**](TROUBLESHOOTING.md), or [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues) for support.
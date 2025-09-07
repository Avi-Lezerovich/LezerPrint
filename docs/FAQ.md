# ❓ Frequently Asked Questions

*Quick answers to common questions about LezerPrint*

---

## 📖 Table of Contents

- [General Questions](#-general-questions)
- [Getting Started](#-getting-started)
- [Features & Functionality](#-features--functionality)
- [Technical Questions](#-technical-questions)
- [Troubleshooting](#-troubleshooting)
- [Security & Privacy](#-security--privacy)
- [Development & Contributing](#-development--contributing)
- [Support & Community](#-support--community)

---

## 🌟 General Questions

### What is LezerPrint?

**LezerPrint** is a comprehensive 3D printer management system that allows you to control, monitor, and manage your 3D printing workflow through a modern web interface. It combines real-time printer control, file management, analytics, and remote monitoring capabilities.

### Who is LezerPrint for?

- **3D Printing Enthusiasts** - Manage personal printers efficiently
- **Makerspaces & Schools** - Multi-user printer management
- **Small Businesses** - Production tracking and analytics
- **Developers** - Showcase of modern full-stack development
- **Students** - Learning 3D printing workflow management

### Is LezerPrint free to use?

Yes! LezerPrint is open-source software released under the MIT License. You can use, modify, and distribute it freely. There are no licensing fees or subscription costs.

### What printers does LezerPrint support?

LezerPrint supports any 3D printer that:
- Communicates via serial/USB connection
- Uses standard G-code commands
- Supports Marlin, RepRap, or compatible firmware

**Tested with:**
- Prusa i3 series
- Ender 3/5 series
- Artillery Sidewinder
- Custom RepRap builds

### Can I use LezerPrint without a physical printer?

Absolutely! LezerPrint includes a **demo mode** that simulates printer operations, making it perfect for:
- Learning the interface
- Portfolio demonstrations
- Development and testing
- Educational purposes

---

## 🚀 Getting Started

### How do I install LezerPrint?

The quickest way to get started:

```bash
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint
npm run setup
./start.sh
```

Visit http://localhost:3000 and create your account!

For detailed instructions, see our [Getting Started Guide](GETTING_STARTED.md).

### What are the system requirements?

**Minimum:**
- Node.js 18+
- 4GB RAM
- 20GB storage
- Docker Desktop

**Recommended:**
- Node.js 20+
- 8GB RAM
- 100GB SSD
- Modern browser

See full requirements in our [Installation Guide](INSTALLATION.md).

### Do I need to know programming to use LezerPrint?

Not at all! LezerPrint is designed for end-users with an intuitive web interface. However, some technical knowledge is helpful for:
- Initial setup and installation
- Troubleshooting connection issues
- Customizing printer settings

### How long does setup take?

- **Experienced developers**: 5-10 minutes
- **Technical users**: 15-30 minutes
- **Beginners**: 30-60 minutes (including learning)

Our automated setup script handles most of the complexity!

---

## 🎯 Features & Functionality

### What can I do with LezerPrint?

**Core Features:**
- Upload and manage 3D model files (STL, G-code, OBJ, 3MF)
- Start, pause, resume, and cancel print jobs
- Real-time monitoring with temperature tracking
- Live camera feeds for remote monitoring
- Print job history and analytics
- Multi-user support with role-based access

**Advanced Features:**
- G-code terminal for direct printer communication
- Custom print profiles and settings
- Automatic timelapse creation
- Print failure detection and alerts
- Cost tracking and material usage analytics

### Can I control multiple printers?

Currently, LezerPrint is designed for single printer management. Multi-printer support is planned for future releases. You can run multiple instances of LezerPrint for multiple printers.

### Does LezerPrint work with my slicer?

LezerPrint works with G-code files from any slicer:
- **Cura** ✅
- **PrusaSlicer** ✅
- **Simplify3D** ✅
- **Slic3r** ✅
- **IdeaMaker** ✅
- **Custom slicers** ✅ (if they output standard G-code)

### Can I access LezerPrint remotely?

Yes! LezerPrint is web-based, so you can access it from anywhere:
- **Local network**: Access from any device on your network
- **Internet**: Set up port forwarding or VPN
- **Mobile devices**: Responsive design works on phones/tablets

For security, we recommend using HTTPS and proper authentication for internet access.

### Does LezerPrint support cameras?

Yes! LezerPrint supports:
- **USB webcams** - Direct connection to computer
- **IP cameras** - Network-connected cameras
- **Raspberry Pi cameras** - Via Pi camera module
- **Demo mode** - Simulated camera for testing

Camera features include live streaming, snapshots, and automatic timelapse creation.

---

## 🔧 Technical Questions

### What technologies does LezerPrint use?

**Frontend:**
- Next.js 15 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- Socket.io (real-time updates)

**Backend:**
- Node.js (runtime)
- Express.js (web framework)
- Prisma (database ORM)
- PostgreSQL (database)
- Socket.io (WebSocket server)

**Infrastructure:**
- Docker (containerization)
- Redis (caching)
- Nginx (reverse proxy)

### Can I customize LezerPrint?

Absolutely! LezerPrint is open-source, so you can:
- Modify the user interface
- Add new features
- Integrate with other systems
- Customize printer communication
- Add support for new file formats

See our [Development Guide](DEVELOPMENT_GUIDE.md) for details.

### How does LezerPrint communicate with printers?

LezerPrint uses **serial communication** over USB:
1. Sends G-code commands to printer
2. Receives status responses
3. Parses temperature and position data
4. Handles error conditions and recovery

Supported protocols: Marlin, RepRap, and compatible firmware.

### Can I integrate LezerPrint with other software?

Yes! LezerPrint provides:
- **REST API** - Complete programmatic access
- **WebSocket API** - Real-time event streaming
- **Webhook support** - Notifications to external systems
- **Import/Export** - Data portability

See our [API Reference](API_REFERENCE.md) for integration details.

### Does LezerPrint store data in the cloud?

**No!** LezerPrint runs entirely on your own hardware:
- All data stays on your local system
- No cloud dependencies required
- Optional cloud storage integration available
- You maintain complete control over your data

---

## 🛠️ Troubleshooting

### LezerPrint won't start - what should I do?

**Quick fixes:**
1. Check if Docker is running: `docker ps`
2. Verify ports are free: `netstat -tulpn | grep -E "(3000|3001)"`
3. Restart services: `./stop.sh && ./start.sh`
4. Check logs: `docker-compose logs`

See our [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed solutions.

### My printer isn't detected - how do I fix this?

**Common solutions:**
1. Check USB connection and cable
2. Verify user permissions: `sudo usermod -a -G dialout $USER`
3. List available ports: `ls /dev/tty*`
4. Test direct communication: `screen /dev/ttyUSB0 115200`

### File uploads are failing - what's wrong?

**Check these issues:**
1. **File size**: Maximum 50MB by default
2. **File type**: Must be STL, G-code, OBJ, or 3MF
3. **Disk space**: Ensure sufficient storage available
4. **Permissions**: Check upload directory permissions

### Real-time updates aren't working

**Troubleshooting steps:**
1. Check WebSocket connection in browser console
2. Verify firewall/proxy settings
3. Test with different browser
4. Check for browser extension conflicts

### Performance is slow - how can I improve it?

**Optimization tips:**
1. **Hardware**: Use SSD storage, more RAM
2. **Database**: Add indexes, vacuum regularly
3. **Network**: Use wired connection for better stability
4. **Browser**: Close unnecessary tabs, disable extensions

---

## 🔒 Security & Privacy

### Is LezerPrint secure?

LezerPrint implements multiple security layers:
- **Authentication**: JWT tokens with bcrypt password hashing
- **Authorization**: Role-based access control
- **Input validation**: All inputs sanitized and validated
- **HTTPS support**: TLS encryption for data in transit
- **Security headers**: CORS, CSP, and other protective headers

See our [Security Guide](SECURITY.md) for complete details.

### What data does LezerPrint collect?

LezerPrint only stores data you provide:
- **Account information**: Username, email, hashed passwords
- **Print files**: STL, G-code files you upload
- **Print history**: Job records and statistics
- **Settings**: Your preferences and configurations

**We do NOT collect:**
- Personal browsing data
- Analytics beyond your print jobs
- Data from other applications
- Any data without your explicit action

### Can I delete my data?

Yes! You have complete control:
- **Delete individual files**: Remove specific uploads
- **Delete print jobs**: Clear job history
- **Export data**: Download all your data
- **Delete account**: Complete account removal (GDPR compliant)

### Is LezerPrint GDPR compliant?

Yes! LezerPrint respects your privacy rights:
- **Right to access**: Export all your data
- **Right to rectification**: Edit your information
- **Right to erasure**: Delete your account
- **Data portability**: Export in standard formats
- **Data minimization**: Only collect necessary data

---

## 💻 Development & Contributing

### How can I contribute to LezerPrint?

We welcome all types of contributions:
- **Bug reports**: Help identify issues
- **Feature requests**: Suggest improvements
- **Code contributions**: Fix bugs or add features
- **Documentation**: Improve guides and tutorials
- **Testing**: Test new features and report issues
- **Community support**: Help other users

See our [Contributing Guide](CONTRIBUTING.md) for details.

### What skills do I need to contribute?

**For users:**
- Bug reporting: Basic computer skills
- Documentation: Writing ability
- Testing: 3D printing knowledge helpful

**For developers:**
- Frontend: React, TypeScript, CSS
- Backend: Node.js, Express, databases
- DevOps: Docker, deployment

**All skill levels welcome!** We have "good first issue" labels for beginners.

### How do I set up a development environment?

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/LezerPrint.git
cd LezerPrint
npm run setup

# Start development environment
./start.sh

# Make changes and test
# Submit pull request when ready
```

Full instructions in our [Development Guide](DEVELOPMENT_GUIDE.md).

### What's the development roadmap?

**Short term (3-6 months):**
- Multi-printer support
- Advanced analytics and ML
- Mobile app companion
- Plugin system

**Medium term (6-12 months):**
- Cloud deployment options
- Advanced security features
- Performance optimizations
- Enterprise features

**Long term (12+ months):**
- AI-powered print optimization
- IoT ecosystem integration
- Advanced automation
- Marketplace for print profiles

### How is LezerPrint maintained?

LezerPrint is actively maintained by:
- **Core team**: Regular updates and maintenance
- **Community contributors**: Bug fixes and features
- **User feedback**: Drives development priorities

We follow semantic versioning and maintain backward compatibility.

---

## 🤝 Support & Community

### Where can I get help?

**Self-service:**
- [User Manual](USER_MANUAL.md) - Complete feature guide
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common solutions
- [FAQ](FAQ.md) - This document!

**Community:**
- [GitHub Discussions](https://github.com/Avi-Lezerovich/LezerPrint/discussions) - Q&A and general help
- [GitHub Issues](https://github.com/Avi-Lezerovich/LezerPrint/issues) - Bug reports and feature requests

### How do I report a bug?

1. **Check existing issues** - Someone might have reported it already
2. **Gather information** - Error messages, steps to reproduce
3. **Create detailed report** - Use our bug report template
4. **Follow up** - Respond to questions from maintainers

Use our [issue template](https://github.com/Avi-Lezerovich/LezerPrint/issues/new) for best results.

### How do I request a feature?

1. **Check existing requests** - Avoid duplicates
2. **Describe the problem** - What are you trying to solve?
3. **Propose solution** - How should it work?
4. **Consider alternatives** - Any other approaches?

Feature requests help us prioritize development!

### Is there a community forum?

Currently, we use **GitHub Discussions** as our main community platform:
- **Q&A**: Get help from community members
- **Ideas**: Discuss potential features
- **Show and tell**: Share your LezerPrint setup
- **General**: Anything LezerPrint related

### How can I stay updated?

- **Watch** the GitHub repository for notifications
- **Star** the project to show support
- **Follow** releases for new versions
- **Join** discussions for community updates

### Can I get commercial support?

While LezerPrint is open-source, commercial support options may be available:
- **Consulting**: Custom development and integration
- **Training**: Team training on LezerPrint usage
- **Hosting**: Managed hosting solutions
- **Enterprise**: Enterprise-specific features

Contact the maintainers for commercial inquiries.

---

## 🎯 Quick Answers

### Q: Does LezerPrint work on Raspberry Pi?
**A:** Yes! LezerPrint runs well on Raspberry Pi 4 with 4GB+ RAM. Perfect for dedicated printer management.

### Q: Can I print directly from my phone?
**A:** Yes! The web interface is mobile-responsive. You can monitor prints and perform basic controls from any mobile browser.

### Q: Does LezerPrint support print queues?
**A:** Yes! You can queue multiple print jobs and they'll execute automatically in order.

### Q: Can I use LezerPrint offline?
**A:** Yes! Once installed, LezerPrint works completely offline. Internet is only needed for initial installation.

### Q: Is there a maximum file size for uploads?
**A:** Default limit is 50MB, but this can be configured higher if needed. Large files may take longer to process.

### Q: Can I backup my LezerPrint data?
**A:** Yes! All data is stored locally and can be backed up using standard database and file backup procedures.

### Q: Does LezerPrint support multiple users?
**A:** Yes! LezerPrint has multi-user support with role-based permissions (Admin, Operator, Viewer).

### Q: Can I customize the interface?
**A:** The interface has light/dark themes and some customization options. Full customization requires modifying the source code.

### Q: Does LezerPrint work with OctoPrint plugins?
**A:** No, LezerPrint is a separate system. However, it provides similar functionality to many popular OctoPrint plugins.

### Q: Can I migrate from OctoPrint?
**A:** While there's no automatic migration tool, you can manually transfer your files and recreate print profiles in LezerPrint.

---

## 🔍 Still Have Questions?

If you can't find the answer you're looking for:

1. **Search** our [GitHub Issues](https://github.com/Avi-Lezerovich/LezerPrint/issues) and [Discussions](https://github.com/Avi-Lezerovich/LezerPrint/discussions)
2. **Check** our other documentation:
   - [User Manual](USER_MANUAL.md) - Detailed feature explanations
   - [Troubleshooting Guide](TROUBLESHOOTING.md) - Problem solutions
   - [Development Guide](DEVELOPMENT_GUIDE.md) - Technical details
3. **Ask** in [GitHub Discussions](https://github.com/Avi-Lezerovich/LezerPrint/discussions) - The community is here to help!
4. **Contact** maintainers for urgent issues

---

**💡 Tip:** This FAQ is community-driven! If you have a question that's not covered here, please ask in discussions so we can add it to help future users.
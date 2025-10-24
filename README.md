# RNLI Mission Chief - UK Coastal Rescue Simulation

A comprehensive web-based emergency dispatch simulation where you build and manage a complete coastal rescue service across the UK.

## 🎮 Play the Game

**Live Demo**: [Deploy to Vercel](https://vercel.com/new) or run locally

**Start Here**: Open `landing.html` in your browser (via HTTP server)

## 🚀 Quick Start

### Local Testing
```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx http-server -p 8080

# Then open: http://localhost:8080/landing.html
```

### Deploy to Vercel
```bash
vercel
# or
vercel --prod
```

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## 🎯 Game Overview

Build your coastal rescue empire from a single lifeboat station to a comprehensive network of:
- **RNLI Lifeboat Stations** with inshore and all-weather lifeboats
- **Beach Lifeguard Posts** with rescue watercraft and patrol teams
- **Coastguard Rescue Bases** with cliff rescue and search teams
- **Air Rescue Bases** with SAR helicopters

Respond to emergencies ranging from beach rescues to offshore mayday calls, earn funding, recruit and train crew, and unlock advanced capabilities as you grow.

## 📊 Game Features

### Core Systems

#### 🏢 **Station Management (4 Types)**
- **Lifeboat Stations** - Host ILBs and ALBs
  - Extensions: ALB Berth, ILB Slipway, Training Room, Medical Room
- **Beach Lifeguard Posts** - Surf zone rescue
  - Extensions: Watercraft Garage, First Aid Tent, Extended Patrol
- **Coastguard Rescue Bases** - Cliff and land rescue
  - Extensions: Cliff Rescue, SAR Team, Mobile Command Unit
- **Air Rescue Bases** - Helicopter operations
  - Extensions: Winch Training, Medical Evac Module

#### 🚤 **Fleet Management (9 Unit Types)**
1. **RNLI Inshore Lifeboat (ILB)** - Fast inshore rescue (35 knots)
2. **RNLI All-Weather Lifeboat (ALB)** - Offshore heavy weather (25 knots, towing)
3. **RNLI Rescue Watercraft** - Jet ski surf rescue (40 knots)
4. **Beach Lifeguard Patrol** - Shore first aid and casualty care
5. **Shore Rescue Vehicle** - 4x4/quad for beach support (20 knots)
6. **Coastguard Cliff Rescue Team** - Rope access and cliff recovery
7. **Coastguard Search & Rescue Team** - Land search operations
8. **Mobile Command Unit** - On-scene incident coordination
9. **SAR Helicopter** - Long-range winch rescue and medevac (150 knots)

Each unit has specific requirements (station type, extensions, trained crew).

#### 👥 **Crew Management**
- Recruit crew members (£10,000 each)
- Assign to stations
- Train in 5 qualifications:
  - **Night Operations** - Required for dusk/night rescues
  - **Swift Water/Surf Rescue** - Beach and surf zone
  - **Cliff Rope Access** - Cliff rescue operations
  - **Casualty Care/First Aid** - Medical emergencies
  - **Helicopter Winch Operations** - SAR helicopter ops

#### 🚨 **Mission System (7 Types)**

Missions unlock progressively based on completed rescues:

| Mission | Requirements | Reward | Level |
|---------|-------------|--------|-------|
| Swimmer in difficulty | Beach Patrol + Rescue Watercraft | £2,000 | 0 |
| Capsized kayak | ILB | £3,000 | 0 |
| Person cut off by tide | ILB + Cliff Rescue | £4,000 | 1 |
| Broken down motorboat | ALB | £5,000 | 2 |
| Missing person near cliffs | SAR Team + SAR Helicopter | £6,000 | 3 |
| Serious injury on rocks | Cliff Rescue + SAR Helicopter | £8,000 | 4 |
| Mayday: vessel sinking | ALB + SAR Helicopter + Command Unit | £12,000 | 5 |

Missions spawn every 45-90 seconds with requirements for specific unit types and trained crew.

#### 💰 **Economy System**
- **Funding** (£) - Earned from completed missions
  - Build stations (£80k - £500k)
  - Purchase units (£15k - £400k)
  - Recruit crew (£10k each)
  - Buy extensions (£15k - £75k)
  - Train crew (£3k - £8k per qualification)

- **Donations** - Premium currency for special items (future feature)

Starting balance: £100,000 + 50 donations

## 🗺️ Map & Interface

### Interactive Map
- **Real OpenStreetMap** of UK south coast (Poole area)
- **Zoom/Pan Controls** - Fully interactive
- **Real-time Unit Tracking** - Units animate between stations and missions
- **Color-coded Markers**:
  - 🟢 Green - Stations
  - 🔴 Red/Orange - Active missions (by urgency)
  - 🔵 Blue - Units on mission

### Navigation (8 Screens)
1. **📍 Map / Dispatch** - View map, missions, and activity log
2. **🏢 Stations** - Manage all stations and extensions
3. **🚤 Fleet** - View and filter all units by status
4. **👥 Crew** - Recruit and train personnel
5. **💰 Funding** - View economy stats and mission income
6. **🤝 Operations** - Mutual aid and multi-agency coordination
7. **✉️ Messages** - Mission notifications and reports
8. **⚙️ Settings** - Game preferences and profile

### Activity Log
Real-time event tracking:
- Missions spawned
- Units dispatched
- Arrivals and completions
- Funding earned
- Crew actions

## 🎲 Gameplay Loop

1. **Emergency Spawns** - Coastal incident appears on map
2. **Assess Requirements** - Check required units and training
3. **Dispatch Units** - Manual selection or "Alarm and Dispatch" (auto-match)
4. **Watch Progress** - Units travel to scene in real-time on map
5. **Mission Complete** - Earn funding, units return to station
6. **Expand Service** - Build new stations, buy units, train crew
7. **Unlock Missions** - Advanced emergencies unlock with progression

Progression Level = Missions Completed ÷ 5

## 🏗️ Starting Setup

Your first command includes:
- **Poole Lifeboat Station** (Dorset)
- **1x ILB** (Inshore Lifeboat)
- **4x Crew** (Sarah Williams, James Mitchell, Emma Thompson, David Roberts)
- **£100,000 Funding**
- **50 Donations**

First mission spawns after 10 seconds.

## 📁 File Structure

```
/
├── landing.html         # Landing page with game overview
├── rnli-game.html       # Main game interface (navigation + screens)
├── rnli-game.css        # Complete styling (1234 lines)
├── rnli-game.js         # Game engine (1410 lines)
├── vercel.json          # Vercel deployment config
├── DEPLOY.md            # Deployment guide
└── README.md            # This file
```

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js 1.9.4 (from CDN)
- **Map Tiles**: OpenStreetMap
- **Hosting**: Vercel (static site)
- **No backend or database required**

## 🌐 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

## 📝 Development

### Local Development
```bash
# Clone repository
git clone https://github.com/Mas0n1010/MissionChief.git
cd MissionChief

# Start local server
python3 -m http.server 8080

# Open in browser
http://localhost:8080/landing.html
```

### Testing Checklist
- [ ] All 8 navigation screens load
- [ ] Map displays with OpenStreetMap tiles
- [ ] Missions spawn and can be clicked
- [ ] Unit dispatch works (manual and auto)
- [ ] Units animate on map during missions
- [ ] Mission completion awards funding
- [ ] Station building works
- [ ] Unit purchasing validates requirements
- [ ] Crew recruitment and training works
- [ ] All modals open and close properly

### Code Structure

**Game Class** (`RNLIGame`):
- Station management
- Fleet management
- Crew management
- Mission generation
- Dispatch system
- Map rendering
- UI updates

**Data Models**:
- 4 station type definitions
- 9 unit type definitions
- 5 training type definitions
- 7 mission type templates

**UI Functions**:
- Screen navigation
- Modal handling
- Mission dispatch
- Station building
- Crew recruitment

## 🎯 Roadmap / Future Features

- [ ] Save/Load game progress (localStorage)
- [ ] Sound effects and notifications
- [ ] Weather system affecting missions
- [ ] Seasonal variations
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Multiplayer mutual aid
- [ ] More UK coastal locations
- [ ] Historical RNLI lifeboats
- [ ] Training minigames
- [ ] Advanced statistics dashboard

## 📄 License

This is an educational fan project inspired by RNLI operations and Mission Chief gameplay. Not affiliated with RNLI or Mission Chief.

## 🤝 Contributing

This is currently a solo project, but suggestions and feedback are welcome!

## 🙏 Credits

- **Mapping**: Leaflet.js + OpenStreetMap contributors
- **Inspiration**: Mission Chief game + RNLI operations
- **Development**: Built with Claude Code

## 📞 Support

For issues or questions:
1. Check browser console (`F12`) for errors
2. Review [DEPLOY.md](DEPLOY.md) for deployment help
3. Ensure you're using an HTTP server (not `file://`)
4. Try in a different browser
5. Clear cache and hard refresh

---

**Deployed Branch**: `claude/rnli-template-creation-011CUS9oGVvUTEEMQN531uC1`

**Latest Commits**:
- Complete game engine rebuild (1410 lines)
- Comprehensive CSS system (1234 lines)
- Full navigation and screens
- Vercel deployment setup

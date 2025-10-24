# RNLI Mission Chief

A web-based emergency dispatch simulation game where you manage RNLI (Royal National Lifeboat Institution) operations and respond to maritime emergencies.

## Game Versions

This repository contains two different game versions:

### 1. RNLI Mission Chief - Dispatch Simulation (`rnli-game.html`)
**Mission Chief style dispatch game** - Build stations, buy lifeboats, dispatch to missions
- Map-based interface with stations and missions
- Build lifeboat stations at coastal locations
- Purchase and manage fleet of RNLI lifeboats
- Dispatch lifeboats to maritime emergencies
- Earn credits from completed rescues
- Expand your operations across the coast

### 2. RNLI Rescue Manager - Action Simulation (`game.html`)
**Direct action game** - Control lifeboats in real-time with animated map
- Single station focused gameplay
- Watch lifeboats travel to missions in real-time
- Interactive canvas map with animated waves
- Simpler, more arcade-style experience

## About

Take command of an RNLI lifeboat station and save lives at sea! Manage your fleet of lifeboats, respond to various maritime emergencies, and build up your rescue service.

## Features

### Game Interface
- **Professional Main Menu** with animated ocean background
- **Interactive Operations Map** showing Poole Harbour area with real-time tracking
- **Modern UI Design** with smooth animations and gradients
- **Three-Panel Layout** for easy management of station, missions, and fleet
- **Real-time Mission Log** tracking all activities

### Lifeboats & Missions
- **8 Authentic RNLI Lifeboat Classes**
  - All-Weather Lifeboats: Shannon, Severn, Tamar, Mersey, Trent
  - Inshore Lifeboats: Atlantic 85, Atlantic 75, D-Class

- **8 Different Mission Types**
  - Person Overboard
  - Vessel Taking on Water
  - Capsized Boat
  - Medical Emergency at Sea
  - People Cut Off by Tide
  - Engine Failure
  - Yacht in Distress
  - Fishing Vessel Emergency

### Gameplay Features
- **Real-time Map Visualization** - Watch lifeboats travel to missions
- **Live Position Tracking** - See your fleet's movements on the map
- **Mission Markers** - Visual indicators for all active emergencies
- **Automatic Mission Generation** - New emergencies appear regularly
- **Realistic Mission Times** - Based on distance and boat speed
- **Statistics Tracking** - Monitor rescues and lives saved
- **Credit System** - Earn money to expand your fleet

---

## RNLI Mission Chief - Dispatch Simulation

### How to Play

1. **Open `rnli-game.html`** in your web browser
2. **Start with:** £50,000 credits, 1 station (Poole), and 1 Atlantic 85 lifeboat
3. **Watch for missions** appearing on the map (red markers)
4. **Click missions** to see details and dispatch available lifeboats
5. **Complete missions** to earn credits and save lives
6. **Expand your operations:**
   - Build new stations at different coastal locations (£100,000 each)
   - Purchase lifeboats for your stations (£50,000 - £2,500,000)
   - Manage multiple stations and fleets simultaneously

### Features

**Game Mechanics:**
- **10 Mission Types:** Person overboard, vessel in distress, capsized boats, medical emergencies, cliff rescues, and more
- **Color-Coded Status:** Red (waiting), Yellow (en route), Green (on scene)
- **8 Coastal Locations:** Poole, Weymouth, Swanage, Lymington, Yarmouth, Bembridge, Selsey, Brighton
- **7 Lifeboat Classes:** From D-Class (£50k) to Tamar Class (£2.5M)
- **Credits System:** Earn £2,000-£10,000 per rescue
- **Statistics Tracking:** Rescues, lives saved, total earnings, failed missions

**Interface:**
- **Map View:** See all your stations and active missions at a glance
- **Mission List:** Right sidebar showing all active emergencies
- **Dispatch Center Menu:**
  - ⚓ View all lifeboat stations
  - 🚤 Manage your entire fleet
  - 🏗️ Build new stations
  - 🛒 Shop for lifeboats
  - 📊 View statistics

### Strategy Tips
1. **Start Small:** Save up for a D-Class (£50k) as your second boat
2. **Build Strategically:** Place stations to cover different coastal areas
3. **Balance Your Fleet:** Mix fast inshore boats with capable all-weather lifeboats
4. **Watch Mission Requirements:** Some missions need 2+ lifeboats
5. **Expand Capacity:** Stations can hold 2 boats initially (expandable)

---

## RNLI Rescue Manager - Action Simulation

### How to Play

1. **Open the game**: Simply open `index.html` in a web browser to see the main menu
2. **Start Game**: Click "Start New Game" from the main menu
3. **Monitor the map**: Watch for new emergencies appearing on the operations map
4. **Dispatch lifeboats**: Select an available lifeboat from the dropdown and dispatch it to a mission
5. **Track progress**: Watch your lifeboat travel to the mission location on the map
6. **Complete rescues**: The lifeboat will automatically complete the mission and return to station
7. **Earn credits**: Successful rescues earn you £3,000-£10,000
8. **Expand your fleet**: Use credits to purchase additional lifeboats from the shop
9. **Manage resources**: Balance responding to urgent missions while keeping boats available

### Interface Guide
- **Left Panel**: Station info, operations map, and your fleet
- **Center Panel**: Active missions and mission log
- **Right Panel**: Lifeboat shop for purchasing new vessels
- **Top Bar**: Current credits, total rescues, and lives saved

## Game Mechanics

- **Starting Credits**: £10,000
- **Starting Fleet**: 1 x Atlantic 85 inshore lifeboat
- **Mission Rewards**: £3,000 - £10,000 depending on difficulty
- **Success Rate**: Approximately 90%
- **Mission Generation**: New missions appear every 30-60 seconds (max 5 active at once)

## Lifeboat Classes

### All-Weather Lifeboats
These larger boats can handle rough seas and longer-range rescues:
- **Shannon Class** (£2,000,000) - Latest technology, 25 knots, 250nm range
- **Tamar Class** (£2,500,000) - Superior maneuverability, 25 knots, 250nm range
- **Severn Class** (£1,800,000) - Fast slipway launch, 25 knots, 250nm range
- **Trent Class** (£2,000,000) - Self-righting, 25 knots, 250nm range
- **Mersey Class** (£1,500,000) - Reliable workhorse, 17 knots, 140nm range

### Inshore Lifeboats
Smaller, faster boats perfect for coastal rescues:
- **Atlantic 85** (£200,000) - Fast and agile, 35 knots, 50nm range
- **Atlantic 75** (£150,000) - Rigid inflatable, 32 knots, 50nm range
- **D-Class** (£50,000) - Lightweight, 25 knots, 30nm range

## Strategy Tips

1. **Watch the Map** - Keep an eye on the operations map to see where missions appear
2. **Build Your Fleet Early** - Start by saving up credits to buy your second lifeboat
3. **Budget Option** - The D-Class (£50,000) is the most affordable way to expand your fleet quickly
4. **Prioritize Urgent Missions** - Missions marked with 🚨 should be handled first
5. **Balance Your Fleet** - Mix fast inshore boats for nearby missions with all-weather boats for distant ones
6. **Keep Reserves** - Always keep at least one lifeboat available for urgent emergencies
7. **Monitor Distance** - Check mission distances and match them with appropriate boat speeds
8. **Track Progress** - Use the map to see which lifeboats are en route and when they'll return

## Technical Details

- **Technology**: Pure HTML, CSS, and JavaScript (no frameworks required)
- **Canvas-Based Map**: Real-time rendering with animated waves and coastline
- **Responsive Design**: Adapts to different screen sizes and devices
- **Smooth Animations**: CSS transitions and keyframe animations throughout
- **Modern UI**: Gradients, shadows, and glassmorphism effects
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **No Installation Required**: Just open and play!
- **No Backend Needed**: Fully client-side application

## About the RNLI

The Royal National Lifeboat Institution (RNLI) is a charity that saves lives at sea. Founded in 1824, the RNLI provides a 24-hour search and rescue service around the coasts of the United Kingdom and Ireland.

This game is a tribute to the brave volunteer crews who risk their lives to save others at sea.

## Screenshots

![Main Menu](docs/screenshots/menu.png)
![Game Interface](docs/screenshots/game.png)
![Operations Map](docs/screenshots/map.png)

*(Screenshots to be added)*

## Future Enhancements

Potential features for future versions:
- **Multiple Lifeboat Stations** - Manage stations across different coastal locations
- **Dynamic Weather** - Weather conditions affecting mission difficulty and boat performance
- **Crew Management** - Recruit, train, and manage volunteer crew members
- **Day/Night Cycle** - Time-based gameplay with different challenges
- **Seasonal Events** - Summer tourist rescues vs. winter storm emergencies
- **Helicopter Support** - Coordinate with coastguard helicopters for evacuations
- **Detailed Scenarios** - Story-driven missions based on real RNLI rescues
- **Save/Load System** - Continue your progress across sessions
- **Achievements** - Unlock badges and awards for rescue milestones
- **Leaderboards** - Compare your rescue statistics with other players
- **Sound Effects** - Ocean ambience, radio chatter, and boat engines
- **Advanced Statistics** - Detailed analytics and performance metrics

## Credits

Created as a sea rescue simulation inspired by the incredible work of the RNLI.

*Note: This is a fan-made game and is not officially affiliated with the RNLI.*

## How to Run Locally

### Option 1: Direct File Opening
Simply open `landing.html` in your web browser. No server required!

### Option 2: Local Server (Recommended for full functionality)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Then visit: http://localhost:8000/landing.html
```

## Deploy to Vercel

### Quick Deploy (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/MissionChief)

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts** and your game will be live!

### Deploy via GitHub
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import from GitHub
5. Deploy!

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

---

**Saving Lives at Sea** 🚤

// RNLI Mission Chief - UK Coastal Rescue Simulation
// Complete rebuild per specification

class RNLIGame {
    constructor() {
        // Economy
        this.funding = 100000; // Earned from missions
        this.donations = 50; // Premium currency
        this.totalEarned = 0;
        this.missionsCompleted = 0;

        // Core data
        this.stations = [];
        this.fleet = [];
        this.crew = [];
        this.missions = [];
        this.messages = [];
        this.incomeLog = [];

        // Counters
        this.stationIdCounter = 0;
        this.unitIdCounter = 0;
        this.crewIdCounter = 0;
        this.missionIdCounter = 0;
        this.messageIdCounter = 0;

        // Map
        this.map = null;
        this.stationMarkers = {};
        this.missionMarkers = {};
        this.unitMarkers = {};

        // Game state
        this.currentScreen = 'dispatch';
        this.activityLog = [];

        this.init();
    }

    init() {
        console.log('Initializing RNLI Mission Chief...');

        // Create initial station
        this.createInitialSetup();

        // Initialize map
        this.initMap();

        // Start mission generator
        this.startMissionGenerator();

        // Update all UI
        this.updateAllUI();

        this.logActivity('System initialized - Welcome to RNLI Mission Chief');
        this.addMessage('Welcome', 'Welcome to UK Coastal Rescue Command. Your first lifeboat station is operational.', 'info');

        console.log('Game initialized successfully!');
    }

    // ==================== DATA DEFINITIONS ====================

    getStationTypes() {
        return {
            'lifeboat': {
                name: 'Lifeboat Station',
                description: 'RNLI lifeboat station hosting inshore and all-weather lifeboats',
                baseCost: 150000,
                capacity: 2,
                extensions: {
                    'alb_berth': { name: 'All-Weather Lifeboat Berth', cost: 50000, unlocks: ['ALB'] },
                    'ilb_slipway': { name: 'Inshore Lifeboat Slipway', cost: 30000, unlocks: ['ILB'] },
                    'training_room': { name: 'Crew Training Room', cost: 20000, unlocks: ['NightOps'] },
                    'medical_room': { name: 'Medical/First Aid Room', cost: 25000, unlocks: ['CasualtyCare'] }
                }
            },
            'beach_lifeguard': {
                name: 'Beach Lifeguard Post',
                description: 'RNLI beach lifeguard post with patrol teams and rescue watercraft',
                baseCost: 80000,
                capacity: 3,
                extensions: {
                    'watercraft_garage': { name: 'Rescue Watercraft Garage', cost: 25000, unlocks: ['RescueWatercraft'] },
                    'first_aid_tent': { name: 'First Aid Treatment Tent', cost: 15000, unlocks: ['BeachPatrol'] },
                    'extended_patrol': { name: 'Extended Patrol Zone', cost: 20000, unlocks: [] }
                }
            },
            'coastguard': {
                name: 'Coastguard Rescue Base',
                description: 'HM Coastguard base with cliff rescue and search teams',
                baseCost: 120000,
                capacity: 3,
                extensions: {
                    'cliff_rescue': { name: 'Cliff Rescue Capability', cost: 40000, unlocks: ['CliffRescue'] },
                    'sar_team': { name: 'Search & Rescue Capability', cost: 35000, unlocks: ['SARTeam'] },
                    'command_unit': { name: 'Mobile Command Unit Bay', cost: 50000, unlocks: ['CommandUnit'] }
                }
            },
            'air_rescue': {
                name: 'Air Rescue Base',
                description: 'SAR helicopter base for long-range rescue and medevac',
                baseCost: 500000,
                capacity: 2,
                extensions: {
                    'winch_training': { name: 'Advanced Winch Training Area', cost: 60000, unlocks: ['WinchOps'] },
                    'medevac_module': { name: 'Medical Evac Module', cost: 75000, unlocks: [] }
                }
            }
        };
    }

    getUnitTypes() {
        return {
            'ILB': {
                name: 'RNLI Inshore Lifeboat',
                description: 'Fast close-to-shore rescue boat',
                cost: 80000,
                speed: 35,
                capacity: 4,
                requiredCrew: 2,
                range: 20,
                stationType: 'lifeboat',
                requiredExtension: 'ilb_slipway'
            },
            'ALB': {
                name: 'RNLI All-Weather Lifeboat',
                description: 'Offshore heavy weather lifeboat with towing capability',
                cost: 250000,
                speed: 25,
                capacity: 10,
                requiredCrew: 4,
                range: 100,
                stationType: 'lifeboat',
                requiredExtension: 'alb_berth'
            },
            'RescueWatercraft': {
                name: 'RNLI Rescue Watercraft',
                description: 'Jet ski for surf zone rescue',
                cost: 30000,
                speed: 40,
                capacity: 2,
                requiredCrew: 1,
                range: 15,
                stationType: 'beach_lifeguard',
                requiredExtension: 'watercraft_garage'
            },
            'BeachPatrol': {
                name: 'Beach Lifeguard Patrol',
                description: 'Shore-based first response and casualty care',
                cost: 15000,
                speed: 5,
                capacity: 3,
                requiredCrew: 2,
                range: 5,
                stationType: 'beach_lifeguard',
                requiredExtension: 'first_aid_tent'
            },
            'ShoreVehicle': {
                name: 'Shore Rescue Vehicle',
                description: '4x4/quad for beach equipment transport',
                cost: 40000,
                speed: 20,
                capacity: 4,
                requiredCrew: 1,
                range: 30,
                stationType: 'beach_lifeguard',
                requiredExtension: null
            },
            'CliffRescue': {
                name: 'Coastguard Cliff Rescue Team',
                description: 'Rope access and cliff recovery team',
                cost: 60000,
                speed: 15,
                capacity: 4,
                requiredCrew: 3,
                range: 25,
                stationType: 'coastguard',
                requiredExtension: 'cliff_rescue'
            },
            'SARTeam': {
                name: 'Coastguard Search & Rescue Team',
                description: 'Land-based search and missing person team',
                cost: 50000,
                speed: 15,
                capacity: 6,
                requiredCrew: 4,
                range: 30,
                stationType: 'coastguard',
                requiredExtension: 'sar_team'
            },
            'CommandUnit': {
                name: 'Mobile Command Unit',
                description: 'On-scene incident command and coordination',
                cost: 80000,
                speed: 25,
                capacity: 4,
                requiredCrew: 2,
                range: 50,
                stationType: 'coastguard',
                requiredExtension: 'command_unit'
            },
            'SARHelicopter': {
                name: 'SAR Helicopter',
                description: 'Long-range search, winch rescue, and medevac',
                cost: 400000,
                speed: 150,
                capacity: 6,
                requiredCrew: 4,
                range: 200,
                stationType: 'air_rescue',
                requiredExtension: null
            }
        };
    }

    getTrainingTypes() {
        return {
            'NightOps': { name: 'Night Operations', cost: 5000, duration: 0 },
            'SwiftWater': { name: 'Swift Water/Surf Rescue', cost: 4000, duration: 0 },
            'CliffAccess': { name: 'Cliff Rope Access', cost: 6000, duration: 0 },
            'CasualtyCare': { name: 'Casualty Care/First Aid', cost: 3000, duration: 0 },
            'WinchOps': { name: 'Helicopter Winch Operations', cost: 8000, duration: 0 }
        };
    }

    getMissionTypes() {
        return {
            'swimmer': {
                title: 'Swimmer in difficulty near flagged bathing area',
                description: 'Swimmer struggling in current near beach',
                reward: 2000,
                urgency: 'high',
                requiredUnits: ['BeachPatrol', 'RescueWatercraft'],
                requiredCount: [1, 1],
                requiredTraining: [],
                unlockLevel: 0
            },
            'cutoff_tide': {
                title: 'Person cut off by tide at base of cliff',
                description: 'Individual stranded at cliff base with rising tide',
                reward: 4000,
                urgency: 'high',
                requiredUnits: ['ILB', 'CliffRescue'],
                requiredCount: [1, 1],
                requiredTraining: ['CliffAccess'],
                unlockLevel: 1
            },
            'capsized_kayak': {
                title: 'Capsized kayak offshore',
                description: 'Kayaker in water approximately 400m from shore',
                reward: 3000,
                urgency: 'high',
                requiredUnits: ['ILB'],
                requiredCount: [1],
                requiredTraining: [],
                unlockLevel: 0
            },
            'broken_down': {
                title: 'Broken down motorboat drifting towards rocks',
                description: 'Vessel with engine failure drifting in strong current',
                reward: 5000,
                urgency: 'medium',
                requiredUnits: ['ALB'],
                requiredCount: [1],
                requiredTraining: [],
                unlockLevel: 2
            },
            'missing_person': {
                title: 'Missing person last seen near cliffs at dusk',
                description: 'Search required for missing individual, possible cliff fall',
                reward: 6000,
                urgency: 'medium',
                requiredUnits: ['SARTeam', 'SARHelicopter'],
                requiredCount: [1, 1],
                requiredTraining: ['NightOps'],
                unlockLevel: 3
            },
            'serious_injury': {
                title: 'Serious injury on rocks - possible spinal',
                description: 'Casualty with suspected spinal injury requires specialist extraction',
                reward: 8000,
                urgency: 'high',
                requiredUnits: ['CliffRescue', 'SARHelicopter'],
                requiredCount: [1, 1],
                requiredTraining: ['CliffAccess', 'CasualtyCare', 'WinchOps'],
                unlockLevel: 4
            },
            'mayday': {
                title: 'Mayday: vessel taking on water offshore',
                description: 'Multiple casualties, vessel sinking in heavy weather',
                reward: 12000,
                urgency: 'critical',
                requiredUnits: ['ALB', 'SARHelicopter', 'CommandUnit'],
                requiredCount: [1, 1, 1],
                requiredTraining: ['CasualtyCare'],
                unlockLevel: 5
            }
        };
    }

    // ==================== INITIALIZATION ====================

    createInitialSetup() {
        // Create initial lifeboat station
        const station = {
            id: this.stationIdCounter++,
            type: 'lifeboat',
            name: 'Poole Lifeboat Station',
            location: 'Poole, Dorset',
            coordinates: { lat: 50.712, lng: -1.987 },
            extensions: ['ilb_slipway'],
            level: 1
        };
        this.stations.push(station);

        // Create initial ILB
        const unit = {
            id: this.unitIdCounter++,
            type: 'ILB',
            name: 'Poole ILB-1',
            stationId: station.id,
            status: 'available', // available, dispatched, returning, maintenance
            currentMission: null,
            progress: 0
        };
        this.fleet.push(unit);

        // Create initial crew
        const crewNames = ['Sarah Williams', 'James Mitchell', 'Emma Thompson', 'David Roberts'];
        crewNames.forEach(name => {
            this.crew.push({
                id: this.crewIdCounter++,
                name: name,
                stationId: station.id,
                assignedUnit: null,
                qualifications: [],
                training: null
            });
        });
    }

    initMap() {
        const mapElement = document.getElementById('game-map');
        if (!mapElement) return;

        // Initialize Leaflet map centered on UK south coast
        this.map = L.map('game-map', {
            center: [50.712, -1.987],
            zoom: 10,
            zoomControl: false
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 8
        }).addTo(this.map);

        // Render initial markers
        this.renderMap();

        // Update map every 2 seconds
        setInterval(() => this.renderMap(), 2000);
    }

    // ==================== MISSION SYSTEM ====================

    startMissionGenerator() {
        // Generate first mission after 10 seconds
        setTimeout(() => this.generateMission(), 10000);

        // Generate missions every 45-90 seconds
        setInterval(() => {
            if (this.missions.length < 8) {
                this.generateMission();
            }
        }, Math.random() * 45000 + 45000);
    }

    generateMission() {
        const missionTypes = this.getMissionTypes();
        const availableTypes = Object.entries(missionTypes).filter(([key, template]) => {
            // Check if mission type is unlocked based on player level
            const playerLevel = Math.floor(this.missionsCompleted / 5);
            return template.unlockLevel <= playerLevel;
        });

        if (availableTypes.length === 0) return;

        const [type, template] = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Random location near a station
        const station = this.stations[Math.floor(Math.random() * this.stations.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = (Math.random() * 0.3 + 0.1) * 0.5; // Degrees

        const mission = {
            id: this.missionIdCounter++,
            type: type,
            title: template.title,
            description: template.description,
            location: this.generateLocationName(),
            coordinates: {
                lat: station.coordinates.lat + Math.cos(angle) * distance,
                lng: station.coordinates.lng + Math.sin(angle) * distance
            },
            reward: template.reward,
            urgency: template.urgency,
            requiredUnits: template.requiredUnits,
            requiredCount: template.requiredCount,
            requiredTraining: template.requiredTraining,
            dispatchedUnits: [],
            status: 'waiting', // waiting, enroute, onscene, completed
            startTime: Date.now()
        };

        this.missions.push(mission);
        this.logActivity(`New emergency: ${mission.title} - ${mission.location}`);
        this.addMessage('New Emergency', `${mission.title} at ${mission.location}`, 'urgent');
        this.updateMissionsList();
        this.renderMap();
    }

    generateLocationName() {
        const locations = [
            'Off Poole Harbour', 'Near Brownsea Island', 'Studland Bay', 'Sandbanks Peninsula',
            'Swanage Bay', 'Durlston Head', 'Old Harry Rocks', 'Bournemouth Coast',
            'Christchurch Bay', 'The Needles', 'Yarmouth Roads', 'Cowes Harbour'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    dispatchToMission(missionId, unitIds) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.status !== 'waiting') return false;

        const units = unitIds.map(id => this.fleet.find(u => u.id === id)).filter(u => u);
        if (units.length === 0) return false;

        // Dispatch units
        units.forEach(unit => {
            if (unit.status === 'available') {
                unit.status = 'dispatched';
                unit.currentMission = missionId;
                unit.progress = 0;
                mission.dispatchedUnits.push(unit.id);

                this.logActivity(`${unit.name} dispatched to ${mission.title}`);
            }
        });

        mission.status = 'enroute';

        // Calculate arrival time (15-60 seconds)
        const arrivalTime = Math.random() * 45000 + 15000;

        // Animate unit progress
        units.forEach(unit => this.animateUnit(unit, arrivalTime));

        // Arrival
        setTimeout(() => {
            if (mission.status === 'enroute') {
                mission.status = 'onscene';
                this.logActivity(`Units on scene at ${mission.title}`);

                // Complete mission after 20-40 seconds
                setTimeout(() => this.completeMission(missionId), Math.random() * 20000 + 20000);
            }
        }, arrivalTime);

        this.updateMissionsList();
        this.renderMap();
        return true;
    }

    animateUnit(unit, duration) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (unit.status !== 'dispatched') {
                clearInterval(interval);
                return;
            }

            const elapsed = Date.now() - startTime;
            unit.progress = Math.min(elapsed / duration, 1);

            if (unit.progress >= 1) {
                clearInterval(interval);
            }
        }, 100);
    }

    completeMission(missionId) {
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        if (missionIndex === -1) return;

        const mission = this.missions[missionIndex];

        // Award funding
        this.funding += mission.reward;
        this.totalEarned += mission.reward;
        this.missionsCompleted++;

        this.logActivity(`Mission complete: ${mission.title} - Earned £${mission.reward.toLocaleString()}`);
        this.addMessage('Mission Complete', `${mission.title} successfully resolved. Earned £${mission.reward.toLocaleString()}`, 'success');

        // Log income
        this.incomeLog.unshift({
            mission: mission.title,
            reward: mission.reward,
            time: new Date().toLocaleTimeString()
        });
        if (this.incomeLog.length > 20) this.incomeLog.pop();

        // Free up units
        mission.dispatchedUnits.forEach(unitId => {
            const unit = this.fleet.find(u => u.id === unitId);
            if (unit) {
                unit.status = 'returning';
                unit.currentMission = null;
                unit.progress = 0;

                // Return to station after 10-20 seconds
                setTimeout(() => {
                    unit.status = 'available';
                    this.logActivity(`${unit.name} returned to station`);
                    this.updateFleetScreen();
                    this.renderMap();
                }, Math.random() * 10000 + 10000);
            }
        });

        // Remove mission
        this.missions.splice(missionIndex, 1);

        this.updateAllUI();
        this.renderMap();
    }

    // ==================== STATION MANAGEMENT ====================

    buildStation(type, name, locationKey) {
        const stationTypes = this.getStationTypes();
        const template = stationTypes[type];

        if (!template) return false;
        if (this.funding < template.baseCost) {
            alert('Insufficient funding!');
            return false;
        }

        this.funding -= template.baseCost;

        const locations = {
            'poole': { name: 'Poole, Dorset', lat: 50.712, lng: -1.987 },
            'weymouth': { name: 'Weymouth, Dorset', lat: 50.608, lng: -2.457 },
            'swanage': { name: 'Swanage, Dorset', lat: 50.610, lng: -1.959 },
            'brighton': { name: 'Brighton, East Sussex', lat: 50.822, lng: -0.137 }
        };

        const location = locations[locationKey] || locations['poole'];

        const station = {
            id: this.stationIdCounter++,
            type: type,
            name: name,
            location: location.name,
            coordinates: { lat: location.lat, lng: location.lng },
            extensions: [],
            level: 1
        };

        this.stations.push(station);
        this.logActivity(`Built ${template.name}: ${name}`);
        this.addMessage('Station Built', `${name} is now operational at ${location.name}`, 'success');

        this.updateAllUI();
        this.renderMap();
        return true;
    }

    buyExtension(stationId, extensionKey) {
        const station = this.stations.find(s => s.id === stationId);
        if (!station) return false;

        const stationTypes = this.getStationTypes();
        const template = stationTypes[station.type];
        const extension = template.extensions[extensionKey];

        if (!extension) return false;
        if (this.funding < extension.cost) {
            alert('Insufficient funding!');
            return false;
        }
        if (station.extensions.includes(extensionKey)) {
            alert('Already purchased!');
            return false;
        }

        this.funding -= extension.cost;
        station.extensions.push(extensionKey);

        this.logActivity(`Purchased ${extension.name} at ${station.name}`);
        this.addMessage('Extension Purchased', `${extension.name} added to ${station.name}`, 'success');

        this.updateAllUI();
        return true;
    }

    // ==================== FLEET MANAGEMENT ====================

    buyUnit(type, stationId) {
        const unitTypes = this.getUnitTypes();
        const template = unitTypes[type];

        if (!template) return false;

        const station = this.stations.find(s => s.id === stationId);
        if (!station) return false;

        if (station.type !== template.stationType) {
            alert(`${template.name} requires a ${template.stationType} station!`);
            return false;
        }

        if (template.requiredExtension && !station.extensions.includes(template.requiredExtension)) {
            alert(`Requires ${template.requiredExtension} extension!`);
            return false;
        }

        if (this.funding < template.cost) {
            alert('Insufficient funding!');
            return false;
        }

        this.funding -= template.cost;

        const unit = {
            id: this.unitIdCounter++,
            type: type,
            name: `${station.name.split(' ')[0]} ${type}-${this.unitIdCounter}`,
            stationId: stationId,
            status: 'available',
            currentMission: null,
            progress: 0
        };

        this.fleet.push(unit);
        this.logActivity(`Purchased ${template.name} for ${station.name}`);
        this.addMessage('Unit Purchased', `${unit.name} added to fleet at ${station.name}`, 'success');

        this.updateAllUI();
        this.renderMap();
        return true;
    }

    // ==================== CREW MANAGEMENT ====================

    recruitCrew(name, stationId) {
        const station = this.stations.find(s => s.id === stationId);
        if (!station) return false;

        const cost = 10000;
        if (this.funding < cost) {
            alert('Insufficient funding!');
            return false;
        }

        this.funding -= cost;

        const crewMember = {
            id: this.crewIdCounter++,
            name: name,
            stationId: stationId,
            assignedUnit: null,
            qualifications: [],
            training: null
        };

        this.crew.push(crewMember);
        this.logActivity(`Recruited ${name} at ${station.name}`);
        this.addMessage('Crew Recruited', `${name} has joined ${station.name}`, 'success');

        this.updateAllUI();
        return true;
    }

    trainCrew(crewId, trainingType) {
        const crewMember = this.crew.find(c => c.id === crewId);
        if (!crewMember) return false;

        const trainingTypes = this.getTrainingTypes();
        const training = trainingTypes[trainingType];

        if (!training) return false;
        if (crewMember.qualifications.includes(trainingType)) {
            alert('Already qualified!');
            return false;
        }
        if (this.funding < training.cost) {
            alert('Insufficient funding!');
            return false;
        }

        this.funding -= training.cost;
        crewMember.qualifications.push(trainingType);

        this.logActivity(`${crewMember.name} completed ${training.name} training`);
        this.addMessage('Training Complete', `${crewMember.name} is now qualified in ${training.name}`, 'success');

        this.updateAllUI();
        return true;
    }

    // ==================== MAP RENDERING ====================

    renderMap() {
        if (!this.map) return;

        // Render stations
        this.stations.forEach(station => {
            if (!this.stationMarkers[station.id]) {
                const icon = L.divIcon({
                    className: 'station-marker',
                    html: '<div style="width: 32px; height: 32px; background: #27ae60; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">⚓</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon: icon }).addTo(this.map);
                marker.bindPopup(`<strong>${station.name}</strong><br>${station.location}`);
                marker.on('click', () => this.showStationDetail(station.id));
                this.stationMarkers[station.id] = marker;
            }
        });

        // Render missions
        this.missions.forEach(mission => {
            if (!this.missionMarkers[mission.id]) {
                const color = mission.urgency === 'critical' ? '#c0392b' :
                             mission.urgency === 'high' ? '#e74c3c' : '#f39c12';

                const icon = L.divIcon({
                    className: 'mission-marker',
                    html: `<div style="width: 36px; height: 36px; background: ${color}; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; animation: pulse-mission 2s infinite;">🚨</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });

                const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], { icon: icon }).addTo(this.map);
                marker.bindPopup(`<strong>${mission.title}</strong><br>${mission.location}`);
                marker.on('click', () => this.showMissionDetail(mission.id));
                this.missionMarkers[mission.id] = marker;
            }
        });

        // Remove old mission markers
        Object.keys(this.missionMarkers).forEach(id => {
            if (!this.missions.find(m => m.id == id)) {
                this.map.removeLayer(this.missionMarkers[id]);
                delete this.missionMarkers[id];
            }
        });

        // Render units on mission
        this.fleet.forEach(unit => {
            if (unit.status === 'dispatched' && unit.currentMission !== null) {
                const mission = this.missions.find(m => m.id === unit.currentMission);
                const station = this.stations.find(s => s.id === unit.stationId);

                if (mission && station) {
                    const lat = station.coordinates.lat + (mission.coordinates.lat - station.coordinates.lat) * unit.progress;
                    const lng = station.coordinates.lng + (mission.coordinates.lng - station.coordinates.lng) * unit.progress;

                    if (this.unitMarkers[unit.id]) {
                        this.unitMarkers[unit.id].setLatLng([lat, lng]);
                    } else {
                        const icon = L.divIcon({
                            className: 'lifeboat-marker',
                            html: '<div style="width: 28px; height: 28px; background: #3498db; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">🚤</div>',
                            iconSize: [28, 28],
                            iconAnchor: [14, 14]
                        });

                        const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
                        marker.bindPopup(`<strong>${unit.name}</strong><br>En route to mission`);
                        this.unitMarkers[unit.id] = marker;
                    }
                }
            } else {
                if (this.unitMarkers[unit.id]) {
                    this.map.removeLayer(this.unitMarkers[unit.id]);
                    delete this.unitMarkers[unit.id];
                }
            }
        });
    }

    mapZoomIn() {
        if (this.map) this.map.zoomIn();
    }

    mapZoomOut() {
        if (this.map) this.map.zoomOut();
    }

    mapCenter() {
        if (this.map && this.stations.length > 0) {
            const first = this.stations[0];
            this.map.setView([first.coordinates.lat, first.coordinates.lng], 10);
        }
    }

    toggleMapLayers() {
        alert('Map layers feature coming soon!');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.getElementById('game-map').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // ==================== ACTIVITY LOG ====================

    logActivity(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.activityLog.push({ time: timestamp, message: message });
        if (this.activityLog.length > 50) this.activityLog.shift();

        const logContent = document.getElementById('log-content');
        if (logContent) {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = `[${timestamp}] ${message}`;
            logContent.insertBefore(entry, logContent.firstChild);

            // Keep only last 20 entries in DOM
            while (logContent.children.length > 20) {
                logContent.removeChild(logContent.lastChild);
            }
        }
    }

    // ==================== MESSAGE SYSTEM ====================

    addMessage(title, content, type) {
        this.messages.unshift({
            id: this.messageIdCounter++,
            title: title,
            content: content,
            type: type, // info, success, urgent
            time: new Date().toLocaleString()
        });

        if (this.messages.length > 50) this.messages.pop();

        // Update message count badge
        const badge = document.getElementById('message-count');
        if (badge) badge.textContent = this.messages.length;

        this.updateMessagesScreen();
    }

    clearMessages() {
        if (confirm('Clear all messages?')) {
            this.messages = [];
            const badge = document.getElementById('message-count');
            if (badge) badge.textContent = '0';
            this.updateMessagesScreen();
        }
    }

    // ==================== UI UPDATE FUNCTIONS ====================

    updateAllUI() {
        // Update nav stats
        document.getElementById('nav-funding').textContent = '£' + this.funding.toLocaleString();
        document.getElementById('nav-donations').textContent = this.donations;

        // Update based on current screen
        if (this.currentScreen === 'stations') this.updateStationsScreen();
        if (this.currentScreen === 'fleet') this.updateFleetScreen();
        if (this.currentScreen === 'crew') this.updateCrewScreen();
        if (this.currentScreen === 'funding') this.updateFundingScreen();
        if (this.currentScreen === 'messages') this.updateMessagesScreen();

        this.updateMissionsList();
    }

    updateMissionsList() {
        const missionList = document.getElementById('mission-list');
        const missionCount = document.getElementById('mission-count');

        if (!missionList) return;

        missionCount.textContent = this.missions.length;

        if (this.missions.length === 0) {
            missionList.innerHTML = `
                <div class="no-missions">
                    <p>No active emergencies</p>
                    <small>Missions will appear automatically</small>
                </div>
            `;
            return;
        }

        let html = '';
        this.missions.forEach(mission => {
            const statusClass = mission.status === 'waiting' ? 'status-red' :
                              mission.status === 'enroute' ? 'status-yellow' : 'status-green';

            html += `
                <div class="mission-card ${statusClass}" onclick="game.showMissionDetail(${mission.id})">
                    <div class="mission-header">
                        <div class="mission-title">${mission.title}</div>
                        <div class="mission-reward">£${mission.reward.toLocaleString()}</div>
                    </div>
                    <div class="mission-location">📍 ${mission.location}</div>
                    <div class="mission-requirements">
                        Required: ${mission.requiredUnits.join(', ')}
                    </div>
                    <div class="mission-status">
                        ${this.getMissionStatusBadge(mission)}
                    </div>
                </div>
            `;
        });

        missionList.innerHTML = html;
    }

    getMissionStatusBadge(mission) {
        if (mission.status === 'waiting') {
            return '<span class="status-badge waiting">⏳ WAITING FOR DISPATCH</span>';
        } else if (mission.status === 'enroute') {
            return '<span class="status-badge enroute">🚤 UNITS EN ROUTE</span>';
        } else {
            return '<span class="status-badge onscene">✓ UNITS ON SCENE</span>';
        }
    }

    updateStationsScreen() {
        const list = document.getElementById('stations-list');
        if (!list) return;

        if (this.stations.length === 0) {
            list.innerHTML = '<p>No stations built yet.</p>';
            return;
        }

        const stationTypes = this.getStationTypes();
        let html = '';

        this.stations.forEach(station => {
            const template = stationTypes[station.type];
            const units = this.fleet.filter(u => u.stationId === station.id);
            const crew = this.crew.filter(c => c.stationId === station.id);

            html += `
                <div class="item-card" onclick="game.showStationDetail(${station.id})">
                    <div class="item-header">
                        <div class="item-title">${station.name}</div>
                        <div class="item-badge">${template.name}</div>
                    </div>
                    <div class="item-info">
                        <div><span>Location:</span><span>${station.location}</span></div>
                        <div><span>Units:</span><span>${units.length}</span></div>
                        <div><span>Crew:</span><span>${crew.length}</span></div>
                        <div><span>Extensions:</span><span>${station.extensions.length}</span></div>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    updateFleetScreen() {
        const list = document.getElementById('fleet-list');
        if (!list) return;

        if (this.fleet.length === 0) {
            list.innerHTML = '<p>No units in fleet yet.</p>';
            return;
        }

        const unitTypes = this.getUnitTypes();
        let html = '';

        this.fleet.forEach(unit => {
            const template = unitTypes[unit.type];
            const station = this.stations.find(s => s.id === unit.stationId);
            const statusColor = unit.status === 'available' ? '#27ae60' :
                              unit.status === 'dispatched' ? '#f39c12' :
                              unit.status === 'returning' ? '#3498db' : '#95a5a6';

            html += `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${unit.name}</div>
                        <div class="item-badge" style="background: ${statusColor}">${unit.status.toUpperCase()}</div>
                    </div>
                    <div class="item-info">
                        <div><span>Type:</span><span>${template.name}</span></div>
                        <div><span>Station:</span><span>${station ? station.name : 'Unknown'}</span></div>
                        <div><span>Speed:</span><span>${template.speed} knots</span></div>
                        <div><span>Capacity:</span><span>${template.capacity} people</span></div>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    updateCrewScreen() {
        const list = document.getElementById('crew-list');
        if (!list) return;

        if (this.crew.length === 0) {
            list.innerHTML = '<p>No crew recruited yet.</p>';
            return;
        }

        let html = '';

        this.crew.forEach(crewMember => {
            const station = this.stations.find(s => s.id === crewMember.stationId);

            html += `
                <div class="item-card">
                    <div class="item-header">
                        <div class="item-title">${crewMember.name}</div>
                        <div class="item-badge">${crewMember.qualifications.length} Quals</div>
                    </div>
                    <div class="item-info">
                        <div><span>Station:</span><span>${station ? station.name : 'Unknown'}</span></div>
                        <div><span>Qualifications:</span><span>${crewMember.qualifications.join(', ') || 'None'}</span></div>
                    </div>
                    <button class="btn-secondary" onclick="game.showTrainCrewModal(${crewMember.id})">Train</button>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    updateFundingScreen() {
        document.getElementById('funding-balance').textContent = '£' + this.funding.toLocaleString();
        document.getElementById('donations-balance').textContent = this.donations;
        document.getElementById('total-earned').textContent = '£' + this.totalEarned.toLocaleString();
        document.getElementById('missions-completed').textContent = this.missionsCompleted;

        const incomeLogEl = document.getElementById('income-log');
        if (!incomeLogEl) return;

        if (this.incomeLog.length === 0) {
            incomeLogEl.innerHTML = '<p style="color: #7f8c8d;">No mission income yet.</p>';
            return;
        }

        let html = '';
        this.incomeLog.forEach(entry => {
            html += `
                <div class="item-info" style="margin-bottom: 10px;">
                    <div><span>${entry.time}</span><span>${entry.mission}</span></div>
                    <div><span></span><span style="color: #27ae60; font-weight: bold;">+£${entry.reward.toLocaleString()}</span></div>
                </div>
            `;
        });

        incomeLogEl.innerHTML = html;
    }

    updateMessagesScreen() {
        const list = document.getElementById('messages-list');
        if (!list) return;

        if (this.messages.length === 0) {
            list.innerHTML = '<p style="color: #7f8c8d;">No messages.</p>';
            return;
        }

        let html = '';
        this.messages.forEach(msg => {
            const color = msg.type === 'urgent' ? '#e74c3c' :
                         msg.type === 'success' ? '#27ae60' : '#3498db';

            html += `
                <div class="item-card" style="border-left: 5px solid ${color};">
                    <div class="item-header">
                        <div class="item-title">${msg.title}</div>
                        <div style="font-size: 0.8em; color: #7f8c8d;">${msg.time}</div>
                    </div>
                    <p style="margin-top: 10px;">${msg.content}</p>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    // Continue in next message...
}

// Global game instance
let game;

// Initialize game when page loads
window.onload = () => {
    try {
        game = new RNLIGame();
        console.log('RNLI Mission Chief loaded successfully!');
    } catch (error) {
        console.error('Error loading game:', error);
        alert('Error loading game: ' + error.message);
    }
};

// Screen navigation
function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Show selected screen
    const screen = document.getElementById(screenName + '-screen');
    if (screen) {
        screen.classList.add('active');
        game.currentScreen = screenName;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Update screen content
        game.updateAllUI();
    }
}

// Mission detail modal
function showMissionDetail(missionId) {
    const mission = game.missions.find(m => m.id === missionId);
    if (!mission) return;

    const modal = document.getElementById('mission-detail-modal');
    const title = document.getElementById('mission-detail-title');
    const content = document.getElementById('mission-detail-content');

    title.textContent = mission.title;

    const availableUnits = game.fleet.filter(u => u.status === 'available');

    let html = `
        <div class="mission-details">
            <h3>${mission.title}</h3>
            <p><strong>Location:</strong> ${mission.location}</p>
            <p><strong>Description:</strong> ${mission.description}</p>
            <p><strong>Urgency:</strong> ${mission.urgency.toUpperCase()}</p>
            <p><strong>Reward:</strong> £${mission.reward.toLocaleString()}</p>
            <p><strong>Required Units:</strong> ${mission.requiredUnits.join(', ')}</p>
            <hr style="margin: 20px 0;">
    `;

    if (mission.status === 'waiting' && availableUnits.length > 0) {
        html += '<h4>Dispatch Units:</h4>';
        html += '<div id="dispatch-units">';

        availableUnits.forEach(unit => {
            const station = game.stations.find(s => s.id === unit.stationId);
            html += `
                <label style="display: block; margin: 10px 0; padding: 10px; background: #f8f9fa; border: 2px solid #bdc3c7; border-radius: 4px;">
                    <input type="checkbox" value="${unit.id}" class="dispatch-checkbox">
                    <strong>${unit.name}</strong> (${unit.type}) - ${station ? station.name : 'Unknown'}
                </label>
            `;
        });

        html += '</div>';
        html += `
            <button class="btn-primary" onclick="dispatchSelectedUnits(${mission.id})" style="margin-top: 15px;">
                Dispatch Selected Units
            </button>
            <button class="btn-secondary" onclick="alarmAndDispatch(${mission.id})" style="margin-top: 15px; margin-left: 10px;">
                Alarm and Dispatch (Auto)
            </button>
        `;
    } else if (mission.status !== 'waiting') {
        html += `<p><strong>Status:</strong> ${game.getMissionStatusBadge(mission)}</p>`;
    } else {
        html += '<p style="color: #e74c3c;"><strong>No available units to dispatch!</strong></p>';
    }

    html += '</div>';

    content.innerHTML = html;
    modal.style.display = 'block';
    modal.classList.add('active');
}

function closeMissionDetail() {
    const modal = document.getElementById('mission-detail-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

function dispatchSelectedUnits(missionId) {
    const checkboxes = document.querySelectorAll('.dispatch-checkbox:checked');
    const unitIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    if (unitIds.length === 0) {
        alert('Please select at least one unit!');
        return;
    }

    if (game.dispatchToMission(missionId, unitIds)) {
        closeMissionDetail();
    }
}

function alarmAndDispatch(missionId) {
    const mission = game.missions.find(m => m.id === missionId);
    if (!mission) return;

    // Auto-select best available units
    const availableUnits = game.fleet.filter(u => u.status === 'available');
    const selectedUnits = [];

    mission.requiredUnits.forEach((requiredType, index) => {
        const count = mission.requiredCount[index] || 1;
        const matchingUnits = availableUnits.filter(u => u.type === requiredType && !selectedUnits.includes(u.id));

        for (let i = 0; i < Math.min(count, matchingUnits.length); i++) {
            selectedUnits.push(matchingUnits[i].id);
        }
    });

    if (selectedUnits.length === 0) {
        alert('No suitable units available!');
        return;
    }

    if (game.dispatchToMission(missionId, selectedUnits)) {
        closeMissionDetail();
    }
}

// Station management
function showStationDetail(stationId) {
    // TODO: Implement station detail modal with tabs
    alert('Station detail modal - Coming soon!');
}

function closeStationDetail() {
    const modal = document.getElementById('station-detail-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

// Build station modal
function showBuildStationModal() {
    const modal = document.getElementById('build-station-modal');
    const content = document.getElementById('build-station-content');

    const stationTypes = game.getStationTypes();

    let html = '<h3>Select Station Type</h3>';

    Object.entries(stationTypes).forEach(([key, template]) => {
        html += `
            <div class="shop-item">
                <div class="shop-header">
                    <div class="shop-name">${template.name}</div>
                    <div class="shop-class">£${template.baseCost.toLocaleString()}</div>
                </div>
                <p>${template.description}</p>
                <p><strong>Capacity:</strong> ${template.capacity} units</p>
                <div style="margin-top: 15px;">
                    <input type="text" id="station-name-${key}" placeholder="Station name" class="input-field">
                    <select id="station-location-${key}" class="input-field">
                        <option value="">Select location</option>
                        <option value="poole">Poole, Dorset</option>
                        <option value="weymouth">Weymouth, Dorset</option>
                        <option value="swanage">Swanage, Dorset</option>
                        <option value="brighton">Brighton, East Sussex</option>
                    </select>
                    <button class="btn-primary" onclick="buildStationSubmit('${key}')">Build Station</button>
                </div>
            </div>
        `;
    });

    content.innerHTML = html;
    modal.style.display = 'block';
    modal.classList.add('active');
}

function closeBuildStationModal() {
    const modal = document.getElementById('build-station-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

function buildStationSubmit(type) {
    const name = document.getElementById(`station-name-${type}`).value.trim();
    const location = document.getElementById(`station-location-${type}`).value;

    if (!name || !location) {
        alert('Please enter a name and select a location!');
        return;
    }

    if (game.buildStation(type, name, location)) {
        closeBuildStationModal();
    }
}

// Recruit crew modal
function showRecruitCrewModal() {
    const modal = document.getElementById('recruit-crew-modal');
    const content = document.getElementById('recruit-crew-content');

    let html = `
        <h3>Recruit Crew Member</h3>
        <p>Cost: £10,000 per crew member</p>
        <input type="text" id="crew-name-input" placeholder="Crew member name" class="input-field">
        <select id="crew-station-input" class="input-field">
            <option value="">Select station</option>
    `;

    game.stations.forEach(station => {
        html += `<option value="${station.id}">${station.name}</option>`;
    });

    html += `
        </select>
        <button class="btn-primary" onclick="recruitCrewSubmit()">Recruit Crew</button>
    `;

    content.innerHTML = html;
    modal.style.display = 'block';
    modal.classList.add('active');
}

function closeRecruitCrewModal() {
    const modal = document.getElementById('recruit-crew-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
}

function recruitCrewSubmit() {
    const name = document.getElementById('crew-name-input').value.trim();
    const stationId = parseInt(document.getElementById('crew-station-input').value);

    if (!name || !stationId) {
        alert('Please enter a name and select a station!');
        return;
    }

    if (game.recruitCrew(name, stationId)) {
        closeRecruitCrewModal();
    }
}

// Fleet filter
function filterFleet(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter logic - for now just show all
    // TODO: Implement actual filtering
    game.updateFleetScreen();
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');

    const bgColor = type === 'success' ? '#27ae60' :
                   type === 'error' ? '#e74c3c' :
                   type === 'warning' ? '#f39c12' : '#3498db';

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        border: 2px solid rgba(0,0,0,0.2);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: bold;
    `;
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

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
        this.placementMode = false;
        this.gameStarted = false;

        this.init();
    }

    init() {
        console.log('Initializing RNLI Mission Chief...');

        // Initialize map first
        this.initMap();

        // Enable placement mode for first station
        this.enablePlacementMode();

        // Update all UI
        this.updateAllUI();

        this.logActivity('System initialized - Click on the map to place your first Lifeboat Station');

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
            'DClass': {
                name: 'RNLI D Class Lifeboat',
                description: 'Inflatable inshore lifeboat for close-to-shore rescue',
                cost: 60000,
                speed: 25, // knots - Real RNLI D Class max speed
                capacity: 3,
                requiredCrew: 2,
                range: 15,
                stationType: 'lifeboat',
                requiredExtension: null // Starter unit, no extension required
            },
            'ILB': {
                name: 'RNLI B Class Atlantic 85',
                description: 'Fast rigid inflatable inshore lifeboat',
                cost: 80000,
                speed: 35, // knots - Real RNLI Atlantic 85 max speed
                capacity: 4,
                requiredCrew: 3,
                range: 20,
                stationType: 'lifeboat',
                requiredExtension: 'ilb_slipway'
            },
            'ALB': {
                name: 'RNLI Shannon Class ALB',
                description: 'All-weather lifeboat with towing capability',
                cost: 250000,
                speed: 25, // knots - Real RNLI Shannon class max speed
                capacity: 10,
                requiredCrew: 6,
                range: 100,
                stationType: 'lifeboat',
                requiredExtension: 'alb_berth'
            },
            'RescueWatercraft': {
                name: 'RNLI Rescue Watercraft',
                description: 'Jet ski for surf zone rescue',
                cost: 30000,
                speed: 50, // knots - Real PWC speed
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
                speed: 5, // knots - Walking/running speed
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
                speed: 30, // knots - Road speed equivalent
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
                speed: 10, // knots - Road travel speed
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
                speed: 15, // knots - Road travel speed
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
                speed: 25, // knots - Road speed
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
                speed: 140, // knots - Real SAR helicopter cruise speed
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
                requiredUnits: ['DClass', 'BeachPatrol', 'RescueWatercraft'],
                requiredCount: [1, 1, 1],
                requiredTraining: [],
                unlockLevel: 0,
                acceptableUnits: [['DClass', 'ILB', 'BeachPatrol', 'RescueWatercraft']] // Any of these
            },
            'cutoff_tide': {
                title: 'Person cut off by tide at base of cliff',
                description: 'Individual stranded at cliff base with rising tide',
                reward: 4000,
                urgency: 'high',
                requiredUnits: ['DClass', 'CliffRescue'],
                requiredCount: [1, 1],
                requiredTraining: ['CliffAccess'],
                unlockLevel: 1,
                acceptableUnits: [['DClass', 'ILB'], ['CliffRescue']]
            },
            'capsized_kayak': {
                title: 'Capsized kayak offshore',
                description: 'Kayaker in water approximately 400m from shore',
                reward: 3000,
                urgency: 'high',
                requiredUnits: ['DClass'],
                requiredCount: [1],
                requiredTraining: [],
                unlockLevel: 0,
                acceptableUnits: [['DClass', 'ILB']]
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

    enablePlacementMode() {
        this.placementMode = true;

        // Show placement instruction
        const mapElement = document.getElementById('game-map');
        if (mapElement && this.map) {
            // Add a placement overlay
            const overlay = document.createElement('div');
            overlay.id = 'placement-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: #003d5c;
                color: white;
                padding: 15px 30px;
                border-radius: 5px;
                border: 3px solid #fbb034;
                z-index: 1000;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                text-align: center;
            `;
            overlay.innerHTML = `
                🏢 Click on the map to place your first Lifeboat Station<br>
                <small style="font-weight: normal; font-size: 12px;">Choose a coastal location near the water</small>
            `;
            mapElement.parentElement.style.position = 'relative';
            mapElement.parentElement.appendChild(overlay);

            // Add click handler to map
            this.map.on('click', (e) => {
                if (this.placementMode) {
                    this.placeFirstStation(e.latlng.lat, e.latlng.lng);
                }
            });
        }
    }

    placeFirstStation(lat, lng) {
        // Create the first lifeboat station at clicked location
        const station = {
            id: this.stationIdCounter++,
            type: 'lifeboat',
            name: 'Station 1 - Lifeboat',
            location: this.getLocationName(lat, lng),
            coordinates: { lat: lat, lng: lng },
            extensions: [],
            level: 1
        };
        this.stations.push(station);

        // Create initial D Class lifeboat
        const unit = {
            id: this.unitIdCounter++,
            type: 'DClass',
            name: 'D-Class-1',
            stationId: station.id,
            status: 'available',
            currentMission: null,
            progress: 0,
            assignedCrew: []
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

        // Disable placement mode
        this.placementMode = false;
        this.gameStarted = true;

        // Remove overlay
        const overlay = document.getElementById('placement-overlay');
        if (overlay) overlay.remove();

        // Start mission generator
        this.startMissionGenerator();

        // Update UI and map
        this.logActivity(`Lifeboat Station established at ${station.location}`);
        this.addMessage('Station Built', `Your first lifeboat station is now operational with a D Class lifeboat and 4 crew members.`, 'success');
        this.updateAllUI();
        this.renderMap();

        // Center map on new station
        this.map.setView([lat, lng], 12);
    }

    getLocationName(lat, lng) {
        // Generate a location name based on coordinates
        // Expanded UK coastal areas including Wales, Scotland, etc.
        const areas = [
            // South Coast England
            { name: 'Poole', lat: 50.712, lng: -1.987 },
            { name: 'Bournemouth', lat: 50.719, lng: -1.880 },
            { name: 'Swanage', lat: 50.610, lng: -1.959 },
            { name: 'Weymouth', lat: 50.608, lng: -2.457 },
            { name: 'Christchurch', lat: 50.735, lng: -1.778 },
            { name: 'Brighton', lat: 50.822, lng: -0.137 },
            { name: 'Portsmouth', lat: 50.800, lng: -1.091 },
            { name: 'Southampton', lat: 50.909, lng: -1.404 },
            { name: 'Isle of Wight', lat: 50.693, lng: -1.304 },
            { name: 'Portland', lat: 50.550, lng: -2.441 },

            // Wales - Bristol Channel
            { name: 'Penarth', lat: 51.434, lng: -3.176 },
            { name: 'Barry', lat: 51.400, lng: -3.266 },
            { name: 'Cardiff', lat: 51.481, lng: -3.179 },
            { name: 'Swansea', lat: 51.621, lng: -3.943 },
            { name: 'Mumbles', lat: 51.567, lng: -3.977 },
            { name: 'Tenby', lat: 51.672, lng: -4.703 },
            { name: 'Pembroke', lat: 51.674, lng: -4.918 },

            // Wales - West Coast
            { name: 'Fishguard', lat: 51.999, lng: -4.983 },
            { name: 'Aberystwyth', lat: 52.415, lng: -4.082 },
            { name: 'Barmouth', lat: 52.723, lng: -4.047 },
            { name: 'Pwllheli', lat: 52.885, lng: -4.416 },
            { name: 'Holyhead', lat: 53.309, lng: -4.633 },

            // North Wales
            { name: 'Llandudno', lat: 53.323, lng: -3.827 },
            { name: 'Rhyl', lat: 53.319, lng: -3.492 },

            // Northwest England
            { name: 'Blackpool', lat: 53.817, lng: -3.054 },
            { name: 'Fleetwood', lat: 53.925, lng: -3.013 },
            { name: 'Morecambe', lat: 54.069, lng: -2.867 },

            // Scotland - West Coast
            { name: 'Stranraer', lat: 54.903, lng: -5.025 },
            { name: 'Oban', lat: 56.415, lng: -5.472 },
            { name: 'Mallaig', lat: 57.005, lng: -5.829 },

            // Scotland - East Coast
            { name: 'Aberdeen', lat: 57.144, lng: -2.099 },
            { name: 'Dundee', lat: 56.462, lng: -2.971 },
            { name: 'Edinburgh', lat: 55.953, lng: -3.189 },
            { name: 'Berwick', lat: 55.768, lng: -2.006 },

            // Northeast England
            { name: 'Newcastle', lat: 54.978, lng: -1.618 },
            { name: 'Sunderland', lat: 54.906, lng: -1.383 },
            { name: 'Hartlepool', lat: 54.693, lng: -1.213 },
            { name: 'Whitby', lat: 54.487, lng: -0.614 },
            { name: 'Scarborough', lat: 54.283, lng: -0.399 },

            // East Coast England
            { name: 'Bridlington', lat: 54.083, lng: -0.191 },
            { name: 'Great Yarmouth', lat: 52.608, lng: 1.730 },
            { name: 'Lowestoft', lat: 52.477, lng: 1.751 },
            { name: 'Felixstowe', lat: 51.964, lng: 1.352 },
            { name: 'Harwich', lat: 51.947, lng: 1.287 }
        ];

        // Find closest area
        let closest = areas[0];
        let minDist = 999;

        areas.forEach(area => {
            const dist = Math.sqrt(Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2));
            if (dist < minDist) {
                minDist = dist;
                closest = area;
            }
        });

        return closest.name;
    }

    initMap() {
        const mapElement = document.getElementById('game-map');
        if (!mapElement) {
            console.error('Map element not found!');
            return;
        }

        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded!');
            mapElement.innerHTML = '<div style="padding: 20px; color: red; background: white;">Error: Map library failed to load. Please refresh the page.</div>';
            return;
        }

        try {
            // Initialize Leaflet map centered on UK south coast (Poole)
            this.map = L.map('game-map', {
                center: [50.712, -1.987],
                zoom: 11,
                zoomControl: false,
                attributionControl: true
            });

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap',
                maxZoom: 18,
                minZoom: 8
            }).addTo(this.map);

            // Wait for map to be ready
            this.map.whenReady(() => {
                console.log('Map initialized successfully');
                this.renderMap();
            });

            // Update map periodically for new missions
            // (Active unit movement handled by animateUnit function)
            setInterval(() => this.renderMap(), 5000);

        } catch (error) {
            console.error('Error initializing map:', error);
            mapElement.innerHTML = '<div style="padding: 20px; color: red; background: white;">Error initializing map: ' + error.message + '</div>';
        }
    }

    // ==================== MISSION SYSTEM ====================

    startMissionGenerator() {
        // Generate first mission after 10 seconds
        setTimeout(() => this.generateMission(), 10000);

        // Generate missions periodically - frequency scales with fleet size
        setInterval(() => {
            // Maximum missions = number of units + 2 (so you have some choice)
            // Minimum of 2 missions so there's always something to do
            const maxMissions = Math.max(2, this.fleet.length + 2);

            // Only generate if under the limit
            if (this.missions.length < maxMissions) {
                this.generateMission();
            }
        }, 45000); // Check every 45 seconds
    }

    generateMission() {
        const missionTypes = this.getMissionTypes();
        const availableTypes = Object.entries(missionTypes).filter(([key, template]) => {
            // Check if mission type is unlocked based on player level
            const playerLevel = Math.floor(this.missionsCompleted / 5);
            return template.unlockLevel <= playerLevel;
        });

        if (availableTypes.length === 0) return;

        // Check if we should generate more missions based on fleet size
        const maxMissions = Math.max(2, this.fleet.length + 2);
        if (this.missions.length >= maxMissions) {
            return; // Already at capacity for current fleet size
        }

        const [type, template] = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Get coastal/water location near a station
        const station = this.stations[Math.floor(Math.random() * this.stations.length)];
        const coastalCoords = this.generateCoastalLocation(station.coordinates);

        const mission = {
            id: this.missionIdCounter++,
            type: type,
            title: template.title,
            description: template.description,
            location: coastalCoords.name,
            coordinates: {
                lat: coastalCoords.lat,
                lng: coastalCoords.lng
            },
            reward: template.reward,
            urgency: template.urgency,
            requiredUnits: template.requiredUnits,
            requiredCount: template.requiredCount,
            requiredTraining: template.requiredTraining,
            dispatchedUnits: [],
            assignedCrew: [],
            status: 'waiting', // waiting, enroute, onscene, completed
            startTime: Date.now()
        };

        this.missions.push(mission);
        this.logActivity(`New emergency: ${mission.title} - ${mission.location} [${this.missions.length}/${maxMissions}]`);
        this.addMessage('New Emergency', `${mission.title} at ${mission.location}`, 'urgent');
        this.updateMissionsList();
        this.renderMap();
    }

    generateCoastalLocation(stationCoords) {
        // Generate a mission location near the player's station
        // CRITICAL: Spawn FAR offshore to GUARANTEE water-only
        // Distance: 6 to 12 nautical miles from station - all in deep water

        // Determine offshore direction based on latitude/longitude
        // For UK: Generally south and west are offshore
        let offshoreAngle;

        if (stationCoords.lat > 54) {
            // Northern Scotland/England - offshore is generally west/northwest
            offshoreAngle = Math.PI * 1.25; // West-Northwest
        } else if (stationCoords.lng < -4) {
            // West coast Wales/Scotland - offshore is generally west
            offshoreAngle = Math.PI; // West
        } else if (stationCoords.lat > 51 && stationCoords.lng > -2) {
            // Bristol Channel area - offshore is generally south/southwest
            offshoreAngle = Math.PI * 1.35; // South-Southwest
        } else {
            // South coast England - offshore is generally south
            offshoreAngle = Math.PI * 1.5; // South
        }

        // Add SMALL random variation (±30 degrees) to keep offshore
        const angleVariation = (Math.random() - 0.5) * Math.PI * 0.33; // ±30 degrees
        const angle = offshoreAngle + angleVariation;

        // MUCH FURTHER offshore - 6 to 12nm guarantees deep water
        const minDistance = 0.1; // ~6 nautical miles
        const maxDistance = 0.2; // ~12 nautical miles
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;

        // Calculate coordinates
        const lat = stationCoords.lat + Math.cos(angle) * distance;
        const lng = stationCoords.lng + Math.sin(angle) * distance;

        // Calculate actual distance in nautical miles
        const distanceNM = Math.round((distance / 0.016) * 10) / 10;

        // Determine compass direction
        const degrees = (angle * 180 / Math.PI + 360) % 360;
        let direction = '';
        if (degrees < 22.5 || degrees >= 337.5) direction = 'North';
        else if (degrees < 67.5) direction = 'Northeast';
        else if (degrees < 112.5) direction = 'East';
        else if (degrees < 157.5) direction = 'Southeast';
        else if (degrees < 202.5) direction = 'South';
        else if (degrees < 247.5) direction = 'Southwest';
        else if (degrees < 292.5) direction = 'West';
        else direction = 'Northwest';

        // Generate realistic location names based on distance
        let locationType = '';
        let locationName = '';

        if (distanceNM < 8) {
            // Medium range - offshore waters
            const features = ['Offshore Waters', 'Open Water', 'Sea Area'];
            locationType = features[Math.floor(Math.random() * features.length)];
            locationName = `${distanceNM}nm ${direction} - ${locationType}`;
        } else {
            // Far offshore - distant waters
            const features = ['Distant Offshore', 'Open Sea', 'Deep Water', 'Far Offshore'];
            locationType = features[Math.floor(Math.random() * features.length)];
            locationName = `${distanceNM}nm ${direction} - ${locationType}`;
        }

        return {
            name: locationName,
            lat: lat,
            lng: lng,
            type: 'water',
            distance: distanceNM,
            direction: direction
        };
    }

    calculateDistance(from, to) {
        // Calculate distance in nautical miles using haversine formula
        const R = 3440.065; // Earth radius in nautical miles
        const lat1 = from.lat * Math.PI / 180;
        const lat2 = to.lat * Math.PI / 180;
        const deltaLat = (to.lat - from.lat) * Math.PI / 180;
        const deltaLng = (to.lng - from.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in nautical miles
    }

    dispatchToMission(missionId, unitIds, crewAssignments = {}) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.status !== 'waiting') return false;

        const units = unitIds.map(id => this.fleet.find(u => u.id === id)).filter(u => u);
        if (units.length === 0) return false;

        // Dispatch units and assign crew
        units.forEach(unit => {
            if (unit.status === 'available') {
                const station = this.stations.find(s => s.id === unit.stationId);
                const unitTypes = this.getUnitTypes();
                const unitTemplate = unitTypes[unit.type];

                // Calculate realistic travel time based on distance and speed
                const distanceNM = this.calculateDistance(station.coordinates, mission.coordinates);
                const speedKnots = unitTemplate.speed;
                const travelTimeHours = distanceNM / speedKnots;

                // Time compression: 5x (1 real minute = 5 game minutes, so 12 real minutes = 1 game hour)
                // This makes travel much more realistic and slower
                const travelTimeMs = Math.max(30000, travelTimeHours * 3600 * 1000 / 5);

                unit.status = 'dispatched';
                unit.currentMission = missionId;
                unit.progress = 0;
                unit.travelTime = travelTimeMs; // Store for return journey
                mission.dispatchedUnits.push(unit.id);

                // Assign crew to this unit
                const assignedCrewIds = crewAssignments[unit.id] || [];
                assignedCrewIds.forEach(crewId => {
                    const crewMember = this.crew.find(c => c.id === crewId);
                    if (crewMember) {
                        crewMember.assignedUnit = unit.id;
                        mission.assignedCrew.push(crewId);
                    }
                });

                const crewNames = assignedCrewIds.map(id => {
                    const c = this.crew.find(cr => cr.id === id);
                    return c ? c.name : '';
                }).filter(n => n).join(', ');

                // Format ETA nicely
                const etaMinutes = Math.floor(travelTimeMs / 60000);
                const etaSeconds = Math.round((travelTimeMs % 60000) / 1000);
                const etaString = etaMinutes > 0 ? `${etaMinutes}m ${etaSeconds}s` : `${etaSeconds}s`;
                this.logActivity(`${unit.name} dispatched - ${distanceNM.toFixed(1)}nm at ${speedKnots}kts - ETA ${etaString}`);

                // Animate unit progress
                this.animateUnit(unit, travelTimeMs);

                // Arrival at scene
                setTimeout(() => {
                    if (mission.status === 'enroute') {
                        mission.status = 'onscene';
                        this.logActivity(`${unit.name} on scene at ${mission.title}`);

                        // Complete mission after 20-40 seconds
                        setTimeout(() => this.completeMission(missionId), Math.random() * 20000 + 20000);
                    }
                }, travelTimeMs);
            }
        });

        mission.status = 'enroute';

        this.updateMissionsList();
        this.renderMap();
        return true;
    }

    animateUnit(unit, duration) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (unit.status !== 'dispatched' && unit.status !== 'returning') {
                clearInterval(interval);
                return;
            }

            const elapsed = Date.now() - startTime;
            unit.progress = Math.min(elapsed / duration, 1);

            if (unit.progress >= 1) {
                clearInterval(interval);
            }

            // Update map more frequently for smoother animation
            this.renderMap();
        }, 50); // Update every 50ms for smoother animation
    }

    calculateWaterPath(fromCoords, toCoords, progress) {
        // HARBOUR-AWARE NAVIGATION SYSTEM
        // For enclosed harbours: 3-stage navigation (Harbour Exit → Offshore → Destination)
        // For open coast: 2-stage navigation (Offshore → Destination)

        // Database of enclosed harbours with their exit waypoints
        const harbours = [
            // South Coast - enclosed harbours and channels
            { name: 'Poole', lat: 50.712, lng: -1.987, exitLat: 50.660, exitLng: -1.915 }, // Poole Harbour entrance
            { name: 'Portsmouth', lat: 50.800, lng: -1.091, exitLat: 50.785, exitLng: -1.095 }, // Portsmouth Harbour entrance
            { name: 'Southampton', lat: 50.909, lng: -1.404, exitLat: 50.800, exitLng: -1.300 }, // Southampton Water exit

            // Bristol Channel - mudflats and narrow channels
            { name: 'Penarth', lat: 51.434, lng: -3.176, exitLat: 51.400, exitLng: -3.150 }, // Cardiff Roads
            { name: 'Barry', lat: 51.400, lng: -3.266, exitLat: 51.380, exitLng: -3.200 }, // Barry Roads
            { name: 'Cardiff', lat: 51.481, lng: -3.179, exitLat: 51.420, exitLng: -3.120 }, // Bristol Channel proper
            { name: 'Swansea', lat: 51.621, lng: -3.943, exitLat: 51.580, exitLng: -3.900 }, // Swansea Bay exit

            // Scotland - enclosed harbours and estuaries
            { name: 'Aberdeen', lat: 57.144, lng: -2.099, exitLat: 57.135, exitLng: -2.050 }, // Aberdeen Harbour entrance
            { name: 'Dundee', lat: 56.462, lng: -2.971, exitLat: 56.450, exitLng: -2.900 }, // Tay estuary
            { name: 'Edinburgh', lat: 55.953, lng: -3.189, exitLat: 55.980, exitLng: -3.100 }, // Firth of Forth

            // Northeast - river mouths and harbours
            { name: 'Newcastle', lat: 54.978, lng: -1.618, exitLat: 54.995, exitLng: -1.420 }, // Tyne estuary
            { name: 'Sunderland', lat: 54.906, lng: -1.383, exitLat: 54.915, exitLng: -1.350 }, // Sunderland harbour
            { name: 'Hartlepool', lat: 54.693, lng: -1.213, exitLat: 54.690, exitLng: -1.180 } // Hartlepool harbour
        ];

        // Check if we're starting from a harbour
        let harbourExit = null;
        for (const harbour of harbours) {
            const dist = Math.sqrt(
                Math.pow(fromCoords.lat - harbour.lat, 2) +
                Math.pow(fromCoords.lng - harbour.lng, 2)
            );
            // If within ~0.01 degrees (~1km), use this harbour's exit
            if (dist < 0.01) {
                harbourExit = { lat: harbour.exitLat, lng: harbour.exitLng };
                break;
            }
        }

        // Calculate offshore waypoint positioned south/southwest of route
        const midLat = (fromCoords.lat + toCoords.lat) / 2;
        const midLng = (fromCoords.lng + toCoords.lng) / 2;

        const distance = Math.sqrt(
            Math.pow(toCoords.lat - fromCoords.lat, 2) +
            Math.pow(toCoords.lng - fromCoords.lng, 2)
        );

        // Waypoint is placed FAR south/southwest of the midpoint
        const waypointOffshoreDistance = distance * 0.8;
        const waypointLat = midLat - waypointOffshoreDistance; // Go south
        const waypointLng = midLng - waypointOffshoreDistance * 0.5; // Go slightly west

        let currentLat, currentLng;

        if (harbourExit) {
            // THREE-STAGE NAVIGATION for harbour stations:
            // 0-33% progress: Station → Harbour Exit
            // 33-66% progress: Harbour Exit → Offshore Waypoint
            // 66-100% progress: Offshore Waypoint → Destination

            if (progress <= 0.33) {
                // Stage 1: Navigate to harbour exit
                const stageProgress = progress * 3; // 0-0.33 becomes 0-1
                currentLat = fromCoords.lat + (harbourExit.lat - fromCoords.lat) * stageProgress;
                currentLng = fromCoords.lng + (harbourExit.lng - fromCoords.lng) * stageProgress;
            } else if (progress <= 0.66) {
                // Stage 2: Harbour exit to offshore waypoint
                const stageProgress = (progress - 0.33) * 3; // 0.33-0.66 becomes 0-1
                currentLat = harbourExit.lat + (waypointLat - harbourExit.lat) * stageProgress;
                currentLng = harbourExit.lng + (waypointLng - harbourExit.lng) * stageProgress;
            } else {
                // Stage 3: Offshore waypoint to destination
                const stageProgress = (progress - 0.66) * 3; // 0.66-1 becomes 0-1
                currentLat = waypointLat + (toCoords.lat - waypointLat) * stageProgress;
                currentLng = waypointLng + (toCoords.lng - waypointLng) * stageProgress;
            }
        } else {
            // TWO-STAGE NAVIGATION for open coast stations:
            // 0-50% progress: Station → Offshore Waypoint
            // 50-100% progress: Offshore Waypoint → Destination

            if (progress <= 0.5) {
                // First half: Travel from station to offshore waypoint
                const stageProgress = progress * 2; // 0-0.5 becomes 0-1
                currentLat = fromCoords.lat + (waypointLat - fromCoords.lat) * stageProgress;
                currentLng = fromCoords.lng + (waypointLng - fromCoords.lng) * stageProgress;
            } else {
                // Second half: Travel from offshore waypoint to destination
                const stageProgress = (progress - 0.5) * 2; // 0.5-1 becomes 0-1
                currentLat = waypointLat + (toCoords.lat - waypointLat) * stageProgress;
                currentLng = waypointLng + (toCoords.lng - waypointLng) * stageProgress;
            }
        }

        return { lat: currentLat, lng: currentLng };
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

        // Free up units and crew
        mission.dispatchedUnits.forEach(unitId => {
            const unit = this.fleet.find(u => u.id === unitId);
            if (unit) {
                unit.status = 'returning';
                unit.returnFrom = { lat: mission.coordinates.lat, lng: mission.coordinates.lng }; // Store return location
                unit.progress = 0;

                // Use same travel time as outbound journey (stored in unit)
                const returnTime = unit.travelTime || 20000;

                // Format ETA nicely
                const etaMinutes = Math.floor(returnTime / 60000);
                const etaSeconds = Math.round((returnTime % 60000) / 1000);
                const etaString = etaMinutes > 0 ? `${etaMinutes}m ${etaSeconds}s` : `${etaSeconds}s`;
                this.logActivity(`${unit.name} returning to station - ETA ${etaString}`);

                // Animate return journey
                this.animateUnit(unit, returnTime);

                // Arrive back at station
                setTimeout(() => {
                    unit.status = 'available';
                    unit.returnFrom = null;
                    unit.travelTime = null;
                    this.logActivity(`${unit.name} returned to station`);
                    this.updateFleetScreen();
                    this.renderMap();
                }, returnTime);
            }
        });

        // Release assigned crew
        if (mission.assignedCrew && mission.assignedCrew.length > 0) {
            mission.assignedCrew.forEach(crewId => {
                const crewMember = this.crew.find(c => c.id === crewId);
                if (crewMember) {
                    crewMember.assignedUnit = null;
                }
            });
        }

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

        const maxMissions = Math.max(2, this.fleet.length + 2);
        this.logActivity(`Purchased ${template.name} for ${station.name} - Max missions now: ${maxMissions}`);
        this.addMessage('Unit Purchased', `${unit.name} added to fleet at ${station.name}. More emergencies will now appear!`, 'success');

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

        // Render stations with labels
        this.stations.forEach(station => {
            if (!this.stationMarkers[station.id]) {
                const stationTypes = this.getStationTypes();
                const template = stationTypes[station.type];
                const units = this.fleet.filter(u => u.stationId === station.id && u.status === 'available');

                const icon = L.divIcon({
                    className: 'custom-marker station-marker-custom',
                    html: `
                        <div style="text-align: center;">
                            <div style="width: 40px; height: 40px; background: #27ae60; border: 4px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin: 0 auto;">
                                ⚓
                            </div>
                            <div style="background: white; color: #27ae60; font-weight: bold; font-size: 11px; padding: 3px 6px; border-radius: 3px; border: 2px solid #27ae60; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                                ${station.name.split(' ')[0]}<br><span style="font-size: 9px;">${units.length} units</span>
                            </div>
                        </div>
                    `,
                    iconSize: [80, 80],
                    iconAnchor: [40, 40]
                });

                const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon: icon }).addTo(this.map);
                marker.bindPopup(`
                    <strong>${station.name}</strong><br>
                    ${station.location}<br>
                    <strong>Type:</strong> ${template.name}<br>
                    <strong>Available Units:</strong> ${units.length}
                `);
                marker.on('click', () => {
                    showStationDetail(station.id);
                    this.map.setView([station.coordinates.lat, station.coordinates.lng], 13);
                });
                this.stationMarkers[station.id] = marker;
            }
        });

        // Render missions with urgency indicators
        this.missions.forEach(mission => {
            if (!this.missionMarkers[mission.id]) {
                const urgencyColors = {
                    'critical': '#c0392b',
                    'high': '#e74c3c',
                    'medium': '#f39c12',
                    'low': '#f1c40f'
                };
                const color = urgencyColors[mission.urgency] || '#f39c12';

                const urgencyLabel = mission.urgency.toUpperCase();

                const icon = L.divIcon({
                    className: 'custom-marker mission-marker-custom',
                    html: `
                        <div style="text-align: center;">
                            <div style="width: 50px; height: 50px; background: ${color}; border: 4px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); animation: pulse-mission 2s infinite; margin: 0 auto;">
                                🚨
                            </div>
                            <div style="background: ${color}; color: white; font-weight: bold; font-size: 10px; padding: 3px 8px; border-radius: 3px; border: 2px solid white; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
                                ${urgencyLabel}<br><span style="font-size: 9px;">£${(mission.reward / 1000).toFixed(0)}k</span>
                            </div>
                        </div>
                    `,
                    iconSize: [90, 90],
                    iconAnchor: [45, 45]
                });

                const marker = L.marker([mission.coordinates.lat, mission.coordinates.lng], { icon: icon }).addTo(this.map);
                marker.bindPopup(`
                    <strong>${mission.title}</strong><br>
                    ${mission.location}<br>
                    <strong>Urgency:</strong> ${mission.urgency.toUpperCase()}<br>
                    <strong>Reward:</strong> £${mission.reward.toLocaleString()}<br>
                    <strong>Required:</strong> ${mission.requiredUnits.join(', ')}
                `);
                marker.on('click', () => {
                    showMissionDetail(mission.id);
                    this.map.setView([mission.coordinates.lat, mission.coordinates.lng], 13);
                });
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

        // Render units on mission with progress indicators (dispatched and returning)
        this.fleet.forEach(unit => {
            // Handle dispatched units (going to mission)
            if (unit.status === 'dispatched' && unit.currentMission !== null) {
                const mission = this.missions.find(m => m.id === unit.currentMission);
                const station = this.stations.find(s => s.id === unit.stationId);

                if (mission && station) {
                    // Use curved path that avoids land
                    const position = this.calculateWaterPath(station.coordinates, mission.coordinates, unit.progress);

                    const progressPercent = Math.round(unit.progress * 100);

                    if (this.unitMarkers[unit.id]) {
                        this.unitMarkers[unit.id].setLatLng([position.lat, position.lng]);
                        // Update progress in popup
                        const popupContent = `
                            <strong>${unit.name}</strong><br>
                            ${unit.type}<br>
                            <strong>Progress:</strong> ${progressPercent}%<br>
                            <strong>To:</strong> ${mission.location}
                        `;
                        this.unitMarkers[unit.id].setPopupContent(popupContent);
                    } else {
                        const icon = L.divIcon({
                            className: 'custom-marker lifeboat-marker-custom',
                            html: `
                                <div style="text-align: center;">
                                    <div style="width: 36px; height: 36px; background: #3498db; border: 4px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin: 0 auto; transition: all 0.05s linear;">
                                        🚤
                                    </div>
                                    <div style="background: #3498db; color: white; font-weight: bold; font-size: 9px; padding: 2px 5px; border-radius: 3px; border: 2px solid white; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                                        ${progressPercent}%
                                    </div>
                                </div>
                            `,
                            iconSize: [60, 60],
                            iconAnchor: [30, 30]
                        });

                        const marker = L.marker([position.lat, position.lng], { icon: icon }).addTo(this.map);
                        marker.bindPopup(`
                            <strong>${unit.name}</strong><br>
                            ${unit.type}<br>
                            <strong>Progress:</strong> ${progressPercent}%<br>
                            <strong>To:</strong> ${mission.location}
                        `);
                        this.unitMarkers[unit.id] = marker;
                    }
                }
            }
            // Handle returning units (going back to station)
            else if (unit.status === 'returning' && unit.returnFrom) {
                const station = this.stations.find(s => s.id === unit.stationId);

                if (station) {
                    // Use curved path for return journey (reverse direction)
                    const position = this.calculateWaterPath(unit.returnFrom, station.coordinates, unit.progress);

                    const progressPercent = Math.round(unit.progress * 100);

                    if (this.unitMarkers[unit.id]) {
                        this.unitMarkers[unit.id].setLatLng([position.lat, position.lng]);
                        // Update progress in popup
                        const popupContent = `
                            <strong>${unit.name}</strong><br>
                            ${unit.type}<br>
                            <strong>Returning:</strong> ${progressPercent}%<br>
                            <strong>To:</strong> ${station.name}
                        `;
                        this.unitMarkers[unit.id].setPopupContent(popupContent);
                    } else {
                        const icon = L.divIcon({
                            className: 'custom-marker lifeboat-marker-custom',
                            html: `
                                <div style="text-align: center;">
                                    <div style="width: 36px; height: 36px; background: #27ae60; border: 4px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); margin: 0 auto; transition: all 0.05s linear;">
                                        🚤
                                    </div>
                                    <div style="background: #27ae60; color: white; font-weight: bold; font-size: 9px; padding: 2px 5px; border-radius: 3px; border: 2px solid white; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                                        Return ${progressPercent}%
                                    </div>
                                </div>
                            `,
                            iconSize: [60, 60],
                            iconAnchor: [30, 30]
                        });

                        const marker = L.marker([position.lat, position.lng], { icon: icon }).addTo(this.map);
                        marker.bindPopup(`
                            <strong>${unit.name}</strong><br>
                            ${unit.type}<br>
                            <strong>Returning:</strong> ${progressPercent}%<br>
                            <strong>To:</strong> ${station.name}
                        `);
                        this.unitMarkers[unit.id] = marker;
                    }
                }
            }
            // Remove marker for units that are available or in maintenance
            else {
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
    console.log('showMissionDetail called with ID:', missionId);

    if (!game || !game.missions) {
        console.error('Game not initialized!');
        alert('Game not ready yet. Please wait for the game to load.');
        return;
    }

    const mission = game.missions.find(m => m.id === missionId);
    if (!mission) {
        console.error('Mission not found:', missionId);
        alert('Mission not found!');
        return;
    }

    console.log('Mission found:', mission);

    const modal = document.getElementById('mission-detail-modal');
    const title = document.getElementById('mission-detail-title');
    const content = document.getElementById('mission-detail-content');

    if (!modal || !title || !content) {
        console.error('Modal elements not found!');
        alert('Modal error - please refresh the page.');
        return;
    }

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
            const unitTypes = game.getUnitTypes();
            const unitTemplate = unitTypes[unit.type];
            const availableCrew = game.crew.filter(c => c.stationId === unit.stationId && !c.assignedUnit);

            html += `
                <div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border: 2px solid #bdc3c7; border-radius: 4px;">
                    <label style="display: block; margin-bottom: 10px;">
                        <input type="checkbox" value="${unit.id}" class="dispatch-checkbox" onchange="toggleCrewSelection(${unit.id})">
                        <strong>${unit.name}</strong> (${unit.type}) - ${station ? station.name : 'Unknown'}
                        <span style="color: #7f8c8d; font-size: 0.9em;"> - Requires ${unitTemplate.requiredCrew} crew</span>
                    </label>
                    <div id="crew-select-${unit.id}" style="display: none; margin-left: 25px; margin-top: 10px; padding: 10px; background: white; border: 1px solid #bdc3c7; border-radius: 3px;">
                        <strong style="font-size: 0.9em;">Assign Crew:</strong><br>
            `;

            availableCrew.forEach(crewMember => {
                html += `
                    <label style="display: block; margin: 5px 0; font-size: 0.9em;">
                        <input type="checkbox" class="crew-checkbox crew-for-${unit.id}" value="${crewMember.id}">
                        ${crewMember.name}
                        ${crewMember.qualifications.length > 0 ? `<span style="color: #27ae60;">(${crewMember.qualifications.join(', ')})</span>` : ''}
                    </label>
                `;
            });

            if (availableCrew.length === 0) {
                html += '<p style="color: #e74c3c; font-size: 0.9em; margin: 5px 0;">No available crew at this station</p>';
            }

            html += `
                    </div>
                </div>
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

        // Show assigned crew for active missions
        if (mission.assignedCrew && mission.assignedCrew.length > 0) {
            html += '<div style="margin-top: 15px;"><strong>Assigned Crew:</strong><ul style="margin: 5px 0;">';
            mission.assignedCrew.forEach(crewId => {
                const crew = game.crew.find(c => c.id === crewId);
                if (crew) {
                    html += `<li>${crew.name}</li>`;
                }
            });
            html += '</ul></div>';
        }
    } else {
        html += '<p style="color: #e74c3c;"><strong>No available units to dispatch!</strong></p>';
    }

    html += '</div>';

    content.innerHTML = html;
    modal.style.display = 'block';
    modal.classList.add('active');

    console.log('Modal displayed. Available units:', availableUnits.length);
    console.log('Mission status:', mission.status);
    console.log('HTML content generated successfully');
}

function toggleCrewSelection(unitId) {
    const checkbox = document.querySelector(`.dispatch-checkbox[value="${unitId}"]`);
    const crewDiv = document.getElementById(`crew-select-${unitId}`);

    if (checkbox && crewDiv) {
        crewDiv.style.display = checkbox.checked ? 'block' : 'none';
    }
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

    // Collect assigned crew for each unit
    const crewAssignments = {};
    unitIds.forEach(unitId => {
        const crewCheckboxes = document.querySelectorAll(`.crew-for-${unitId}:checked`);
        crewAssignments[unitId] = Array.from(crewCheckboxes).map(cb => parseInt(cb.value));
    });

    if (game.dispatchToMission(missionId, unitIds, crewAssignments)) {
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

    // Auto-assign crew to selected units
    const unitTypes = game.getUnitTypes();
    const crewAssignments = {};

    selectedUnits.forEach(unitId => {
        const unit = game.fleet.find(u => u.id === unitId);
        if (unit) {
            const unitTemplate = unitTypes[unit.type];
            const requiredCrew = unitTemplate.requiredCrew;

            // Get available crew at the same station
            const availableCrew = game.crew.filter(c =>
                c.stationId === unit.stationId && !c.assignedUnit
            );

            // Auto-assign the required number of crew
            crewAssignments[unitId] = availableCrew.slice(0, requiredCrew).map(c => c.id);
        }
    });

    if (game.dispatchToMission(missionId, selectedUnits, crewAssignments)) {
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

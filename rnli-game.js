// RNLI Mission Chief - Full Game Engine

class RNLIGame {
    constructor() {
        this.credits = 50000;
        this.stations = [];
        this.vehicles = [];
        this.missions = [];
        this.stats = {
            totalRescues: 0,
            livesSaved: 0,
            totalEarned: 0,
            failedMissions: 0
        };

        this.missionIdCounter = 0;
        this.stationIdCounter = 0;
        this.vehicleIdCounter = 0;

        this.mapZoom = 1;
        this.mapOffset = { x: 0, y: 0 };

        this.init();
    }

    init() {
        console.log('Initializing RNLI Mission Chief...');

        // Create initial station
        this.createInitialStation();

        // Initialize map
        this.initMap();

        // Start mission generator
        this.startMissionGenerator();

        // Update UI
        this.updateAll();

        console.log('Game initialized successfully!');
    }

    createInitialStation() {
        const initialStation = {
            id: this.stationIdCounter++,
            name: 'Poole Lifeboat Station',
            location: 'Poole, Dorset',
            coordinates: { x: 0.5, y: 0.5 },
            capacity: 2,
            vehicles: []
        };

        this.stations.push(initialStation);

        // Create initial lifeboat
        const initialBoat = {
            id: this.vehicleIdCounter++,
            name: 'Atlantic 85-1',
            type: 'Atlantic 85',
            class: 'Inshore',
            stationId: initialStation.id,
            status: 'available',
            speed: 35,
            capacity: 6,
            currentMission: null
        };

        this.vehicles.push(initialBoat);
        initialStation.vehicles.push(initialBoat.id);
    }

    // Mission System
    startMissionGenerator() {
        // Generate first mission after 5 seconds
        setTimeout(() => this.generateMission(), 5000);

        // Generate missions every 30-60 seconds
        setInterval(() => {
            if (this.missions.length < 10) {
                this.generateMission();
            }
        }, Math.random() * 30000 + 30000);
    }

    generateMission() {
        const missionTypes = this.getMissionTypes();
        const typeKeys = Object.keys(missionTypes);
        const randomType = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        const template = missionTypes[randomType];

        // Random location near a station
        const station = this.stations[Math.floor(Math.random() * this.stations.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.3 + 0.1;

        const mission = {
            id: this.missionIdCounter++,
            type: randomType,
            title: template.title,
            description: template.description,
            location: this.generateLocation(),
            coordinates: {
                x: Math.max(0.1, Math.min(0.9, station.coordinates.x + Math.cos(angle) * distance)),
                y: Math.max(0.1, Math.min(0.9, station.coordinates.y + Math.sin(angle) * distance))
            },
            peopleInDanger: Math.floor(Math.random() * template.maxPeople) + 1,
            reward: template.reward,
            required: template.required,
            dispatched: [],
            status: 'waiting', // waiting, enroute, onscene
            startTime: Date.now()
        };

        this.missions.push(mission);
        this.updateMissions();
        this.updateMap();
    }

    generateLocation() {
        const locations = [
            'Off Poole Harbour',
            'Near Brownsea Island',
            'Studland Bay',
            'Sandbanks Peninsula',
            'Swanage Bay',
            'Durlston Head',
            'Old Harry Rocks',
            'Bournemouth Coast',
            'Christchurch Bay',
            'The Solent',
            'Needles Passage',
            'Yarmouth Roads',
            'Cowes Harbour',
            'Bembridge Ledge',
            'Selsey Bill',
            'Chichester Harbour'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    getMissionTypes() {
        return {
            'person-overboard': {
                title: 'Person Overboard',
                description: 'Person has fallen overboard and is in the water. Immediate response required.',
                maxPeople: 2,
                reward: 5000,
                required: { lifeboats: 1 }
            },
            'vessel-distress': {
                title: 'Vessel in Distress',
                description: 'Boat is taking on water and crew needs immediate evacuation.',
                maxPeople: 8,
                reward: 8000,
                required: { lifeboats: 2 }
            },
            'capsized': {
                title: 'Capsized Vessel',
                description: 'Small craft has capsized. Crew in the water.',
                maxPeople: 5,
                reward: 7000,
                required: { lifeboats: 1 }
            },
            'medical': {
                title: 'Medical Emergency at Sea',
                description: 'Serious medical emergency aboard vessel. Patient needs urgent evacuation.',
                maxPeople: 1,
                reward: 6000,
                required: { lifeboats: 1 }
            },
            'tide': {
                title: 'People Cut Off by Tide',
                description: 'Group stranded on rocks, cut off by incoming tide.',
                maxPeople: 6,
                reward: 3000,
                required: { lifeboats: 1 }
            },
            'engine-failure': {
                title: 'Engine Failure',
                description: 'Vessel has lost power and is drifting towards rocks.',
                maxPeople: 4,
                reward: 4000,
                required: { lifeboats: 1 }
            },
            'yacht': {
                title: 'Yacht in Distress',
                description: 'Yacht caught in rough seas with damaged rigging.',
                maxPeople: 6,
                reward: 9000,
                required: { lifeboats: 2 }
            },
            'fishing-vessel': {
                title: 'Fishing Vessel Emergency',
                description: 'Commercial fishing vessel in trouble with injured crew.',
                maxPeople: 8,
                reward: 10000,
                required: { lifeboats: 2 }
            },
            'swimmer': {
                title: 'Swimmer in Difficulty',
                description: 'Swimmer struggling in strong currents.',
                maxPeople: 1,
                reward: 2000,
                required: { lifeboats: 1 }
            },
            'cliff-rescue': {
                title: 'Cliff Rescue',
                description: 'Person stranded on cliff face, accessible only by sea.',
                maxPeople: 2,
                reward: 5500,
                required: { lifeboats: 1 }
            }
        };
    }

    dispatchToMission(missionId, vehicleIds) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission) return false;

        let dispatched = 0;
        vehicleIds.forEach(vid => {
            const vehicle = this.vehicles.find(v => v.id === vid);
            if (vehicle && vehicle.status === 'available') {
                vehicle.status = 'dispatched';
                vehicle.currentMission = missionId;
                mission.dispatched.push(vid);
                dispatched++;
            }
        });

        if (dispatched > 0) {
            mission.status = 'enroute';

            // Calculate arrival time based on distance and speed
            const fastestVehicle = this.vehicles
                .filter(v => vehicleIds.includes(v.id))
                .sort((a, b) => b.speed - a.speed)[0];

            const arrivalTime = Math.random() * 30000 + 15000; // 15-45 seconds

            setTimeout(() => {
                this.arriveAtMission(missionId);
            }, arrivalTime);

            return true;
        }

        return false;
    }

    arriveAtMission(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission || mission.status === 'onscene') return;

        mission.status = 'onscene';
        this.updateMissions();

        // Complete mission after 20-40 seconds
        const completionTime = Math.random() * 20000 + 20000;
        setTimeout(() => {
            this.completeMission(missionId);
        }, completionTime);
    }

    completeMission(missionId) {
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        if (missionIndex === -1) return;

        const mission = this.missions[missionIndex];

        // Calculate success
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
            this.credits += mission.reward;
            this.stats.totalRescues++;
            this.stats.livesSaved += mission.peopleInDanger;
            this.stats.totalEarned += mission.reward;

            this.showNotification(`Mission Complete! Saved ${mission.peopleInDanger} people. +£${mission.reward}`,'success');
        } else {
            this.stats.failedMissions++;
            this.showNotification('Mission partially completed. Some casualties reported.', 'warning');
        }

        // Free up vehicles
        mission.dispatched.forEach(vid => {
            const vehicle = this.vehicles.find(v => v.id === vid);
            if (vehicle) {
                vehicle.status = 'available';
                vehicle.currentMission = null;
            }
        });

        // Remove mission
        this.missions.splice(missionIndex, 1);

        this.updateAll();
    }

    // Station Management
    buildStation() {
        const name = document.getElementById('station-name').value.trim();
        const location = document.getElementById('station-location').value;

        if (!name || !location) {
            alert('Please enter a station name and select a location.');
            return;
        }

        const cost = 100000;
        if (this.credits < cost) {
            alert('Insufficient credits to build station!');
            return;
        }

        this.credits -= cost;

        const locationData = this.getLocationCoordinates(location);

        const station = {
            id: this.stationIdCounter++,
            name: name,
            location: locationData.name,
            coordinates: locationData.coords,
            capacity: 2,
            vehicles: []
        };

        this.stations.push(station);

        this.showNotification(`Station "${name}" built successfully!`, 'success');
        this.updateAll();
        closeModal();

        document.getElementById('station-name').value = '';
        document.getElementById('station-location').value = '';
    }

    getLocationCoordinates(location) {
        const locations = {
            'poole': { name: 'Poole, Dorset', coords: { x: 0.5, y: 0.5 } },
            'weymouth': { name: 'Weymouth, Dorset', coords: { x: 0.3, y: 0.6 } },
            'swanage': { name: 'Swanage, Dorset', coords: { x: 0.6, y: 0.7 } },
            'lymington': { name: 'Lymington, Hampshire', coords: { x: 0.7, y: 0.4 } },
            'yarmouth': { name: 'Yarmouth, Isle of Wight', coords: { x: 0.75, y: 0.5 } },
            'bembridge': { name: 'Bembridge, Isle of Wight', coords: { x: 0.8, y: 0.6 } },
            'selsey': { name: 'Selsey, West Sussex', coords: { x: 0.85, y: 0.45 } },
            'brighton': { name: 'Brighton, East Sussex', coords: { x: 0.9, y: 0.5 } }
        };
        return locations[location] || locations['poole'];
    }

    buyLifeboat(type, stationId) {
        const lifeboats = this.getLifeboatTypes();
        const template = lifeboats[type];

        if (!template) return false;

        if (this.credits < template.cost) {
            alert('Insufficient credits!');
            return false;
        }

        const station = this.stations.find(s => s.id === stationId);
        if (!station) {
            alert('Invalid station!');
            return false;
        }

        if (station.vehicles.length >= station.capacity) {
            alert(`Station is at full capacity (${station.capacity} vehicles)!`);
            return false;
        }

        this.credits -= template.cost;

        const vehicle = {
            id: this.vehicleIdCounter++,
            name: `${type}-${this.vehicleIdCounter}`,
            type: type,
            class: template.class,
            stationId: stationId,
            status: 'available',
            speed: template.speed,
            capacity: template.capacity,
            currentMission: null
        };

        this.vehicles.push(vehicle);
        station.vehicles.push(vehicle.id);

        this.showNotification(`Purchased ${type} for £${template.cost.toLocaleString()}`, 'success');
        this.updateAll();

        return true;
    }

    getLifeboatTypes() {
        return {
            'Shannon Class': {
                class: 'All-Weather',
                speed: 25,
                capacity: 10,
                range: 250,
                cost: 2000000,
                description: 'Latest all-weather lifeboat with advanced navigation and self-righting capability.'
            },
            'Severn Class': {
                class: 'All-Weather',
                speed: 25,
                capacity: 10,
                range: 250,
                cost: 1800000,
                description: 'Fast slipway-launched all-weather lifeboat with excellent sea-keeping.'
            },
            'Tamar Class': {
                class: 'All-Weather',
                speed: 25,
                capacity: 10,
                range: 250,
                cost: 2500000,
                description: 'State-of-the-art all-weather lifeboat with superior maneuverability.'
            },
            'Mersey Class': {
                class: 'All-Weather',
                speed: 17,
                capacity: 10,
                range: 140,
                cost: 1500000,
                description: 'Reliable all-weather lifeboat designed for inshore and offshore work.'
            },
            'Atlantic 85': {
                class: 'Inshore',
                speed: 35,
                capacity: 6,
                range: 50,
                cost: 200000,
                description: 'Fast and agile inshore lifeboat for coastal rescues.'
            },
            'Atlantic 75': {
                class: 'Inshore',
                speed: 32,
                capacity: 6,
                range: 50,
                cost: 150000,
                description: 'Rigid inflatable boat ideal for shallow water rescues.'
            },
            'D-Class': {
                class: 'Inshore',
                speed: 25,
                capacity: 3,
                range: 30,
                cost: 50000,
                description: 'Small, lightweight inflatable ideal for beach rescues.'
            }
        };
    }

    // Map System
    initMap() {
        const mapElement = document.getElementById('game-map');
        if (!mapElement) return;

        this.renderMap();

        // Update map every second
        setInterval(() => {
            this.renderMap();
        }, 1000);
    }

    renderMap() {
        const mapElement = document.getElementById('game-map');
        if (!mapElement) return;

        const width = mapElement.clientWidth;
        const height = mapElement.clientHeight;

        let mapHTML = '';

        // Draw stations
        this.stations.forEach(station => {
            const x = station.coordinates.x * width;
            const y = station.coordinates.y * height;
            mapHTML += `
                <div class="map-marker station-marker" style="left: ${x}px; top: ${y}px;" title="${station.name}">
                    ⚓
                </div>
            `;
        });

        // Draw missions
        this.missions.forEach(mission => {
            const x = mission.coordinates.x * width;
            const y = mission.coordinates.y * height;
            const colorClass = mission.status === 'waiting' ? 'red' : mission.status === 'enroute' ? 'yellow' : 'green';
            mapHTML += `
                <div class="map-marker mission-marker ${colorClass}" style="left: ${x}px; top: ${y}px;"
                     onclick="game.showMissionDetail(${mission.id})" title="${mission.title}">
                    🚨
                </div>
            `;
        });

        mapElement.innerHTML = mapHTML;
    }

    zoomIn() {
        this.mapZoom *= 1.2;
        this.renderMap();
    }

    zoomOut() {
        this.mapZoom /= 1.2;
        this.renderMap();
    }

    centerMap() {
        this.mapOffset = { x: 0, y: 0 };
        this.renderMap();
    }

    // UI Updates
    updateAll() {
        this.updateNav();
        this.updateMissions();
        this.updateMap();
    }

    updateNav() {
        document.getElementById('nav-credits').textContent = this.credits.toLocaleString();
        document.getElementById('nav-stations').textContent = this.stations.length;
        document.getElementById('nav-boats').textContent = this.vehicles.length;
    }

    updateMissions() {
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
                        Required: ${mission.required.lifeboats} lifeboat(s) |
                        ${mission.peopleInDanger} people in danger
                    </div>
                    <div class="mission-status">
                        ${this.getStatusBadge(mission)}
                    </div>
                </div>
            `;
        });

        missionList.innerHTML = html;
    }

    getStatusBadge(mission) {
        if (mission.status === 'waiting') {
            return '<span class="status-badge waiting">⏳ Waiting for dispatch</span>';
        } else if (mission.status === 'enroute') {
            return '<span class="status-badge enroute">🚤 Units en route</span>';
        } else {
            return '<span class="status-badge onscene">✓ Units on scene</span>';
        }
    }

    showMissionDetail(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        if (!mission) return;

        const availableVehicles = this.vehicles.filter(v => v.status === 'available');

        let content = `
            <div class="mission-details">
                <h3>${mission.title}</h3>
                <p><strong>Location:</strong> ${mission.location}</p>
                <p><strong>Description:</strong> ${mission.description}</p>
                <p><strong>People in Danger:</strong> ${mission.peopleInDanger}</p>
                <p><strong>Reward:</strong> £${mission.reward.toLocaleString()}</p>
                <p><strong>Required:</strong> ${mission.required.lifeboats} lifeboat(s)</p>
                <hr style="margin: 20px 0;">
        `;

        if (mission.status === 'waiting' && availableVehicles.length > 0) {
            content += '<h4>Dispatch Lifeboats:</h4>';
            content += '<div id="dispatch-vehicles">';

            availableVehicles.forEach(vehicle => {
                const station = this.stations.find(s => s.id === vehicle.stationId);
                content += `
                    <label style="display: block; margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                        <input type="checkbox" value="${vehicle.id}" class="dispatch-checkbox">
                        ${vehicle.name} (${vehicle.type}) - ${station ? station.name : 'Unknown'}
                    </label>
                `;
            });

            content += '</div>';
            content += `<button class="btn-primary" onclick="game.dispatchSelected(${mission.id})" style="margin-top: 15px;">Dispatch Selected</button>`;
        } else if (mission.status !== 'waiting') {
            content += `<p><strong>Status:</strong> ${this.getStatusBadge(mission)}</p>`;
        } else {
            content += '<p style="color: #e63946;"><strong>No available lifeboats to dispatch!</strong></p>';
        }

        content += '</div>';

        document.getElementById('mission-detail-title').textContent = mission.title;
        document.getElementById('mission-detail-content').innerHTML = content;
        showPanel('mission-detail');
    }

    dispatchSelected(missionId) {
        const checkboxes = document.querySelectorAll('.dispatch-checkbox:checked');
        const vehicleIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

        if (vehicleIds.length === 0) {
            alert('Please select at least one lifeboat!');
            return;
        }

        if (this.dispatchToMission(missionId, vehicleIds)) {
            this.showNotification(`Dispatched ${vehicleIds.length} lifeboat(s) to mission!`, 'success');
            closeModal();
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// UI Functions
function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
}

function showPanel(panelName) {
    closeModal();

    const panel = document.getElementById(panelName + '-panel');
    if (!panel) return;

    document.getElementById('modal-overlay').classList.add('active');
    panel.classList.add('active');

    // Update panel content
    switch(panelName) {
        case 'stations':
            updateStationsPanel();
            break;
        case 'vehicles':
            updateVehiclesPanel();
            break;
        case 'shop':
            updateShopPanel();
            break;
        case 'stats':
            updateStatsPanel();
            break;
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.querySelectorAll('.modal-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('side-menu').classList.remove('active');
}

function updateStationsPanel() {
    const list = document.getElementById('stations-list');
    if (!list) return;

    let html = '';
    game.stations.forEach(station => {
        const stationVehicles = game.vehicles.filter(v => v.stationId === station.id);
        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${station.name}</div>
                    <div class="item-badge">${stationVehicles.length}/${station.capacity} lifeboats</div>
                </div>
                <div class="item-info">
                    <div><span>Location:</span><span>${station.location}</span></div>
                    <div><span>Capacity:</span><span>${station.capacity} vehicles</span></div>
                </div>
                <div style="margin-top: 10px;">
                    <strong>Lifeboats:</strong><br>
                    ${stationVehicles.length > 0 ? stationVehicles.map(v =>
                        `<span style="display: inline-block; margin: 5px; padding: 5px 10px; background: white; border-radius: 5px;">${v.name}</span>`
                    ).join('') : '<em>No lifeboats assigned</em>'}
                </div>
            </div>
        `;
    });

    list.innerHTML = html || '<p>No stations built yet.</p>';
}

function updateVehiclesPanel() {
    const list = document.getElementById('vehicles-list');
    if (!list) return;

    let html = '';
    game.vehicles.forEach(vehicle => {
        const station = game.stations.find(s => s.id === vehicle.stationId);
        const statusColor = vehicle.status === 'available' ? '#4caf50' : '#ff9800';

        html += `
            <div class="item-card">
                <div class="item-header">
                    <div class="item-title">${vehicle.name}</div>
                    <div class="item-badge" style="background: ${statusColor}">${vehicle.status}</div>
                </div>
                <div class="item-info">
                    <div><span>Type:</span><span>${vehicle.type}</span></div>
                    <div><span>Class:</span><span>${vehicle.class}</span></div>
                    <div><span>Speed:</span><span>${vehicle.speed} knots</span></div>
                    <div><span>Capacity:</span><span>${vehicle.capacity} people</span></div>
                    <div><span>Station:</span><span>${station ? station.name : 'Unknown'}</span></div>
                    <div><span>Status:</span><span>${vehicle.status}</span></div>
                </div>
            </div>
        `;
    });

    list.innerHTML = html || '<p>No lifeboats purchased yet.</p>';
}

function updateShopPanel() {
    const shop = document.getElementById('shop-content');
    if (!shop) return;

    const lifeboats = game.getLifeboatTypes();

    let html = '<p style="margin-bottom: 20px;">Select a station to purchase a lifeboat for:</p>';
    html += '<select id="purchase-station" class="input-field"><option value="">Select Station...</option>';
    game.stations.forEach(s => {
        html += `<option value="${s.id}">${s.name}</option>`;
    });
    html += '</select><hr style="margin: 20px 0;">';

    Object.entries(lifeboats).forEach(([name, data]) => {
        const canAfford = game.credits >= data.cost;
        html += `
            <div class="shop-item">
                <div class="shop-header">
                    <div class="shop-name">${name}</div>
                    <div class="shop-class">${data.class}</div>
                </div>
                <div class="shop-description">${data.description}</div>
                <div class="shop-specs">
                    <div class="spec-item">
                        <div class="spec-label">Speed</div>
                        <div class="spec-value">${data.speed} kts</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Capacity</div>
                        <div class="spec-value">${data.capacity}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Range</div>
                        <div class="spec-value">${data.range} nm</div>
                    </div>
                </div>
                <div class="shop-footer">
                    <div class="shop-price">£${data.cost.toLocaleString()}</div>
                    <button class="btn-primary" onclick="purchaseFromShop('${name}')" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Purchase' : 'Insufficient Credits'}
                    </button>
                </div>
            </div>
        `;
    });

    shop.innerHTML = html;
}

function purchaseFromShop(type) {
    const stationSelect = document.getElementById('purchase-station');
    const stationId = parseInt(stationSelect.value);

    if (!stationId) {
        alert('Please select a station first!');
        return;
    }

    game.buyLifeboat(type, stationId);
}

function updateStatsPanel() {
    const stats = document.getElementById('stats-content');
    if (!stats) return;

    stats.innerHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-number">${game.stats.totalRescues}</div>
                <div class="stat-title">Total Rescues</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${game.stats.livesSaved}</div>
                <div class="stat-title">Lives Saved</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">£${game.stats.totalEarned.toLocaleString()}</div>
                <div class="stat-title">Total Earned</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">${game.stats.failedMissions}</div>
                <div class="stat-title">Failed Missions</div>
            </div>
        </div>
        <hr style="margin: 30px 0;">
        <h3>Current Assets</h3>
        <div class="item-info" style="margin-top: 20px;">
            <div><span>Credits:</span><span>£${game.credits.toLocaleString()}</span></div>
            <div><span>Stations:</span><span>${game.stations.length}</span></div>
            <div><span>Lifeboats:</span><span>${game.vehicles.length}</span></div>
            <div><span>Active Missions:</span><span>${game.missions.length}</span></div>
        </div>
    `;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .map-marker {
        position: absolute;
        font-size: 24px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.3s;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }
    .map-marker:hover {
        transform: translate(-50%, -50%) scale(1.2);
    }
    .mission-marker.red {
        animation: pulse-red 2s infinite;
    }
    .mission-marker.yellow {
        animation: pulse-yellow 2s infinite;
    }
    .mission-marker.green {
        animation: pulse-green 2s infinite;
    }
    @keyframes pulse-red {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); filter: drop-shadow(0 0 10px #e63946); }
    }
    @keyframes pulse-yellow {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); filter: drop-shadow(0 0 8px #ffa500); }
    }
    @keyframes pulse-green {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.05); filter: drop-shadow(0 0 6px #4caf50); }
    }
`;
document.head.appendChild(style);

// Initialize game
let game;
window.onload = () => {
    try {
        game = new RNLIGame();
        console.log('RNLI Mission Chief loaded!');
    } catch (error) {
        console.error('Error loading game:', error);
        alert('Error loading game: ' + error.message);
    }
};

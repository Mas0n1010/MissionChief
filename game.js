// RNLI Mission Chief - Game Logic

class Map {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get 2D context from canvas');
            return;
        }

        this.stationPos = { x: 0.3, y: 0.6 }; // Station at Poole (relative position)

        this.resize();
        this.draw();

        // Redraw map periodically
        setInterval(() => this.draw(), 100);
    }

    resize() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        if (!container) return;

        this.canvas.width = container.clientWidth || 400;
        this.canvas.height = container.clientHeight || 400;
    }

    draw() {
        if (!this.canvas || !this.ctx) return;

        const { width, height } = this.canvas;
        const ctx = this.ctx;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw water with waves
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw some wave patterns
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            const offset = (Date.now() / 1000 + i * 20) % 100;
            for (let x = 0; x < width; x += 10) {
                const y = height * 0.3 + Math.sin((x + offset * 10) / 30) * 10 + i * 15;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Draw coastline (Poole Harbour area)
        ctx.fillStyle = '#d2b48c';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        ctx.quadraticCurveTo(width * 0.2, height * 0.4, width * 0.4, height * 0.5);
        ctx.lineTo(width * 0.4, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Draw harbour entrance
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(width * 0.28, height * 0.5, 10, height * 0.2);
        ctx.fillRect(width * 0.32, height * 0.5, 10, height * 0.2);
    }

    toPixels(relativePos) {
        if (!this.canvas) return { x: 0, y: 0 };

        return {
            x: relativePos.x * this.canvas.width,
            y: relativePos.y * this.canvas.height
        };
    }

    drawStation() {
        if (!this.canvas) return null;

        const pos = this.toPixels(this.stationPos);
        const marker = this.createMarker(pos.x, pos.y, 'station');
        return marker;
    }

    drawMission(mission) {
        if (!this.canvas || !mission || !mission.position) return null;

        const pos = this.toPixels(mission.position);
        const marker = this.createMarker(pos.x, pos.y, 'mission', mission.id);
        return marker;
    }

    drawLifeboat(lifeboat, mission) {
        if (!this.canvas || !mission || !mission.position) return null;

        // Interpolate position between station and mission
        const progress = lifeboat.progress || 0;
        const startPos = this.stationPos;
        const endPos = mission.position;

        const currentPos = {
            x: startPos.x + (endPos.x - startPos.x) * progress,
            y: startPos.y + (endPos.y - startPos.y) * progress
        };

        const pos = this.toPixels(currentPos);
        const marker = this.createMarker(pos.x, pos.y, 'lifeboat', lifeboat.id);
        return marker;
    }

    createMarker(x, y, type, id) {
        const marker = document.createElement('div');
        marker.className = `map-marker marker-${type}`;
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        if (id !== undefined) marker.dataset.id = id;
        return marker;
    }
}

class Game {
    constructor() {
        this.credits = 10000;
        this.rescues = 0;
        this.livesSaved = 0;
        this.lifeboats = [];
        this.missions = [];
        this.missionIdCounter = 0;
        this.lifeboatIdCounter = 0;
        this.map = new Map('map-canvas');

        // Initialize with one basic lifeboat
        this.addLifeboat('Atlantic 85');

        this.updateUI();
        this.startMissionGenerator();
        this.startMapUpdate();
    }

    addLifeboat(type) {
        const template = LIFEBOAT_TYPES[type];
        if (!template) return;

        const lifeboat = {
            id: this.lifeboatIdCounter++,
            name: `${type} ${this.lifeboatIdCounter}`,
            type: type,
            speed: template.speed,
            capacity: template.capacity,
            range: template.range,
            status: 'available',
            currentMission: null
        };

        this.lifeboats.push(lifeboat);
        this.updateUI();
    }

    purchaseLifeboat(type) {
        const template = LIFEBOAT_TYPES[type];
        if (!template) return;

        if (this.credits >= template.cost) {
            this.credits -= template.cost;
            this.addLifeboat(type);
            this.addLog(`Purchased new ${type} lifeboat!`, 'success');
        } else {
            this.addLog(`Insufficient credits to purchase ${type}`, 'info');
        }
    }

    generateMission() {
        const types = Object.keys(MISSION_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        const template = MISSION_TYPES[randomType];

        // Generate random position on the map (avoiding land)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 0.4 + 0.2; // 0.2 to 0.6 from station
        const position = {
            x: Math.max(0.35, Math.min(0.95, 0.3 + Math.cos(angle) * distance)),
            y: Math.max(0.1, Math.min(0.9, 0.6 + Math.sin(angle) * distance))
        };

        const mission = {
            id: this.missionIdCounter++,
            type: randomType,
            title: template.title,
            description: template.description,
            difficulty: template.difficulty,
            distance: Math.floor(Math.random() * 15) + 5, // 5-20 nautical miles
            peopleInDanger: Math.floor(Math.random() * template.maxPeople) + 1,
            reward: template.reward,
            urgent: Math.random() > 0.7,
            assignedLifeboat: null,
            startTime: Date.now(),
            position: position
        };

        this.missions.push(mission);
        this.addLog(`🚨 NEW EMERGENCY: ${mission.title} - ${mission.peopleInDanger} people in danger!`, 'emergency');
        this.updateUI();
        this.updateMap();
    }

    dispatchLifeboat(missionId, lifeboatId) {
        const mission = this.missions.find(m => m.id === missionId);
        const lifeboat = this.lifeboats.find(l => l.id === lifeboatId);

        if (!mission || !lifeboat || lifeboat.status !== 'available') return;

        mission.assignedLifeboat = lifeboatId;
        lifeboat.status = 'on-mission';
        lifeboat.currentMission = missionId;
        lifeboat.progress = 0;
        lifeboat.dispatchTime = Date.now();

        this.addLog(`${lifeboat.name} dispatched to ${mission.title}`, 'info');

        // Calculate mission duration based on distance and boat speed
        const duration = (mission.distance / lifeboat.speed) * 3600000; // Convert to milliseconds
        const missionTime = duration + (Math.random() * 60000 + 30000); // Add 30-90 seconds mission time

        lifeboat.missionDuration = missionTime;

        setTimeout(() => {
            this.completeMission(missionId, lifeboatId);
        }, missionTime);

        this.updateUI();
        this.updateMap();
    }

    completeMission(missionId, lifeboatId) {
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        const lifeboat = this.lifeboats.find(l => l.id === lifeboatId);

        if (missionIndex === -1 || !lifeboat) return;

        const mission = this.missions[missionIndex];

        // Success rate based on difficulty and boat capability
        const successRate = 0.9; // 90% success rate for now
        const success = Math.random() < successRate;

        if (success) {
            const livesSaved = mission.peopleInDanger;
            this.credits += mission.reward;
            this.rescues++;
            this.livesSaved += livesSaved;
            this.addLog(`✓ SUCCESS: ${lifeboat.name} saved ${livesSaved} people! +£${mission.reward}`, 'success');
        } else {
            this.addLog(`Mission partially successful. Some casualties reported.`, 'info');
        }

        // Remove mission and reset lifeboat
        this.missions.splice(missionIndex, 1);
        lifeboat.status = 'available';
        lifeboat.currentMission = null;
        lifeboat.progress = 0;

        this.updateUI();
        this.updateMap();
    }

    startMapUpdate() {
        // Update lifeboat positions on map every 100ms
        setInterval(() => {
            this.lifeboats.forEach(lifeboat => {
                if (lifeboat.status === 'on-mission' && lifeboat.dispatchTime) {
                    const elapsed = Date.now() - lifeboat.dispatchTime;
                    lifeboat.progress = Math.min(1, elapsed / lifeboat.missionDuration);
                }
            });
            this.updateMap();
        }, 100);
    }

    updateMap() {
        const markersContainer = document.getElementById('map-markers');
        if (!markersContainer || !this.map) return;

        markersContainer.innerHTML = '';

        // Draw station marker
        const stationMarker = this.map.drawStation();
        if (stationMarker) {
            markersContainer.appendChild(stationMarker);
        }

        // Draw mission markers
        this.missions.forEach(mission => {
            const missionMarker = this.map.drawMission(mission);
            if (missionMarker) {
                markersContainer.appendChild(missionMarker);
            }
        });

        // Draw lifeboat markers
        this.lifeboats.forEach(lifeboat => {
            if (lifeboat.status === 'on-mission') {
                const mission = this.missions.find(m => m.id === lifeboat.currentMission);
                if (mission) {
                    const lifeboatMarker = this.map.drawLifeboat(lifeboat, mission);
                    if (lifeboatMarker) {
                        markersContainer.appendChild(lifeboatMarker);
                    }
                }
            }
        });
    }

    addLog(message, type = 'info') {
        const logElement = document.getElementById('mission-log');
        const entry = document.createElement('p');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${message}`;
        logElement.insertBefore(entry, logElement.firstChild);

        // Keep only last 50 entries
        while (logElement.children.length > 50) {
            logElement.removeChild(logElement.lastChild);
        }
    }

    startMissionGenerator() {
        // Generate first mission after 5 seconds
        setTimeout(() => {
            this.generateMission();
        }, 5000);

        // Generate missions every 30-60 seconds
        setInterval(() => {
            if (this.missions.length < 5) { // Max 5 active missions
                this.generateMission();
            }
        }, Math.random() * 30000 + 30000);
    }

    updateUI() {
        // Update stats
        document.getElementById('credits').textContent = this.credits.toLocaleString();
        document.getElementById('rescues').textContent = this.rescues;
        document.getElementById('livesSaved').textContent = this.livesSaved;

        // Update lifeboat list
        const lifeboatList = document.getElementById('lifeboat-list');
        lifeboatList.innerHTML = '';

        this.lifeboats.forEach(lifeboat => {
            const card = document.createElement('div');
            card.className = 'lifeboat-card';
            card.innerHTML = `
                <h3>${lifeboat.name}</h3>
                <div class="lifeboat-info">
                    <span>Type: ${lifeboat.type}</span>
                    <span>Speed: ${lifeboat.speed} knots</span>
                </div>
                <div class="lifeboat-info">
                    <span>Capacity: ${lifeboat.capacity} people</span>
                    <span>Range: ${lifeboat.range} nm</span>
                </div>
                <span class="lifeboat-status ${lifeboat.status}">${lifeboat.status.toUpperCase()}</span>
            `;
            lifeboatList.appendChild(card);
        });

        // Update missions
        const missionList = document.getElementById('mission-list');
        missionList.innerHTML = '';

        if (this.missions.length === 0) {
            missionList.innerHTML = '<p class="no-missions">No active missions. Waiting for emergencies...</p>';
        } else {
            this.missions.forEach(mission => {
                const card = document.createElement('div');
                card.className = `mission-card ${mission.urgent ? 'mission-urgent' : ''}`;

                const availableLifeboats = this.lifeboats.filter(l => l.status === 'available');

                card.innerHTML = `
                    <h3>${mission.urgent ? '🚨 URGENT: ' : ''}${mission.title}</h3>
                    <p>${mission.description}</p>
                    <div class="mission-info">📍 Distance: ${mission.distance} nautical miles</div>
                    <div class="mission-info">👥 People in danger: ${mission.peopleInDanger}</div>
                    <div class="mission-info">💰 Reward: £${mission.reward}</div>
                    <div class="mission-info">Difficulty: ${mission.difficulty}</div>
                    ${mission.assignedLifeboat === null ? `
                        <select id="lifeboat-select-${mission.id}" style="margin: 10px 0; padding: 5px; width: 100%;">
                            <option value="">Select a lifeboat...</option>
                            ${availableLifeboats.map(lb =>
                                `<option value="${lb.id}">${lb.name} (${lb.type})</option>`
                            ).join('')}
                        </select>
                        <button class="btn btn-dispatch" onclick="dispatchToMission(${mission.id})">
                            Dispatch Lifeboat
                        </button>
                    ` : `
                        <div class="lifeboat-status on-mission">LIFEBOAT EN ROUTE</div>
                    `}
                `;
                missionList.appendChild(card);
            });
        }

        // Update shop
        const shopList = document.getElementById('shop-list');
        shopList.innerHTML = '';

        Object.entries(LIFEBOAT_TYPES).forEach(([type, data]) => {
            const card = document.createElement('div');
            card.className = 'shop-item';
            card.innerHTML = `
                <h3>${type}</h3>
                <p>${data.description}</p>
                <div class="lifeboat-info">
                    <span>Speed: ${data.speed} knots</span>
                    <span>Capacity: ${data.capacity}</span>
                </div>
                <div class="lifeboat-info">
                    <span>Range: ${data.range} nm</span>
                    <span>Class: ${data.class}</span>
                </div>
                <div class="shop-price">£${data.cost.toLocaleString()}</div>
                <button class="btn" onclick="game.purchaseLifeboat('${type}')"
                    ${this.credits < data.cost ? 'disabled' : ''}>
                    Purchase
                </button>
            `;
            shopList.appendChild(card);
        });
    }
}

// RNLI Lifeboat Types
const LIFEBOAT_TYPES = {
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
    'Trent Class': {
        class: 'All-Weather',
        speed: 25,
        capacity: 10,
        range: 250,
        cost: 2000000,
        description: 'Fast all-weather lifeboat with self-righting capability.'
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
        description: 'Small, lightweight inflatable ideal for beach rescues and close-to-shore operations.'
    }
};

// Mission Types
const MISSION_TYPES = {
    'Person in Water': {
        title: 'Person Overboard',
        description: 'Person has fallen overboard and is in the water. Immediate response required.',
        difficulty: 'Medium',
        maxPeople: 2,
        reward: 5000
    },
    'Vessel in Distress': {
        title: 'Vessel Taking on Water',
        description: 'Boat is taking on water and crew needs immediate evacuation.',
        difficulty: 'High',
        maxPeople: 8,
        reward: 8000
    },
    'Capsized Boat': {
        title: 'Capsized Vessel',
        description: 'Small craft has capsized. Crew in the water.',
        difficulty: 'High',
        maxPeople: 5,
        reward: 7000
    },
    'Medical Emergency': {
        title: 'Medical Emergency at Sea',
        description: 'Serious medical emergency aboard vessel. Patient needs urgent evacuation.',
        difficulty: 'Medium',
        maxPeople: 1,
        reward: 6000
    },
    'Cut Off by Tide': {
        title: 'People Cut Off by Tide',
        description: 'Group of people stranded on rocks, cut off by incoming tide.',
        difficulty: 'Low',
        maxPeople: 6,
        reward: 3000
    },
    'Broken Down Vessel': {
        title: 'Engine Failure',
        description: 'Vessel has lost power and is drifting towards rocks.',
        difficulty: 'Medium',
        maxPeople: 4,
        reward: 4000
    },
    'Yacht in Trouble': {
        title: 'Yacht in Distress',
        description: 'Yacht caught in rough seas with damaged rigging.',
        difficulty: 'High',
        maxPeople: 6,
        reward: 9000
    },
    'Fishing Vessel': {
        title: 'Fishing Vessel Emergency',
        description: 'Commercial fishing vessel in trouble with injured crew.',
        difficulty: 'High',
        maxPeople: 8,
        reward: 10000
    }
};

// Global function to dispatch lifeboat from mission card
function dispatchToMission(missionId) {
    const selectElement = document.getElementById(`lifeboat-select-${missionId}`);
    const lifeboatId = parseInt(selectElement.value);

    if (lifeboatId >= 0) {
        game.dispatchLifeboat(missionId, lifeboatId);
    }
}

// Initialize game
let game;
window.onload = () => {
    try {
        console.log('Initializing RNLI Mission Chief...');
        game = new Game();
        console.log('RNLI Mission Chief loaded successfully!');
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Error starting game: ' + error.message + '\n\nPlease check the browser console (F12) for more details.');
    }
};

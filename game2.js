import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// =================================
// TARTU VIRTUAL LIFE
// =================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ac8e8);

const camera = new THREE.PerspectiveCamera(
    70, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(20, 30, 10);
scene.add(sun);

// =================================
// GROUND AND CITY
// =================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0xe4e8ed })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const road = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.1, 250),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
);
road.position.y = 0.05;
scene.add(road);

function building(x, z, color, width = 12, depth = 10) {
    const house = new THREE.Mesh(
        new THREE.BoxGeometry(width, 12, depth),
        new THREE.MeshStandardMaterial({ color })
    );
    house.position.set(x, 6, z);
    scene.add(house);
    return house;
}

// City buildings
building(-20, -15, 0xe7bd96);
building(20, -15, 0xf2d5a5);
building(-20, 25, 0xd5e1ef);
building(20, 25, 0xf5c9c9);

// =================================
// PLAYER
// =================================

const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3366ff })
);

player.position.set(0, 1, 15);
scene.add(player);

// =================================
// GAME PROGRESS
// =================================

let stage = 0;
let score = 0;
let colaCollected = 0;
let ornamentsCollected = 0;
let skatingDone = false;
let universityDone = false;
let pastaDone = false;
let marikaCaught = false;

const stages = [
    '⛸️ Find the ice rink and go skating!',
    '🎄 Decorate the Christmas tree!',
    '🎓 Complete your university task!',
    '🍝 Visit Vapiano and order pasta!',
    '🏃 Catch Marika!'
];

// =================================
// GAME INTERFACE
// =================================

const panel = document.createElement('div');

panel.style.cssText = `
position:absolute;
top:10px;
left:10px;
z-index:10;
background:rgba(0,0,0,0.8);
color:white;
padding:12px;
border-radius:12px;
font-family:Arial;
max-width:260px;
`;

panel.innerHTML = `
<h3>🌆 Tartu Virtual Life</h3>
<p id="mission"></p>
<p id="score">⭐ Points: 0</p>
<p id="cola">🥤 Coca-Cola: 0</p>
<p id="message">Welcome to Tartu!</p>
`;

document.body.appendChild(panel);

const mission = document.getElementById('mission');
const scoreText = document.getElementById('score');
const colaText = document.getElementById('cola');
const message = document.getElementById('message');

function updateUI() {
    mission.innerText = stages[stage] || '🎉 Adventure completed!';
    scoreText.innerText = '⭐ Points: ' + score;
    colaText.innerText = '🥤 Coca-Cola: ' + colaCollected;
}

updateUI();

// =================================
// ICE RINK
// =================================

const rink = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.2, 16),
    new THREE.MeshStandardMaterial({
        color: 0x9ceaff,
        metalness: 0.4,
        roughness: 0.2
    })
);

rink.position.set(-30, 0.1, 10);
scene.add(rink);

function makeSign(text, x, z) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(text, 20, 80);

    const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 3),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(canvas)
        })
    );

    sign.position.set(x, 9, z);
    scene.add(sign);
}

makeSign('ICE RINK', -30, 1);

// =================================
// CHRISTMAS TREE
// =================================

const treePosition = new THREE.Vector3(30, 0, 15);

const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x754321 })
);

trunk.position.set(30, 1.5, 15);
scene.add(trunk);

for (let i = 0; i < 4; i++) {
    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(5 - i * 0.8, 5, 10),
        new THREE.MeshStandardMaterial({ color: 0x08752b })
    );

    leaves.position.set(30, 4 + i * 2.5, 15);
    scene.add(leaves);
}

const ornaments = [];

for (let i = 0; i < 12; i++) {
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({
            color: [0xff0000, 0xffcc00, 0x0088ff, 0xff55aa][i % 4]
        })
    );

    const angle = i * Math.PI / 6;

    ball.position.set(
        30 + Math.cos(angle) * 3,
        4 + (i % 4) * 2,
        15 + Math.sin(angle) * 3
    );

    scene.add(ball);
    ornaments.push(ball);
}

// =================================
// UNIVERSITY
// =================================

building(0, -40, 0xe6c49a, 20, 14);
makeSign('UNIVERSITY', 0, -47);

// =================================
// VAPIANO
// =================================

building(35, -40, 0xe52b2b, 16, 12);
makeSign('VAPIANO', 35, -46);

// =================================
// COCA-COLA COLLECTION
// =================================

const bottles = [];

function createCola(x, z) {
    const bottle = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0xe60000 })
    );

    bottle.add(body);

    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    cap.position.y = 0.5;
    bottle.add(cap);

    bottle.position.set(x, 0.55, z);
    scene.add(bottle);
    bottles.push(bottle);
}

[
    [-10, 0], [10, 10], [0, -10],
    [25, 10], [-25, 15], [40, 0],
    [-40, -20], [15, -35], [-10, 40],
    [35, 35], [0, 55], [-30, -45]
].forEach(([x, z]) => createCola(x, z));

// =================================
// MARIKA — FINAL CHALLENGE
// =================================

const marika = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.5, 1, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0xff69b4 })
);

marika.position.set(50, 1, 50);
scene.add(marika);

marika.visible = false;

// =================================
// CONTROLS
// =================================

const keys = {};

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

// Phone movement buttons
const controls = document.createElement('div');

controls.style.cssText = `
position:absolute;
bottom:20px;
left:15px;
z-index:20;
display:grid;
grid-template-columns:55px 55px 55px;
gap:5px;
`;

const directions = [
    ['up', '⬆️', 0, 1],
    ['left', '⬅️', 1, 0],
    ['down', '⬇️', 2, 1],
    ['right', '➡️', 1, 2]
];

const touchKeys = {};

directions.forEach(([name, icon, row, col]) => {
    const button = document.createElement('button');

    button.innerText = icon;
    button.style.cssText = `
    width:55px;height:55px;
    font-size:23px;border-radius:12px;
    border:0;background:#ffffffcc;
    `;

    button.style.gridRow = row + 1;
    button.style.gridColumn = col + 1;

    const key = {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd'
    }[name];

    button.addEventListener('pointerdown', e => {
        e.preventDefault();
        touchKeys[key] = true;
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach(event => {
        button.addEventListener(event, () => {
            touchKeys[key] = false;
        });
    });

    controls.appendChild(button);
});

document.body.appendChild(controls);

// ACTION BUTTON
const actionButton = document.createElement('button');

actionButton.innerText = 'ACTION';
actionButton.style.cssText = `
position:absolute;
bottom:35px;
right:20px;
z-index:20;
padding:20px;
border-radius:50%;
border:0;
background:#ffcc00;
font-weight:bold;
`;

document.body.appendChild(actionButton);

let actionPressed = false;

actionButton.addEventListener('click', () => {
    actionPressed = true;
});

// =================================
// INTERACTION
// =================================

function distanceTo(x, z) {
    return Math.sqrt(
        (player.position.x - x) ** 2 +
        (player.position.z - z) ** 2
    );
}

function interact() {
    if (stage === 0 && distanceTo(-30, 10) < 13) {
        skatingDone = true;
        score += 100;
        stage = 1;
        message.innerText = '⛸️ Skating completed! +100 points';
    }

    else if (stage === 1 && distanceTo(30, 15) < 9) {
        if (ornamentsCollected < 3) {
            const ball = ornaments[ornamentsCollected];
            ball.position.y += 1;
            ornamentsCollected++;
            message.innerText = '🎄 Ornament added! ' +
                ornamentsCollected + '/3';
        }

        if (ornamentsCollected >= 3) {
            score += 100;
            stage = 2;
            message.innerText = '🎄 Tree decorated! +100 points';
        }
    }

    else if (stage === 2 && distanceTo(0, -40) < 15) {
        universityDone = true;
        score += 100;
        stage = 3;
        message.innerText = '🎓 University task completed! +100 points';
    }

    else if (stage === 3 && distanceTo(35, -40) < 15) {
        pastaDone = true;
        score += 100;
        stage = 4;
        marika.visible = true;
        message.innerText = '🍝 Pasta eaten! +100 points. Find Marika!';
    }

    else if (stage === 4 && distanceTo(
        marika.position.x, marika.position.z
    ) < 2.5) {
        marikaCaught = true;
        marika.visible = false;
        score += 200;
        stage = 5;
        message.innerText = '🎉 You caught Marika! Adventure completed!';
    }

    updateUI();
}

// =================================
// MAIN GAME LOOP
// =================================

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.16;

    if (keys.w || touchKeys.w) player.position.z -= speed;
    if (keys.s || touchKeys.s) player.position.z += speed;
    if (keys.a || touchKeys.a) player.position.x -= speed;
    if (keys.d || touchKeys.d) player.position.x += speed;

    // Coca-Cola can be collected at any stage
    for (let i = bottles.length - 1; i >= 0; i--) {
        if (distanceTo(
            bottles[i].position.x,
            bottles[i].position.z
        ) < 1.5) {
            scene.remove(bottles[i]);
            bottles.splice(i, 1);
            colaCollected++;
            score += 10;
            message.innerText = '🥤 Coca-Cola collected! +10 points';
            updateUI();
        }
    }

    // Marika runs away during the final challenge
    if (marika.visible && !marikaCaught) {
        const dx = marika.position.x - player.position.x;
        const dz = marika.position.z - player.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 12 && distance > 0) {
            marika.position.x += (dx / distance) * 0.06;
            marika.position.z += (dz / distance) * 0.06;
        }
    }

    if (actionPressed) {
        interact();
        actionPressed = false;
    }

    camera.position.set(
        player.position.x,
        8,
        player.position.z + 12
    );

    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

animate();

// =================================
// RESIZE
// =================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

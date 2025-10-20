import * as THREE from 'three';

// Funzione helper per creare un edificio e aggiungerlo alla scena/ostacoli
function createBuilding(scene, obstacles, position, size, color = 0x3a2a1a) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshStandardMaterial({ 
        color, 
        roughness: 0.9, 
        metalness: 0.1 
    });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(position.x, size.y / 2, position.z);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
    obstacles.push(building);
}

// Funzione helper per creare un albero stilizzato
function createTree(scene, obstacles, position) {
    const treeMaterialTrunk = new THREE.MeshStandardMaterial({ color: 0x4a2e1a });
    const treeMaterialLeaves = new THREE.MeshStandardMaterial({ color: 0x1a4a1a });
    
    const trunkHeight = 3 + Math.random() * 2;
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, trunkHeight, 8);
    const leavesGeometry = new THREE.ConeGeometry(1.5, 6, 8);

    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeometry, treeMaterialTrunk);
    trunk.castShadow = true;
    
    const leaves = new THREE.Mesh(leavesGeometry, treeMaterialLeaves);
    leaves.position.y = trunkHeight / 2 + 2;
    leaves.castShadow = true;
    
    tree.add(trunk);
    tree.add(leaves);
    tree.position.set(position.x, trunkHeight / 2, position.z);
    
    scene.add(tree);
    
    // Aggiungiamo solo il tronco come ostacolo fisico per semplicità
    const trunkCollider = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, trunkHeight, 8));
    trunkCollider.position.copy(tree.position);
    obstacles.push(trunkCollider); // Non lo aggiungiamo alla scena, serve solo per il calcolo delle collisioni
}

// Funzione principale che costruisce l'intera scena
export function createPiedmontScene(scene) {
    const obstacles = [];

    // 1. TERRENO ERBOSO
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.95 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 2. EDIFICI SPARSI
    const buildingPositions = [
        { pos: new THREE.Vector3(-15, 0, -10), size: new THREE.Vector3(8, 4, 12) },
        { pos: new THREE.Vector3(10, 0, -15), size: new THREE.Vector3(10, 5, 8) },
        { pos: new THREE.Vector3(15, 0, 10), size: new THREE.Vector3(6, 3, 6) },
        { pos: new THREE.Vector3(-5, 0, 18), size: new THREE.Vector3(14, 4, 7) },
        { pos: new THREE.Vector3(0, 0, 0), size: new THREE.Vector3(5, 3, 5) } // Un piccolo fienile al centro
    ];

    buildingPositions.forEach(b => {
        createBuilding(scene, obstacles, b.pos, b.size);
    });

    // 3. ALBERI PER CREARE COPERTURE
    createTree(scene, obstacles, new THREE.Vector3(20, 0, -20));
    createTree(scene, obstacles, new THREE.Vector3(-25, 0, 5));
    createTree(scene, obstacles, new THREE.Vector3(8, 0, 25));
    createTree(scene, obstacles, new THREE.Vector3(-18, 0, 25));


    // 4. PERCORSI DEI NEMICI ADATTATI ALLA NUOVA SCENA
    const enemyRoutes = [
        // Sentinella 1: Gira intorno all'edificio in basso a sinistra
        { x: -18, z: 0, route: [{x: -18, z: 0}, {x: -18, z: -18}, {x: -8, z: -18}, {x: -8, z: 0}] },
        // Sentinella 2: Pattuglia l'area a destra
        { x: 10, z: 0, route: [{x: 10, z: 0}, {x: 20, z: -5}, {x: 10, z: -10}] },
        // Sentinella 3: Vigila l'area in alto
        { x: -10, z: 25, route: [{x: -10, z: 25}, {x: 15, z: 25}] }
    ];

    return { obstacles, enemyRoutes };
}
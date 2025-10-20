import * as THREE from 'three';
import { Enemy } from './enemy.js';
import { createPiedmontScene } from './scene.js'; 

function initMiniGame() {
    const canvas = document.querySelector('#gioco-3d-canvas');
    if (!canvas) {
        console.error('Canvas per il mini-gioco non trovato!');
        return;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x0a0f1a);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x050810, 0.05);

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

    const ambientLight = new THREE.AmbientLight(0x2a3f5f, 0.15);
    scene.add(ambientLight);
    
    const moonLight = new THREE.DirectionalLight(0x6688aa, 0.4);
    moonLight.position.set(15, 25, 10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.left = -30;
    moonLight.shadow.camera.right = 30;
    moonLight.shadow.camera.top = 30;
    moonLight.shadow.camera.bottom = -30;
    scene.add(moonLight);

    // --- CREAZIONE SCENA DELEGATA ---
    const { obstacles, enemyRoutes } = createPiedmontScene(scene);

    const player = {
        position: new THREE.Vector3(0, 1, 40), // <-- POSIZIONE MOLTO PIÙ LONTANA
        rotation: Math.PI, // Guarda sempre verso il centro della scena
        speed: 0.15,
        crouching: false,
        bobbing: 0
    };
    camera.position.copy(player.position);

    const enemies = [];
    enemyRoutes.forEach(data => {
        enemies.push(new Enemy(scene, data));
    });
    
    let gameState = { detected: false, eliminazioni: 0, gameOver: false, victory: false, isGameActive: false };

    const startScreen = document.getElementById('minigioco-start-screen');
    const startButton = document.getElementById('minigioco-start-button');
    if(!startScreen || !startButton) return;

    const hudDiv = document.createElement('div');
    hudDiv.style.cssText = `position: absolute; top: 20px; left: 20px; color: white; font-family: sans-serif; background: rgba(10, 10, 10, 0.7); padding: 15px; border-left: 3px solid #c8a45c; backdrop-filter: blur(5px); z-index: 10; display: none;`;
    hudDiv.innerHTML = `
        <div style="font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: bold; margin-bottom: 10px; color: #c8a45c; text-transform: uppercase;">INFILTRAZIONE</div>
        <div style="margin: 8px 0; font-size: 1rem;"><span>ELIMINAZIONI:</span> <span id="eliminazioni" style="font-weight: bold;">0</span>/3</div>
        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; color: #a0aec0;">
            <div style="margin: 4px 0;"><kbd style="background: #222; padding: 2px 5px; border-radius: 3px; border: 1px solid #444;">W,A,S,D</kbd> Movimento</div>
            <div style="margin: 4px 0;"><kbd style="background: #222; padding: 2px 5px; border-radius: 3px; border: 1px solid #444;">MOUSE</kbd> Visuale</div>
            <div style="margin: 4px 0;"><kbd style="background: #222; padding: 2px 5px; border-radius: 3px; border: 1px solid #444;">C</kbd> Accovacciati</div>
            <div style="margin: 4px 0;"><kbd style="background: #222; padding: 2px 5px; border-radius: 3px; border: 1px solid #444;">E</kbd> Elimina</div>
            <div style="margin: 4px 0;"><kbd style="background: #222; padding: 2px 5px; border-radius: 3px; border: 1px solid #444;">ESC</kbd> Sblocca Mouse</div>
        </div>`;
    canvas.parentElement.appendChild(hudDiv);
    
    const statusDiv = document.createElement('div');
    statusDiv.style.cssText = `position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); padding: 8px 20px; font-family: 'Cinzel', serif; color: white; background: rgba(40, 120, 40, 0.7); border: 1px solid rgba(80, 200, 80, 0.5); font-weight: bold; font-size: 1rem; z-index: 10; transition: all 0.3s ease; text-transform: uppercase; display: none;`;
    statusDiv.textContent = 'NON RILEVATO';
    canvas.parentElement.appendChild(statusDiv);
    
    const overlayDiv = document.createElement('div');
    overlayDiv.style.cssText = `position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); z-index: 20; animation: fadeIn 0.5s ease; text-align: center; padding: 20px;`;
    canvas.parentElement.appendChild(overlayDiv);

    function updateUI() {
        document.getElementById('eliminazioni').textContent = gameState.eliminazioni;
        if (gameState.detected) {
            statusDiv.style.background = 'rgba(180, 40, 40, 0.7)';
            statusDiv.style.borderColor = 'rgba(255, 80, 80, 0.7)';
            statusDiv.textContent = 'SCOPERTO!';
        }
    }

    function showUI(show) {
        const displayValue = show ? 'block' : 'none';
        hudDiv.style.display = displayValue;
        statusDiv.style.display = displayValue;
    }

    function restartGame() {
        overlayDiv.style.display = 'none';
        scene.background.set(skyColor);
        gameState = { detected: false, eliminazioni: 0, gameOver: false, victory: false, isGameActive: true };
        player.position.set(0, 1, 40);
        player.rotation = Math.PI;
        enemies.forEach(enemy => {
            const initialPos = enemy.route[0];
            enemy.group.visible = true;
            enemy.group.position.set(initialPos.x, 1, initialPos.z);
            enemy.currentPoint = 0;
            enemy.awareness = 0;
            enemy.eliminated = false;
            enemy.body.rotation.set(0, 0, 0);
        });
        statusDiv.style.background = 'rgba(40, 120, 40, 0.7)';
        statusDiv.style.borderColor = 'rgba(80, 200, 80, 0.5)';
        statusDiv.textContent = 'NON RILEVATO';
        updateUI();
        showUI(true);
        animate();
    }

    function showGameOver() {
        gameState.isGameActive = false;
        showUI(false);
        overlayDiv.style.display = 'flex';
        overlayDiv.innerHTML = `<div class="minigioco-overlay-contenuto" style="animation: slideUp 0.5s ease;"><h3 class="minigioco-titolo" style="color: #b73737;">SCOPERTO</h3><p class="minigioco-istruzioni">La vigilanza è la prima arma di un partigiano. Un momento di distrazione può costare tutto.</p><button id="retry-button" class="pulsante-minigioco">RIPROVA</button></div>`;
        document.getElementById('retry-button').addEventListener('click', restartGame);
    }

    function showVictory() {
        gameState.isGameActive = false;
        showUI(false);
        overlayDiv.style.display = 'flex';
        overlayDiv.innerHTML = `<div class="minigioco-overlay-contenuto" style="animation: slideUp 0.5s ease;"><h3 class="minigioco-titolo">MISSIONE COMPLETATA</h3><p class="minigioco-istruzioni">L'organizzazione e la determinazione vincono sempre sulla forza bruta. Questa è solo l'inizio della RESISTENZA.</p><button id="replay-button" class="pulsante-minigioco">RIGIOCA</button></div>`;
        document.getElementById('replay-button').addEventListener('click', restartGame);
    }

    startButton.addEventListener('click', () => { startScreen.style.display = 'none'; gameState.isGameActive = true; showUI(true); lockPointer(); animate(); });
    const keys = {};
    window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if (e.key.toLowerCase() === 'c' && gameState.isGameActive) { player.crouching = !player.crouching; } });
    window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    let isPointerLocked = false;
    const lockPointer = () => canvas.requestPointerLock();
    canvas.addEventListener('click', () => { if (gameState.isGameActive && !isPointerLocked) lockPointer(); });
    const onMouseMove = (event) => { if (isPointerLocked) { player.rotation -= event.movementX * 0.002; } };
    const onPointerLockChange = () => { if (document.pointerLockElement === canvas) { isPointerLocked = true; document.addEventListener('mousemove', onMouseMove, false); } else { isPointerLocked = false; document.removeEventListener('mousemove', onMouseMove, false); } };
    document.addEventListener('pointerlockchange', onPointerLockChange, false);

    function animate() {
        if (!gameState.isGameActive) return;
        requestAnimationFrame(animate);

        const previousPosition = player.position.clone();
        const moveSpeed = player.crouching ? player.speed * 0.5 : player.speed;
        const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation);
        const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation);

        let isMoving = false;
        if (keys['w']) { player.position.addScaledVector(forward, moveSpeed); isMoving = true; }
        if (keys['s']) { player.position.addScaledVector(forward, -moveSpeed); isMoving = true; }
        if (keys['a']) { player.position.addScaledVector(right, -moveSpeed); isMoving = true; }
        if (keys['d']) { player.position.addScaledVector(right, moveSpeed); isMoving = true; }

        const playerBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(player.position.x, 0.5, player.position.z), new THREE.Vector3(0.5, 1, 0.5));
        for (const obstacle of obstacles) {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            if (playerBox.intersectsBox(obstacleBox)) { player.position.copy(previousPosition); break; }
        }
        
        if (isMoving) { player.bobbing += 0.15; } else { player.bobbing *= 0.9; }
        player.position.x = Math.max(-45, Math.min(45, player.position.x));
        player.position.z = Math.max(-45, Math.min(45, player.position.z));
        camera.position.copy(player.position);
        camera.position.y = (player.crouching ? 0.7 : 1.6) + (Math.sin(player.bobbing) * 0.05);
        camera.rotation.y = player.rotation;
        camera.rotation.z = Math.sin(player.bobbing * 0.5) * 0.01;

        enemies.forEach((enemy) => {
            enemy.update(player, camera);

            if (enemy.awareness >= 1.0 && !gameState.detected) {
                gameState.detected = true;
                gameState.gameOver = true;
                scene.background.set(0xff0000);
                setTimeout(()=> scene.background.set(skyColor), 100);
                updateUI();
                setTimeout(showGameOver, 500);
            }

            const distanceToPlayer = player.position.distanceTo(enemy.group.position);
            const toPlayerDir = new THREE.Vector3().subVectors(player.position, enemy.group.position).normalize();
            const enemyForwardDir = new THREE.Vector3();
            enemy.group.getWorldDirection(enemyForwardDir);
            const angle = toPlayerDir.angleTo(enemyForwardDir);
            const isBehind = angle > Math.PI * 0.7;
            
            if (keys['e'] && distanceToPlayer < 2 && isBehind && !enemy.eliminated) {
                enemy.eliminate();
                gameState.eliminazioni++;
                keys['e'] = false;
                updateUI();
                if (gameState.eliminazioni === enemies.length) {
                    gameState.victory = true;
                    setTimeout(showVictory, 1000);
                }
            }
        });

        renderer.render(scene, camera);
    }

    function handleResize() { camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.clientWidth, canvas.clientHeight); }
    window.addEventListener('resize', handleResize);
}

document.addEventListener('DOMContentLoaded', () => {
    initMiniGame();
});
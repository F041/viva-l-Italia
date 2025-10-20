import * as THREE from 'three';

export class Enemy {
    constructor(scene, initialData) {
        this.route = initialData.route;
        this.speed = 0.02;
        this.detectionRange = 18;
        this.visionAngle = Math.PI / 2; // 90 gradi

        // Stato
        this.currentPoint = 0;
        this.awareness = 0;
        this.eliminated = false;
        this.walkCycle = 0;

        // Creazione del modello 3D
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a12, roughness: 0.8 });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;

        const headGeometry = new THREE.SphereGeometry(0.28, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xa48964, roughness: 0.7 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.1;
        this.body.add(head);

        const helmetGeometry = new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3a1a, metalness: 0.3, roughness: 0.6 });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 0.15;
        head.add(helmet);
        
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a12 });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.3, 0);
        leftArm.rotation.z = 0.3;
        this.body.add(leftArm);
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.3, 0);
        rightArm.rotation.z = -0.3;
        this.body.add(rightArm);

        this.group = new THREE.Group();
        this.group.add(this.body);
        this.group.position.set(initialData.x, 1, initialData.z);
        scene.add(this.group);
    }

    // Metodo chiamato ad ogni frame per aggiornare il nemico
    update(player, camera) {
        if (this.eliminated) return;

        // 1. Animazione e pattugliamento
        this.walkCycle += 0.1;
        this.body.rotation.x = Math.sin(this.walkCycle) * 0.05;
        this.body.rotation.z = Math.cos(this.walkCycle * 0.5) * 0.03;

        const target = this.route[this.currentPoint];
        const direction = new THREE.Vector3(target.x - this.group.position.x, 0, target.z - this.group.position.z);
        
        if (direction.length() < 0.5) {
            this.currentPoint = (this.currentPoint + 1) % this.route.length;
        } else {
            direction.normalize();
            this.group.position.add(direction.multiplyScalar(this.speed));
            this.group.rotation.y = Math.atan2(direction.x, direction.z);
        }

        // 2. Logica di rilevamento
        const toPlayer = new THREE.Vector3().subVectors(player.position, this.group.position);
        const distanceToPlayer = toPlayer.length();
        const angleToPlayer = Math.atan2(toPlayer.x, toPlayer.z);
        const enemyForward = this.group.rotation.y;
        let angleDiff = angleToPlayer - enemyForward;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
        const inFOV = Math.abs(angleDiff) < this.visionAngle / 2;
        const detectionMod = player.crouching ? 0.4 : 1.0;
        const range = this.detectionRange * detectionMod;

        if (inFOV && distanceToPlayer < range) {
            const awarenessIncrease = (1.0 - (distanceToPlayer / range)) * 0.02;
            this.awareness = Math.min(this.awareness + awarenessIncrease, 1.0);
        } else {
            this.awareness = Math.max(this.awareness - 0.005, 0.0);
        }
    }

    // Metodo per eliminare il nemico
    eliminate() {
        if (this.eliminated) return;
        this.eliminated = true;

        let fadeOut = 0;
        const fadeInterval = setInterval(() => {
            fadeOut += 0.05;
            this.group.position.y = 1 - fadeOut;
            this.body.rotation.x += 0.1;
            if (fadeOut >= 1) {
                this.group.visible = false;
                clearInterval(fadeInterval);
            }
        }, 16);
    }
}
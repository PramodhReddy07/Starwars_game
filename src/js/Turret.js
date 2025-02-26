import * as THREE from 'three';

export class Turret {
    constructor(scene, position) {
        this.scene = scene;
        this.mesh = null;
        this.health = 100;
        this.isDestroyed = false;
        this.rotationSpeed = 0.01;

        this.createTurret(position);
    }

    createTurret(position) {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 1, 8);
        const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, wireframe: true });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);

        // Turret head
        const headGeometry = new THREE.SphereGeometry(0.8, 8, 8);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1;
        group.add(head);

        // Cannon
        const cannonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
        const cannonMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true });
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.position.y = 1;
        cannon.position.z = 1;
        cannon.rotation.x = Math.PI / 2;
        group.add(cannon);

        group.position.copy(position);
        this.mesh = group;
        this.scene.add(group);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && !this.isDestroyed) {
            this.destroy();
        }
    }

    destroy() {
        this.isDestroyed = true;
        // Change color to red to indicate destruction
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.color.setHex(0xff0000);
            }
        });
    }

    update(playerPosition) {
        if (this.isDestroyed) return;

        // Make turret track player
        const direction = new THREE.Vector3();
        direction.subVectors(playerPosition, this.mesh.position);
        direction.y = 0; // Keep turret level
        
        // Calculate the angle to rotate
        const angle = Math.atan2(direction.x, direction.z);
        
        // Smoothly rotate towards the player
        const currentAngle = this.mesh.rotation.y;
        const angleDiff = angle - currentAngle;
        
        // Normalize the angle difference
        const normalizedAngleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        
        // Apply rotation
        this.mesh.rotation.y += Math.sign(normalizedAngleDiff) * 
                               Math.min(Math.abs(normalizedAngleDiff), this.rotationSpeed);
    }

    checkCollision(laser) {
        if (this.isDestroyed) return false;

        // Simple distance-based collision detection
        const distance = this.mesh.position.distanceTo(laser.mesh.position);
        return distance < 2; // Adjust collision radius as needed
    }
} 
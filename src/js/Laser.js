import * as THREE from 'three';

export class Laser {
    constructor(scene, position, direction) {
        this.scene = scene;
        this.speed = 2;
        this.maxDistance = 1000;
        this.distanceTraveled = 0;
        this.direction = direction;

        // Create laser beam
        const geometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);

        // Position and rotate the laser
        this.mesh.position.copy(position);
        this.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        scene.add(this.mesh);
    }

    update() {
        // Move laser in its direction
        const movement = this.direction.clone().multiplyScalar(this.speed);
        this.mesh.position.add(movement);
        this.distanceTraveled += this.speed;

        // Return true if laser should be removed
        return this.distanceTraveled > this.maxDistance;
    }

    remove() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
} 
import * as THREE from 'three';

export class Asteroid {
    constructor(scene, position, size = 1) {
        this.scene = scene;
        this.mesh = null;
        this.rotationSpeed = {
            x: Math.random() * 0.02 - 0.01,
            y: Math.random() * 0.02 - 0.01,
            z: Math.random() * 0.02 - 0.01
        };

        this.createAsteroid(position, size);
    }

    createAsteroid(position, size) {
        // Create irregular asteroid shape
        const geometry = new THREE.IcosahedronGeometry(size, 0);
        
        // Randomize vertices to make it more irregular
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] *= 0.8 + Math.random() * 0.4;
            vertices[i + 1] *= 0.8 + Math.random() * 0.4;
            vertices[i + 2] *= 0.8 + Math.random() * 0.4;
        }

        const material = new THREE.MeshBasicMaterial({ 
            color: 0x808080, 
            wireframe: true 
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);
        
        // Random initial rotation
        this.mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        this.scene.add(this.mesh);
    }

    update() {
        // Rotate asteroid
        this.mesh.rotation.x += this.rotationSpeed.x;
        this.mesh.rotation.y += this.rotationSpeed.y;
        this.mesh.rotation.z += this.rotationSpeed.z;
    }

    checkCollision(object) {
        // Simple distance-based collision detection
        const distance = this.mesh.position.distanceTo(object.position);
        const collisionThreshold = this.mesh.geometry.parameters.radius * 1.2; // Add some buffer
        return distance < collisionThreshold;
    }
} 
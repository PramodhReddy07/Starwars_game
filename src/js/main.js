import * as THREE from 'three';
import { XWing } from './XWing';
import { Turret } from './Turret';
import { Asteroid } from './Asteroid';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer();
        this.xwing = null;
        this.turrets = [];
        this.asteroids = [];
        this.score = 0;
        
        this.init();
        this.setupScene();
        this.animate();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Add score display
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '20px';
        this.scoreElement.style.left = '20px';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.fontFamily = 'Arial';
        this.scoreElement.style.fontSize = '24px';
        document.body.appendChild(this.scoreElement);
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    setupScene() {
        // Position camera
        this.camera.position.set(0, 2, 10);
        this.camera.lookAt(0, 0, 0);

        // Add some stars (temporary placeholder for space environment)
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF });
        
        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);

        // Create X-Wing
        this.xwing = new XWing(this.scene);

        // Add turrets
        this.createTurrets();

        // Add asteroids
        this.createAsteroids();
    }

    createTurrets() {
        // Create a few turrets at different positions
        const turretPositions = [
            new THREE.Vector3(-20, -10, -50),
            new THREE.Vector3(20, -10, -50),
            new THREE.Vector3(0, -10, -80),
            new THREE.Vector3(-30, -10, -100),
            new THREE.Vector3(30, -10, -100)
        ];

        turretPositions.forEach(position => {
            this.turrets.push(new Turret(this.scene, position));
        });
    }

    createAsteroids() {
        // Create several asteroids at random positions
        for (let i = 0; i < 15; i++) {
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 40,
                -(Math.random() * 200)
            );
            const size = 1 + Math.random() * 2; // Random size between 1 and 3
            this.asteroids.push(new Asteroid(this.scene, position, size));
        }
    }

    checkCollisions() {
        // Check laser hits on turrets
        if (this.xwing && this.xwing.lasers) {
            this.xwing.lasers.forEach((laser, laserIndex) => {
                // Check turret hits
                this.turrets.forEach(turret => {
                    if (turret.checkCollision(laser)) {
                        turret.takeDamage(34); // 3 hits to destroy
                        laser.remove();
                        this.xwing.lasers.splice(laserIndex, 1);
                        if (turret.isDestroyed) {
                            this.score += 100;
                            this.updateScoreDisplay();
                        }
                    }
                });

                // Check asteroid hits
                this.asteroids.forEach(asteroid => {
                    if (asteroid.checkCollision(laser.mesh)) {
                        laser.remove();
                        this.xwing.lasers.splice(laserIndex, 1);
                    }
                });
            });
        }

        // Check X-Wing collision with asteroids
        if (this.xwing && this.xwing.mesh) {
            this.asteroids.forEach(asteroid => {
                if (asteroid.checkCollision(this.xwing.mesh)) {
                    console.log('Ship hit asteroid!');
                    // You could add game over logic here
                }
            });
        }
    }

    updateCamera() {
        if (this.xwing && this.xwing.mesh) {
            // Follow the X-Wing from behind and slightly above
            const idealOffset = new THREE.Vector3(0, 2, 10);
            const idealLookat = new THREE.Vector3(0, 0, -10);
            
            // Transform the ideal offset to the ship's local space
            const offset = idealOffset.clone();
            offset.applyQuaternion(this.xwing.mesh.quaternion);
            offset.add(this.xwing.mesh.position);
            
            // Transform the ideal lookat to the ship's local space
            const lookat = idealLookat.clone();
            lookat.applyQuaternion(this.xwing.mesh.quaternion);
            lookat.add(this.xwing.mesh.position);
            
            // Update camera position and orientation
            this.camera.position.lerp(offset, 0.1);
            this.camera.lookAt(this.xwing.mesh.position);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.xwing) {
            this.xwing.update();
            this.updateCamera();
        }

        // Update turrets
        this.turrets.forEach(turret => {
            if (this.xwing) {
                turret.update(this.xwing.mesh.position);
            }
        });

        // Update asteroids
        this.asteroids.forEach(asteroid => {
            asteroid.update();
        });

        // Check for collisions
        this.checkCollisions();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
}); 
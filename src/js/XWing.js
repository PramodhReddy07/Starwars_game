import * as THREE from 'three';
import { Laser } from './Laser';
import { SoundManager } from './SoundManager';

export class XWing {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.lasers = [];
        this.cannonPositions = [];
        this.lastShotTime = 0;
        this.shootingDelay = 250; // Minimum time between shots in milliseconds

        // Initialize sound manager
        this.soundManager = new SoundManager();
        this.soundManager.init();
        this.engineSound = null;

        this.speed = {
            velocity: 0,
            rotation: 0.05,
            maxVelocity: 0.5,
            boostVelocity: 1.0,
            acceleration: 0.01,
            deceleration: 0.005
        };
        this.movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            rollLeft: false,
            rollRight: false,
            boost: false,
            shooting: false
        };
        
        // Movement boundaries
        this.boundaries = {
            x: { min: -100, max: 100 },
            y: { min: -50, max: 50 },
            z: { min: -1000, max: 1000 }
        };

        this.createShip();
        this.setupControls();
    }

    createShip() {
        // Create a more detailed temporary ship using multiple geometries
        const shipGroup = new THREE.Group();

        // Main body (fuselage)
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        shipGroup.add(body);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(6, 0.1, 1);
        const wingMaterial = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.2;
        shipGroup.add(wings);

        // Cannons
        const cannonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const cannonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        
        // Store cannon positions for laser firing
        const cannonOffsets = [
            new THREE.Vector3(2.5, 0.2, 0),
            new THREE.Vector3(-2.5, 0.2, 0)
        ];

        cannonOffsets.forEach(offset => {
            const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
            cannon.position.copy(offset);
            shipGroup.add(cannon);
            this.cannonPositions.push(offset);
        });

        this.mesh = shipGroup;
        this.mesh.rotation.y = Math.PI;
        this.scene.add(this.mesh);
    }

    setupControls() {
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
    }

    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w': 
                this.movement.forward = true;
                if (!this.engineSound) {
                    this.engineSound = this.soundManager.playSound('engine', true);
                }
                break;
            case 's': this.movement.backward = true; break;
            case 'a': this.movement.left = true; break;
            case 'd': this.movement.right = true; break;
            case ' ': this.movement.up = true; break;
            case 'shift': this.movement.down = true; break;
            case 'q': this.movement.rollLeft = true; break;
            case 'e': this.movement.rollRight = true; break;
            case 'b': 
                this.movement.boost = true;
                this.soundManager.playSound('boost');
                break;
            case 'f': this.movement.shooting = true; break;
        }
    }

    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w': 
                this.movement.forward = false;
                if (this.engineSound) {
                    this.soundManager.stopSound(this.engineSound);
                    this.engineSound = null;
                }
                break;
            case 's': this.movement.backward = false; break;
            case 'a': this.movement.left = false; break;
            case 'd': this.movement.right = false; break;
            case ' ': this.movement.up = false; break;
            case 'shift': this.movement.down = false; break;
            case 'q': this.movement.rollLeft = false; break;
            case 'e': this.movement.rollRight = false; break;
            case 'b': this.movement.boost = false; break;
            case 'f': this.movement.shooting = false; break;
        }
    }

    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShotTime < this.shootingDelay) {
            return;
        }

        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.mesh.quaternion);

        this.cannonPositions.forEach(cannonPos => {
            const worldPosition = cannonPos.clone();
            worldPosition.applyMatrix4(this.mesh.matrixWorld);
            const laser = new Laser(this.scene, worldPosition, direction);
            this.lasers.push(laser);
        });

        // Play laser sound
        this.soundManager.playSound('laser');

        this.lastShotTime = currentTime;
    }

    updateLasers() {
        // Update and remove lasers that have traveled too far
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            if (laser.update()) {
                laser.remove();
                this.lasers.splice(i, 1);
            }
        }
    }

    clampPosition() {
        this.mesh.position.x = Math.max(this.boundaries.x.min, Math.min(this.boundaries.x.max, this.mesh.position.x));
        this.mesh.position.y = Math.max(this.boundaries.y.min, Math.min(this.boundaries.y.max, this.mesh.position.y));
        this.mesh.position.z = Math.max(this.boundaries.z.min, Math.min(this.boundaries.z.max, this.mesh.position.z));
    }

    update() {
        // Handle forward/backward movement with boost
        const currentMaxVelocity = this.movement.boost ? this.speed.boostVelocity : this.speed.maxVelocity;
        
        if (this.movement.forward) {
            this.speed.velocity = Math.min(this.speed.velocity + this.speed.acceleration, currentMaxVelocity);
        } else if (this.movement.backward) {
            this.speed.velocity = Math.max(this.speed.velocity - this.speed.acceleration, -currentMaxVelocity);
        } else {
            // Apply deceleration when no forward/backward input
            if (Math.abs(this.speed.velocity) > 0) {
                this.speed.velocity *= (1 - this.speed.deceleration);
            }
        }

        // Calculate movement direction based on ship's rotation
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.mesh.quaternion);
        direction.multiplyScalar(this.speed.velocity);
        
        this.mesh.position.add(direction);

        // Handle rotation (left/right)
        if (this.movement.left) {
            this.mesh.rotation.y += this.speed.rotation;
        }
        if (this.movement.right) {
            this.mesh.rotation.y -= this.speed.rotation;
        }

        // Handle roll (Q/E)
        if (this.movement.rollLeft) {
            this.mesh.rotation.z += this.speed.rotation;
        }
        if (this.movement.rollRight) {
            this.mesh.rotation.z -= this.speed.rotation;
        }

        // Handle vertical movement (up/down)
        if (this.movement.up) {
            this.mesh.position.y += this.speed.maxVelocity;
        }
        if (this.movement.down) {
            this.mesh.position.y -= this.speed.maxVelocity;
        }

        // Handle shooting
        if (this.movement.shooting) {
            this.shoot();
        }

        // Update lasers
        this.updateLasers();

        // Apply position boundaries
        this.clampPosition();
    }
} 
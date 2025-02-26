# Star Wars: X-Wing Death Star Run

A 3D space shooter game where players pilot an X-Wing fighter in an attempt to destroy the Death Star, inspired by the iconic scene from Star Wars: Episode IV - A New Hope.

## Current Features
- 3D X-Wing fighter with realistic flight controls
- Laser shooting mechanics
- Enemy turrets that track and can be destroyed
- Asteroid field obstacles
- Score tracking system
- Sound effects for weapons, engines, and boost
- Collision detection system

## Controls
- W/S: Forward/Backward
- A/D: Turn left/right
- Q/E: Roll left/right
- Space: Move up
- Shift: Move down
- F: Fire lasers
- B: Speed boost

## Setup Instructions
1. Clone the repository:
```bash
git clone [your-repo-url]
cd starwars-exp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:9000
```

## Development
The project uses:
- Three.js for 3D graphics
- Webpack for bundling
- Web Audio API for sound effects

## Project Structure
```
src/
  ├── js/
  │   ├── main.js        # Game initialization and main loop
  │   ├── XWing.js       # Player ship controls and mechanics
  │   ├── Turret.js      # Enemy turret behavior
  │   ├── Asteroid.js    # Asteroid obstacles
  │   ├── Laser.js       # Laser projectiles
  │   └── SoundManager.js # Audio system
  └── styles/            # (Future CSS styles)
```

## Planned Features
- Death Star surface environment
- Enemy AI and return fire
- Explosion effects
- Power-ups and shields
- Background music
- Game over conditions
- Menu system
- High score tracking

## Contributing
This is a learning project. Feel free to fork and experiment!

## License
MIT License 
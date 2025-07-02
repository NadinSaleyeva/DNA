let particles = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1);
    
    // Create 200 particles for a denser effect
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
}

function draw() {
    // Semi-transparent background for trail effect
    background(0, 0, 0, 0.05);
    
    // Update and display all particles
    for (let particle of particles) {
        particle.update();
        particle.display();
        
        // Draw connections between nearby particles
        drawConnections(particle);
    }
}

class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(random(-1, 1), random(-1, 1));
        this.acc = createVector(0, 0);
        this.size = random(3, 8);
        this.hue = random(360);
        this.maxSpeed = 3;
    }
    
    update() {
        // React to mouse cursor
        let mouse = createVector(mouseX, mouseY);
        let dir = p5.Vector.sub(mouse, this.pos);
        let distance = dir.mag();
        
        // Different behavior based on distance
        if (distance < 150) {
            dir.setMag(map(distance, 0, 150, 3, 0));
            this.acc.add(dir);
            this.hue = (this.hue + 1) % 360;
        }
        
        // Add some random movement
        this.acc.add(createVector(random(-0.1, 0.1), random(-0.1, 0.1)));
        
        // Particle physics
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        
        // Bounce off edges
        if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
        if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
    }
    
    display() {
        noStroke();
        fill(this.hue, 80, 100, 0.8);
        ellipse(this.pos.x, this.pos.y, this.size);
    }
}

function drawConnections(particle) {
    stroke(particle.hue, 50, 100, 0.3);
    strokeWeight(0.5);
    
    for (let other of particles) {
        let d = p5.Vector.dist(particle.pos, other.pos);
        if (d > 0 && d < 100) {
            line(particle.pos.x, particle.pos.y, other.pos.x, other.pos.y);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
    // Add particle explosion on click
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
}
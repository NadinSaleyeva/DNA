let angle = 0;
let dnaRadius = 200;
let particles = [];
let colorPalette = [];
let currentHue = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100, 1);
  noStroke();
  
  // Инициализация цветовой палитры
  updateColorPalette();
  
  // Создание частиц фона
  for (let i = 0; i < 150; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(0);
  
  // Плавное изменение основного цвета
  currentHue = (currentHue + 0.5) % 360;
  updateColorPalette();
  
  // Освещение с изменяющимся цветом
  pointLight(100, 80, 100, -width/2, -height/2, 200);
  pointLight(currentHue, 80, 100, width/2, height/2, 200);
  ambientLight(20);
  
  // Вращение всей сцены
  rotateX(frameCount * 0.005);
  rotateY(frameCount * 0.008);
  
  // Рисуем частицы фона
  for (let p of particles) {
    p.update();
    p.display();
  }
  
  // Параметры ДНК
  let segments = 80;
  let segmentHeight = 15;
  let twistSpeed = 0.02;
  
  // Интерактивность
  if (mouseIsPressed) {
    dnaRadius = map(mouseX, 0, width, 100, 400);
    angle += map(mouseY, 0, height, -0.1, 0.1);
  } else {
    dnaRadius = 200 + sin(frameCount * 0.03) * 50;
  }
  
  // Рисуем абстрактную ДНК
  for (let i = 0; i < segments; i++) {
    let y = i * segmentHeight - segments * segmentHeight / 2;
    let segmentAngle = angle + i * twistSpeed;
    
    // Позиции цепей
    let x1 = cos(segmentAngle) * dnaRadius;
    let z1 = sin(segmentAngle) * dnaRadius;
    let x2 = cos(segmentAngle + PI) * dnaRadius;
    let z2 = sin(segmentAngle + PI) * dnaRadius;
    
    // Цвет для сегмента
    let hue = (currentHue + i * 2) % 360;
    let sat = 80 + sin(frameCount * 0.05 + i) * 20;
    let bri = 70 + cos(frameCount * 0.03 + i) * 30;
    
    // Первая цепь (сферы)
    push();
    translate(x1, y, z1);
    fill(hue, sat, bri);
    sphere(8 + sin(frameCount * 0.1 + i) * 3);
    pop();
    
    // Вторая цепь (коробки)
    push();
    translate(x2, y, z2);
    fill((hue + 120) % 360, sat, bri);
    box(10 + cos(frameCount * 0.1 + i) * 4);
    pop();
    
    // Соединения (цилиндры)
    if (i % 2 === 0) {
      push();
      let midX = (x1 + x2) / 2;
      let midY = y;
      let midZ = (z1 + z2) / 2;
      
      translate(midX, midY, midZ);
      rotateZ(atan2(x2 - x1, z2 - z1));
      rotateY(PI/2);
      
      let len = dist(x1, y, z1, x2, y, z2);
      fill((hue + 60) % 360, 60, 90);
      cylinder(3, len, 8, 1, false, false);
      pop();
    }
    
    // Соединительные линии между сегментами
    if (i > 0) {
      let prevY = (i-1) * segmentHeight - segments * segmentHeight / 2;
      let prevAngle = angle + (i-1) * twistSpeed;
      
      let prevX1 = cos(prevAngle) * dnaRadius;
      let prevZ1 = sin(prevAngle) * dnaRadius;
      let prevX2 = cos(prevAngle + PI) * dnaRadius;
      let prevZ2 = sin(prevAngle + PI) * dnaRadius;
      
      // Линии первой цепи
      stroke(hue, sat, bri, 0.5);
      strokeWeight(2);
      line(x1, y, z1, prevX1, prevY, prevZ1);
      
      // Линии второй цепи
      stroke((hue + 120) % 360, sat, bri, 0.5);
      line(x2, y, z2, prevX2, prevY, prevZ2);
    }
  }
  
  angle += 0.01;
}

function updateColorPalette() {
  colorPalette = [
    color(currentHue % 360, 80, 100),
    color((currentHue + 120) % 360, 80, 100),
    color((currentHue + 240) % 360, 80, 100)
  ];
}

class Particle {
  constructor() {
    this.reset();
    this.z = random(-500, 500);
  }
  
  reset() {
    this.pos = createVector(random(-width, width), random(-height, height), random(-1000, 1000));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5), random(-0.5, 0.5));
    this.size = random(5, 20);
    this.hue = random(360);
    this.life = random(100, 200);
    this.maxLife = this.life;
  }
  
  update() {
    this.pos.add(this.vel);
    this.life--;
    
    if (this.life <= 0 || 
        this.pos.x < -width*1.5 || this.pos.x > width*1.5 ||
        this.pos.y < -height*1.5 || this.pos.y > height*1.5 ||
        this.pos.z < -1500 || this.pos.z > 500) {
      this.reset();
    }
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    
    let alpha = map(this.life, this.maxLife, 0, 1, 0);
    let col = color(this.hue, 60, 100, alpha);
    fill(col);
    noStroke();
    
    // Случайная форма частицы
    if (random() > 0.3) {
      sphere(this.size * 0.5);
    } else {
      box(this.size);
    }
    
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
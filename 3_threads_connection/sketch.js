let letters = [];
let dna = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  
  // Создаем буквы ДНК со спиральными параметрами
  for (let i = 0; i < 200; i++) {
    let angle = random(TWO_PI);
    let radius = random(100, min(width, height)/2);
    let x = width/2 + cos(angle) * radius;
    let y = height/2 + sin(angle) * radius;
    let letter = random(['A', 'T', 'C', 'G']);
    letters.push(new DNALetter(x, y, letter, angle, radius));
  }
  
  // Создаем нити ДНК
  for (let i = 0; i < 5; i++) {
    dna.push(new DNAStrand());
  }
}

function draw() {
  background(240);
  
  // Рисуем нити ДНК
  for (let strand of dna) {
    strand.update();
    strand.display();
  }
  
  // Рисуем и обновляем буквы
  for (let letter of letters) {
    letter.update();
    letter.display();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class DNALetter {
  constructor(x, y, letter, angle, radius) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.size = 20;
    this.targetSize = 20;
    this.color = color(100, 100, 100);
    this.baseColor = color(100, 100, 100);
    this.highlightColor = color(255, 0, 0);
    this.maxSize = 200;
    this.hoverRadius = 100;
    
    // Параметры для спирального движения
    this.angle = angle || random(TWO_PI);
    this.radius = radius || random(100, min(width, height)/2);
    this.spiralSpeed = random(0.01, 0.05);
    this.spiralRadiusGrowth = random(0.1, 0.3);
    this.centerX = width/2;
    this.centerY = height/2;
  }
  
  update() {
    // Обновляем спиральное движение
    this.angle += this.spiralSpeed;
    this.radius += this.spiralRadiusGrowth;
    
    // Если радиус становится слишком большим, сбрасываем его
    if (this.radius > min(width, height)/1.5) {
      this.radius = 50;
    }
    
    // Обновляем позицию на основе спирали
    this.x = this.centerX + cos(this.angle) * this.radius;
    this.y = this.centerY + sin(this.angle) * this.radius;
    
    // Обработка наведения
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.hoverRadius) {
      let scaleFactor = map(d, 0, this.hoverRadius, this.maxSize, this.targetSize);
      this.targetSize = scaleFactor;
      this.color = lerpColor(this.highlightColor, this.baseColor, d/this.hoverRadius);
    } else {
      this.targetSize = 20;
      this.color = this.baseColor;
    }
    this.size = lerp(this.size, this.targetSize, 0.1);
  }
  
  display() {
    fill(this.color);
    textSize(this.size);
    text(this.letter, this.x, this.y);
    
    if (this.size > 50) {
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = color(255, 0, 0, 150);
    } else {
      drawingContext.shadowBlur = 0;
    }
  }
}

class DNAStrand {
  constructor() {
    this.points = [];
    for (let i = 0; i < 150; i++) {
      this.points.push(createVector(random(width), random(height)));
    }
    this.speed = random(0.5, 1.5);
  }
  
  update() {
    for (let p of this.points) {
      p.x += random(-this.speed, this.speed);
      p.y += random(-this.speed, this.speed);
      
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }
  }
  
  display() {
    noFill();
    stroke(150, 150, 255, 150);
    beginShape();
    for (let p of this.points) {
      curveVertex(p.x, p.y);
    }
    endShape();
  }
}
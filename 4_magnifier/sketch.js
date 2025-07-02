let dnaElements = [];
let zoomLevel = 1;
let targetZoom = 1;
let zoomPos = { x: 0, y: 0 };
let smoothZoomPos = { x: 0, y: 0 };
let microscopeLight = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  
  // Создаем элементы ДНК (буквы и связи)
  for (let i = 0; i < 150; i++) {
    dnaElements.push(new DNASymbol(
      random(width),
      random(height),
      random(['A', 'T', 'C', 'G']),
      random(15, 30)
    ));
  }
  
  // Создаем нити ДНК
  for (let i = 0; i < 8; i++) {
    dnaElements.push(new DNAStrand(
      random(width),
      random(height),
      random(50, 200)
    ));
  }
}

function draw() {
  background(230, 50, 15); // Темно-синий фон
  
  // Плавное приближение
  zoomLevel = lerp(zoomLevel, targetZoom, 0.1);
  smoothZoomPos.x = lerp(smoothZoomPos.x, zoomPos.x, 0.1);
  smoothZoomPos.y = lerp(smoothZoomPos.y, zoomPos.y, 0.1);
  
  // Эффект освещения микроскопа
  microscopeLight = lerp(microscopeLight, 
                        targetZoom > 1 ? 100 : 70, 
                        0.05);
  
  push();
  translate(width/2, height/2);
  scale(zoomLevel);
  translate(-smoothZoomPos.x, -smoothZoomPos.y);
  
  // Рисуем сетку линзы
  drawLensGrid();
  
  // Рисуем все элементы ДНК
  for (let element of dnaElements) {
    element.update(zoomLevel);
    element.display();
  }
  
  pop();
  
  // Интерфейс микроскопа
  drawMicroscopeUI();
}

function mouseMoved() {
  // Находим ближайший элемент под курсором
  let closest = null;
  let record = Infinity;
  
  for (let element of dnaElements) {
    // Конвертируем координаты мыши в координаты мира с учетом зума
    let mx = (mouseX - width/2)/zoomLevel + smoothZoomPos.x;
    let my = (mouseY - height/2)/zoomLevel + smoothZoomPos.y;
    
    let d = dist(mx, my, element.x, element.y);
    let threshold = element instanceof DNAStrand ? 50 : 30;
    
    if (d < threshold && d < record) {
      closest = element;
      record = d;
    }
  }
  
  // Если нашли элемент - увеличиваем на него
  if (closest) {
    targetZoom = 3;
    zoomPos = { x: closest.x, y: closest.y };
  } else {
    targetZoom = 1;
    zoomPos = { x: width/2, y: height/2 };
  }
}

function drawLensGrid() {
  // Сетка микроскопа (меняется в зависимости от зума)
  stroke(190, 30, microscopeLight, 0.3); // Голубоватая сетка
  strokeWeight(1/zoomLevel);
  
  let gridSize = map(zoomLevel, 1, 3, 100, 30);
  for (let x = -width; x < width*2; x += gridSize) {
    line(x, -height, x, height*2);
  }
  for (let y = -height; y < height*2; y += gridSize) {
    line(-width, y, width*2, y);
  }
  
  // Круг линзы
  noFill();
  stroke(190, 40, microscopeLight, 0.2);
  strokeWeight(3/zoomLevel);
  ellipse(0, 0, width/zoomLevel);
}

function drawMicroscopeUI() {
  // Индикатор увеличения
  fill(190, 70, 90);
  noStroke();
  rect(20, 20, 150, 40, 5);
  fill(230, 50, 20);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(`Увеличение: ${zoomLevel.toFixed(1)}x`, 30, 40);
  
  // Подсветка при увеличении
  if (zoomLevel > 1.5) {
    fill(190, 30, 100, 0.1);
    noStroke();
    ellipse(width/2, height/2, width*0.8);
  }
}

class DNASymbol {
  constructor(x, y, symbol, size) {
    this.x = x;
    this.y = y;
    this.symbol = symbol;
    this.baseSize = size;
    this.color = this.getSymbolColor();
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.01, 0.01);
  }
  
  getSymbolColor() {
    // Стандартное цветовое кодирование нуклеотидов
    const colors = {
      'A': color(120, 80, 100),  // Зеленый (Аденин)
      'T': color(0, 80, 100),    // Красный (Тимин)
      'C': color(60, 80, 100),   // Желтый (Цитозин)
      'G': color(240, 80, 100)   // Синий (Гуанин)
    };
    return colors[this.symbol] || color(190, 80, 100);
  }
  
  update(zoom) {
    this.angle += this.rotationSpeed;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Эффект увеличения
    let displaySize = this.baseSize * (1 + (zoomLevel-1)*0.5);
    
    // Подсветка при увеличении
    if (zoomLevel > 1.5 && dist(
      (mouseX - width/2)/zoomLevel + smoothZoomPos.x, 
      (mouseY - height/2)/zoomLevel + smoothZoomPos.y, 
      this.x, this.y) < 50) {
      fill(this.color);
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = this.color.toString();
    } else {
      fill(hue(this.color), saturation(this.color), microscopeLight);
      drawingContext.shadowBlur = 0;
    }
    
    noStroke();
    textSize(displaySize);
    textAlign(CENTER, CENTER);
    text(this.symbol, 0, 0);
    
    pop();
  }
}

class DNAStrand {
  constructor(x, y, length) {
    this.x = x;
    this.y = y;
    this.length = length;
    this.segments = [];
    this.hue = 190; // Голубой для фосфатного остова
    
    // Создаем сегменты цепочки
    for (let i = 0; i < this.length; i++) {
      this.segments.push({
        angle: random(TWO_PI),
        offset: random(-10, 10),
        radius: random(3, 8),
        base: random(['A', 'T', 'C', 'G']) // Добавляем тип основания
      });
    }
  }
  
  update() {
    // Медленно меняем форму
    for (let seg of this.segments) {
      seg.angle += random(-0.02, 0.02);
      seg.radius += random(-0.1, 0.1);
      seg.radius = constrain(seg.radius, 3, 8);
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Основная цепочка (фосфатный остов)
    noFill();
    stroke(this.hue, 50, microscopeLight, 0.8);
    strokeWeight(2/zoomLevel);
    beginShape();
    for (let i = 0; i < this.length; i++) {
      let y = (i - this.length/2) * 5;
      curveVertex(0, y);
    }
    endShape();
    
    // Боковые связи с цветами оснований
    for (let i = 0; i < this.length; i++) {
      let y = (i - this.length/2) * 5;
      let seg = this.segments[i];
      let x1 = cos(seg.angle) * seg.radius;
      let x2 = -cos(seg.angle) * seg.radius;
      
      // Цвет связи соответствует типу основания
      let baseColor;
      switch(seg.base) {
        case 'A': baseColor = color(120, 80, 100); break; // Зеленый
        case 'T': baseColor = color(0, 80, 100); break;   // Красный
        case 'C': baseColor = color(60, 80, 100); break;  // Желтый
        case 'G': baseColor = color(240, 80, 100); break; // Синий
        default: baseColor = color(190, 80, 100);
      }
      
      stroke(hue(baseColor), saturation(baseColor), microscopeLight, 0.6);
      line(x1, y, x2, y);
      
      // Кружки на концах
      fill(hue(baseColor), saturation(baseColor), microscopeLight);
      noStroke();
      ellipse(x1, y, 5/zoomLevel);
      ellipse(x2, y, 5/zoomLevel);
      
      // Буквы оснований (если достаточно увеличение)
      if (zoomLevel > 2) {
        fill(0);
        textSize(10/zoomLevel);
        textAlign(CENTER, CENTER);
        text(seg.base, 0, y);
      }
    }
    
    pop();
  }
}
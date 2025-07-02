let glitchColors;
let lastGlitchTime = 0;
let glitchIntensity = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    
    // Яркая глитч-палитра
    glitchColors = [
        color(255, 0, 100),   // Неоново-розовый
        color(0, 255, 200),   // Кислотно-бирюзовый
        color(150, 0, 255),   // Фиолетовый
        color(255, 255, 0)    // Желтый
    ];
}

function draw() {
    // Базовая структура ДНК
    background(0);
    drawDNAStructure();
    
    // Глитч-эффекты
    applyGlitchEffects();
}

function drawDNAStructure() {
    const centerX = width/2;
    const centerY = height/2;
    const dnaLength = min(width, height) * 0.7;
    const segments = 24;
    const spiralRadius = width * 0.2;
    
    // Основные спирали ДНК
    for (let i = 0; i < segments; i++) {
        const y = map(i, 0, segments-1, centerY - dnaLength/2, centerY + dnaLength/2);
        const angle = map(i, 0, segments-1, 0, TWO_PI * 3);
        
        // Левая цепь с глитчем
        fill(glitchColors[0]);
        rect(
            centerX - spiralRadius * cos(angle) + randomGlitchOffset(),
            y + randomGlitchOffset(),
            12,
            12
        );
        
        // Правая цепь с глитчем
        fill(glitchColors[1]);
        rect(
            centerX + spiralRadius * cos(angle) + randomGlitchOffset(),
            y + randomGlitchOffset(),
            12,
            12
        );
        
        // Соединения с глитчем
        if (random() > 0.3) {
            stroke(glitchColors[2 + i%2]);
            strokeWeight(1.5);
            line(
                centerX - spiralRadius * cos(angle) + randomGlitchOffset(),
                y + randomGlitchOffset(),
                centerX + spiralRadius * cos(angle) + randomGlitchOffset(),
                y + randomGlitchOffset()
            );
            noStroke();
        }
    }
}

function applyGlitchEffects() {
    // Случайные сильные глитчи
    if (millis() - lastGlitchTime > random(500, 2000)) {
        glitchIntensity = random(10, 30);
        lastGlitchTime = millis();
    }
    
    // Применяем текущую интенсивность глитча
    if (glitchIntensity > 0) {
        applyColorShift();
        applyScanLines();
        glitchIntensity -= 0.5;
    }
    
    // Постоянные легкие искажения
    applyPixelDisplacement();
}

function randomGlitchOffset() {
    return random(-glitchIntensity, glitchIntensity);
}

function applyColorShift() {
    loadPixels();
    for (let i = 0; i < pixels.length; i += 4) {
        if (random() < 0.1) {
            // Сдвигаем цветовые каналы
            pixels[i] = pixels[i + 4];     // Красный
            pixels[i + 1] = pixels[i + 5]; // Зеленый
            pixels[i + 2] = pixels[i + 6]; // Синий
        }
    }
    updatePixels();
}

function applyScanLines() {
    stroke(0, 100);
    strokeWeight(1);
    for (let y = 0; y < height; y += 2) {
        line(0, y + random(-2, 2), width, y + random(-2, 2));
    }
}

function applyPixelDisplacement() {
    if (random() < 0.3) {
        loadPixels();
        const displacement = floor(random(1, 5));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (random() < 0.01) {
                    const index = (y * width + x) * 4;
                    const newX = constrain(x + displacement, 0, width-1);
                    const newIndex = (y * width + newX) * 4;
                    
                    pixels[index] = pixels[newIndex];
                    pixels[index + 1] = pixels[newIndex + 1];
                    pixels[index + 2] = pixels[newIndex + 2];
                }
            }
        }
        updatePixels();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Дополнительные интерактивные эффекты
function mousePressed() {
    glitchIntensity = random(20, 50);
    lastGlitchTime = millis();
}

function keyPressed() {
    if (key === ' ') {
        glitchIntensity = random(30, 60);
    }
}
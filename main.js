// =========================================================================
// 1. INITIALIZE ENGINE CANVAS
// =========================================================================
kaplay({
    background: "#1a1a3a", 
    width: 800,
    height: 600,
})

// Global tracking state pointers
let allShapes = [];
let levelPool = [];
let score = 0;
let currentLevel = 1;

// Setup score & level overlay text UI elements
const scoreLabel = add([
    text(`Score: ${score}`, { size: 22 }),
    pos(24, 24),
])

const levelLabel = add([
    text(`Level: ${currentLevel}`, { size: 22 }),
    pos(24, 54),
    color(0, 255, 255)
])

// =========================================================================
// 2. VISUAL GRAPHICS THEME SCHEMATICS
// =========================================================================

// --- Theme Set A: Geometric Shapes ---
const geometricTheme = [
    (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#5555ff"; ctx.fillRect(12, 12, 40, 40); }, 
    (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 52); ctx.lineTo(12, 52); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 32); ctx.lineTo(32, 52); ctx.lineTo(12, 32); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#22cc66"; ctx.fillRect(26, 12, 12, 40); ctx.fillRect(12, 26, 40, 12); }, 
    (ctx) => { ctx.fillStyle = "#ff8800"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 22); ctx.lineTo(52, 44); ctx.lineTo(32, 52); ctx.lineTo(12, 44); ctx.lineTo(12, 22); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.roundRect(16, 12, 32, 40, 16); ctx.fill(); } 
];

// Helper wrapper to process drawing dots on the canvas
function drawPipCircle(ctx, x, y) { 
    ctx.fillStyle = "#ffffff"; 
    ctx.beginPath(); 
    ctx.arc(x, y, 4, 0, Math.PI * 2); 
    ctx.fill(); 
}

// --- Theme Set B: Domino Pips ---
const dominoTheme = [
    (ctx) => { /* Pip 0: Blank */ },
    (ctx) => { drawPipCircle(ctx, 32, 32); }, 
    (ctx) => { drawPipCircle(ctx, 18, 18); drawPipCircle(ctx, 46, 46); }, 
    (ctx) => { drawPipCircle(ctx, 18, 18); drawPipCircle(ctx, 32, 32); drawPipCircle(ctx, 46, 46); }, 
    (ctx) => { drawPipCircle(ctx, 18, 18); drawPipCircle(ctx, 46, 18); drawPipCircle(ctx, 18, 46); drawPipCircle(ctx, 46, 46); }, 
    (ctx) => { drawPipCircle(ctx, 18, 18); drawPipCircle(ctx, 46, 18); drawPipCircle(ctx, 32, 32); drawPipCircle(ctx, 18, 46); drawPipCircle(ctx, 46, 46); }, 
    (ctx) => { drawPipCircle(ctx, 18, 18); drawPipCircle(ctx, 18, 32); drawPipCircle(ctx, 18, 46); drawPipCircle(ctx, 46, 18); drawPipCircle(ctx, 46, 32); drawPipCircle(ctx, 46, 46); } 
];

// =========================================================================
// 3. CORE SPRITE LAYER MAP GENERATOR
// =========================================================================
function generateTileTheme(themeName, tileDrawingFunctions) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 448;
    canvas.height = 64;

    const BORDER_COLOR = "#ffffff";
    const BORDER_WIDTH = 4;

    allShapes = [];
    let atlasSlices = {};

    tileDrawingFunctions.forEach((drawGraphic, index) => {
        const startX = index * 64;
        const nameKey = `${themeName}_tile_${index}`;

        ctx.strokeStyle = BORDER_COLOR; 
        ctx.lineWidth = BORDER_WIDTH;
        ctx.strokeRect(startX + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

        ctx.save();
        ctx.translate(startX, 0); 
        drawGraphic(ctx);
        ctx.restore();

        allShapes.push(nameKey);
        atlasSlices[nameKey] = { x: startX, y: 0, width: 64, height: 64 };
    });

    atlasSlices["frame_tile"] = { x: 0, y: 0, width: 64, height: 64 };
    loadSpriteAtlas(canvas.toDataURL(), atlasSlices);

    generatePuzzlePatterns();
}

function generatePuzzlePatterns() {
    // Dynamic difficulty blueprints mapped using relative array values
    levelPool = [
        { sequence: [allShapes[0], allShapes[1], allShapes[0]], answer: allShapes[1] },
        { sequence: [allShapes[2], allShapes[3], allShapes[3]], answer: allShapes[2] },
        { sequence: [allShapes[4], allShapes[5], allShapes[6]], answer: allShapes[5] }
    ];
}

// =========================================================================
// 4. DISPLAY LAYER DRAW ROUTINES
// =========================================================================
function drawTopSequenceRow(sequenceArray) {
    destroyAll("top-puzzle-tile");

    sequenceArray.forEach((spriteName, index) => {
        add([
            sprite(spriteName),
            pos(180 + index * 140, 200),
            anchor("center"),
            scale(1.5),
            "top-puzzle-tile"
        ]);
    });

    add([
        sprite("frame_tile"),
        pos(180 + 3 * 140, 200),
        anchor("center"),
        scale(1.5),
        "top-puzzle-tile"
    ]);

    add([
        text("?", { size: 32 }),
        pos(180 + 3 * 140, 200),
        anchor("center"),
        color(255, 255, 0),
        "top-puzzle-tile"
    ]);
}

function drawBottomSelectorRow(correctAnswer) {
    destroyAll("bottom-selector-tile");

    const decoyPool = allShapes.filter(shape => shape !== correctAnswer);
    
    let choicesSet = new Set([correctAnswer]);
    while (choicesSet.size < 4) {
        choicesSet.add(choose(decoyPool));
    }

    const randomizedChoices = shuffle(Array.from(choicesSet));

    randomizedChoices.forEach((spriteName, index) => {
        const btnX = 145 + index * 170;
        const btnY = 460;

        const btn = add([
            sprite(spriteName), 
            pos(btnX, btnY),
            anchor("center"),
            scale(1.5),
            area(),
            "bottom-selector-tile"
        ]);

        btn.onClick(() => {
            if (spriteName === correctAnswer) {
                burp(); 
                score += 10;
                scoreLabel.text = `Score: ${score}`;
                loadRandomGameLevel(); 
            } else {
                shake(10); 
            }
        });
    });
}

// =========================================================================
// 5. DIFFICULTY SCALE LEVEL LOADER & INITIALIZATION
// =========================================================================
function loadRandomGameLevel() {
    if (score >= 80) {
        currentLevel = 3;
    } else if (score >= 40) {
        currentLevel = 2;
    } else {
        currentLevel = 1;
    }

    levelLabel.text = `Level: ${currentLevel}`;

    // Gracefully handle picking the active sequence rules safely
    let activeLevel = choose(levelPool);
    
    drawTopSequenceRow(activeLevel.sequence);
    drawBottomSelectorRow(activeLevel.answer);
}

// --- START UP ENGINES ---
generateTileTheme("domino", dominoTheme);
loadRandomGameLevel();

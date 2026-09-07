// =========================================================================
// 1. INITIALIZE ENGINE CANVAS
// =========================================================================
kaplay({
    background: "#1a1a3a", 
    width: 800,
    height: 600,
})

let score = 0;
let currentLevelIndex = 0; // Tracks which level number the player is currently on

// Setup overlay UI elements
const scoreLabel = add([
    text(`Score: ${score}`, { size: 22 }),
    pos(24, 24),
])

const levelLabel = add([
    text(`Level: ${currentLevelIndex + 1}`, { size: 22 }), 
    pos(24, 54),
    color(0, 255, 255)
])

// =========================================================================
// 2. THEME DEFINITIONS
// =========================================================================

// --- Theme Set A: Geometric Shapes ---
const geometricTheme = [
    (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#5555ff"; ctx.fillRect(12, 12, 40, 40); }, 
    (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 52); ctx.lineTo(12, 52); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 32); ctx.lineTo(32, 52); ctx.lineTo(12, 32); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#22cc66"; ctx.fillRect(26, 12, 12, 40); ctx.fillRect(12, 26, 40, 12); }, 
    (ctx) => { ctx.fillStyle = "#ff8800"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 22); ctx.lineTo(52, 44); ctx.lineTo(32, 52); ctx.lineTo(12, 44); ctx.lineTo(12, 22); ctx.fill(); }, 
    (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.roundRect(16, 12, 32, 40, 16); ctx.fill(); }, 
    (ctx) => { 
        ctx.fillStyle = "#00cccc"; 
        ctx.beginPath();
        ctx.ellipse(32, 32, 16, 24, 0, 0, Math.PI * 2); 
        ctx.fill(); 
    } 
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
// 3. MASTER LEVEL POOL MATRIX
// =========================================================================
const masterLevelPool = [
    // Level 1: Domino Progression (Pip 1, Pip 2, Pip 3 -> Guess Pip 4)
    [
        "domino_tile_1", "domino_tile_2", "domino_tile_3", 
        "domino_tile_4", "domino_tile_0", "domino_tile_5", "domino_tile_6"
    ],
    // Level 2: Geometry Alternating (Circle, Square, Circle -> Guess Square)
    [
        "geo_tile_0", "geo_tile_1", "geo_tile_0", 
        "geo_tile_1", "geo_tile_2", "geo_tile_3", "geo_tile_4"
    ],
    // Level 3: Mixed Challenge (Cross, Hex, Cross -> Guess Hex)
    [
        "geo_tile_4", "geo_tile_5", "geo_tile_4", 
        "geo_tile_5", "geo_tile_6", "domino_tile_2", "domino_tile_1"
    ]
];

// =========================================================================
// 4. LEVEL PARSING ENGINE
// =========================================================================
function loadPresetPuzzle(tileBlueprint) {
    const topSequence = tileBlueprint.slice(0, 3); 
    const correctAnswer = tileBlueprint[3];         
    const bottomOptions = tileBlueprint.slice(3, 7); 

    // --- RENDERING TOP ROW ---
    destroyAll("top-puzzle-tile");
    
    topSequence.forEach((spriteName, index) => {
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

    // --- RENDERING BOTTOM ROW ---
    destroyAll("bottom-selector-tile");

    const shuffledOptions = shuffle(bottomOptions);

    shuffledOptions.forEach((spriteName, index) => {
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
                currentLevelIndex++; 
                loadHandCraftedLevel(); 
            } else {
                shake(10); 
            }
        });
    });
} // <-- FIXED: Added this missing brace to close loadPresetPuzzle cleanly!

// =========================================================================
// 5. PROGRESSION HANDLER CONTROLLER
// =========================================================================
function loadHandCraftedLevel() {
    if (currentLevelIndex >= masterLevelPool.length) {
        destroyAll("top-puzzle-tile");
        destroyAll("bottom-selector-tile");
        
        add([
            text("YOU WIN!", { size: 48 }),
            pos(400, 250),
            anchor("center"),
            color(0, 255, 0)
        ]);
        add([
            text(`Final Score: ${score}`, { size: 24 }),
            pos(400, 320),
            anchor("center")
        ]);
        return; 
    }

    levelLabel.text = `Level: ${currentLevelIndex + 1}`;
    const selectedLayout = masterLevelPool[currentLevelIndex];
    loadPresetPuzzle(selectedLayout);
}

// =========================================================================
// 6. TEXTURE ENGINE GENERATOR
// =========================================================================
function generateTileTheme(themeName, tileDrawingFunctions) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 448;
    canvas.height = 64;

    const BORDER_COLOR = "#ffffff";
    const BORDER_WIDTH = 4;

    let atlasSlices = {}; // FIXED: Removed the second duplicate initialization line

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

        atlasSlices[nameKey] = { x: startX, y: 0, width: 64, height: 64 };
    });

    // FIXED: Baked-in separate frame registration for mystery window
    atlasSlices["frame_tile"] = { x: 0, y: 0, width: 64, height: 64 };

    loadSpriteAtlas(canvas.toDataURL(), atlasSlices);
}

// =========================================================================
// 7. INITIAL STARTUP BOOTLOADER
// =========================================================================
generateTileTheme("geo", geometricTheme);
generateTileTheme("domino", dominoTheme);

loadHandCraftedLevel();

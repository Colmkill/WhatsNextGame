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
    (ctx) => { ctx.fillStyle = "#00cccc"; // The internal fill color (cyan)
    ctx.beginPath();
    // ctx.ellipse(centerX, centerY, radiusX, radiusY, rotation, startAngle, endAngle)
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
// Master pool of puzzle setups. 
// Format: Exactly 7 tile names. [0,1,2] = Puzzle Row, [3] = Answer, [3,4,5,6] = Bottom Choices
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

/**
 * Core Tile System: Takes any 7-tile blueprint layout array and parses it onto the screen
 * @param {string[]} tileBlueprint - An array containing exactly 7 sprite names
 */
function loadPresetPuzzle(tileBlueprint) {
    // 1. Separate our arrays based on index constraints
    const topSequence = tileBlueprint.slice(0, 3); // Gets items 0, 1, 2
    const correctAnswer = tileBlueprint[3];         // Gets item 3
    const bottomOptions = tileBlueprint.slice(3, 7); // Gets items 3, 4, 5, 6

    // ==================== RENDERING TOP ROW (3 PIECES) ====================
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

    // Mystery slot question mark placeholder setup
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

    // ==================== RENDERING BOTTOM ROW (4 SELECTORS) ====================
    destroyAll("bottom-selector-tile");

    // Mix up the 4 options so the answer isn't always the first button
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
                burp(); // Winning chime audio track
                score += 10;
                scoreLabel.text = `Score: ${score}`;
                
                // Fetch another random 7-tile master layout blueprint block
                loadRandomGameLevel(); 
            } else {
                shake(10); // Shake scene camera bounds on invalid choice
            }
        });
    });
}

/**
 * Controller to pick a layout blueprint variant array out of your pool
 */
function loadRandomGameLevel() {
    const selectedLayout = choose(masterLevelPool);
    loadPresetPuzzle(selectedLayout);
}
// =========================================================================
// ADDED: THE TEXTURE GENERATION ENGINE
// =========================================================================
/**
 * Draws your custom tile sheets into memory and registers them with KAPLAY
 */
function generateTileTheme(themeName, tileDrawingFunctions) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 7 tiles wide (448px) x 1 tile high (64px)
    canvas.width = 448;
    canvas.height = 64;

    const BORDER_COLOR = "#ffffff";
    const BORDER_WIDTH = 4;

    let atlasSlices = {};

    tileDrawingFunctions.forEach((drawGraphic, index) => {
        const startX = index * 64;
        const nameKey = `${themeName}_tile_${index}`;

        // Draw individual tile border box
        ctx.strokeStyle = BORDER_COLOR; 
        ctx.lineWidth = BORDER_WIDTH;
        ctx.strokeRect(startX + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

        // Execute your custom drawing code inside this tile slot box
        ctx.save();
        ctx.translate(startX, 0); 
        drawGraphic(ctx);
        ctx.restore();

        atlasSlices[nameKey] = { x: startX, y: 0, width: 64, height: 64 };
    });

    // Make sure frame_tile is registered for your question mark mystery block
    atlasSlices["frame_tile"] = { x: 0, y: 0, width: 64, height: 64 };
    
    // Upload the canvas texture bundle into the game engine
    loadSpriteAtlas(canvas.toDataURL(), atlasSlices);
}

// =========================================================================
// RUN ENGINE & TRIGGER THE INITIAL LEVEL
// =========================================================================

// 1. Generate your geometric shape canvas tile assets (Creates "geo_tile_0", etc.)
generateTileTheme("geo", geometricTheme);

// 2. Generate your domino pip canvas tile assets (Creates "domino_tile_0", etc.)
generateTileTheme("domino", dominoTheme);

// 3. Kick off the level selector to pick a puzzle from masterLevelPool and display it!
loadRandomGameLevel();

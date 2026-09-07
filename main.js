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
    // [Index 0] -> "geo_tile_0": Red Circle
    // Draws a circular arc centered at (32, 32) with a 20px radius.
    (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, 

    // [Index 1] -> "geo_tile_1": Blue Square
    // Draws a solid square starting 12px from the top-left edge, measuring 40x40px.
    (ctx) => { ctx.fillStyle = "#5555ff"; ctx.fillRect(12, 12, 40, 40); }, 

    // [Index 2] -> "geo_tile_2": Yellow Triangle
    // Connects lines from top-centre (32,12) to bottom-right (52,52) to bottom-left (12,52).
    (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 52); ctx.lineTo(12, 52); ctx.fill(); }, 

    // [Index 3] -> "geo_tile_3": Magenta Diamond
    // Connects lines from top (32,12) to right (52,32) to bottom (32,52) to left (12,32).
    (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 32); ctx.lineTo(32, 52); ctx.lineTo(12, 32); ctx.fill(); }, 

    // [Index 4] -> "geo_tile_4": Green Cross / Plus Sign
    // Overlaps a vertical rectangle (12x40px) and a horizontal rectangle (40x12px).
    (ctx) => { ctx.fillStyle = "#22cc66"; ctx.fillRect(26, 12, 12, 40); ctx.fillRect(12, 26, 40, 12); }, 

    // [Index 5] -> "geo_tile_5": Orange Hexagon
    // Connects 6 perimeter path coordinates starting at the top point (32,12) and cycling clockwise.
    (ctx) => { ctx.fillStyle = "#ff8800"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 22); ctx.lineTo(52, 44); ctx.lineTo(32, 52); ctx.lineTo(12, 44); ctx.lineTo(12, 22); ctx.fill(); }, 

    // [Index 6] -> "geo_tile_6": Cyan Rounded Rectangle / Capsule
    // Draws a 32x40px rectangle rounded off smoothly by a corner radius border of 16px.
    (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.roundRect(16, 12, 32, 40, 16); ctx.fill(); }, 

    // [Index 7] -> "geo_tile_7": Cyan Vertical Oval
    // Spits out an ellipse at pixel (32,32) with a horizontal radius of 16px and vertical radius of 24px.
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
    [
        "geo_tile_0", "geo_tile_7", "geo_tile_2", 
        "geo_tile_1", "geo_tile_2", "geo_tile_3", "geo_tile_4"
    ],
    // Level 3: Mixed Challenge (Cross, Hex, Cross -> Guess Hex)
    [
        "geo_tile_4", "geo_tile_5", "geo_tile_4", 
        "geo_tile_5", "geo_tile_6", "domino_tile_2", "domino_tile_1"
    ], // <-- Make sure there is a comma here to separate the levels!
    
    // Level 4: The Oval Launch (Oval, Square, Oval -> Guess Square)
    [
        "geo_tile_7", "geo_tile_1", "geo_tile_7",
        "geo_tile_1", "geo_tile_0", "geo_tile_3", "geo_tile_5"
    ],
    
    // Level 5: High-Pip Domino Race (Pip 4, Pip 5, Pip 6 -> Guess Pip 3? No, progressive down!)
    [
        "domino_tile_6", "domino_tile_5", "domino_tile_4",
        "domino_tile_3", "domino_tile_0", "domino_tile_1", "domino_tile_2"
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

    // FIXED: Calculate canvas width dynamically based on the total items in the array!
    const totalTiles = tileDrawingFunctions.length;
    canvas.width = totalTiles * 64; 
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
// 7. INITIAL STARTUP BOOTLOADER
// =========================================================================
generateTileTheme("geo", geometricTheme);
generateTileTheme("domino", dominoTheme);

loadHandCraftedLevel();

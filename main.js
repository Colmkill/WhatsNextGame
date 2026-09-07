// =========================================================================
// 1. INITIALIZE ENGINE CANVAS
// =========================================================================
kaplay({
    background: "#1a1a3a", // Dark blue background color array
    width: 800,
    height: 600,
})

// =========================================================================
// 2. 2x4 CUSTOM TILE GRAPHICS GENERATOR (With Baked-In Borders)
// =========================================================================
// Global tracking arrays
let allShapes = [];
let levelPool = [];

/**
 * Generates an entirely fresh 7-tile sprite sheet asset in memory based on a chosen theme style.
 * @param {string} themeName - The naming prefix (e.g. "domino", "geo")
 * @param {Function[]} tileDrawingFunctions - An array of exactly 7 canvas drawing instructions.
 */
function generateTileTheme(themeName, tileDrawingFunctions) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 7 tiles wide (448px) x 1 tile high (64px)
    canvas.width = 448;
    canvas.height = 64;

    const BORDER_COLOR = "#ffffff";
    const BORDER_WIDTH = 4;

    // Reset our game asset lists
    allShapes = [];
    let atlasSlices = {};

    // Loop through and draw each of the 7 tiles side-by-side
    tileDrawingFunctions.forEach((drawGraphic, index) => {
        const startX = index * 64;
        const nameKey = `${themeName}_tile_${index}`;

        // 1. Draw the common tile outline box envelope
        ctx.strokeStyle = BORDER_COLOR; 
        ctx.lineWidth = BORDER_WIDTH;
        ctx.strokeRect(startX + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

        // 2. Execute the unique custom graphic code inside this box slot boundary
        ctx.save();
        ctx.translate(startX, 0); // Shifts drawing context so (0,0) is the start of this specific tile
        drawGraphic(ctx);
        ctx.restore();

        // 3. Register slice definitions mapping data
        allShapes.push(nameKey);
        atlasSlices[nameKey] = { x: startX, y: 0, width: 64, height: 64 };
    });

    // Register frame tile outline separately for the mystery question mark block
    atlasSlices["frame_tile"] = { x: 0, y: 0, width: 64, height: 64 };

    // Register everything to KAPLAY
    loadSpriteAtlas(canvas.toDataURL(), atlasSlices);

    // 4. Automatically generate the puzzle pools using your newly mapped tiles
    generatePuzzlePatterns();
}

/**
 * Creates logical progression structures using whatever shapes are active in allShapes.
 */
function generatePuzzlePatterns() {
    // Rebuild puzzle blueprints based on the new allShapes index mappings
    levelPool = [
        // Pattern 1: Alternating (0, 1, 0 -> Guess 1)
        { sequence: [allShapes[0], allShapes[1], allShapes[0]], answer: allShapes[1] },
        // Pattern 2: Sandwich (2, 3, 3 -> Guess 2)
        { sequence: [allShapes[2], allShapes[3], allShapes[3]], answer: allShapes[2] },
        // Pattern 3: Line Progressive (4, 5, 6 -> Guess 5)
        { sequence: [allShapes[4], allShapes[5], allShapes[6]], answer: allShapes[5] }
    ];
}
// =========================================================================
// THEME DEF_POOL A: GEOMETRIC SHAPES (7 TILES)
// =========================================================================
const geometricTheme = [
    (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Circle
    (ctx) => { ctx.fillStyle = "#5555ff"; ctx.fillRect(12, 12, 40, 40); }, // Square
    (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 52); ctx.lineTo(12, 52); ctx.fill(); }, // Triangle
    (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 32); ctx.lineTo(32, 52); ctx.lineTo(12, 32); ctx.fill(); }, // Diamond
    (ctx) => { ctx.fillStyle = "#22cc66"; ctx.fillRect(26, 12, 12, 40); ctx.fillRect(12, 26, 40, 12); }, // Cross
    (ctx) => { ctx.fillStyle = "#ff8800"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 22); ctx.lineTo(52, 44); ctx.lineTo(32, 52); ctx.lineTo(12, 44); ctx.lineTo(12, 22); ctx.fill(); }, // Hex
    (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.roundRect(16, 12, 32, 40, 16); ctx.fill(); } // Oval
];

// =========================================================================
// THEME DEF_POOL B: DOMINO PIP STYLES (7 TILES: Pip 0 to Pip 6)
// =========================================================================
const dominoTheme = [
    // Helper tool to quickly draw a pip dot on the canvas
    function drawPip(ctx, x, y) { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); };

    (ctx) => { /* Blank Domino (0) */ },
    (ctx) => { drawPip(ctx, 32, 32); }, // 1 Dot
    (ctx) => { drawPip(ctx, 18, 18); drawPip(ctx, 46, 46); }, // 2 Dots
    (ctx) => { drawPip(ctx, 18, 18); drawPip(ctx, 32, 32); drawPip(ctx, 46, 46); }, // 3 Dots
    (ctx) => { drawPip(ctx, 18, 18); drawPip(ctx, 46, 18); drawPip(ctx, 18, 46); drawPip(ctx, 46, 46); }, // 4 Dots
    (ctx) => { drawPip(ctx, 18, 18); drawPip(ctx, 46, 18); drawPip(ctx, 32, 32); drawPip(ctx, 18, 46); drawPip(ctx, 46, 46); }, // 5 Dots
    (ctx) => { drawPip(ctx, 18, 18); drawPip(ctx, 18, 32); drawPip(ctx, 18, 46); drawPip(ctx, 46, 18); drawPip(ctx, 46, 32); drawPip(ctx, 46, 46); } // 6 Dots
];
// =========================================================================
// 3. GAME STATE & SEPARATED LEVEL POOLS
// =========================================================================
let score = 0;
let currentLevel = 1;

// Setup score & level overlay graphic UI labels
const scoreLabel = add([
    text(`Score: ${score}`, { size: 22 }),
    pos(24, 24),
])

const levelLabel = add([
    text(`Level: ${currentLevel}`, { size: 22 }),
    pos(24, 54),
    color(0, 255, 255)
])

// --- LEVEL 1 POOL: Simple Alternating (A, B, A -> B) ---
const poolLevel1 = [
    { sequence: ["circly_tile", "square_tile", "circly_tile"], answer: "square_tile" },
    { sequence: ["triangle_tile", "diamond_tile", "triangle_tile"], answer: "diamond_tile" },
    { sequence: ["star_tile", "hex_tile", "star_tile"], answer: "hex_tile" },
];

// --- LEVEL 2 POOL: Mirror Sandwich (A, B, B -> A) ---
const poolLevel2 = [
    { sequence: ["circly_tile", "square_tile", "square_tile"], answer: "circly_tile" },
    { sequence: ["triangle_tile", "oval_tile", "oval_tile"], answer: "triangle_tile" },
    { sequence: ["frame_tile", "hex_tile", "hex_tile"], answer: "frame_tile" },
];

// --- LEVEL 3 POOL: Progressive Line (A, B, C -> D) ---
const poolLevel3 = [
    { sequence: ["circly_tile", "square_tile", "triangle_tile"], answer: "diamond_tile" },
    { sequence: ["star_tile", "hex_tile", "oval_tile"], answer: "frame_tile" },
    { sequence: ["frame_tile", "oval_tile", "hex_tile"], answer: "star_tile" },
];
// =========================================================================
// 4. TOP ROW RENDERING (Sequence Viewer)
// =========================================================================
function drawTopSequenceRow(sequenceArray) {
    destroyAll("top-puzzle-tile");

    // Loop through the 3 pattern puzzle tiles
    sequenceArray.forEach((spriteName, index) => {
        add([
            sprite(spriteName),
            pos(180 + index * 140, 200),
            anchor("center"),
            scale(1.5),
            "top-puzzle-tile"
        ]);
    });

    // Draw the fourth mystery outline question mark tile
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
// =========================================================================
// 5. BOTTOM ROW RENDERING (Dynamic Choice Option Sorter)
// =========================================================================
function drawBottomSelectorRow(correctAnswer) {
    destroyAll("bottom-selector-tile");

    // Filter out the winning item to pull bad options safely from leftovers
    const decoyPool = allShapes.filter(shape => shape !== correctAnswer);
    
    // Assemble exactly 4 unique choices using a JavaScript Set
    let choicesSet = new Set([correctAnswer]);
    while (choicesSet.size < 4) {
        choicesSet.add(choose(decoyPool));
    }

    // Shuffle tile arrays to avoid predictable patterns
    const randomizedChoices = shuffle(Array.from(choicesSet));

    // Render option triggers side-by-side
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
                burp(); // Standard built-in engine win notification audio clip
                score += 10;
                scoreLabel.text = `Score: ${score}`;
                loadRandomGameLevel(); // Proceed seamlessly
            } else {
                shake(10); // Shake scene camera bounds on mistake
            }
        });
    });
}
// =========================================================================
// 6. GAME INITIALIZATION & DIFFICULTY CONTROLLER
// =========================================================================
function loadRandomGameLevel() {
    // 1. Calculate difficulty scaling threshold milestones based on score
    if (score >= 120) {
        currentLevel = 4;
    } else if (score >= 80) {
        currentLevel = 3;
    } else if (score >= 40) {
        currentLevel = 2;
    } else {
        currentLevel = 1;
    }

    // Update screen UI text layer
    levelLabel.text = `Level: ${currentLevel}`;

    // 2. Select the correct puzzle pool based on the active level threshold
    let activeLevel;

    if (currentLevel === 1) {
        activeLevel = choose(poolLevel1);
    } else if (currentLevel === 2) {
        activeLevel = choose(poolLevel2);
    } else if (currentLevel === 3) {
        activeLevel = choose(poolLevel3);
    } else {
        // Level 4 (Chaos Mode): Merges all pools together randomly
        const fullChaosPool = [...poolLevel1, ...poolLevel2, ...poolLevel3];
        activeLevel = choose(fullChaosPool);
    }

    // 3. Render the chosen pattern and options to screen
    drawTopSequenceRow(activeLevel.sequence);
    drawBottomSelectorRow(activeLevel.answer);
}
generateTileTheme("domino", dominoTheme);
loadRandomGameLevel();

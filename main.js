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
    // ==================== ORIGINAL SHAPES (Index 0 - 7) ====================
    /* [0] */ (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Red Circle
    /* [1] */ (ctx) => { ctx.fillStyle = "#5555ff"; ctx.fillRect(12, 12, 40, 40); },                                 // Blue Square
    /* [2] */ (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 52); ctx.lineTo(12, 52); ctx.fill(); }, // Triangle
    /* [3] */ (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 32); ctx.lineTo(32, 52); ctx.lineTo(12, 32); ctx.fill(); }, // Diamond
    /* [4] */ (ctx) => { ctx.fillStyle = "#22cc66"; ctx.fillRect(26, 12, 12, 40); ctx.fillRect(12, 26, 40, 12); }, // Cross
    /* [5] */ (ctx) => { ctx.fillStyle = "#ff8800"; ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(52, 22); ctx.lineTo(52, 44); ctx.lineTo(32, 52); ctx.lineTo(12, 44); ctx.lineTo(12, 22); ctx.fill(); }, // Hexagon
    /* [6] */ (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.roundRect(16, 12, 32, 40, 16); ctx.fill(); }, // Capsule
    /* [7] */ (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.ellipse(32, 32, 16, 24, 0, 0, Math.PI * 2); ctx.fill(); }, // Oval

    // ==================== NEW COLORED CIRCLES (Index 8 - 15) ====================
    /* [8]  -> "geo_tile_8"  */ (ctx) => { ctx.fillStyle = "#ff5555"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Red Circle
    /* [9]  -> "geo_tile_9"  */ (ctx) => { ctx.fillStyle = "#ff9933"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Orange Circle
    /* [10] -> "geo_tile_10" */ (ctx) => { ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Yellow Circle
    /* [11] -> "geo_tile_11" */ (ctx) => { ctx.fillStyle = "#22cc66"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Green Circle
    /* [12] -> "geo_tile_12" */ (ctx) => { ctx.fillStyle = "#00cccc"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Cyan Circle
    /* [13] -> "geo_tile_13" */ (ctx) => { ctx.fillStyle = "#5555ff"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Blue Circle
    /* [14] -> "geo_tile_14" */ (ctx) => { ctx.fillStyle = "#aa55ff"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }, // Purple Circle
    /* [15] -> "geo_tile_15" */ (ctx) => { ctx.fillStyle = "#ff00ff"; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); }  // Magenta Circle
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
// 1. HELPER CARD FUNCTION (Kept safely outside the array)
// =========================================================================
function drawBaseCard(ctx, textChar) {
    // 1. Draw a white card background plate (inset slightly by 4px from the tile edge)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(4, 4, 56, 56, 6);
    ctx.fill();

    // 2. Draw a subtle grey inner card line border accent
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 48, 48);

    // 3. Render the bold black character cleanly centered on the card deck face
    ctx.fillStyle = "#111111";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textChar, 32, 33); // Offset slightly to account for font height baselines
}

// =========================================================================
// 2. THEME SET C: CARD STYLES (Numbers 0 to 9)
// =========================================================================
const cardTheme = [
    // Every index now strictly holds a single valid tile drawing loop function
    (ctx) => { drawBaseCard(ctx, "0"); }, // Index 0 -> "card_tile_0"
    (ctx) => { drawBaseCard(ctx, "1"); }, // Index 1 -> "card_tile_1"
    (ctx) => { drawBaseCard(ctx, "2"); }, // Index 2 -> "card_tile_2"
    (ctx) => { drawBaseCard(ctx, "3"); }, // Index 3 -> "card_tile_3"
    (ctx) => { drawBaseCard(ctx, "4"); }, // Index 4 -> "card_tile_4"
    (ctx) => { drawBaseCard(ctx, "5"); }, // Index 5 -> "card_tile_5"
    (ctx) => { drawBaseCard(ctx, "6"); }, // Index 6 -> "card_tile_6"
    (ctx) => { drawBaseCard(ctx, "7"); }, // Index 7 -> "card_tile_7"
    (ctx) => { drawBaseCard(ctx, "8"); }, // Index 8 -> "card_tile_8"
    (ctx) => { drawBaseCard(ctx, "9"); }  // Index 9 -> "card_tile_9"
];

// =========================================================================
// 1. HELPER ALPHABET FUNCTION (Kept safely outside the array)
// =========================================================================
function drawLetterTile(ctx, character) {
    // 1. Draw a wooden/plastic letter block background (inset slightly by 4px)
    ctx.fillStyle = "#f5d0a1"; // Light tan/birch wood colour
    ctx.beginPath();
    ctx.roundRect(4, 4, 56, 56, 8); // Smooth rounded square
    ctx.fill();

    // 2. Draw a dark wood inner carving indentation frame
    ctx.strokeStyle = "#c69c6d";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 48, 48);

    // 3. Render the bold letter value centered cleanly on the block face
    ctx.fillStyle = "#4a3319"; // Deep brown letter carving colour
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(character.toUpperCase(), 32, 33);
}

// =========================================================================
// 2. THEME SET D: ALPHABET LETTERS (A to Z)
// =========================================================================
const alphabetTheme = [
    // Registers inside your system dynamically as "letter_tile_0" through "letter_tile_25"
    (ctx) => { drawLetterTile(ctx, "a"); }, // Index 0 -> "letter_tile_0"
    (ctx) => { drawLetterTile(ctx, "b"); }, // Index 1 -> "letter_tile_1"
    (ctx) => { drawLetterTile(ctx, "c"); }, // Index 2 -> "letter_tile_2"
    (ctx) => { drawLetterTile(ctx, "d"); }, // Index 3 -> "letter_tile_3"
    (ctx) => { drawLetterTile(ctx, "e"); }, // Index 4 -> "letter_tile_4"
    (ctx) => { drawLetterTile(ctx, "f"); }, // Index 5 -> "letter_tile_5"
    (ctx) => { drawLetterTile(ctx, "g"); }, // Index 6 -> "letter_tile_6"
    (ctx) => { drawLetterTile(ctx, "h"); }, // Index 7 -> "letter_tile_7"
    (ctx) => { drawLetterTile(ctx, "i"); }, // Index 8 -> "letter_tile_8"
    (ctx) => { drawLetterTile(ctx, "j"); }, // Index 9 -> "letter_tile_9"
    (ctx) => { drawLetterTile(ctx, "k"); }, // Index 10 -> "letter_tile_10"
    (ctx) => { drawLetterTile(ctx, "l"); }, // Index 11 -> "letter_tile_11"
    (ctx) => { drawLetterTile(ctx, "m"); }, // Index 12 -> "letter_tile_12"
    (ctx) => { drawLetterTile(ctx, "n"); }, // Index 13 -> "letter_tile_13"
    (ctx) => { drawLetterTile(ctx, "o"); }, // Index 14 -> "letter_tile_14"
    (ctx) => { drawLetterTile(ctx, "p"); }, // Index 15 -> "letter_tile_15"
    (ctx) => { drawLetterTile(ctx, "q"); }, // Index 16 -> "letter_tile_16"
    (ctx) => { drawLetterTile(ctx, "r"); }, // Index 17 -> "letter_tile_17"
    (ctx) => { drawLetterTile(ctx, "s"); }, // Index 18 -> "letter_tile_18"
    (ctx) => { drawLetterTile(ctx, "t"); }, // Index 19 -> "letter_tile_19"
    (ctx) => { drawLetterTile(ctx, "u"); }, // Index 20 -> "letter_tile_20"
    (ctx) => { drawLetterTile(ctx, "v"); }, // Index 21 -> "letter_tile_21"
    (ctx) => { drawLetterTile(ctx, "w"); }, // Index 22 -> "letter_tile_22"
    (ctx) => { drawLetterTile(ctx, "x"); }, // Index 23 -> "letter_tile_23"
    (ctx) => { drawLetterTile(ctx, "y"); }, // Index 24 -> "letter_tile_24"
    (ctx) => { drawLetterTile(ctx, "z"); }  // Index 25 -> "letter_tile_25"
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
    ],
     [
        "card_tile_1", "card_tile_2", "card_tile_3", 
        "card_tile_4", "card_tile_0", "card_tile_5", "card_tile_9"
    ],
    // New Level 5: Skip Count Sequence Pattern Challenge (2, 4, 6 -> Guess Card 8)
    [
        "card_tile_2", "card_tile_4", "card_tile_6", 
        "card_tile_8", "card_tile_3", "card_tile_5", "card_tile_7"
    ],
        // New Level: Spell a simple pattern (C, A, T -> Guess T? No, spell CAT twice: C, A, T -> Guess C)
    [
        "letter_tile_2", "letter_tile_0", "letter_tile_19", 
        "letter_tile_2", "letter_tile_4", "letter_tile_14", "letter_tile_24"
    ],
    // New Level: Alphabetical ordering progression (A, B, C -> Guess D)
    [
        "letter_tile_0", "letter_tile_1", "letter_tile_2", 
        "letter_tile_3", "letter_tile_23", "letter_tile_11", "letter_tile_7"
    ],
    [
        "letter_tile_5", "letter_tile_14", "letter_tile_17", 
        "letter_tile_19", "letter_tile_23", "letter_tile_11", "letter_tile_18"
    ]
];

// =========================================================================
// 4. LEVEL PARSING ENGINE
// =========================================================================

function drawDefaultFrame(ctx) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 60, 60); // A clean, empty white bounding outline
}

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

     // --- REPLACED SPRITE WITH A NATIVE RECTANGLE ---
    add([
        rect(96, 96, { radius: 8 }), // 1.5 scale of 64x64 is 96x96 pixels
        pos(180 + 3 * 140, 200),
        color(40, 40, 80),        // Give it a permanent dark blue/grey backing
        outline(4, "#ffffff"),    // Give it a crisp white border outline
        anchor("center"),
        "top-puzzle-tile"
    ]);

    // Keep your text question mark exactly the same
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
generateTileTheme("card", cardTheme); 
generateTileTheme("letter", alphabetTheme);
loadHandCraftedLevel();

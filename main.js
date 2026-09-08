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
// 1. HELPER ANIMAL FUNCTION (Kept safely outside the array)
// =========================================================================
function drawAnimalTile(ctx, emojiChar) {
    // 1. Draw a soft green/jungle background tile (inset slightly by 4px)
    ctx.fillStyle = "#e2f0d9"; 
    ctx.beginPath();
    ctx.roundRect(4, 4, 56, 56, 8); 
    ctx.fill();

    // 2. Draw a dark green accent inner border frame
    ctx.strokeStyle = "#385723";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 48, 48);

    // 3. Render the animal emoji centered cleanly on the block face
    ctx.font = "36px sans-serif"; // Large font size to fill the card beautifully
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emojiChar, 32, 33);
}

// =========================================================================
// 2. THEME SET E: ANIMAL PICTURE TILES (7 Assets)
// =========================================================================
const animalTheme = [
    // Registers inside your system dynamically as "animal_tile_0" through "animal_tile_6"
    (ctx) => { drawAnimalTile(ctx, "🦁"); }, // Index 0 -> "animal_tile_0" (Lion)
    (ctx) => { drawAnimalTile(ctx, "🐯"); }, // Index 1 -> "animal_tile_1" (Tiger)
    (ctx) => { drawAnimalTile(ctx, "🐻"); }, // Index 2 -> "animal_tile_2" (Bear)
    (ctx) => { drawAnimalTile(ctx, "🐼"); }, // Index 3 -> "animal_tile_3" (Panda)
    (ctx) => { drawAnimalTile(ctx, "🦊"); }, // Index 4 -> "animal_tile_4" (Fox)
    (ctx) => { drawAnimalTile(ctx, "🐸"); }, // Index 5 -> "animal_tile_5" (Frog)
    (ctx) => { drawAnimalTile(ctx, "🐵"); }  // Index 6 -> "animal_tile_6" (Monkey)
];

// =========================================================================
// THEME SET H: FARM ANIMAL PICTURE TILES (Registers as "farm_tile_0" etc.)
// =========================================================================
const farmAnimalTheme = [
    // --- Major Livestock (Index 0 - 4) ---
    (ctx) => { drawAnimalTile(ctx, "🐮"); }, // Index 0  -> "farm_tile_0" (Cow Face)
    (ctx) => { drawAnimalTile(ctx, "🐷"); }, // Index 1  -> "farm_tile_1" (Pig Face)
    (ctx) => { drawAnimalTile(ctx, "🐑"); }, // Index 2  -> "farm_tile_2" (Sheep)
    (ctx) => { drawAnimalTile(ctx, "🐐"); }, // Index 3  -> "farm_tile_3" (Goat)
    (ctx) => { drawAnimalTile(ctx, "🐴"); }, // Index 4  -> "farm_tile_4" (Horse Face)

    // --- Poultry & Birds (Index 5 - 8) ---
    (ctx) => { drawAnimalTile(ctx, "🐔"); }, // Index 5  -> "farm_tile_5" (Chicken)
    (ctx) => { drawAnimalTile(ctx, "🐓"); }, // Index 6  -> "farm_tile_6" (Rooster)
    (ctx) => { drawAnimalTile(ctx, "🦆"); }, // Index 7  -> "farm_tile_7" (Duck)
    (ctx) => { drawAnimalTile(ctx, "🪿"); }, // Index 8  -> "farm_tile_8" (Goose)

    // --- Barnyard Companions & Helpers (Index 9 - 11) ---
    (ctx) => { drawAnimalTile(ctx, "🫏"); }, // Index 9  -> "farm_tile_9" (Donkey)
    (ctx) => { drawAnimalTile(ctx, "🧑‍🌾"); }, // Index 10 -> "farm_tile_10" (Farmer)
    (ctx) => { drawAnimalTile(ctx, "🚜"); }  // Index 11 -> "farm_tile_11" (Tractor)
];

// =========================================================================
// 1. DYNAMIC REPETITIVE PATTERNS THEME (4 Unique Styles)
// =========================================================================
const patternedTheme = [
    // [Index 0] -> "pattern_tile_0": Horizontal Stripes (Candy Cane Style)
    (ctx) => {
        // Base fill
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(4, 4, 56, 56);
        // Draw recurring horizontal lines
        ctx.fillStyle = "#ff4444";
        for (let y = 8; y < 60; y += 12) {
            ctx.fillRect(4, y, 56, 4); // x, y, width, height
        }
    },

    // [Index 1] -> "pattern_tile_1": Polka Dots / Polka Tile
    (ctx) => {
        ctx.fillStyle = "#ffcc00"; // Yellow background
        ctx.fillRect(4, 4, 56, 56);
        ctx.fillStyle = "#ffffff"; // White dots
        // Loop grid to space dots out evenly
        for (let x = 16; x < 60; x += 32) {
            for (let y = 16; y < 60; y += 32) {
                ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
            }
        }
    },

    // [Index 2] -> "pattern_tile_2": Chequerboard Tile
    (ctx) => {
        ctx.fillStyle = "#444444"; // Dark squares base
        ctx.fillRect(4, 4, 56, 56);
        ctx.fillStyle = "#ffffff"; // Light squares layer
        const size = 14; // Quarter sizing divider block
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if ((row + col) % 2 === 0) {
                    ctx.fillRect(4 + col * size, 4 + row * size, size, size);
                }
            }
        }
    },

    // [Index 3] -> "pattern_tile_3": Concentric Target Rings
    (ctx) => {
        ctx.fillStyle = "#00cccc"; // Cyan background base
        ctx.fillRect(4, 4, 56, 56);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        
        ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(32, 32, 10, 0, Math.PI * 2); ctx.stroke();
    }
];
// =========================================================================
// 1. HELPER PUZZLE PIECE DRAWING TOOL (Kept safely outside the array)
// =========================================================================
/**
 * Draws a clean jigsaw puzzle shape backing and centers an asset or color inside it.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} fillColor - The base background color of this specific piece.
 * @param {string} tabDirections - Directions that have protruding tabs e.g., "right", "top", "none".
 */
function drawJigsawPiece(ctx, fillColor, tabDirections = "none") {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    
    // Base square dimensions (inset slightly to leave breathing room for tabs)
    // Core box sits from X:12 to 52, Y:12 to 52 (40x40 pixels)
    ctx.moveTo(12, 12);
    
    // --- TOP EDGE ---
    if (tabDirections.includes("top")) {
        ctx.lineTo(26, 12);
        ctx.arc(32, 12, 6, Math.PI, 0, false); // Outward Tab
    }
    ctx.lineTo(52, 12);
    
    // --- RIGHT EDGE ---
    if (tabDirections.includes("right")) {
        ctx.lineTo(52, 26);
        ctx.arc(52, 32, 6, Math.PI * 1.5, Math.PI * 0.5, false); // Outward Tab
    }
    ctx.lineTo(52, 52);
    
    // --- BOTTOM EDGE ---
    if (tabDirections.includes("bottom")) {
        ctx.lineTo(38, 52);
        ctx.arc(32, 52, 6, 0, Math.PI, false); // Outward Tab
    }
    ctx.lineTo(12, 52);
    
    // --- LEFT EDGE ---
    if (tabDirections.includes("left")) {
        ctx.lineTo(12, 38);
        ctx.arc(12, 32, 6, Math.PI * 0.5, Math.PI * 1.5, false); // Outward Tab
    }
    ctx.lineTo(12, 12);
    
    ctx.closePath();
    ctx.fill();

    // Give the jigsaw piece a subtle inner plastic/cardboard shine accent
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// =========================================================================
// 2. THEME SET F: JIGSAW PUZZLE PIECES (Registers as "jigsaw_tile_0" etc.)
// =========================================================================
const jigsawTheme = [
    // [Index 0] -> Red Corner Piece (protrudes Right and Bottom)
    (ctx) => { drawJigsawPiece(ctx, "#ff5555", "right-bottom"); },
    
    // [Index 1] -> Blue Edge Piece (protrudes Left, Right, and Bottom)
    (ctx) => { drawJigsawPiece(ctx, "#5555ff", "left-right-bottom"); },
    
    // [Index 2] -> Yellow Corner Piece (protrudes Left and Bottom)
    (ctx) => { drawJigsawPiece(ctx, "#ffcc00", "left-bottom"); },
    
    // [Index 3] -> Green Middle Piece (protrudes Top, Bottom, Left, and Right)
    (ctx) => { drawJigsawPiece(ctx, "#22cc66", "top-bottom-left-right"); },
    
    // [Index 4] -> Orange Vertical Piece (protrudes Top and Bottom)
    (ctx) => { drawJigsawPiece(ctx, "#ff8800", "top-bottom"); },
    
    // [Index 5] -> Purple Horizontal Piece (protrudes Left and Right)
    (ctx) => { drawJigsawPiece(ctx, "#aa55ff", "left-right"); },
    
    // [Index 6] -> Magenta Isolated Block (Smooth flat edges, no connectors)
    (ctx) => { drawJigsawPiece(ctx, "#ff00ff", "none"); }
];
// =========================================================================
// 1. HELPER INDENTED PUZZLE PIECE TOOL (Kept safely outside the array)
// =========================================================================
/**
 * Draws a puzzle shape with options for both outward tabs and inward indentations.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} fillColor - The base background color.
 * @param {string} tabs - Compass directions for outward tabs (e.g. "top")
 * @param {string} holes - Compass directions for inward holes/indentations (e.g. "left")
 */
function drawIndentedPiece(ctx, fillColor, tabs = "", holes = "") {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    
    // Core box frame edges map from X:12 to 52, Y:12 to 52
    ctx.moveTo(12, 12);
    
    // --- TOP EDGE ---
    if (tabs.includes("top")) {
        ctx.lineTo(26, 12);
        ctx.arc(32, 12, 6, Math.PI, 0, false); // Outward Tab
    } else if (holes.includes("top")) {
        ctx.lineTo(26, 12);
        ctx.arc(32, 12, 6, Math.PI, 0, true);  // Inward Hole / Indentation
    }
    ctx.lineTo(52, 12);
    
    // --- RIGHT EDGE ---
    if (tabs.includes("right")) {
        ctx.lineTo(52, 26);
        ctx.arc(52, 32, 6, Math.PI * 1.5, Math.PI * 0.5, false); // Outward Tab
    } else if (holes.includes("right")) {
        ctx.lineTo(52, 26);
        ctx.arc(52, 32, 6, Math.PI * 1.5, Math.PI * 0.5, true);  // Inward Hole / Indentation
    }
    ctx.lineTo(52, 52);
    
    // --- BOTTOM EDGE ---
    if (tabs.includes("bottom")) {
        ctx.lineTo(38, 52);
        ctx.arc(32, 52, 6, 0, Math.PI, false); // Outward Tab
    } else if (holes.includes("bottom")) {
        ctx.lineTo(38, 52);
        ctx.arc(32, 52, 6, 0, Math.PI, true);  // Inward Hole / Indentation
    }
    ctx.lineTo(12, 52);
    
    // --- LEFT EDGE ---
    if (tabs.includes("left")) {
        ctx.lineTo(12, 38);
        ctx.arc(12, 32, 6, Math.PI * 0.5, Math.PI * 1.5, false); // Outward Tab
    } else if (holes.includes("left")) {
        ctx.lineTo(12, 38);
        ctx.arc(12, 32, 6, Math.PI * 0.5, Math.PI * 1.5, true);  // Inward Hole / Indentation
    }
    ctx.lineTo(12, 12);
    
    ctx.closePath();
    ctx.fill();

    // Subtle edge framing highlight line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// =========================================================================
// 2. THEME SET G: INDENTED PIECES (Registers as "hole_tile_0" etc.)
// =========================================================================
const indentedTheme = [
    // [Index 0] -> Red Starter block (Tab on Right, Indentation on Bottom)
    (ctx) => { drawIndentedPiece(ctx, "#ff5555", "right", "bottom"); },
    
    // [Index 1] -> Blue Receiving block (Indentation on Left, Tab on Right)
    (ctx) => { drawIndentedPiece(ctx, "#5555ff", "right", "left"); },
    
    // [Index 2] -> Yellow Receiving block (Indentation on Left, Tab on Bottom)
    (ctx) => { drawIndentedPiece(ctx, "#ffcc00", "bottom", "left"); },
    
    // [Index 3] -> Green Capsular block (Indentation on Top, Tab on Bottom)
    (ctx) => { drawIndentedPiece(ctx, "#22cc66", "bottom", "top"); },
    
    // [Index 4] -> Orange Inverse block (Holes on Top, Bottom, Left, and Right)
    (ctx) => { drawIndentedPiece(ctx, "#ff8800", "", "top-bottom-left-right"); }
];

// =========================================================================
// 3. MASTER LEVEL POOL MATRIX
// =========================================================================
const masterLevelPool = [
    // Level 1: Domino Progression (Pip 1, Pip 2, Pip 3 -> Guess Pip 4)
    [
        "domino_tile_1", "domino_tile_2", "domino_tile_3", 
        "?", // <-- Added divider
        "domino_tile_4", "domino_tile_0", "domino_tile_5", "domino_tile_6"
    ],
     
    // Level 2: Geometry Alternating (Circle, Square, Circle -> Guess Square)
    [
        "geo_tile_0", "geo_tile_1", "geo_tile_0", 
        "?", // <-- Added divider
        "geo_tile_1", "geo_tile_2", "geo_tile_3", "geo_tile_4"
    ],
    
    // Level 3: Mixed Geometry Run
    [
        "geo_tile_0", "geo_tile_7", "geo_tile_2", 
        "?", // <-- Added divider
        "geo_tile_1", "geo_tile_2", "geo_tile_3", "geo_tile_4"
    ],

    // Level 4: Mixed Challenge (Cross, Hex, Cross -> Guess Hex)
    [
        "geo_tile_4", "geo_tile_5", "geo_tile_4", 
        "?", // <-- Added divider
        "geo_tile_5", "geo_tile_6", "domino_tile_2", "domino_tile_1"
    ], 
    
    // Level 5: The Oval Launch (Oval, Square, Oval -> Guess Square)
    [
        "geo_tile_7", "geo_tile_1", "geo_tile_7",
        "?", // <-- Added divider
        "geo_tile_1", "geo_tile_0", "geo_tile_3", "geo_tile_5"
    ],

    // Level 6: Animal Sequence (Lion, Tiger, Lion -> Guess Tiger!)
    [
        "animal_tile_0", "animal_tile_1", "animal_tile_0", 
        "?", // <-- Added divider
        "animal_tile_1", "animal_tile_3", "animal_tile_4", "animal_tile_5"
    ],
    
    // Level 7: High-Pip Domino Race (Pip 6, Pip 5, Pip 4 -> Guess Pip 3)
    [
        "domino_tile_6", "domino_tile_5", "domino_tile_4",
        "?", // <-- Added divider
        "domino_tile_3", "domino_tile_0", "domino_tile_1", "domino_tile_2"
    ],

    // Level 8: Card Counting Progression (1, 2, 3 -> Guess Card 4)
    [
        "card_tile_1", "card_tile_2", "card_tile_3", 
        "?", // <-- Added divider
        "card_tile_4", "card_tile_0", "card_tile_5", "card_tile_9"
    ],

    // Level 9: Skip Count Sequence Pattern Challenge (2, 4, 6 -> Guess Card 8)
    [
        "card_tile_2", "card_tile_4", "card_tile_6", 
        "?", // <-- Added divider
        "card_tile_8", "card_tile_3", "card_tile_5", "card_tile_7"
    ],

    // Level 10: Spell a simple pattern (C, A, T -> Guess C)
    [
        "letter_tile_2", "letter_tile_0", "letter_tile_19", 
        "?", // <-- Added divider
        "letter_tile_2", "letter_tile_4", "letter_tile_14", "letter_tile_24"
    ],

    // Level 11: Alphabetical ordering progression (A, B, C -> Guess D)
    [
        "letter_tile_0", "letter_tile_1", "letter_tile_2", 
        "?", // <-- Added divider
        "letter_tile_3", "letter_tile_23", "letter_tile_11", "letter_tile_7"
    ],
    
    // Level 12: Visual Texture Layout (Stripes, Polka, Stripes -> Guess Polka!)
    [
        "pattern_tile_0", "pattern_tile_1", "pattern_tile_0", 
        "?", // <-- Added divider
        "pattern_tile_1", "pattern_tile_2", "pattern_tile_3", "geo_tile_1"
    ],
    
    // Level 13: Alphabet Step Pattern 1
    [
        "letter_tile_5", "letter_tile_14", "letter_tile_17", 
        "?", // <-- Added divider
        "letter_tile_19", "letter_tile_23", "letter_tile_11", "letter_tile_18"
    ],

    // Level 14: Alphabet Step Pattern 2
    [
        "letter_tile_0", "letter_tile_4", "letter_tile_8", 
        "?", // <-- Added divider
        "letter_tile_14", "letter_tile_23", "letter_tile_11", "letter_tile_18"
    ],

    // Level 15: EXPANDED FORMAT LEVEL (4 on top, 5 choices below)
    [
        "card_tile_1", "card_tile_2", "card_tile_3", "card_tile_1",
        "?", 
        "card_tile_2", "card_tile_4", "card_tile_5", "card_tile_6", "card_tile_7"
    ],

    // Level 16: MEGA FORMAT LEVEL (5 on top, 6 choices below)
    [
        "card_tile_2", "card_tile_3", "card_tile_4", "card_tile_5", "card_tile_6",
        "?",
        "card_tile_7", "card_tile_0", "card_tile_1", "card_tile_8", "card_tile_9", "geo_tile_0"
    ],
      [
        "jigsaw_tile_0", "jigsaw_tile_1", "jigsaw_tile_2", 
        "?", 
        "jigsaw_tile_3", "jigsaw_tile_4", "jigsaw_tile_5", "jigsaw_tile_6" // 3 is correct answer
    ],
        [
        "hole_tile_0", "hole_tile_1", "hole_tile_0", 
        "?", 
        "hole_tile_1", // <-- Correct Answer: Continues alternating tab/hole chain
        "hole_tile_3", "hole_tile_4", "jigsaw_tile_6" 
    ],
    [
    "farm_tile_10", "farm_tile_11", "farm_tile_10", 
    "?", 
    "farm_tile_11", // <-- Correct Answer
    "farm_tile_0", "farm_tile_1", "farm_tile_5"
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
    // 1. DYNAMIC SPLIT RULES: 
    // Find the "?" character to separate the top row sequence from the bottom choices
    const questionIndex = tileBlueprint.indexOf("?");
    
    // Fallback error guard: if you forget to put a "?" in your manual level array
    if (questionIndex === -1) {
        console.error("Level error: Missing '?' marker in your level array blueprint!");
        return;
    }

    const topSequence = tileBlueprint.slice(0, questionIndex); 
    const correctAnswer = tileBlueprint[questionIndex + 1];         
    const bottomOptions = tileBlueprint.slice(questionIndex + 1); 

    // ==================== RENDERING TOP ROW (AUTOSCALING) ====================
    destroyAll("top-puzzle-tile");
    
    // Calculate adaptive spacing so any number of tiles center perfectly on screen
    const topCount = topSequence.length + 1; // +1 includes the mystery slot
    const topSpacing = Math.min(140, 700 / topCount); 
    const topStartX = 400 - ((topCount - 1) * topSpacing) / 2;
    const topScale = topCount > 4 ? 1.2 : 1.5; // Scale tiles down if row is long

    topSequence.forEach((spriteName, index) => {
        add([
            sprite(spriteName),
            pos(topStartX + index * topSpacing, 200),
            anchor("center"),
            scale(topScale),
            "top-puzzle-tile"
        ]);
    });

    // Render the placeholder mystery question mark box at the end of the sequence
    add([
        rect(64 * topScale, 64 * topScale, { radius: 8 }),
        pos(topStartX + (topCount - 1) * topSpacing, 200),
        color(40, 40, 80),
        outline(4, "#ffffff"),
        anchor("center"),
        "top-puzzle-tile"
    ]);
    add([
        text("?", { size: topCount > 5 ? 24 : 32 }),
        pos(topStartX + (topCount - 1) * topSpacing, 200),
        anchor("center"),
        color(255, 255, 0),
        "top-puzzle-tile"
    ]);

    // ==================== RENDERING BOTTOM ROW (AUTOSCALING) ====================
    destroyAll("bottom-selector-tile");

    // Mix up all choice items so the correct answer lands in a random spot
    const shuffledOptions = shuffle(bottomOptions);
    const bottomCount = shuffledOptions.length;
    
    // Calculate adaptive spacing so 4, 6, or 8 buttons distribute evenly
    const bottomSpacing = Math.min(170, 740 / bottomCount);
    const bottomStartX = 400 - ((bottomCount - 1) * bottomSpacing) / 2;
    const bottomScale = bottomCount > 5 ? 1.1 : 1.5;

    shuffledOptions.forEach((spriteName, index) => {
        const btnX = bottomStartX + index * bottomSpacing;
        const btnY = 460;

        const btn = add([
            sprite(spriteName), 
            pos(btnX, btnY),
            anchor("center"),
            scale(bottomScale),
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
}
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
generateTileTheme("animal", animalTheme); 
generateTileTheme("pattern", patternedTheme);
generateTileTheme("jigsaw", jigsawTheme); 
generateTileTheme("hole", indentedTheme);
generateTileTheme("farm", farmAnimalTheme);
loadHandCraftedLevel();

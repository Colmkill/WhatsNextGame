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
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 256;
canvas.height = 128;

// Set up your outline border style parameters
const BORDER_COLOR = "#ffffff"; // White tile outline (change to #000000 for black)
const BORDER_WIDTH = 4;        // Thickness of your tile outline borders

// --- ROW 1 (Y = 0) ---
// Tile 1: Red Circle (X: 0, Y: 0)
ctx.fillStyle = "#ff5555";
ctx.beginPath(); ctx.arc(32, 32, 24, 0, Math.PI * 2); ctx.fill();
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 2: Blue Square (X: 64, Y: 0)
ctx.fillStyle = "#5555ff";
ctx.fillRect(64 + 8, 8, 48, 48);
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(64 + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 3: Yellow Triangle (X: 128, Y: 0)
ctx.fillStyle = "#ffcc00";
ctx.beginPath();
ctx.moveTo(128 + 32, 8); ctx.lineTo(128 + 56, 56); ctx.lineTo(128 + 8, 56);
ctx.closePath(); ctx.fill();
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(128 + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 4: Magenta Diamond (X: 192, Y: 0)
ctx.fillStyle = "#ff00ff";
ctx.beginPath();
ctx.moveTo(192 + 32, 8); ctx.lineTo(192 + 56, 32); ctx.lineTo(192 + 32, 56); ctx.lineTo(192 + 8, 32);
ctx.closePath(); ctx.fill();
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(192 + BORDER_WIDTH/2, BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);


// --- ROW 2 (Y = 64) ---
// Tile 5: Green Star / Cross (X: 0, Y: 64)
ctx.fillStyle = "#22cc66";
ctx.fillRect(24, 64 + 8, 16, 48);
ctx.fillRect(8, 64 + 24, 48, 16);
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(BORDER_WIDTH/2, 64 + BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 6: Orange Hexagon (X: 64, Y: 64)
ctx.fillStyle = "#ff8800";
ctx.beginPath();
ctx.moveTo(64 + 32, 64 + 8);  ctx.lineTo(64 + 56, 64 + 20); ctx.lineTo(64 + 56, 64 + 44);
ctx.lineTo(64 + 32, 64 + 56); ctx.lineTo(64 + 8, 64 + 44);  ctx.lineTo(64 + 8, 64 + 20);
ctx.closePath(); ctx.fill();
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(64 + BORDER_WIDTH/2, 64 + BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 7: Cyan Capsule / Oval (X: 128, Y: 64)
ctx.fillStyle = "#00cccc";
ctx.beginPath(); ctx.roundRect(128 + 12, 64 + 8, 40, 48, 20); ctx.fill();
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(128 + BORDER_WIDTH/2, 64 + BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);

// Tile 8: Purple Border Box / Frame (X: 192, Y: 64)
ctx.strokeStyle = "#aa55ff";
ctx.lineWidth = 6;
ctx.strokeRect(192 + 12, 64 + 12, 40, 40);
// Outlined border box
ctx.strokeStyle = BORDER_COLOR; ctx.lineWidth = BORDER_WIDTH;
ctx.strokeRect(192 + BORDER_WIDTH/2, 64 + BORDER_WIDTH/2, 64 - BORDER_WIDTH, 64 - BORDER_WIDTH);


// =========================================================================
// 3. GAME STATE & PATTERN BLUEPRINTS
// =========================================================================
let score = 0;

// Setup score overlay graphic UI
const scoreLabel = add([
    text(`Score: ${score}`, { size: 24 }),
    pos(24, 24),
])

// Pattern Blueprints: Customize, modify, or add items here freely!
const levelPool = [
    { sequence: ["circly_tile", "square_tile", "circly_tile"], answer: "square_tile" },
    { sequence: ["triangle_tile", "diamond_tile", "triangle_tile"], answer: "diamond_tile" },
    { sequence: ["star_tile", "oval_tile", "star_tile"], answer: "oval_tile" },
    { sequence: ["hex_tile", "frame_tile", "hex_tile"], answer: "frame_tile" }
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
// 6. GAME INITIALIZATION CONTROLLER
// =========================================================================
function loadRandomGameLevel() {
    const activeLevel = choose(levelPool);
    drawTopSequenceRow(activeLevel.sequence);
    drawBottomSelectorRow(activeLevel.answer);
}

// Kick off the first round of the game
loadRandomGameLevel();

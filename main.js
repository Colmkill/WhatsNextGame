// =========================================================================
// 1. YOUR PATTERN BLUEPRINTS (Easy to edit or add new ones in the future!)
// =========================================================================

// Example A: A color perspective pattern (Red, Blue, Red -> Guess Blue)
const colorPattern = {
    sequence: ["circly_tile", "square_tile", "circly_tile"],
    answer: "square_tile"
};

// Example B: A shape perspective pattern (Triangle, Diamond, Triangle -> Guess Diamond)
const shapePattern = {
    sequence: ["triangle_tile", "diamond_tile", "triangle_tile"],
    answer: "diamond_tile"
};

// Example C: A mixed perspective pattern (Star, Oval, Star -> Guess Oval)
const mixedPattern = {
    sequence: ["star_tile", "oval_tile", "star_tile"],
    answer: "oval_tile"
};

// Master pool of games. To add more games later, just add your new blueprints here!
const levelPool = [colorPattern, shapePattern, mixedPattern];


// =========================================================================
// 2. THE UNIVERSAL TILE ENGINE FUNCTIONS
// =========================================================================

/**
 * Renders any 3-tile sequence on the top row with a mystery 4th question mark slot.
 * @param {string[]} sequenceArray - An array of 3 sprite name strings to draw.
 */
function drawTopSequenceRow(sequenceArray) {
    // Always wipe out the old puzzle tiles before drawing new ones
    destroyAll("top-puzzle-tile");

    // Loop through the 3 template items and render them side-by-side
    sequenceArray.forEach((spriteName, index) => {
        add([
            sprite(spriteName),
            pos(180 + index * 140, 200), // Spaced evenly across the top layer deck
            anchor("center"),
            scale(1.5),
            "top-puzzle-tile"
        ]);
    });

    // Draw the empty question mark placeholder at slot layout position #4
    add([
        sprite("frame_tile"), // Your custom outline box tile frame
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

/**
 * Renders a list of clickable choice buttons along the bottom row deck.
 * @param {string[]} choiceArray - An array of sprite names to display as clickable buttons.
 * @param {string} correctAnswer - The exact sprite name string that wins the round.
 */
function drawBottomSelectorRow(choiceArray, correctAnswer) {
    // Always wipe out the old button tiles before drawing new ones
    destroyAll("bottom-selector-tile");

    choiceArray.forEach((spriteName, index) => {
        const btnX = 145 + index * 170;
        const btnY = 460;

        // Create the interactive clickable button container base
        const btn = add([
            sprite(spriteName), // Draws whichever tile shape/color is passed in
            pos(btnX, btnY),
            anchor("center"),
            scale(1.5),
            area(),
            "bottom-selector-tile"
        ]);

        // Evaluate the action when a user selects a tile option
        btn.onClick(() => {
            if (spriteName === correctAnswer) {
                burp(); // Correct answer celebration audio confirmation sound
                score += 10;
                scoreLabel.text = `Score: ${score}`;
                
                // Pick a brand new pattern configuration and load it seamlessly
                loadRandomGameLevel();
            } else {
                shake(10); // Shake interface camera view frame if choice is wrong
            }
        });
    });
}

/**
 * Grabs a random blueprint configuration from your pool and feeds it into the engines.
 */
function loadRandomGameLevel() {
    const activeLevel = choose(levelPool);

    // 1. Pass the 3 pattern tiles straight to the top row draw function
    drawTopSequenceRow(activeLevel.sequence);

    // 2. Pass options to the bottom. (For now, we just pass 4 default tiles as options)
    const optionsList = ["circly_tile", "square_tile", "triangle_tile", "diamond_tile"];
    drawBottomSelectorRow(optionsList, activeLevel.answer);
}

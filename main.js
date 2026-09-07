// Initialize KAPLAY canvas
kaplay({
    background: [16, 24, 48], // Dark blue background color array
    width: 800,
    height: 600,
})
// Load the engine's built-in asset bundle automatically
loadBean()
loadSprite("apple", "https://kaplayjs.com")
loadSprite("heart", "https://kaplayjs.com")
loadSprite("coin", "https://kaplayjs.com")

const shapes = ["apple", "heart", "coin", "bean",]
// Swap your custom names out for the built-in bean variant configurations

let pattern = []
let targetShape = ""
let score = 0

// Add score text to the screen
const scoreLabel = add([
    text(`Score: ${score}`),
    pos(24, 24),
])

function startNewRound() {
    // 1. Generate a basic alternating sequence: A, B, A, B...
    const shapeA = choose(shapes)
    const shapeB = choose(shapes)
    
    // Pick the mystery 4th shape that should come next
    pattern = [shapeA, shapeB, shapeA]
    targetShape = shapeB 

    // Wipe any old puzzle sprites off the board
    destroyAll("puzzle-piece")

    // 2. Render the pattern on screen (3 items side by side)
    pattern.forEach((shapeName, index) => {
        add([
            sprite(shapeName),
            pos(200 + index * 150, 200),
            anchor("center"),
            scale(2),
            "puzzle-piece"
        ])
    })

    // Draw an empty placeholder question mark for the 4th item
    add([
        text("?"),
        pos(200 + 3 * 150, 200),
        anchor("center"),
        "puzzle-piece"
    ])
}

// 3. Make the interactive interface buttons at the bottom
shapes.forEach((shapeName, index) => {
    // Create button background
    const btn = add([
        rect(100, 60, { radius: 8 }),
        pos(200 + index * 180, 450),
        color(100, 100, 250),
        area(),
        anchor("center")
    ])

    // Label the button with a sprite icon
    add([
        sprite(shapeName),
        pos(btn.pos),
        anchor("center"),
        scale(1.2)
    ])

    // Handle clicks/touches on the choice buttons
    btn.onClick(() => {
        if (shapeName === targetShape) {
            score += 10
            scoreLabel.text = `Score: ${score}`
            burp() // Fun built-in audio confirmation
            startNewRound()
        } else {
            shake(10) // Shake screen if wrong
        }
    })
})

// Boot up the very first round
startNewRound()

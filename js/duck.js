document.addEventListener("DOMContentLoaded", () => {
    // Create the duck element
    const duck = document.createElement("div");
    duck.style.position = "absolute";
    duck.style.width = "50px";
    duck.style.height = "50px";
    duck.style.backgroundColor = "yellow"; // Placeholder for the duck (can be replaced with an image)
    duck.style.borderRadius = "50%"; // Make it circular
    duck.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    duck.style.pointerEvents = "none"; // Prevent the duck from interfering with mouse events
    duck.style.transition = "transform 1s ease"; // Smooth movement
    duck.style.zIndex = "1000"; // Ensure the duck is on top of other elements
    duck.style.userSelect = "none"; // Prevent text selection
    duck.style.touchAction = "none"; // Prevent touch actions
    duck.style.willChange = "transform"; // Optimize for performance
    duck.style.padding = "-500px";

    // Add the duck to the body
    document.body.appendChild(duck);

    // Function to move the duck to a random position within the visible screen
    function moveDuck() {
        const screenWidth = window.innerWidth; // Visible width of the screen
        const screenHeight = window.innerHeight; // Visible height of the screen

        // Generate random positions within the visible screen bounds
        const randomX = Math.random() * (screenWidth - 50); // Subtract duck width
        const randomY = Math.random() * (screenHeight - 50); // Subtract duck height

        // Move the duck to the new position
        duck.style.transform = `translate(0px, 0px)`;
    }

    // Make the duck move periodically
    setInterval(() => {
        moveDuck();

        // Optionally, make the duck "stop" for a moment by not moving every few intervals
        if (Math.random() < 0.2) {
            // 20% chance to "stop" (do nothing)
            return;
        }
    }, 2000); // Move every 2 seconds
});
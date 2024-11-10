const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

function preload() {
    this.load.image('background', 'assets/images/background.png');
    this.load.image('player', 'assets/images/woodman.png');
    this.load.image('camper1', 'assets/images/camper-1.png');
    this.load.image('camper2', 'assets/images/camper-2.png');
    this.load.image('camper3', 'assets/images/camper-3.png');
    this.load.image('camper4', 'assets/images/camper-4.png');
    this.load.audio('music', 'assets/audio/music.mp3');
}

function create() {
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    const background = this.add.image(0, 0, 'background').setOrigin(0.5, 0.5);
    const scale = Math.max(gameWidth / background.width, gameHeight / background.height);
    background.setScale(scale).setScrollFactor(0);
    background.setPosition(gameWidth / 2, gameHeight / 2);

    this.player = this.physics.add.sprite(gameWidth / 2, gameHeight / 2, 'player');
    this.player.setDisplaySize(50, 50);
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.campersSpawned = 0;
    this.items = this.physics.add.group();
    this.camperCounter = 1;
    this.initialDelay = 3000;
    this.currentDelay = this.initialDelay;
    this.minDelay = 75;

    // Margin and vertical spacing for stacked text
    const margin = 20;
    let textY = margin;

    // Score Text
    this.score = 0;
    this.scoreText = this.add.text(margin, textY, 'Score: 0', { fontSize: '24px', fill: '#fff' });
    textY += this.scoreText.height + margin;

    // Pause Button
    this.pauseButton = this.add.text(margin, textY, 'Pause Game', { fontSize: '24px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => togglePause.call(this));
    textY += this.pauseButton.height + margin;

    // Camp Attendance Label above Progress Bar
    this.attendanceText = this.add.text(margin, textY, `Camp Attendance: 0`, { fontSize: '24px', fill: '#fff' });
    textY += this.attendanceText.height + margin;

    // Progress Bar Setup
    const barYPosition = textY;  // Align both bars at the same Y-coordinate

    this.progressBarBackground = this.add.graphics();
    this.progressBarBackground.fillStyle(0x808080, 1);
    this.progressBarBackground.fillRect(margin, barYPosition, 200, 20); // Background for the bar

    this.progressBar = this.add.graphics(); // Foreground that fills up
    updateProgressBar.call(this); // Initialize the progress bar

    // Start Button (centered and larger)
    const startButton = this.add.text(gameWidth / 2, gameHeight / 2, 'Start Game', {
        fontSize: '48px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
        if (!this.gameStarted) {
            this.gameStarted = true;
            startGame.call(this);
            this.music.play({ loop: true });
            this.isMusicPlaying = true;
            startButton.destroy();
        }
    });

    // Music Setup
    this.music = this.sound.add('music');
    this.isMusicPlaying = false;
    this.gamePaused = false;

    // Overlap Detection for Player and Campers
    this.physics.add.overlap(this.player, this.items, killCamper, null, this);

    // Update player target continuously as finger moves
    this.input.on('pointermove', (pointer) => {
        this.targetX = pointer.worldX;
        this.targetY = pointer.worldY;
    });
}

function update() {
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        togglePause.call(this);  // Ensure togglePause is called when spacebar is pressed
        return;  // Exit if pause is toggled to prevent further updates
    }

    if (!this.gameStarted || this.gamePaused) return;

    const targetSpeed = 400;

    // Move player to target position if touch input was registered
    if (this.targetX !== undefined && this.targetY !== undefined) {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetX, this.targetY);

        // Move player toward the target position
        this.physics.moveTo(this.player, this.targetX, this.targetY, targetSpeed);

        // Stop player when close enough to target
        if (distance < 10) {
            this.player.setVelocity(0);
            this.targetX = undefined; // Clear target to stop movement
            this.targetY = undefined;
        }
    } else {
        // Desktop keyboard controls if no touch input is active
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-targetSpeed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(targetSpeed);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-targetSpeed);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(targetSpeed);
        } else {
            this.player.setVelocityY(0);
        }
    }
}

function startGame() {
    // Core logic to start the game, excluding any reference to startButton
    this.startText?.setVisible(false);  // Only hide start text if it's defined

    restartSpawnTimer.call(this);

    for (let i = 0; i < 8; i++) {
        spawnCamper.call(this);
    }
}

function togglePause() {
    this.gamePaused = !this.gamePaused;

    if (this.gamePaused) {
        this.music.pause();
        this.pauseButton.setText('Resume Game');

        this.player.setVelocity(0, 0);

        this.items.getChildren().forEach(camper => {
            camper.storedVelocity = { x: camper.body.velocity.x, y: camper.body.velocity.y };
            camper.setVelocity(0, 0);
        });

        this.time.removeAllEvents();

    } else {
        this.music.resume();
        this.pauseButton.setText('Pause Game');

        this.items.getChildren().forEach(camper => {
            if (camper.storedVelocity) {
                camper.setVelocity(camper.storedVelocity.x, camper.storedVelocity.y);
            }
        });

        restartSpawnTimer.call(this);
    }
}

function restartSpawnTimer() {
    const spawnWithDelay = () => {
        if (this.campersSpawned >= 100) {
            gameOver.call(this);
            return;
        } else {
            spawnCamper.call(this);

            const elapsedTime = this.time.now / 1000;  // Time in seconds
            if (elapsedTime >= 18) {
                this.currentDelay = Math.max(this.currentDelay - 100, this.minDelay);  // Faster reduction after 18 seconds
            } else {
                this.currentDelay = Math.max(this.currentDelay - 50, this.minDelay);
            }

            const difficultyPercent = Math.floor(100 * (1 - this.currentDelay / this.initialDelay));
            updateProgressBar.call(this);

            this.time.addEvent({
                delay: this.currentDelay,
                callback: spawnWithDelay,
                callbackScope: this
            });
        }
    };

    this.time.addEvent({
        delay: this.currentDelay,
        callback: spawnWithDelay,
        callbackScope: this
    });
}

function updateProgressBar() {
    const maxCampers = 100;
    const progress = Phaser.Math.Clamp(this.campersSpawned / maxCampers, 0, 1);
    const barWidth = 200 * progress; // Adjust to fill up to 200px width

    this.attendanceText.setText(`Camp Attendance: ${this.campersSpawned}`);

    // Set the progress bar color based on the number of campers
    let color;
    if (this.campersSpawned <= 33) {
        color = 0x8B0000; // Dark red
    } else if (this.campersSpawned <= 66) {
        color = 0xB22222; // Medium red
    } else {
        color = 0xFF0000; // Bright red
    }

    this.progressBar.clear();
    this.progressBar.fillStyle(color, 1); // Set the fill color
    this.progressBar.fillRect(20, 154, barWidth, 20);
}

function spawnCamper() {
    const camperKey = `camper${this.camperCounter}`;
    const x = Phaser.Math.Between(100, this.sys.game.config.width - 100);
    const y = Phaser.Math.Between(100, this.sys.game.config.height - 100);

    const camper = this.items.create(x, y, camperKey);
    camper.setDisplaySize(50, 50);
    camper.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
    camper.setCollideWorldBounds(true);
    camper.setBounce(1);

    this.campersSpawned++;
    updateProgressBar.call(this);

    this.camperCounter++;
    if (this.camperCounter > 4) {
        this.camperCounter = 1;
    }
}

function killCamper(player, camper) {
    camper.disableBody(true, true);
    this.campersSpawned = Math.max(this.campersSpawned - 1, 0);
    updateProgressBar.call(this);

    this.score += 20;
    this.scoreText.setText('Score: ' + this.score);

    this.currentDelay = Math.max(this.currentDelay - 100, this.minDelay);
}

function toggleMusic() {
    if (this.isMusicPlaying) {
        this.music.pause();
        this.musicButton.setText('Play Music');
    } else {
        this.music.resume();
        this.musicButton.setText('Pause Music');
    }
    this.isMusicPlaying = !this.isMusicPlaying;
}

function gameOver() {
    this.gamePaused = true;

    this.items.getChildren().forEach(camper => camper.setVelocity(0, 0));
    this.time.removeAllEvents();

    // Create a black background rectangle to cover the entire screen
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    const blackBackground = this.add.graphics();
    blackBackground.fillStyle(0x000000, 0.8); // Black color with opacity (0.8)
    blackBackground.fillRect(0, 0, gameWidth, gameHeight); // Full-screen rectangle

    // Hide all game objects except for the text
    this.player.setVisible(false);
    this.items.getChildren().forEach(camper => camper.setVisible(false));
    this.scoreText.setVisible(false);
    this.pauseButton.setVisible(false);
    this.attendanceText.setVisible(false);
    this.progressBarBackground.setVisible(false);
    this.progressBar.setVisible(false);

    // Show game over text
    this.add.text(gameWidth / 2, gameHeight / 2, 'Game Over!', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0.5);

    // Show instructions to restart
    this.add.text(gameWidth / 2, gameHeight / 2 + 80, 'Reload to try again', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Add a restart button
    const restartButton = this.add.text(gameWidth / 2, gameHeight / 2 + 160, 'Restart Game', {
        fontSize: '48px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
        // Reload the game
        location.reload();
    });
}
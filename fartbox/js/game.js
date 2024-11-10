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
    this.camperText.setText(`Campers: ${this.campersSpawned}`);

    this.camperCounter++;
    if (this.camperCounter > 4) {
        this.camperCounter = 1;
    }
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

    this.difficultyText = this.add.text(gameWidth - 300, gameHeight - 100, `Difficulty: 0%`, { fontSize: '24px', fill: '#fff' });
    this.difficultySpeedText = this.add.text(gameWidth - 300, gameHeight - 60, `Camp Popularity: ${this.currentDelay} ms`, { fontSize: '24px', fill: '#fff' });
    this.camperText = this.add.text(gameWidth - 300, gameHeight - 30, `Campers: ${this.campersSpawned}`, { fontSize: '24px', fill: '#fff' });

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
    this.music = this.sound.add('music');
    this.isMusicPlaying = false;
    this.gamePaused = false;

    this.musicButton = this.add.text(16, 50, 'Pause Music', { fontSize: '24px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => toggleMusic.call(this));

    this.pauseButton = this.add.text(16, 90, 'Pause Game', { fontSize: '24px', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => togglePause.call(this));

    this.physics.add.overlap(this.player, this.items, killCamper, null, this);

    this.gameStarted = false;

    // Create Start Button
    const startButton = this.add.text(gameWidth / 2, gameHeight / 2, 'Start Game', {
        fontSize: '48px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    // Start the game and play music when Start button is clicked
    startButton.on('pointerdown', () => {
        if (!this.gameStarted) {
            this.gameStarted = true;
            startGame.call(this);
            this.music.play({ loop: true });
            this.isMusicPlaying = true;

            // Destroy the Start button to remove it from the game entirely
            startButton.destroy();
        }
    });

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
            this.difficultyText.setText(`Difficulty: ${difficultyPercent}%`);
            this.difficultySpeedText.setText(`Camp Popularity: ${this.currentDelay} ms`);

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

function killCamper(player, camper) {
    camper.disableBody(true, true);
    this.campersSpawned--;
    this.camperText.setText(`Campers: ${this.campersSpawned}`);
    this.score += 20;
    this.scoreText.setText('Score: ' + this.score);

    this.currentDelay = Math.max(this.currentDelay - 100, this.minDelay);

    const difficultyPercent = Math.floor(100 * (1 - this.currentDelay / this.initialDelay));
    this.difficultyText.setText(`Difficulty: ${difficultyPercent}%`);
    this.difficultySpeedText.setText(`Camp Popularity: ${this.currentDelay} ms`);
}

function gameOver() {
    this.gamePaused = true;

    this.items.getChildren().forEach(camper => camper.setVelocity(0, 0));
    this.time.removeAllEvents();

    if (this.music.isPlaying) {
        this.music.pause();
    }

    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    this.add.text(gameWidth / 2, gameHeight / 2, 'Game Over!', {
        fontSize: '64px',
        fill: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(gameWidth / 2, gameHeight / 2 + 80, 'Press F5 to Restart', {
        fontSize: '24px',
        fill: '#ffffff'
    }).setOrigin(0.5);
}

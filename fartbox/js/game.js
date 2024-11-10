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
    this.startText = this.add.text(gameWidth / 2, gameHeight / 2, 'Press Arrow Key to Start', {
        fontSize: '32px',
        fill: '#fff'
    }).setOrigin(0.5);
}

function update() {
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        togglePause.call(this);
    }

    if (!this.gameStarted) {
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown) {
            startGame.call(this);
        }
        return;
    }

    if (this.gamePaused) return;

    const targetSpeed = 320;
    const acceleration = 50;
    const decelerationFactor = 0.7;

    if (this.cursors.left.isDown) {
        this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x - acceleration, -targetSpeed, 0));
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x + acceleration, 0, targetSpeed));
    } else {
        this.player.setVelocityX(this.player.body.velocity.x * decelerationFactor);
        if (Math.abs(this.player.body.velocity.x) < 5) this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
        this.player.setVelocityY(Phaser.Math.Clamp(this.player.body.velocity.y - acceleration, -targetSpeed, 0));
    } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(Phaser.Math.Clamp(this.player.body.velocity.y + acceleration, 0, targetSpeed));
    } else {
        this.player.setVelocityY(this.player.body.velocity.y * decelerationFactor);
        if (Math.abs(this.player.body.velocity.y) < 5) this.player.setVelocityY(0);
    }
}

function startGame() {
    this.gameStarted = true;
    this.startText.setVisible(false);
    this.music.play({ loop: true });
    this.isMusicPlaying = true;

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
            this.currentDelay = Math.max(this.currentDelay - 50, this.minDelay);

            const difficultyPercent = Math.floor(100 * ((this.initialDelay - this.currentDelay) / (this.initialDelay - this.minDelay)));
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

    const difficultyPercent = Math.floor(100 * ((this.initialDelay - this.currentDelay) / (this.initialDelay - this.minDelay)));
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

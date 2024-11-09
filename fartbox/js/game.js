const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
  
  function preload() {
    this.load.image('background', 'assets/images/background.png'); // Replace with your background image
    this.load.audio('song', 'assets/audio/song.mp3'); // Replace with your song
  }
  
  function create() {
    this.add.image(400, 300, 'background');
    this.music = this.sound.add('song');
    this.music.play();
  
    this.add.text(100, 100, 'Welcome to The Very Bad Days interactive experience!', {
      fontSize: '24px',
      fill: '#fff'
    });
  }
  
  function update() {
    // Add any interactive code or animations here
  }
  
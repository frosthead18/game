const gameOptions = {
  shipHorizontalSpeed: 400,       // ship horizontal speed, can be modified to change gameplay
  barrierSpeed: 100,              // barrier vertical speed, can be modified to change gameplay
  barrierGap: 150,                // gap between two barriers, in pixels
  safeZones: 5,                    // amount of possible safe zone. It affects safe zone width
  width: 800,
  height: 600,
}

export class MainScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private horizontalBarrierGroup!: Phaser.Physics.Arcade.Group
  private horizontalBarrierPool: any[] = [];

  constructor(){
    super("PlayGame");
  }

  preload(){
    this.load.image("ship", "assets/radical/ship.png");
    this.load.image("barrier", "assets/radical/barrier.png");
  }

  create(){
    this.ship = this.physics.add.sprite(gameOptions.width / 2, gameOptions.height / 5 * 4, "ship");
    this.input.on("pointerdown", this.moveShip, this);
    this.input.on("pointerup", this.stopShip, this);
    this.addBarriers();
  }

  moveShip(p: any){
    let speedMultiplier = (p.x < gameOptions.width / 2) ? -1 : 1;
    // @ts-ignore
    this.ship.body.velocity.x = gameOptions.shipHorizontalSpeed * speedMultiplier;
  }

  stopShip(){
    // @ts-ignore
    this.ship.body.velocity.x = 0;
  }

  addBarriers(){
    this.horizontalBarrierGroup = this.physics.add.group()
    for(let i = 0; i < 10; i++){
      this.horizontalBarrierPool = [this.horizontalBarrierGroup.create(0, 0, "barrier"), this.horizontalBarrierGroup.create(0, 0, "barrier")];
      this.placeHorizontalBarriers();
    }
    this.horizontalBarrierGroup.setVelocityY(gameOptions.barrierSpeed);
  }

  getTopmostBarrier(){
    let topmostBarrier = gameOptions.height;

    this.horizontalBarrierGroup.getChildren().forEach((barrier) => {
      // @ts-ignore
      topmostBarrier = Math.min(topmostBarrier, barrier.y)
    });

    return topmostBarrier;
  }

  placeHorizontalBarriers(){
    let topmost = this.getTopmostBarrier();
    let holePosition = Phaser.Math.Between(0, gameOptions.safeZones - 1);
    this.horizontalBarrierPool[0].x = holePosition * gameOptions.width / gameOptions.safeZones;
    this.horizontalBarrierPool[0].y = topmost - gameOptions.barrierGap;
    this.horizontalBarrierPool[0].setOrigin(1, 0);
    this.horizontalBarrierPool[1].x = (holePosition + 1) * gameOptions.width / gameOptions.safeZones;
    this.horizontalBarrierPool[1].y = topmost - gameOptions.barrierGap;
    this.horizontalBarrierPool[1].setOrigin(0, 0);
    this.horizontalBarrierPool = [];
  }

  override update(){
    this.ship.x = Phaser.Math.Wrap(this.ship.x, 0, gameOptions.width);
    this.physics.world.collide(this.ship, this.horizontalBarrierGroup, () =>{
      this.scene.start("PlayGame");
    }, undefined, this);
    this.horizontalBarrierGroup.getChildren().forEach((barrier) => {
      // @ts-ignore
      if(barrier.y > gameOptions.height){
        this.horizontalBarrierPool.push(barrier);

        if (this.horizontalBarrierPool.length == 2) {
          this.placeHorizontalBarriers();
        }
      }
    }, this);
  }
}

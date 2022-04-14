import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

export interface Position {
  x: number;
  y: number;
}

export enum Directions {
  Up = 'up',
  Right = 'right',
  Down = 'down',
  Left = 'left'
}

export enum ArrowKeys {
  ArrowUp = 'ArrowUp',
  ArrowRight = 'ArrowRight',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft'
}

export enum SpeedOptions {
  SuperSlow = 'SuperSlow',
  Slow = 'Slow',
  Fast = 'Fast',
  SuperFast = 'SuperFast'
}

@Component({
  selector: 'snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit{
  // # Data

  // -- Angular
  @ViewChild('boardRef', { static: true })
  boardRef: ElementRef<HTMLCanvasElement>;

  // listen for arrow key press and change direction of the snake
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key !== this.direction && this._timeout !== this._cachedTimeout) {
      switch (event.key) {
        case ArrowKeys.ArrowUp:
          this.direction =
            this.direction !== Directions.Down ? Directions.Up : this.direction;
          break;
        case ArrowKeys.ArrowRight:
          this.direction =
            this.direction !== Directions.Left
              ? Directions.Right
              : this.direction;
          break;
        case ArrowKeys.ArrowDown:
          this.direction =
            this.direction !== Directions.Up ? Directions.Down : this.direction;
          break;
        case ArrowKeys.ArrowLeft:
          this.direction =
            this.direction !== Directions.Right
              ? Directions.Left
              : this.direction;
          break;
      }
      this._cachedTimeout = this._timeout;
    }
  }

  @Input()
  startingPositions: Position[] = [
    { x: 20, y: 20 },
    { x: 30, y: 20 },
    { x: 40, y: 20 }
  ];

  @Input()
  boardSize = 300;

  @Input()
  speed = SpeedOptions.Slow

  @Input()
  foodColor = '#61BB45';

  @Input()
  snakeColor = '#424242';

  @Input()
  showPoints = true;

  @Output()
  pointsChanged = new EventEmitter<number>();

  @Output()
  gameStarted = new EventEmitter<boolean>();

  // -- sync
  direction = Directions.Right;
  step = 10;
  points = 0;
  foodPosition: Position;
  private _boardContext: CanvasRenderingContext2D;
  private _timeout;
  private _cachedTimeout: number;
  private _snake: Position[] = [ ...this.startingPositions ];

  ngOnInit() {
    this._boardContext = this.boardRef.nativeElement.getContext('2d');
    this._generateFoodPosition();
    this.loopGame();
    this.gameStarted.emit(true);
  }

  loopGame() {
    this._recalculateSnake();
    this._drawSnake();
    this._drawPart(this.foodPosition, this.foodColor);
    this._timeout = setTimeout(() => this.loopGame(), this._getSpeed(this.speed));
  }

  private _getSpeed(speedOption: SpeedOptions) {
    switch (speedOption) {
      case SpeedOptions.SuperSlow: return 100;
      case SpeedOptions.Slow: return 80;
      case SpeedOptions.Fast: return 60;
      case SpeedOptions.SuperFast: return 40;
      default: return 80;
    }
  }

  restartGame() {
    this.points = 0;
    this.pointsChanged.emit(this.points);
    this._snake = [ ...this.startingPositions ];
    this.direction = Directions.Right;
    this.gameStarted.emit(true);
  }

  // draw individual part
  private _drawPart(part: Position, fillColor?: string) {
    this._boardContext.fillStyle = fillColor || this.snakeColor;
    this._boardContext.fillRect(part.x, part.y, this.step, this.step);
  }

  // draw whole snake by given array of snake positions
  private _drawSnake() {
    // clear canvas
    this._clearCanvas();
    // loop through snake and draw all parts
    this._snake.forEach((part) => this._drawPart(part));
  }

  // move whole snake by given direction
  private _recalculateSnake() {
    if (this._snake.length) {
      this._snake.forEach((_, index) => (this._snake[index] = this._snake[index + 1]
        ? this._snake[index + 1]
        : this._snake[index])
      );
      this._snake[this._snake.length - 1] = this._getHeadPosition(this._snake[this._snake.length - 1]);
      // check snake colisions
      this._checkColision();
    }
  }

  private _checkColision() {
    const snake = [...this._snake];
    const snakeHead = snake[snake.length - 1];
    snake.pop();

    // snake colision
    if (snake.some((part) => part.x === snakeHead.x && part.y === snakeHead.y)) {
      this.restartGame();
    }

    // food colision
    if (snakeHead.x === this.foodPosition.x && snakeHead.y === this.foodPosition.y) {
      this._generateFoodPosition();
      this.points++;
      this.pointsChanged.emit(this.points);
      this._snake.unshift(this._snake[0]);
    }

    // wall colision
    if (snakeHead.x <= 0 || snakeHead.x >= this.boardSize || snakeHead.y <= 0 || snakeHead.y >= this.boardSize) {
      this._snake[this._snake.length - 1] = {
        x: this._mod(snakeHead.x),
        y: this._mod(snakeHead.y)
      };
    }
  }

  // get new snake head position by given direction
  private _getHeadPosition(part: Position) {
    switch (this.direction) {
      case Directions.Up:
        return { x: part.x, y: part.y - this.step };
      case Directions.Right:
        return { x: part.x + this.step, y: part.y };
      case Directions.Down:
        return { x: part.x, y: part.y + this.step };
      case Directions.Left:
        return { x: part.x - this.step, y: part.y };
    }
  }

  // clear whole canvas
  private _clearCanvas() {
    this._boardContext.clearRect(0, 0, this.boardSize, this.boardSize);
  }

  private _generateRandomPosition() {
    const difference = this.boardSize - this.step;
    const randomX = Math.ceil(Math.floor(Math.random() * difference) / this.step) * this.step;
    const randomY = Math.ceil(Math.floor(Math.random() * difference) / this.step) * this.step;
    const randomPosition = {
      x: randomX,
      y: randomY,
    };
    return randomPosition;
  }

  private _generateFoodPosition() {
    let randomPosition = this._generateRandomPosition();
    while (this._snake.some((part) => part.x === randomPosition.x && part.y === randomPosition.y)) {
      randomPosition = this._generateRandomPosition();
    }
    this.foodPosition = randomPosition;
    return randomPosition;
  }

  private _mod(n: number, max: number = this.boardSize) {
    return ((n % max) + max) % max;
  }
}

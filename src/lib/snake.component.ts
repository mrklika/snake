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

@Component({
  selector: 'snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss']
})
export class SnakeComponent implements OnInit {
  // # Data

  // -- Angular
  @ViewChild('boardRef', { static: true })
  private _boardRef: ElementRef<HTMLCanvasElement>;

  // listen for arrow key press and change direction of the snake
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (ArrowKeys[event.key]) {
      switch (event.key) {
        case ArrowKeys.ArrowUp:
          this._direction = this._direction !== Directions.Down ? Directions.Up : this._direction;
          break;
        case ArrowKeys.ArrowRight:
          this._direction = this._direction !== Directions.Left
            ? Directions.Right
            : this._direction;
          break;
        case ArrowKeys.ArrowDown:
          this._direction = this._direction !== Directions.Up ? Directions.Down : this._direction;
          break;
        case ArrowKeys.ArrowLeft:
          this._direction = this._direction !== Directions.Right
            ? Directions.Left
            : this._direction;
          break;
      }
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
  speedInterval = 80;

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
  points = 0;
  private _foodPosition: Position;
  private _step = 10;
  private _direction = Directions.Right;
  private _boardContext: CanvasRenderingContext2D;
  private _interval;
  private _snake: Position[];

  ngOnInit() {
    this._boardContext = this._boardRef.nativeElement.getContext('2d');
    this._startGame();
  }

  private _startGame() {
    this.restartGame();
  }

  private _loopGame() {
    this._recalculateSnake();
    this._drawSnake();
    this._drawPart(this._foodPosition, this.foodColor);
  }

  restartGame() {
    this._setSnake([ ...this.startingPositions ]);
    this._generateFoodPosition();
    this._changePoints(0);
    this._changeDirection(Directions.Right);
    this._loopGame();
    this._setInterval();
    this.gameStarted.emit(true);
  }

  private _setInterval() {
    clearInterval(this._interval);
    this._interval = setInterval(() => this._loopGame(), this.speedInterval);
  }

  private _setSnake(snake: Position[]) {
    this._snake = snake;
  }

  private _changeDirection(direction: Directions) {
    this._direction = direction;
  }

  private _changePoints(points: number) {
    this.points = points;
    this.pointsChanged.emit(this.points);
  }

  // draw individual part
  private _drawPart(part: Position, fillColor?: string) {
    this._boardContext.fillStyle = fillColor || this.snakeColor;
    this._boardContext.fillRect(part.x, part.y, this._step, this._step);
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
    const snake = [ ...this._snake ];
    const snakeHead = snake[snake.length - 1];
    snake.pop();

    // snake colision
    if (snake.some((part) => part.x === snakeHead.x && part.y === snakeHead.y)) {
      this.restartGame();
    }

    // food colision
    if (snakeHead.x === this._foodPosition.x && snakeHead.y === this._foodPosition.y) {
      this._generateFoodPosition();
      this._changePoints(this.points + 1);
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
    switch (this._direction) {
      case Directions.Up:
        return { x: part.x, y: part.y - this._step };
      case Directions.Right:
        return { x: part.x + this._step, y: part.y };
      case Directions.Down:
        return { x: part.x, y: part.y + this._step };
      case Directions.Left:
        return { x: part.x - this._step, y: part.y };
    }
  }

  // clear whole canvas
  private _clearCanvas() {
    this._boardContext.clearRect(0, 0, this.boardSize, this.boardSize);
  }

  private _generateRandomPosition() {
    const difference = this.boardSize - this._step;
    const randomX = Math.ceil(Math.floor(Math.random() * difference) / this._step) * this._step;
    const randomY = Math.ceil(Math.floor(Math.random() * difference) / this._step) * this._step;
    const randomPosition = {
      x: randomX,
      y: randomY
    };
    return randomPosition;
  }

  private _generateFoodPosition() {
    let randomPosition = this._generateRandomPosition();
    while (this._snake.some((part) => part.x === randomPosition.x && part.y === randomPosition.y)) {
      randomPosition = this._generateRandomPosition();
    }
    this._foodPosition = randomPosition;
    return randomPosition;
  }

  private _mod(n: number, max: number = this.boardSize) {
    return ((n % max) + max) % max;
  }
}

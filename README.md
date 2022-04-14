# Snake
The classic snake game you know, powered by Angular.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.0.

## Installation
```bash
npm i @mrklika/snake
```

## Inputs
```python
@Input()
startingPositions: Position[] = [
  { x: 20, y: 20 },
  { x: 30, y: 20 },
  { x: 40, y: 20 }
];

@Input()
boardSize = 300;

@Input()
speed = SpeedOptions.Slow;

@Input()
foodColor = '#61BB45';

@Input()
snakeColor = '#424242';

@Input()
showPoints = true;
```

## Outputs
```python
@Output()
pointsChanged = new EventEmitter<number>();

@Output()
gameStarted = new EventEmitter<boolean>();
```

## License
[MIT](https://choosealicense.com/licenses/mit)

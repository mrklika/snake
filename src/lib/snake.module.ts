import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeComponent } from './snake.component';

@NgModule({
  declarations: [ SnakeComponent ],
  imports: [ CommonModule ],
  exports: [ SnakeComponent ]
})
export class SnakeModule { }

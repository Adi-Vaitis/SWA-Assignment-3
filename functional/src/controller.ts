import { Position } from './board'
import { Model } from './model'

export class Controller<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model
  }

  click(p: Position) {
    if (this.model.isSelected(p)) {
      this.model.unselect(p)
    } else {
      this.model.select(p)
      if (this.model.selection.length == 2) {
        const [first, second] = this.model.selection
        if (this.model.canMove(first, second)) {
          this.model.move(first, second)
        } else {
          this.model.addMessage("Can't move")
        }
        this.model.unselect(first)
        this.model.unselect(second)
      }
    }
  }
}

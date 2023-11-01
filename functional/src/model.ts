import { Position, Match, Generator } from './board'
import * as Board from './board'

const equalPosition = (p: Position) => (q: Position) => p.row === q.row && p.col === q.col

const toStringPosition = ({row, col}: Position) => `(${row}, ${col})`
const toStringPositions = (ps: Position[]) => `[${ps.map(toStringPosition).join(', ')}]`
const toStringMatch = <T>({matched, positions}: Match<T>) => `${toStringPositions(positions)}: ${matched}`

export class Model<T> {
    private observers: Set<((b: Model<T>) => void)>
    private _board: Board.Board<T>
    private selected: Position[]
    private _messages: string[]
    private generator: Generator<T>

    constructor(board: Board.Board<T>, generator: Generator<T>) {
        this._board = board
        this.observers = new Set()
        this.selected = []
        this._messages = []
        this.generator = generator
    }

    addObserver(observer: (b: Model<T>) => void) {
        this.observers.add(observer)
    }

    private notify() {
        this.observers.forEach(o => o(this))
    }

    get board(): Board.Board<T> {
        return this._board
    }

    piece(p: Position): T {
        return Board.piece(this._board, p)
    }

    canMove(first: Position, second: Position): boolean {
        return Board.canMove(this._board, first, second)
    }

    move(first: Position, second: Position) {
        const result = Board.move(this.generator, this._board, first, second)
        result.effects.forEach(eff => {
            if (eff.kind === 'Match') {
                this.addMessage(toStringMatch(eff.match))
            } else {
                this._board = eff.board
                this.notify()
            }
        })
        this._board = result.board
        this.notify()
    }

    select(p: Position) {
        if (!this.isSelected(p)) {
            this.selected.push(p)
            this.notify()
        }
    }

    unselect(p: Position) {
        if (this.isSelected(p)) {
            this.selected = this.selected.filter(q => !equalPosition(p)(q))
            this.notify()
        }
    }

    isSelected(p: Position): boolean {
        return this.selected.find(equalPosition(p)) !== undefined
    }

    get selection(): Position[] {
        return this.selected
    }

    addMessage(message: string) {
        this._messages.push(message)
        this.notify()
    }

    get messages(): string[] {
        return [...this._messages]
    }
}
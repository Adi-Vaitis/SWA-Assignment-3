import { Position, Board, BoardEvent, Match } from './board'

const equalPosition = (p: Position) => (q: Position) => p.row === q.row && p.col === q.col

const toStringPosition = ({row, col}: Position) => `(${row}, ${col})`
const toStringPositions = (ps: Position[]) => `[${ps.map(toStringPosition).join(', ')}]`
const toStringMatch = <T>({matched, positions}: Match<T>) => `${toStringPositions(positions)}: ${matched}`

export class Model<T> {
    private observers: Set<((b: Model<T>) => void)>
    private _board: Board<T>
    private selected: Position[]
    private _messages: string[]

    constructor(board: Board<T>) {
        this._board = board
        this.observers = new Set()
        this.selected = []
        this._messages = []
        board.addListener(this.listener)
    }

    addObserver(observer: (b: Model<T>) => void) {
        this.observers.add(observer)
    }

    private notify() {
        this.observers.forEach(o => o(this))
    }

    private listener = (e: BoardEvent<T>) => {
        if (e.kind === 'Match') {
            this.addMessage(toStringMatch(e.match))
        }
        this.notify()
    }

    get board(): Board<T> {
        return this._board
    }

    piece(p: Position): T {
        return this._board.piece(p)
    }

    canMove(first: Position, second: Position): boolean {
        return this._board.canMove(first, second)
    }

    move(first: Position, second: Position) {
        this._board.move(first, second)
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
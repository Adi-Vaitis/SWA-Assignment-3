import { describe, it, expect, beforeEach } from '@jest/globals'
import { Generator, Position, Board, BoardEvent } from '../src/board'

class CyclicGenerator implements Generator<string> {
    private sequence: string
    private index: number

    constructor(sequence: string) {
        this.sequence = sequence
        this.index = 0
    }

    next(): string {
        const n = this.sequence.charAt(this.index)
        this.index = (this.index + 1) % this.sequence.length
        return n
    }
}

class GeneratorFake<T> implements Generator<T> {
    private upcoming: T[]

    constructor(...upcoming: T[]) {
        this.upcoming = upcoming
    }

    prepare(...e: T[]) {
        this.upcoming.push(...e)
    }

    next(): T {
        let v = this.upcoming.shift()
        if (v === undefined)
            throw new Error('Empty queue')
        else
            return v
    }

}

function require(board: Board<String>) {
    function index({ row, col }: Position) {
        return row * board.width + col
    }

    function toEqual(...tiles: String[]) {
        board.positions().forEach(p => expect(board.piece(p)).toEqual(tiles[index(p)]));
    }

    function toMatch(...tiles: String[]) {
        const matched: (String | undefined)[] = []
        board.positions().forEach(p => {
            if (tiles[index(p)] === '*') {
                matched.push(board.piece(p))
            } else {
                expect(board.piece(p)).toEqual(tiles[index(p)])
            }
        })

        function withPieces(...pieces: String[]) {
            expect(pieces.sort()).toEqual(matched.sort())
        }

        return { withPieces }
    }

    return { toEqual, toMatch }
}

describe("Board", () => {
    describe("Initial board", () => {
        const generator = new CyclicGenerator('ABC')
        const board = new Board(generator, 2, 3)

        it("has the given width", () => {
            expect(board.width).toEqual(2)
        })

        it("has the given height", () => {
            expect(board.height).toEqual(3)
        })

        it("has row * col positions", () => {
            const positions = [{ row: 0, col: 0 }, { row: 0, col: 1 },
            { row: 1, col: 0 }, { row: 1, col: 1 },
            { row: 2, col: 0 }, { row: 2, col: 1 }]
            expect(board.positions()).toEqual(positions)
        })

        it("contains the generated elements", () => {
            expect(board.piece({ row: 0, col: 0 })).toEqual('A')
            expect(board.piece({ row: 1, col: 1 })).toEqual('A')
            expect(board.piece({ row: 0, col: 1 })).toEqual('B')
            expect(board.piece({ row: 2, col: 0 })).toEqual('B')
            expect(board.piece({ row: 1, col: 0 })).toEqual('C')
            expect(board.piece({ row: 2, col: 1 })).toEqual('C')
        })

        it("is undefined outside of the board", () => {
            expect(board.piece({ row: 0, col: -1 })).toBeUndefined()
            expect(board.piece({ row: -1, col: 0 })).toBeUndefined()
            expect(board.piece({ row: 0, col: 2 })).toBeUndefined()
            expect(board.piece({ row: 3, col: 0 })).toBeUndefined()
        })
    })

    describe("moves", () => {
        describe("valid moves", () => {
            const generator = new GeneratorFake<String>(
                'A', 'B', 'A', 'C',
                'D', 'C', 'A', 'C',
                'D', 'A', 'D', 'D',
                'C', 'C', 'D', 'C'
            )
            const board = new Board(generator, 4, 4)
            describe("valid vertical moves", () => {
                it("recognizes vertical moves that moves first piece to a horizontal match as valid", () => {
                    expect(board.canMove({ row: 2, col: 1 }, { row: 0, col: 1 })).toEqual(true)
                })
                it("recognizes vertical moves that moves second piece to a horizontal match as valid", () => {
                    expect(board.canMove({ row: 0, col: 1 }, { row: 2, col: 1 })).toEqual(true)
                })
                it("recognizes vertical moves that moves first piece to a vertical match as valid", () => {
                    expect(board.canMove({ row: 3, col: 3 }, { row: 2, col: 3 })).toEqual(true)
                })
                it("recognizes vertical moves that moves second piece to a vertical match as valid", () => {
                    expect(board.canMove({ row: 2, col: 3 }, { row: 3, col: 3 })).toEqual(true)
                })
            })

            describe("valid horizontal moves", () => {
                it("recognizes horizontal moves that moves first piece to a horizontal match as valid", () => {
                    expect(board.canMove({ row: 3, col: 3 }, { row: 3, col: 2 })).toEqual(true)
                })
                it("recognizes horizontal moves that moves second piece to a horizontal match as valid", () => {
                    expect(board.canMove({ row: 3, col: 2 }, { row: 3, col: 3 })).toEqual(true)
                })
                it("recognizes horizontal moves that moves first piece to a vertical match as valid", () => {
                    expect(board.canMove({ row: 1, col: 0 }, { row: 1, col: 2 })).toEqual(true)
                })
                it("recognizes horizontal moves that moves second piece to a vertical match as valid", () => {
                    expect(board.canMove({ row: 1, col: 2 }, { row: 1, col: 0 })).toEqual(true)
                })
            })

            describe("invalid moves", () => {
                it("does not allow moves that make no matches", () => {
                    expect(board.canMove({ row: 0, col: 0 }, { row: 0, col: 0 })).toEqual(false)
                })
                it("does not count the piece that is moved away", () => {
                    expect(board.canMove({ row: 1, col: 1 }, { row: 2, col: 1 })).toEqual(false)
                })
                it("recognizes moves on different rows and columns as invalid", () => {
                    expect(board.canMove({ row: 0, col: 3 }, { row: 1, col: 2 })).toEqual(false)
                })
                it("recognizes out-of-bounds moves as invalid", () => {
                    expect(board.canMove({ row: 3, col: 3 }, { row: -1, col: 3 })).toEqual(false)
                    expect(board.canMove({ row: 3, col: 3 }, { row: 3, col: -1 })).toEqual(false)
                    expect(board.canMove({ row: 2, col: 0 }, { row: 2, col: 4 })).toEqual(false)
                })
            })
        })

        describe("making moves", () => {
            let events: BoardEvent<String>[]
            let generator: GeneratorFake<String>
            let board: Board<String>

            beforeEach(() => {
                events = []
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A', 'C', 'F',
                    'D', 'B', 'C', 'C', 'A',
                    'D', 'A', 'C', 'B', 'F',
                    'C', 'D', 'D', 'C', 'D'
                )
                board = new Board(generator, 5, 4)
                board.addListener(e => events.push(e))
            })

            it("moves the pieces during a move", () => {
                generator.prepare('C', 'D', 'A')
                board.move({ row: 2, col: 1 }, { row: 0, col: 1 })
                expect(board.piece({ row: 2, col: 1 })).toEqual('B')
            })
            it("finds single horizontal match when moving first piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                board.move({ row: 2, col: 1 }, { row: 0, col: 1 })
                console.log("Events " + JSON.stringify(events.slice(0, 1)));
                expect(events.slice(0, 1)).toEqual([{ kind: 'Match', match: { matched: 'A', positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] } }])
            })
            it("finds single horizontal match when moving second piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                expect(events.slice(0, 1)).toEqual([{ kind: 'Match', match: { matched: 'A', positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] } }])
            })
            it("finds single vertical match when moving first piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                board.move({ row: 3, col: 3 }, { row: 2, col: 3 })
                expect(events.slice(0, 1)).toEqual([{ kind: 'Match', match: { matched: 'C', positions: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }] } }])
            })
            it("finds single vertical match when moving second piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                board.move({ row: 2, col: 3 }, { row: 3, col: 3 })
                expect(events.slice(0, 1)).toEqual([{ kind: 'Match', match: { matched: 'C', positions: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }] } }])
            })
            it("fires multiple events on horz + vert matches", () => {
                generator.prepare('G', 'H', 'I')
                generator.prepare('J', 'K', 'L')
                generator.prepare('J', 'K', 'L')
                board.move({ row: 3, col: 4 }, { row: 3, col: 0 })
                expect(events.slice(0, 2)).toEqual([
                    { kind: 'Match', match: { matched: 'D', positions: [{ row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }] } },
                    { kind: 'Match', match: { matched: 'D', positions: [{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }] } },
                ])
            })
            it("fires multiple events when both pieces make new matches", () => {
                generator.prepare('C', 'D', 'A')
                generator.prepare('B', 'A', 'B')
                board.move({ row: 3, col: 2 }, { row: 3, col: 0 })
                expect(events.slice(0, 2)).toEqual([
                    { kind: 'Match', match: { matched: 'C', positions: [{ row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }] } },
                    { kind: 'Match', match: { matched: 'D', positions: [{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }] } },
                ])
            })
            it("doesn't swap on illegal moves", () => {
                generator.prepare('C', 'D', 'A', 'C', 'D', 'A', 'C', 'D', 'A')
                board.move({ row: 1, col: 1 }, { row: 2, col: 1 })
                expect(board.piece({ row: 1, col: 1 })).toEqual('B')
                board.move({ row: 0, col: 3 }, { row: 1, col: 2 })
                expect(board.piece({ row: 0, col: 3 })).toEqual('C')
                board.move({ row: 3, col: 3 }, { row: -1, col: 3 })
                expect(board.piece({ row: 3, col: 3 })).toEqual('C')
            })
            it("doesn't fire events on illegal moves", () => {
                generator.prepare('C', 'D', 'A', 'C', 'D', 'A', 'C', 'D', 'A')
                board.move({ row: 0, col: 0 }, { row: 0, col: 0 })
                board.move({ row: 1, col: 1 }, { row: 2, col: 1 })
                board.move({ row: 0, col: 3 }, { row: 1, col: 2 })
                board.move({ row: 3, col: 3 }, { row: -1, col: 3 })
                expect(events).toEqual([])
            })
        })

        describe("replacing tiles", () => {
            let generator: GeneratorFake<String>
            let board: Board<String>

            beforeEach(() => {
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'D', 'A', 'C',
                    'C', 'D', 'D',
                )
                board = new Board(generator, 3, 4)
            })

            it("replaces missing top row with generated tiles", () => {
                generator.prepare('B', 'C', 'D')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                require(board).toMatch(
                    '*', '*', '*',
                    'D', 'B', 'C',
                    'D', 'B', 'C',
                    'C', 'D', 'D',
                ).withPieces('B', 'C', 'D')
            })
            it("shifts tiles down before replacing", () => {
                generator.prepare('B', 'C', 'D')
                board.move({ row: 2, col: 0 }, { row: 3, col: 0 })
                require(board).toMatch(
                    '*', '*', '*',
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'C', 'A', 'C',
                ).withPieces('B', 'C', 'D')
            })
            it("shifts tiles down before replacing multiple matches", () => {
                generator.prepare('D', 'B', 'C', 'A', 'B', 'A')
                board.move({ row: 3, col: 0 }, { row: 3, col: 2 })
                require(board).toMatch(
                    '*', 'B', '*',
                    '*', 'B', '*',
                    '*', 'A', '*',
                    'A', 'D', 'A',
                ).withPieces('A', 'A', 'B', 'B', 'C', 'D')
            })
            it("only deletes a double match once", () => {
                generator = new GeneratorFake<String>(
                    'D', 'B', 'A',
                    'D', 'B', 'C',
                    'B', 'A', 'B',
                    'C', 'B', 'D',
                )
                board = new Board(generator, 3, 4)
                generator.prepare('X', 'C', 'B', 'B', 'A')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                require(board).toMatch(
                    '*', '*', '*',
                    'D', '*', 'A',
                    'D', '*', 'C',
                    'C', 'A', 'D',
                ).withPieces('A', 'B', 'B', 'C', 'X')
            })
        })

        describe("Refill event", () => {
            let events: BoardEvent<String>[]
            let generator: GeneratorFake<String>
            let board: Board<String>

            beforeEach(() => {
                events = []
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A', 'C', 'F',
                    'D', 'B', 'C', 'C', 'A',
                    'D', 'A', 'C', 'B', 'F',
                    'C', 'D', 'D', 'C', 'D'
                )
                board = new Board(generator, 5, 4)
                board.addListener(e => events.push(e))
            })

            it("fires refill event after shifting", () => {
                generator.prepare('B', 'C', 'D')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                expect(events[events.length - 1]).toEqual({ kind: 'Refill' })
            })
            it("fires nothing with no matches", () => {
                board.move({ row: 0, col: 0 }, { row: 0, col: 0 })
                board.move({ row: 1, col: 1 }, { row: 2, col: 1 })
                board.move({ row: 0, col: 3 }, { row: 1, col: 2 })
                board.move({ row: 3, col: 3 }, { row: -1, col: 3 })
                expect(events).toEqual([])
            })
        })

        describe("Cascading", () => {
            let events: BoardEvent<String>[]
            let generator: GeneratorFake<String>
            let board: Board<String>

            beforeEach(() => {
                events = []
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'D', 'A', 'C',
                    'C', 'D', 'D',
                )
                board = new Board(generator, 3, 4)
                board.addListener(e => events.push(e))
            })

            it("registers if refilling brings new matches", () => {
                generator.prepare('B', 'C', 'C')
                generator.prepare('A', 'A', 'D')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                expect(events).toEqual([
                    { kind: 'Match', match: { matched: 'A', positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] } },
                    { kind: 'Refill' },
                    { kind: 'Match', match: { matched: 'C', positions: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }] } },
                    { kind: 'Refill' },
                ])
            })

            it("iterates until there are no new matches", () => {
                generator.prepare('B', 'C', 'C')
                generator.prepare('A', 'A', 'A')
                generator.prepare('A', 'A', 'D')
                board.move({ row: 0, col: 1 }, { row: 2, col: 1 })
                expect(events).toEqual([
                    { kind: 'Match', match: { matched: 'A', positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] } },
                    { kind: 'Refill' },
                    { kind: 'Match', match: { matched: 'C', positions: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }] } },
                    { kind: 'Refill' },
                    { kind: 'Match', match: { matched: 'A', positions: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }] } },
                    { kind: 'Refill' },
                ])
            })
        })
    })
})
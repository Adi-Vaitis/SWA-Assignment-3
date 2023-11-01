import { describe, it, expect, beforeEach } from '@jest/globals'
import { Effect, Generator, Position } from '../src/board'
import * as Board from '../src/board'

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

function require(board: Board.Board<String>) {
    function index({row, col}: Position) {
        return row * board.width + col
    }

    function toEqual(...tiles: String[]) {
        Board.positions(board).forEach(p => expect(Board.piece(board, p)).toEqual(tiles[index(p)]) );
    }

    function toMatch(...tiles: String[]) {
        const matched: (String | undefined)[] = []
        Board.positions(board).forEach(p => {
            if (tiles[index(p)] === '*') {
                matched.push(Board.piece(board, p))
            } else {
                expect(Board.piece(board, p)).toEqual(tiles[index(p)])
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
        const board = Board.create(generator, 2, 3)

        it("has the given width", () => {
            expect(board.width).toEqual(2)
        })

        it("has the given height", () => {
            expect(board.height).toEqual(3)
        })

        it("has row * col positions", () => {
            const positions = [{row: 0, col: 0}, {row: 0, col: 1},
                {row: 1, col: 0}, {row: 1, col: 1},
                {row: 2, col: 0}, {row: 2, col: 1}]
            expect(Board.positions(board)).toEqual(positions)
        })

        it("contains the generated elements", () => {
            expect(Board.piece(board, {row: 0, col: 0})).toEqual('A')
            expect(Board.piece(board, {row: 1, col: 1})).toEqual('A')
            expect(Board.piece(board, {row: 0, col: 1})).toEqual('B')
            expect(Board.piece(board, {row: 2, col: 0})).toEqual('B')
            expect(Board.piece(board, {row: 1, col: 0})).toEqual('C')
            expect(Board.piece(board, {row: 2, col: 1})).toEqual('C')
        })
        it("is undefined outside of the board", () => {
            expect(Board.piece(board, {row: 0, col: -1})).toBeUndefined()
            expect(Board.piece(board, {row: -1, col: 0})).toBeUndefined()
            expect(Board.piece(board, {row: 0, col: 2})).toBeUndefined()
            expect(Board.piece(board, {row: 3, col: 0})).toBeUndefined()
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
            const board = Board.create(generator, 4, 4)
            describe("valid vertical moves", () => {
                it("recognizes vertical moves that moves first piece to a horizontal match as valid", () => {
                    expect(Board.canMove(board, {row: 2, col: 1}, {row: 0, col: 1})).toEqual(true)
                })
                it("recognizes vertical moves that moves second piece to a horizontal match as valid", () => {
                    expect(Board.canMove(board, {row: 0, col: 1}, {row: 2, col: 1})).toEqual(true)
                })
                it("recognizes vertical moves that moves first piece to a vertical match as valid", () => {
                    expect(Board.canMove(board, {row: 3, col: 3}, {row: 2, col: 3})).toEqual(true)
                })
                it("recognizes vertical moves that moves second piece to a vertical match as valid", () => {
                    expect(Board.canMove(board, {row: 2, col: 3}, {row: 3, col: 3})).toEqual(true)
                })
            })

            describe("valid horizontal moves", () => {
                it("recognizes horizontal moves that moves first piece to a horizontal match as valid", () => {
                    expect(Board.canMove(board, {row: 3, col: 3}, {row: 3, col: 2})).toEqual(true)
                })
                it("recognizes horizontal moves that moves second piece to a horizontal match as valid", () => {
                    expect(Board.canMove(board, {row: 3, col: 2}, {row: 3, col: 3})).toEqual(true)
                })
                it("recognizes horizontal moves that moves first piece to a vertical match as valid", () => {
                    expect(Board.canMove(board, {row: 1, col: 0}, {row: 1, col: 2})).toEqual(true)
                })
                it("recognizes horizontal moves that moves second piece to a vertical match as valid", () => {
                    expect(Board.canMove(board, {row: 1, col: 2}, {row: 1, col: 0})).toEqual(true)
                })
            })

            describe("invalid moves", () => {
                it("does not allow moves that make no matches", () => {
                    expect(Board.canMove(board, {row: 0, col: 0}, {row: 0, col: 0})).toEqual(false)
                })
                it("does not count the piece that is moved away", () => {
                    expect(Board.canMove(board, {row: 1, col: 1}, {row: 2, col: 1})).toEqual(false)
                })
                it("recognizes moves on different rows and columns as invalid", () => {
                    expect(Board.canMove(board, {row: 0, col: 3}, {row: 1, col: 2})).toEqual(false)
                })
                it("recognizes out-of-bounds moves as invalid", () =>{
                    expect(Board.canMove(board, {row: 3, col: 3}, {row: -1, col: 3})).toEqual(false)
                    expect(Board.canMove(board, {row: 3, col: 3}, {row: 3, col: -1})).toEqual(false)
                    expect(Board.canMove(board, {row: 2, col: 0}, {row: 2, col: 4})).toEqual(false)
                })
            })
        })

        describe("making moves", () => {
            let generator: GeneratorFake<String>
            let board: Board.Board<String>

            beforeEach(() => {
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A', 'C', 'F',
                    'D', 'B', 'C', 'C', 'A',
                    'D', 'A', 'C', 'B', 'F',
                    'C', 'D', 'D', 'C', 'D'
                )
                board = Board.create(generator, 5, 4)
            })

            it("moves the pieces during a move", () => {
                generator.prepare('C', 'D', 'A')
                board = Board.move(generator, board, {row: 2, col: 1}, {row: 0, col: 1}).board
                expect(Board.piece(board, {row: 2, col: 1})).toEqual('B')
            })
            it("finds single horizontal match when moving first piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                expect(Board.move(generator, board, {row: 2, col: 1}, {row: 0, col: 1}).effects)
                    .toContainEqual({kind: 'Match', match: {matched: 'A', positions: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]}})
            })
            it("finds single horizontal match when moving second piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                expect(Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1}).effects)
                    .toContainEqual({kind: 'Match', match: {matched: 'A', positions: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]}})
            })
            it("finds single vertical match when moving first piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                expect(Board.move(generator, board, {row: 3, col: 3}, {row: 2, col: 3}).effects)
                    .toContainEqual({kind: 'Match', match: {matched: 'C', positions: [{row: 0, col: 3}, {row: 1, col: 3}, {row: 2, col: 3}]}})
            })
            it("finds single vertical match when moving second piece to a match", () => {
                generator.prepare('C', 'D', 'A')
                expect(Board.move(generator, board, {row: 2, col: 3}, {row: 3, col: 3}).effects)
                    .toContainEqual({kind: 'Match', match: {matched: 'C', positions: [{row: 0, col: 3}, {row: 1, col: 3}, {row: 2, col: 3}]}})
            })
            it("fires multiple events on horz + vert matches", () => {
                generator.prepare('G', 'H', 'I')
                generator.prepare('J', 'K', 'L')
                generator.prepare('J', 'K', 'L')
                const moved = Board.move(generator, board, {row: 3, col: 4}, {row: 3, col: 0})
                expect(moved.effects).toContainEqual(
                    {kind: 'Match', match: {matched: 'D', positions: [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]}}
                )
                expect(moved.effects).toContainEqual(
                    {kind: 'Match', match: {matched: 'D', positions: [{row: 1, col: 0}, {row: 2, col: 0}, {row: 3, col: 0}]}}
                )
            })
            it("fires multiple events when both pieces make new matches", () => {
                generator.prepare('C', 'D', 'A')
                generator.prepare('B', 'A', 'B')
                const moved = Board.move(generator, board, { row: 3, col: 2 }, { row: 3, col: 0 })
                expect(moved.effects).toContainEqual(
                    {kind: 'Match', match: {matched: 'C', positions: [{row: 1, col: 2}, {row: 2, col: 2}, {row: 3, col: 2}]}}
                )
                expect(moved.effects).toContainEqual(
                    {kind: 'Match', match: {matched: 'D', positions: [{row: 1, col: 0}, {row: 2, col: 0}, {row: 3, col: 0}]}}
                )
            })
            it("doesn't swap on illegal moves", () => {
                generator.prepare('C', 'D', 'A', 'C', 'D', 'A', 'C', 'D', 'A')
                board = Board.move(generator, board, {row: 1, col: 1}, {row: 2, col: 1}).board
                expect(Board.piece(board, {row: 1, col: 1})).toEqual('B')
                board = Board.move(generator, board, {row: 0, col: 3}, {row: 1, col: 2}).board
                expect(Board.piece(board, {row: 0, col: 3})).toEqual('C')
                board = Board.move(generator, board, {row: 3, col: 3}, {row: -1, col: 3}).board
                expect(Board.piece(board, {row: 3, col: 3})).toEqual('C')
            })
            it("doesn't fire events on illegal moves", () => {
                generator.prepare('C', 'D', 'A', 'C', 'D', 'A', 'C', 'D', 'A')
                expect(Board.move(generator, board, {row: 0, col: 0}, {row: 0, col: 0}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 1, col: 1}, {row: 2, col: 1}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 0, col: 3}, {row: 1, col: 2}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 3, col: 3}, {row: -1, col: 3}).effects).toEqual([])
            })
        })

        describe("replacing tiles", () => {
            let generator: GeneratorFake<String>
            let board: Board.Board<String>

            beforeEach(() => {
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'D', 'A', 'C',
                    'C', 'D', 'D',
                )
                board = Board.create(generator, 3, 4)
            })

            it("replaces missing top row with generated tiles", () => {
                generator.prepare('B', 'C', 'D')
                require(Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1}).board).toMatch(
                    '*', '*', '*',
                    'D', 'B', 'C',
                    'D', 'B', 'C',
                    'C', 'D', 'D',
                ).withPieces('B', 'C', 'D')
            })

            it("shifts tiles down before replacing", () => {
                generator.prepare('B', 'C', 'D')
                require(Board.move(generator, board, {row: 2, col: 0}, {row: 3, col: 0}).board).toMatch(
                    '*', '*', '*',
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'C', 'A', 'C',
                ).withPieces('B', 'C', 'D')
            })

            it("shifts tiles down before replacing multiple matches", () => {
                generator.prepare('D', 'B', 'C', 'A', 'B', 'A')
                require(Board.move(generator, board, {row: 3, col: 0}, {row: 3, col: 2}).board).toMatch(
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
                board = Board.create(generator, 3, 4)
                generator.prepare('X', 'C', 'B', 'B', 'A')
                require(Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1}).board).toMatch(
                    '*', '*', '*',
                    'D', '*', 'A',
                    'D', '*', 'C',
                    'C', 'A', 'D',
                ).withPieces('A', 'B', 'B', 'C', 'X')
            })
        })

        describe("Refill event", () => {
            let generator: GeneratorFake<String>
            let board: Board.Board<String>

            beforeEach(() => {
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A', 'C', 'F',
                    'D', 'B', 'C', 'C', 'A',
                    'D', 'A', 'C', 'B', 'F',
                    'C', 'D', 'D', 'C', 'D'
                )
                board = Board.create(generator, 5, 4)
            })

            it("fires refill event after shifting", () => {
                generator.prepare('B', 'C', 'D')
                const { effects } = Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1})
                expect(effects[effects.length - 1].kind).toEqual('Refill')
            })

            it("fires nothing with no matches", () => {
                generator.prepare('C', 'D', 'A', 'C', 'D', 'A', 'C', 'D', 'A')
                expect(Board.move(generator, board, {row: 0, col: 0}, {row: 0, col: 0}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 1, col: 1}, {row: 2, col: 1}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 0, col: 3}, {row: 1, col: 2}).effects).toEqual([])
                expect(Board.move(generator, board, {row: 3, col: 3}, {row: -1, col: 3}).effects).toEqual([])
            })
        })

        describe("Cascading", () => {
            let generator: GeneratorFake<String>
            let board: Board.Board<String>

            beforeEach(() => {
                generator = new GeneratorFake<String>(
                    'A', 'B', 'A',
                    'D', 'B', 'C',
                    'D', 'A', 'C',
                    'C', 'D', 'D',
                )
                board = Board.create(generator, 3, 4)
            })

            // To not put constrains on the Board type.
            const forgetBoard = (e: Effect<String>) => {
                if (e.kind === 'Match') {
                    return e
                } else {
                    return { kind: e.kind }
                }
            }
            it("registers if refilling brings new matches", () => {
                generator.prepare('B', 'C', 'C')
                generator.prepare('A', 'A', 'D')
                expect(Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1}).effects.map(forgetBoard)).toEqual([
                    {kind: 'Match', match: {matched: 'A', positions: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]}},
                    {kind: 'Refill'},
                    {kind: 'Match', match: {matched: 'C', positions: [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}]}},
                    {kind: 'Refill'},
                ])
            })

            it("iterates until there are no new matches", () => {
                generator.prepare('B', 'C', 'C')
                generator.prepare('A', 'A', 'A')
                generator.prepare('A', 'A', 'D')
                expect(Board.move(generator, board, {row: 0, col: 1}, {row: 2, col: 1}).effects.map(forgetBoard)).toEqual([
                    {kind: 'Match', match: {matched: 'A', positions: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}]}},
                    {kind: 'Refill'},
                    {kind: 'Match', match: {matched: 'C', positions: [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}]}},
                    {kind: 'Refill'},
                    {kind: 'Match', match: {matched: 'A', positions: [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}]}},
                    {kind: 'Refill'},
                ])
            })
        })
    })
})
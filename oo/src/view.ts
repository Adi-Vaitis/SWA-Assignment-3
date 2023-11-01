import { Board } from './board'
import { Model } from './model'
import { Controller } from './controller'

export class View<T> {
    private controller: Controller<T>
    private window: Window
    private base: HTMLDivElement
    private table?: HTMLTableElement
    private theLog: HTMLParagraphElement
    private board?: HTMLElement[][]

    constructor(window: Window, controller: Controller<T>) {
        this.controller = controller
        this.window = window
        this.base = window.document.getElementById('base') as HTMLDivElement
        this.theLog = this.createChild(this.base, 'p') as HTMLParagraphElement
    }

    private get document(): Document {
        return this.window.document
    }

    private createChild(parent: Node, tag: string): HTMLElement {
        let child: HTMLElement = this.document.createElement(tag)
        return parent.appendChild(child)
    }

    view(model: Model<T>): void {
        this.viewBoard(model)
        this.viewLog(model.messages)
    }

    private viewLog(messages: string[]) {
        this.theLog.innerHTML = messages.join('<br>')
    }

    private viewBoard(model: Model<T>): void {
        if (this.table === undefined) {
            this.board = []
            this.table = this.createChild(this.base, 'table') as HTMLTableElement
            for(let i = 0; i < model.board.height; i++) {
                const row = this.createChild(this.table, 'tr')
                const tds: HTMLElement[] = []
                for(let j = 0; j < model.board.width; j++) {
                    const cell = this.createChild(row, 'td')
                    tds.push(cell)
                    cell.onclick = (_) => this.controller.click({row: i, col: j})
                }
                this.board.push(tds)
            }
        }
        this.board.forEach((row, i) => {
            row.forEach((cell, j) => {
                const position = {row: i, col: j}
                cell.innerText = model.board.piece(position).toString()
                cell.style.background = model.isSelected(position) ? 'aqua' : 'white'
            })
        });
    }
}

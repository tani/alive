import { CompletionItem, Position } from 'vscode'
import { Defun, Expr, findExpr, Let, posInExpr } from '../lisp/Expr'
import { PackageMgr } from '../lisp/PackageMgr'
import { Repl } from './repl'

export class CompletionProvider {
    packageMgr: PackageMgr

    constructor(pkgMgr: PackageMgr) {
        this.packageMgr = pkgMgr
    }

    async getCompletions(repl: Repl | undefined, exprs: Expr[], pos: Position): Promise<CompletionItem[]> {
        return repl === undefined ? this.staticCompletions(exprs, pos) : this.replCompletions(repl)
    }

    async replCompletions(repl: Repl): Promise<CompletionItem[]> {
        const comps = await repl.getCompletions()
        const items = []

        for (const comp of comps) {
            const item = new CompletionItem(comp.toLowerCase())
            const doc = await repl.getDoc(item.label)

            item.documentation = doc

            items.push(item)
        }

        return items
    }

    staticCompletions(exprs: Expr[], pos: Position): CompletionItem[] {
        const expr = findExpr(exprs, pos)
        if (expr === undefined) {
            return []
        }

        const symbols = this.packageMgr.getSymbols(expr.start.line)
        if (symbols === undefined) {
            return []
        }

        const locals = this.getLocals(expr, pos)
        const completions = locals.concat(symbols)

        return completions.map((item) => new CompletionItem(item.toLowerCase()))
    }

    getLocals(expr: Expr, pos: Position): string[] {
        if (!posInExpr(expr, pos)) {
            return []
        }

        let locals: string[] = []

        if (expr instanceof Defun) {
            locals = locals.concat(expr.args)
            expr.body.forEach((expr) => (locals = locals.concat(this.getLocals(expr, pos))))
        } else if (expr instanceof Let) {
            locals = locals.concat(Object.keys(expr.vars))
            expr.body.forEach((expr) => (locals = locals.concat(this.getLocals(expr, pos))))
        }

        return locals
    }
}
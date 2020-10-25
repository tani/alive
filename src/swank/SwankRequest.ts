import { LispID, LispQuote, LispSymbol } from './LispID'
import { toWire } from './SwankUtils'

export class SwankRequest {
    data: string[]

    constructor(data: string[]) {
        this.data = data
    }

    encode(msgID: number) {
        this.data.push(toWire(msgID))

        const str = `(${this.data.join(' ')})`
        const len = str.length.toString(16).padStart(6, '0')

        return `${len}${str}`
    }
}

/*
swank:list-all-package-names [t]
swank:toggle-debug-on-swank-error
swank:connection-info
swank:compile-file-for-emacs [file] [load] [options]
swank:compile-string-for-emacs [string] [buffer] [position] [file]
swank:load-file [fasl file]
swank:compile-multiple-strings-for-emacs [strings]
swank:operator-arglist [op] [package]
swank:simple-completions [prefix] [package]
swank:find-definitions-for-emacs [name]
swank:buffer-first-change [file]
swank:interactive-eval [string]
swank:eval-and-grab-output [string]
swank:interactive-eval-region [string]
swank:pprint-eval [string]
swank:re-evaluate-defvar [form]
swank:value-for-editing [string]
swank:commit-edited-value [string] [value]
swank:untrace-all
swank:swank-toggle-trace [spec]
swank:disassemble-form [form]
swank:undefine-function [name]
swank:unintern-symbol [name] [package]
swank:guess-package [name]
swank:load-file [file]
swank:set-default-directory [dir]
swank:default-directory
swank:toggle-profile-fdefinition [name]
swank:unprofile-all
swank:profile-report
swank:profile-reset
swank:profiled-functions
swank:swank-profile-package [package] [callers] [methods]
swank:profile-by-substring [string] [package]
swank:describe-symbol [name]
swank:documentation-symbol [name]
swank:describe-function [name]
swank:apropos-list-for-emacs [string] [only-external] [case-sensitive] [package]
swank:describe-definition-for-emacs [item] [type]
swank:xref [type] [symbol]
swank:xrefs [type] [symbol]
swank:swank-macroexpand [macro]
swank:swank-macroexpand-1 [macro]
swank:swank-macroexpand-all
swank:swank-compiler-macroexpand [macro]
swank:swank-compiler-macroexpand-1 [macro]
swank:swank-expand [macro]
swank:swank-expand-1 [macro]
swank:swank-format-string-expand [string]
swank:quit-lisp
swank:debugger-info-for-emacs [?] [?]
swank:backtrace [from] [to]
swank:frame-source-location [frame-num]
swank:frame-locals-and-catch-tags [num]
swank:sldb-disassemble [frame]
swank:eval-string-in-frame [string] [frame] [package]
swank:pprint-eval-string-in-frame [string] [frame] [package]
swank:frame-package-name [frame]
swank:inspect-in-frame [string] [num]
swank:inspect-frame-var [frame] [var]
swank:inspect-current-condition
swank:sdlb-print-condition
swank:throw-to-toplevel
swank:sldb-continue
swank:sldb-abort
swank:invoke-nth-restart-for-emacs [level] [restart]
swank:sldb-break-with-default-debugger [unwind]
swank:sldb-step [frame]
swank:sldb-next [frame]
swank:sldb-out [frame]
swank:sldb-break-on-return [frame]
swank:sldb-break [name]
swank:sldb-return-from-frame [num] [string]
swank:restart-frame [number]
swank:toggle-break-on-signals
swank:frame-source-location [num]
swank:quit-thread-browser
swank:list-threads
swank:kill-nth-thread [num]
swank:start-swank-server-in-thread [id] [file]
swank:debug-nth-thread [id]
swank:init-inspector [string]
swank:inspect-nth-part [value]
swank:inspector-call-nth-action [value]
swank:inspector-pop
swank:inspector-next
swank:quit-inspector
swank:describe-inspectee
swank:pprint-inspector-part [part]
swank:inspector-eval [string]
swank:inspector-history
swank:find-source-location-for-emacs [part]
swank:inspector-reinspect
swank:inspector-toggle-verbose
swank:inspector-range [from] [to]
swank:update-indentation-information
swank:swank-require [needed]
*/

export class EmacsRex extends SwankRequest {
    constructor(data: string, pkg: any, threadID: string | boolean) {
        super([toWire(new LispSymbol('emacs-rex')), data, toWire(pkg), toWire(threadID)])
    }
}

export class ConnectionInfoReq extends EmacsRex {
    constructor() {
        super(toWire([new LispID('swank:connection-info')]), new LispID('nil'), true)
    }
}

export class EvalReq extends EmacsRex {
    constructor(form: string) {
        super(toWire([new LispID('swank:eval-and-grab-output'), form]), new LispID('nil'), true)
    }
}

export class ThreadsReq extends EmacsRex {
    constructor() {
        super(toWire([new LispID('swank:list-threads')]), new LispID('nil'), true)
    }
}

export class FrameLocalsReq extends EmacsRex {
    constructor(threadID: string, frameID: string) {
        super(toWire([new LispID('swank:frame-locals-and-catch-tags'), frameID]), new LispID('nil'), threadID)
    }
}

export class DebuggerInfoReq extends EmacsRex {
    constructor(threadID: string, start: number, end: number) {
        super(toWire([new LispID('swank:debugger-info-for-emacs'), start, end]), new LispID('nil'), threadID)
    }
}

export class DebugThreadReq extends EmacsRex {
    constructor(threadNdx: number, pid: number) {
        // super(toWire([new LispID('swank:debug-nth-thread'), threadID]), 'COMMON-LISP-USER', true);
        super(toWire([new LispID('swank:start-swank-server-in-thread'), threadNdx, `/tmp/slime.${pid}`]), new LispID('nil'), true)
    }
}
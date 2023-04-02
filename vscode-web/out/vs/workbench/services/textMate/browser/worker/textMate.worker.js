/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/base/common/lifecycle","vs/base/common/observableImpl/logging","vs/base/common/platform","vs/base/common/observableImpl/base","vs/base/common/errors","vs/editor/common/core/eolCounter","vs/editor/common/tokens/lineTokens","vs/base/common/observableImpl/autorun","vs/base/common/observableImpl/derived","vs/base/common/observable","vs/base/common/buffer","vs/editor/common/encodedTokenAttributes","vs/editor/common/tokens/contiguousMultilineTokensBuilder","vs/base/common/uri","vs/base/common/resources","vs/base/common/async","vs/editor/common/languages/nullTokenize","vs/editor/common/languages","vs/base/common/observableImpl/utils","vs/base/common/stream","vs/base/common/symbols","vs/editor/common/tokens/contiguousTokensEditing","vs/editor/common/tokens/contiguousMultilineTokens","vs/base/common/arrays","vs/base/common/extpath","vs/base/common/path","vs/base/common/strings","vs/base/common/network","vs/base/common/event","vs/editor/common/model/textModelTokens","vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport","vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit","vs/workbench/services/textMate/common/TMScopeRegistry","vs/workbench/services/textMate/common/TMGrammarFactory","vs/workbench/services/textMate/browser/worker/textMateWorkerModel","vs/editor/common/core/position","vs/editor/common/core/lineRange","vs/base/common/types","vs/base/common/cancellation","vs/base/common/stopwatch","vs/editor/common/model/mirrorTextModel","vscode-textmate","vs/workbench/services/textMate/browser/worker/textMate.worker"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[3/*vs/base/common/observableImpl/logging*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleObservableLogger = exports.getLogger = exports.setLogger = void 0;
    let globalObservableLogger;
    function setLogger(logger) {
        globalObservableLogger = logger;
    }
    exports.setLogger = setLogger;
    function getLogger() {
        return globalObservableLogger;
    }
    exports.getLogger = getLogger;
    class ConsoleObservableLogger {
        constructor() {
            this.a = 0;
            this.d = new WeakMap();
        }
        b(text) {
            return consoleTextToArgs([
                normalText(repeat('|  ', this.a)),
                text,
            ]);
        }
        c(info) {
            return info.didChange
                ? [
                    normalText(` `),
                    styled(formatValue(info.oldValue, 70), {
                        color: 'red',
                        strikeThrough: true,
                    }),
                    normalText(` `),
                    styled(formatValue(info.newValue, 60), {
                        color: 'green',
                    }),
                ]
                : [normalText(` (unchanged)`)];
        }
        handleObservableChanged(observable, info) {
            console.log(...this.b([
                formatKind('observable value changed'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.c(info),
            ]));
        }
        formatChanges(changes) {
            if (changes.size === 0) {
                return undefined;
            }
            return styled(' (changed deps: ' +
                [...changes].map((o) => o.debugName).join(', ') +
                ')', { color: 'gray' });
        }
        handleDerivedCreated(derived) {
            const existingHandleChange = derived.handleChange;
            this.d.set(derived, new Set());
            derived.handleChange = (observable, change) => {
                this.d.get(derived).add(observable);
                return existingHandleChange.apply(derived, [observable, change]);
            };
        }
        handleDerivedRecomputed(derived, info) {
            const changedObservables = this.d.get(derived);
            console.log(...this.b([
                formatKind('derived recomputed'),
                styled(derived.debugName, { color: 'BlueViolet' }),
                ...this.c(info),
                this.formatChanges(changedObservables)
            ]));
            changedObservables.clear();
        }
        handleFromEventObservableTriggered(observable, info) {
            console.log(...this.b([
                formatKind('observable from event triggered'),
                styled(observable.debugName, { color: 'BlueViolet' }),
                ...this.c(info),
            ]));
        }
        handleAutorunCreated(autorun) {
            const existingHandleChange = autorun.handleChange;
            this.d.set(autorun, new Set());
            autorun.handleChange = (observable, change) => {
                this.d.get(autorun).add(observable);
                return existingHandleChange.apply(autorun, [observable, change]);
            };
        }
        handleAutorunTriggered(autorun) {
            const changedObservables = this.d.get(autorun);
            console.log(...this.b([
                formatKind('autorun'),
                styled(autorun.debugName, { color: 'BlueViolet' }),
                this.formatChanges(changedObservables)
            ]));
            changedObservables.clear();
        }
        handleBeginTransaction(transaction) {
            let transactionName = transaction.getDebugName();
            if (transactionName === undefined) {
                transactionName = '';
            }
            console.log(...this.b([
                formatKind('transaction'),
                styled(transactionName, { color: 'BlueViolet' }),
            ]));
            this.a++;
        }
        handleEndTransaction() {
            this.a--;
        }
    }
    exports.ConsoleObservableLogger = ConsoleObservableLogger;
    function consoleTextToArgs(text) {
        const styles = new Array();
        const initial = {};
        const data = initial;
        let firstArg = '';
        function process(t) {
            if ('length' in t) {
                for (const item of t) {
                    if (item) {
                        process(item);
                    }
                }
            }
            else if ('text' in t) {
                firstArg += `%c${t.text}`;
                styles.push(t.style);
                if (t.data) {
                    Object.assign(data, t.data);
                }
            }
            else if ('data' in t) {
                Object.assign(data, t.data);
            }
        }
        process(text);
        const result = [firstArg, ...styles];
        if (Object.keys(data).length > 0) {
            result.push(data);
        }
        return result;
    }
    function normalText(text) {
        return styled(text, { color: 'black' });
    }
    function formatKind(kind) {
        return styled(padStr(`${kind}: `, 10), { color: 'black', bold: true });
    }
    function styled(text, options = {
        color: 'black',
    }) {
        function objToCss(styleObj) {
            return Object.entries(styleObj).reduce((styleString, [propName, propValue]) => {
                return `${styleString}${propName}:${propValue};`;
            }, '');
        }
        const style = {
            color: options.color,
        };
        if (options.strikeThrough) {
            style['text-decoration'] = 'line-through';
        }
        if (options.bold) {
            style['font-weight'] = 'bold';
        }
        return {
            text,
            style: objToCss(style),
        };
    }
    function formatValue(value, availableLen) {
        switch (typeof value) {
            case 'number':
                return '' + value;
            case 'string':
                if (value.length + 2 <= availableLen) {
                    return `"${value}"`;
                }
                return `"${value.substr(0, availableLen - 7)}"+...`;
            case 'boolean':
                return value ? 'true' : 'false';
            case 'undefined':
                return 'undefined';
            case 'object':
                if (value === null) {
                    return 'null';
                }
                if (Array.isArray(value)) {
                    return formatArray(value, availableLen);
                }
                return formatObject(value, availableLen);
            case 'symbol':
                return value.toString();
            case 'function':
                return `[[Function${value.name ? ' ' + value.name : ''}]]`;
            default:
                return '' + value;
        }
    }
    function formatArray(value, availableLen) {
        let result = '[ ';
        let first = true;
        for (const val of value) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${formatValue(val, availableLen - result.length)}`;
        }
        result += ' ]';
        return result;
    }
    function formatObject(value, availableLen) {
        let result = '{ ';
        let first = true;
        for (const [key, val] of Object.entries(value)) {
            if (!first) {
                result += ', ';
            }
            if (result.length - 5 > availableLen) {
                result += '...';
                break;
            }
            first = false;
            result += `${key}: ${formatValue(val, availableLen - result.length)}`;
        }
        result += ' }';
        return result;
    }
    function repeat(str, count) {
        let result = '';
        for (let i = 1; i <= count; i++) {
            result += str;
        }
        return result;
    }
    function padStr(str, length) {
        while (str.length < length) {
            str += ' ';
        }
        return str;
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/base/common/observableImpl/autorun*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/lifecycle*/,3/*vs/base/common/observableImpl/logging*/]), function (require, exports, lifecycle_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autorunDelta = exports.AutorunObserver = exports.autorunWithStore = exports.autorunHandleChanges = exports.autorun = void 0;
    function autorun(debugName, fn) {
        return new AutorunObserver(debugName, fn, undefined);
    }
    exports.autorun = autorun;
    function autorunHandleChanges(debugName, options, fn) {
        return new AutorunObserver(debugName, fn, options.handleChange);
    }
    exports.autorunHandleChanges = autorunHandleChanges;
    function autorunWithStore(fn, debugName) {
        const store = new lifecycle_1.DisposableStore();
        const disposable = autorun(debugName, reader => {
            store.clear();
            fn(reader, store);
        });
        return (0, lifecycle_1.toDisposable)(() => {
            disposable.dispose();
            store.dispose();
        });
    }
    exports.autorunWithStore = autorunWithStore;
    class AutorunObserver {
        get dependencies() {
            return this.c;
        }
        constructor(debugName, e, f) {
            this.debugName = debugName;
            this.e = e;
            this.f = f;
            this.needsToRun = true;
            this.a = 0;
            this.b = false;
            /**
             * The actual dependencies.
            */
            this.c = new Set();
            /**
             * Dependencies that have to be removed when {@link e} ran through.
            */
            this.d = new Set();
            (0, logging_1.getLogger)()?.handleAutorunCreated(this);
            this.g();
        }
        subscribeTo(observable) {
            // In case the run action disposes the autorun
            if (this.b) {
                return;
            }
            this.c.add(observable);
            if (!this.d.delete(observable)) {
                observable.addObserver(this);
            }
        }
        handleChange(observable, change) {
            const shouldReact = this.f ? this.f({
                changedObservable: observable,
                change,
                didChange: o => o === observable,
            }) : true;
            this.needsToRun = this.needsToRun || shouldReact;
            if (this.a === 0) {
                this.g();
            }
        }
        beginUpdate() {
            this.a++;
        }
        endUpdate() {
            this.a--;
            if (this.a === 0) {
                this.g();
            }
        }
        g() {
            if (!this.needsToRun) {
                return;
            }
            // Assert: this.staleDependencies is an empty set.
            const emptySet = this.d;
            this.d = this.c;
            this.c = emptySet;
            this.needsToRun = false;
            (0, logging_1.getLogger)()?.handleAutorunTriggered(this);
            try {
                this.e(this);
            }
            finally {
                // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                // Thus, we only unsubscribe from observables that are definitely not read anymore.
                for (const o of this.d) {
                    o.removeObserver(this);
                }
                this.d.clear();
            }
        }
        dispose() {
            this.b = true;
            for (const o of this.c) {
                o.removeObserver(this);
            }
            this.c.clear();
        }
        toString() {
            return `Autorun<${this.debugName}>`;
        }
    }
    exports.AutorunObserver = AutorunObserver;
    (function (autorun) {
        autorun.Observer = AutorunObserver;
    })(autorun = exports.autorun || (exports.autorun = {}));
    function autorunDelta(name, observable, handler) {
        let _lastValue;
        return autorun(name, (reader) => {
            const newValue = observable.read(reader);
            const lastValue = _lastValue;
            _lastValue = newValue;
            handler({ lastValue, newValue });
        });
    }
    exports.autorunDelta = autorunDelta;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[5/*vs/base/common/observableImpl/base*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/observableImpl/logging*/]), function (require, exports, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObservableValue = exports.observableValue = exports.TransactionImpl = exports.getFunctionName = exports.transaction = exports.BaseObservable = exports.ConvenientObservable = exports._setDerived = void 0;
    let _derived;
    /**
     * @internal
     * This is to allow splitting files.
    */
    function _setDerived(derived) {
        _derived = derived;
    }
    exports._setDerived = _setDerived;
    class ConvenientObservable {
        get TChange() { return null; }
        /** @sealed */
        read(reader) {
            reader.subscribeTo(this);
            return this.get();
        }
        /** @sealed */
        map(fn) {
            return _derived(() => {
                const name = getFunctionName(fn);
                return name !== undefined ? name : `${this.debugName} (mapped)`;
            }, (reader) => fn(this.read(reader)));
        }
    }
    exports.ConvenientObservable = ConvenientObservable;
    class BaseObservable extends ConvenientObservable {
        constructor() {
            super(...arguments);
            this.a = new Set();
        }
        /** @sealed */
        addObserver(observer) {
            const len = this.a.size;
            this.a.add(observer);
            if (len === 0) {
                this.b();
            }
        }
        /** @sealed */
        removeObserver(observer) {
            const deleted = this.a.delete(observer);
            if (deleted && this.a.size === 0) {
                this.c();
            }
        }
        b() { }
        c() { }
    }
    exports.BaseObservable = BaseObservable;
    function transaction(fn, getDebugName) {
        const tx = new TransactionImpl(fn, getDebugName);
        try {
            (0, logging_1.getLogger)()?.handleBeginTransaction(tx);
            fn(tx);
        }
        finally {
            tx.finish();
            (0, logging_1.getLogger)()?.handleEndTransaction();
        }
    }
    exports.transaction = transaction;
    function getFunctionName(fn) {
        const fnSrc = fn.toString();
        // Pattern: /** @description ... */
        const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
        const match = regexp.exec(fnSrc);
        const result = match ? match[1] : undefined;
        return result?.trim();
    }
    exports.getFunctionName = getFunctionName;
    class TransactionImpl {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = [];
        }
        getDebugName() {
            if (this.c) {
                return this.c();
            }
            return getFunctionName(this.b);
        }
        updateObserver(observer, observable) {
            this.a.push({ observer, observable });
            observer.beginUpdate(observable);
        }
        finish() {
            const updatingObservers = this.a;
            // Prevent anyone from updating observers from now on.
            this.a = null;
            for (const { observer, observable } of updatingObservers) {
                observer.endUpdate(observable);
            }
        }
    }
    exports.TransactionImpl = TransactionImpl;
    function observableValue(name, initialValue) {
        return new ObservableValue(name, initialValue);
    }
    exports.observableValue = observableValue;
    class ObservableValue extends BaseObservable {
        constructor(debugName, initialValue) {
            super();
            this.debugName = debugName;
            this.d = initialValue;
        }
        get() {
            return this.d;
        }
        set(value, tx, change) {
            if (this.d === value) {
                return;
            }
            if (!tx) {
                transaction((tx) => {
                    this.set(value, tx, change);
                }, () => `Setting ${this.debugName}`);
                return;
            }
            const oldValue = this.d;
            this.d = value;
            (0, logging_1.getLogger)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true });
            for (const observer of this.a) {
                tx.updateObserver(observer, this);
                observer.handleChange(this, change);
            }
        }
        toString() {
            return `${this.debugName}: ${this.d}`;
        }
    }
    exports.ObservableValue = ObservableValue;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[10/*vs/base/common/observableImpl/derived*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/observableImpl/base*/,3/*vs/base/common/observableImpl/logging*/]), function (require, exports, base_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Derived = exports.derived = void 0;
    function derived(debugName, computeFn) {
        return new Derived(debugName, computeFn);
    }
    exports.derived = derived;
    (0, base_1._setDerived)(derived);
    class Derived extends base_1.BaseObservable {
        get dependencies() {
            return this.i;
        }
        get debugName() {
            return typeof this.k === 'function' ? this.k() : this.k;
        }
        constructor(k, l) {
            super();
            this.k = k;
            this.l = l;
            this.e = false;
            this.f = false;
            this.g = undefined;
            this.h = 0;
            this.i = new Set();
            /**
             * Dependencies that have to be removed when {@link runFn} ran through.
             */
            this.j = new Set();
            (0, logging_1.getLogger)()?.handleDerivedCreated(this);
        }
        c() {
            /**
             * We are not tracking changes anymore, thus we have to assume
             * that our cache is invalid.
             */
            this.f = false;
            this.e = false;
            this.g = undefined;
            for (const d of this.i) {
                d.removeObserver(this);
            }
            this.i.clear();
        }
        get() {
            if (this.a.size === 0) {
                // Cache is not valid and don't refresh the cache.
                // Observables should not be read in non-reactive contexts.
                const result = this.l(this);
                // Clear new dependencies
                this.c();
                return result;
            }
            if (this.h > 0 && this.f) {
                // Refresh dependencies
                for (const d of this.i) {
                    // Maybe `.get()` triggers `handleChange`?
                    d.get();
                    if (!this.f) {
                        // The other dependencies will refresh on demand
                        break;
                    }
                }
            }
            if (!this.f) {
                const emptySet = this.j;
                this.j = this.i;
                this.i = emptySet;
                const oldValue = this.g;
                try {
                    this.g = this.l(this);
                }
                finally {
                    // We don't want our observed observables to think that they are (not even temporarily) not being observed.
                    // Thus, we only unsubscribe from observables that are definitely not read anymore.
                    for (const o of this.j) {
                        o.removeObserver(this);
                    }
                    this.j.clear();
                }
                this.f = true;
                const didChange = this.e && oldValue !== this.g;
                (0, logging_1.getLogger)()?.handleDerivedRecomputed(this, {
                    oldValue,
                    newValue: this.g,
                    change: undefined,
                    didChange
                });
                if (didChange) {
                    for (const r of this.a) {
                        r.handleChange(this, undefined);
                    }
                }
            }
            return this.g;
        }
        // IObserver Implementation
        beginUpdate() {
            if (this.h === 0) {
                for (const r of this.a) {
                    r.beginUpdate(this);
                }
            }
            this.h++;
        }
        handleChange(_observable, _change) {
            if (this.f) {
                this.e = true;
                this.f = false;
            }
            // Not in transaction: Recompute & inform observers immediately
            if (this.h === 0 && this.a.size > 0) {
                this.get();
            }
            // Otherwise, recompute in `endUpdate` or on demand.
        }
        endUpdate() {
            this.h--;
            if (this.h === 0) {
                if (this.a.size > 0) {
                    // Propagate invalidation
                    this.get();
                }
                for (const r of this.a) {
                    r.endUpdate(this);
                }
            }
        }
        // IReader Implementation
        subscribeTo(observable) {
            this.i.add(observable);
            // We are already added as observer for stale dependencies.
            if (!this.j.delete(observable)) {
                observable.addObserver(this);
            }
        }
        toString() {
            return `LazyDerived<${this.debugName}>`;
        }
    }
    exports.Derived = Derived;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[20/*vs/base/common/observableImpl/utils*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/lifecycle*/,9/*vs/base/common/observableImpl/autorun*/,5/*vs/base/common/observableImpl/base*/,10/*vs/base/common/observableImpl/derived*/,3/*vs/base/common/observableImpl/logging*/]), function (require, exports, lifecycle_1, autorun_1, base_1, derived_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.derivedObservableWithWritableCache = exports.derivedObservableWithCache = exports.keepAlive = exports.wasEventTriggeredRecently = exports.debouncedObservable = exports.observableSignal = exports.observableSignalFromEvent = exports.FromEventObservable = exports.observableFromEvent = exports.waitForState = exports.observableFromPromise = exports.constObservable = void 0;
    function constObservable(value) {
        return new ConstObservable(value);
    }
    exports.constObservable = constObservable;
    class ConstObservable extends base_1.ConvenientObservable {
        constructor(a) {
            super();
            this.a = a;
        }
        get debugName() {
            return this.toString();
        }
        get() {
            return this.a;
        }
        addObserver(observer) {
            // NO OP
        }
        removeObserver(observer) {
            // NO OP
        }
        toString() {
            return `Const: ${this.a}`;
        }
    }
    function observableFromPromise(promise) {
        const observable = (0, base_1.observableValue)('promiseValue', {});
        promise.then((value) => {
            observable.set({ value }, undefined);
        });
        return observable;
    }
    exports.observableFromPromise = observableFromPromise;
    function waitForState(observable, predicate) {
        return new Promise(resolve => {
            let didRun = false;
            let shouldDispose = false;
            const d = (0, autorun_1.autorun)('waitForState', reader => {
                const currentState = observable.read(reader);
                if (predicate(currentState)) {
                    if (!didRun) {
                        shouldDispose = true;
                    }
                    else {
                        d.dispose();
                    }
                    resolve(currentState);
                }
            });
            didRun = true;
            if (shouldDispose) {
                d.dispose();
            }
        });
    }
    exports.waitForState = waitForState;
    function observableFromEvent(event, getValue) {
        return new FromEventObservable(event, getValue);
    }
    exports.observableFromEvent = observableFromEvent;
    class FromEventObservable extends base_1.BaseObservable {
        constructor(h, i) {
            super();
            this.h = h;
            this.i = i;
            this.f = false;
            this.l = (args) => {
                const newValue = this.i(args);
                const didChange = !this.f || this.e !== newValue;
                (0, logging_1.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue: this.e, newValue, change: undefined, didChange });
                if (didChange) {
                    this.e = newValue;
                    if (this.f) {
                        (0, base_1.transaction)((tx) => {
                            for (const o of this.a) {
                                tx.updateObserver(o, this);
                                o.handleChange(this, undefined);
                            }
                        }, () => {
                            const name = this.j();
                            return 'Event fired' + (name ? `: ${name}` : '');
                        });
                    }
                    this.f = true;
                }
            };
        }
        j() {
            return (0, base_1.getFunctionName)(this.i);
        }
        get debugName() {
            const name = this.j();
            return 'From Event' + (name ? `: ${name}` : '');
        }
        b() {
            this.g = this.h(this.l);
        }
        c() {
            this.g.dispose();
            this.g = undefined;
            this.f = false;
            this.e = undefined;
        }
        get() {
            if (this.g) {
                if (!this.f) {
                    this.l(undefined);
                }
                return this.e;
            }
            else {
                // no cache, as there are no subscribers to keep it updated
                return this.i(undefined);
            }
        }
    }
    exports.FromEventObservable = FromEventObservable;
    (function (observableFromEvent) {
        observableFromEvent.Observer = FromEventObservable;
    })(observableFromEvent = exports.observableFromEvent || (exports.observableFromEvent = {}));
    function observableSignalFromEvent(debugName, event) {
        return new FromEventObservableSignal(debugName, event);
    }
    exports.observableSignalFromEvent = observableSignalFromEvent;
    class FromEventObservableSignal extends base_1.BaseObservable {
        constructor(debugName, f) {
            super();
            this.debugName = debugName;
            this.f = f;
            this.h = () => {
                (0, base_1.transaction)((tx) => {
                    for (const o of this.a) {
                        tx.updateObserver(o, this);
                        o.handleChange(this, undefined);
                    }
                }, () => this.debugName);
            };
        }
        b() {
            this.e = this.f(this.h);
        }
        c() {
            this.e.dispose();
            this.e = undefined;
        }
        get() {
            // NO OP
        }
    }
    function observableSignal(debugName) {
        return new ObservableSignal(debugName);
    }
    exports.observableSignal = observableSignal;
    class ObservableSignal extends base_1.BaseObservable {
        constructor(debugName) {
            super();
            this.debugName = debugName;
        }
        trigger(tx) {
            if (!tx) {
                (0, base_1.transaction)(tx => {
                    this.trigger(tx);
                }, () => `Trigger signal ${this.debugName}`);
                return;
            }
            for (const o of this.a) {
                tx.updateObserver(o, this);
                o.handleChange(this, undefined);
            }
        }
        get() {
            // NO OP
        }
    }
    function debouncedObservable(observable, debounceMs, disposableStore) {
        const debouncedObservable = (0, base_1.observableValue)('debounced', undefined);
        let timeout = undefined;
        disposableStore.add((0, autorun_1.autorun)('debounce', reader => {
            const value = observable.read(reader);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                (0, base_1.transaction)(tx => {
                    debouncedObservable.set(value, tx);
                });
            }, debounceMs);
        }));
        return debouncedObservable;
    }
    exports.debouncedObservable = debouncedObservable;
    function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
        const observable = (0, base_1.observableValue)('triggeredRecently', false);
        let timeout = undefined;
        disposableStore.add(event(() => {
            observable.set(true, undefined);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                observable.set(false, undefined);
            }, timeoutMs);
        }));
        return observable;
    }
    exports.wasEventTriggeredRecently = wasEventTriggeredRecently;
    /**
     * This ensures the observable cache is kept up-to-date, even if there are no subscribers.
     * This is useful when the observables `get` method is used, but not its `read` method.
     *
     * (Usually, when no one is actually observing the observable, getting its value will
     * compute it from scratch, as the cache cannot be trusted:
     * Because no one is actually observing its value, keeping the cache up-to-date would be too expensive)
    */
    function keepAlive(observable) {
        const o = new KeepAliveObserver();
        observable.addObserver(o);
        return (0, lifecycle_1.toDisposable)(() => {
            observable.removeObserver(o);
        });
    }
    exports.keepAlive = keepAlive;
    class KeepAliveObserver {
        beginUpdate(observable) {
            // NO OP
        }
        handleChange(observable, change) {
            // NO OP
        }
        endUpdate(observable) {
            // NO OP
        }
    }
    function derivedObservableWithCache(name, computeFn) {
        let lastValue = undefined;
        const observable = (0, derived_1.derived)(name, reader => {
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return observable;
    }
    exports.derivedObservableWithCache = derivedObservableWithCache;
    function derivedObservableWithWritableCache(name, computeFn) {
        let lastValue = undefined;
        const counter = (0, base_1.observableValue)('derivedObservableWithWritableCache.counter', 0);
        const observable = (0, derived_1.derived)(name, reader => {
            counter.read(reader);
            lastValue = computeFn(reader, lastValue);
            return lastValue;
        });
        return Object.assign(observable, {
            clearCache: (transaction) => {
                lastValue = undefined;
                counter.set(counter.get() + 1, transaction);
            },
        });
    }
    exports.derivedObservableWithWritableCache = derivedObservableWithWritableCache;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define(__m[11/*vs/base/common/observable*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/observableImpl/base*/,10/*vs/base/common/observableImpl/derived*/,9/*vs/base/common/observableImpl/autorun*/,20/*vs/base/common/observableImpl/utils*/,3/*vs/base/common/observableImpl/logging*/]), function (require, exports, base_1, derived_1, autorun_1, utils_1, logging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autorunWithStore = exports.autorunHandleChanges = exports.autorunDelta = exports.autorun = exports.derived = exports.transaction = exports.observableValue = void 0;
    Object.defineProperty(exports, "observableValue", { enumerable: true, get: function () { return base_1.observableValue; } });
    Object.defineProperty(exports, "transaction", { enumerable: true, get: function () { return base_1.transaction; } });
    Object.defineProperty(exports, "derived", { enumerable: true, get: function () { return derived_1.derived; } });
    Object.defineProperty(exports, "autorun", { enumerable: true, get: function () { return autorun_1.autorun; } });
    Object.defineProperty(exports, "autorunDelta", { enumerable: true, get: function () { return autorun_1.autorunDelta; } });
    Object.defineProperty(exports, "autorunHandleChanges", { enumerable: true, get: function () { return autorun_1.autorunHandleChanges; } });
    Object.defineProperty(exports, "autorunWithStore", { enumerable: true, get: function () { return autorun_1.autorunWithStore; } });
    __exportStar(utils_1, exports);
    const enableLogging = false;
    if (enableLogging) {
        (0, logging_1.setLogger)(new logging_1.ConsoleObservableLogger());
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[21/*vs/base/common/stream*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/errors*/,2/*vs/base/common/lifecycle*/]), function (require, exports, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prefixedStream = exports.prefixedReadable = exports.transform = exports.toReadable = exports.emptyStream = exports.toStream = exports.peekStream = exports.listenStream = exports.consumeStream = exports.peekReadable = exports.consumeReadable = exports.newWriteableStream = exports.isReadableBufferedStream = exports.isReadableStream = exports.isReadable = void 0;
    function isReadable(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return typeof candidate.read === 'function';
    }
    exports.isReadable = isReadable;
    function isReadableStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function');
    }
    exports.isReadableStream = isReadableStream;
    function isReadableBufferedStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean';
    }
    exports.isReadableBufferedStream = isReadableBufferedStream;
    function newWriteableStream(reducer, options) {
        return new WriteableStreamImpl(reducer, options);
    }
    exports.newWriteableStream = newWriteableStream;
    class WriteableStreamImpl {
        constructor(e, f) {
            this.e = e;
            this.f = f;
            this.a = {
                flowing: false,
                ended: false,
                destroyed: false
            };
            this.b = {
                data: [],
                error: []
            };
            this.c = {
                data: [],
                error: [],
                end: []
            };
            this.d = [];
        }
        pause() {
            if (this.a.destroyed) {
                return;
            }
            this.a.flowing = false;
        }
        resume() {
            if (this.a.destroyed) {
                return;
            }
            if (!this.a.flowing) {
                this.a.flowing = true;
                // emit buffered events
                this.j();
                this.k();
                this.l();
            }
        }
        write(data) {
            if (this.a.destroyed) {
                return;
            }
            // flowing: directly send the data to listeners
            if (this.a.flowing) {
                this.g(data);
            }
            // not yet flowing: buffer data until flowing
            else {
                this.b.data.push(data);
                // highWaterMark: if configured, signal back when buffer reached limits
                if (typeof this.f?.highWaterMark === 'number' && this.b.data.length > this.f.highWaterMark) {
                    return new Promise(resolve => this.d.push(resolve));
                }
            }
        }
        error(error) {
            if (this.a.destroyed) {
                return;
            }
            // flowing: directly send the error to listeners
            if (this.a.flowing) {
                this.h(error);
            }
            // not yet flowing: buffer errors until flowing
            else {
                this.b.error.push(error);
            }
        }
        end(result) {
            if (this.a.destroyed) {
                return;
            }
            // end with data if provided
            if (typeof result !== 'undefined') {
                this.write(result);
            }
            // flowing: send end event to listeners
            if (this.a.flowing) {
                this.i();
                this.destroy();
            }
            // not yet flowing: remember state
            else {
                this.a.ended = true;
            }
        }
        g(data) {
            this.c.data.slice(0).forEach(listener => listener(data)); // slice to avoid listener mutation from delivering event
        }
        h(error) {
            if (this.c.error.length === 0) {
                (0, errors_1.onUnexpectedError)(error); // nobody listened to this error so we log it as unexpected
            }
            else {
                this.c.error.slice(0).forEach(listener => listener(error)); // slice to avoid listener mutation from delivering event
            }
        }
        i() {
            this.c.end.slice(0).forEach(listener => listener()); // slice to avoid listener mutation from delivering event
        }
        on(event, callback) {
            if (this.a.destroyed) {
                return;
            }
            switch (event) {
                case 'data':
                    this.c.data.push(callback);
                    // switch into flowing mode as soon as the first 'data'
                    // listener is added and we are not yet in flowing mode
                    this.resume();
                    break;
                case 'end':
                    this.c.end.push(callback);
                    // emit 'end' event directly if we are flowing
                    // and the end has already been reached
                    //
                    // finish() when it went through
                    if (this.a.flowing && this.l()) {
                        this.destroy();
                    }
                    break;
                case 'error':
                    this.c.error.push(callback);
                    // emit buffered 'error' events unless done already
                    // now that we know that we have at least one listener
                    if (this.a.flowing) {
                        this.k();
                    }
                    break;
            }
        }
        removeListener(event, callback) {
            if (this.a.destroyed) {
                return;
            }
            let listeners = undefined;
            switch (event) {
                case 'data':
                    listeners = this.c.data;
                    break;
                case 'end':
                    listeners = this.c.end;
                    break;
                case 'error':
                    listeners = this.c.error;
                    break;
            }
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            }
        }
        j() {
            if (this.b.data.length > 0) {
                const fullDataBuffer = this.e(this.b.data);
                this.g(fullDataBuffer);
                this.b.data.length = 0;
                // When the buffer is empty, resolve all pending writers
                const pendingWritePromises = [...this.d];
                this.d.length = 0;
                pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
            }
        }
        k() {
            if (this.c.error.length > 0) {
                for (const error of this.b.error) {
                    this.h(error);
                }
                this.b.error.length = 0;
            }
        }
        l() {
            if (this.a.ended) {
                this.i();
                return this.c.end.length > 0;
            }
            return false;
        }
        destroy() {
            if (!this.a.destroyed) {
                this.a.destroyed = true;
                this.a.ended = true;
                this.b.data.length = 0;
                this.b.error.length = 0;
                this.c.data.length = 0;
                this.c.error.length = 0;
                this.c.end.length = 0;
                this.d.length = 0;
            }
        }
    }
    /**
     * Helper to fully read a T readable into a T.
     */
    function consumeReadable(readable, reducer) {
        const chunks = [];
        let chunk;
        while ((chunk = readable.read()) !== null) {
            chunks.push(chunk);
        }
        return reducer(chunks);
    }
    exports.consumeReadable = consumeReadable;
    /**
     * Helper to read a T readable up to a maximum of chunks. If the limit is
     * reached, will return a readable instead to ensure all data can still
     * be read.
     */
    function peekReadable(readable, reducer, maxChunks) {
        const chunks = [];
        let chunk = undefined;
        while ((chunk = readable.read()) !== null && chunks.length < maxChunks) {
            chunks.push(chunk);
        }
        // If the last chunk is null, it means we reached the end of
        // the readable and return all the data at once
        if (chunk === null && chunks.length > 0) {
            return reducer(chunks);
        }
        // Otherwise, we still have a chunk, it means we reached the maxChunks
        // value and as such we return a new Readable that first returns
        // the existing read chunks and then continues with reading from
        // the underlying readable.
        return {
            read: () => {
                // First consume chunks from our array
                if (chunks.length > 0) {
                    return chunks.shift();
                }
                // Then ensure to return our last read chunk
                if (typeof chunk !== 'undefined') {
                    const lastReadChunk = chunk;
                    // explicitly use undefined here to indicate that we consumed
                    // the chunk, which could have either been null or valued.
                    chunk = undefined;
                    return lastReadChunk;
                }
                // Finally delegate back to the Readable
                return readable.read();
            }
        };
    }
    exports.peekReadable = peekReadable;
    function consumeStream(stream, reducer) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            listenStream(stream, {
                onData: chunk => {
                    if (reducer) {
                        chunks.push(chunk);
                    }
                },
                onError: error => {
                    if (reducer) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                },
                onEnd: () => {
                    if (reducer) {
                        resolve(reducer(chunks));
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    exports.consumeStream = consumeStream;
    /**
     * Helper to listen to all events of a T stream in proper order.
     */
    function listenStream(stream, listener) {
        let destroyed = false;
        stream.on('error', error => {
            if (!destroyed) {
                listener.onError(error);
            }
        });
        stream.on('end', () => {
            if (!destroyed) {
                listener.onEnd();
            }
        });
        // Adding the `data` listener will turn the stream
        // into flowing mode. As such it is important to
        // add this listener last (DO NOT CHANGE!)
        stream.on('data', data => {
            if (!destroyed) {
                listener.onData(data);
            }
        });
        return (0, lifecycle_1.toDisposable)(() => destroyed = true);
    }
    exports.listenStream = listenStream;
    /**
     * Helper to peek up to `maxChunks` into a stream. The return type signals if
     * the stream has ended or not. If not, caller needs to add a `data` listener
     * to continue reading.
     */
    function peekStream(stream, maxChunks) {
        return new Promise((resolve, reject) => {
            const streamListeners = new lifecycle_1.DisposableStore();
            const buffer = [];
            // Data Listener
            const dataListener = (chunk) => {
                // Add to buffer
                buffer.push(chunk);
                // We reached maxChunks and thus need to return
                if (buffer.length > maxChunks) {
                    // Dispose any listeners and ensure to pause the
                    // stream so that it can be consumed again by caller
                    streamListeners.dispose();
                    stream.pause();
                    return resolve({ stream, buffer, ended: false });
                }
            };
            // Error Listener
            const errorListener = (error) => {
                return reject(error);
            };
            // End Listener
            const endListener = () => {
                return resolve({ stream, buffer, ended: true });
            };
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('error', errorListener)));
            stream.on('error', errorListener);
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('end', endListener)));
            stream.on('end', endListener);
            // Important: leave the `data` listener last because
            // this can turn the stream into flowing mode and we
            // want `error` events to be received as well.
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('data', dataListener)));
            stream.on('data', dataListener);
        });
    }
    exports.peekStream = peekStream;
    /**
     * Helper to create a readable stream from an existing T.
     */
    function toStream(t, reducer) {
        const stream = newWriteableStream(reducer);
        stream.end(t);
        return stream;
    }
    exports.toStream = toStream;
    /**
     * Helper to create an empty stream
     */
    function emptyStream() {
        const stream = newWriteableStream(() => { throw new Error('not supported'); });
        stream.end();
        return stream;
    }
    exports.emptyStream = emptyStream;
    /**
     * Helper to convert a T into a Readable<T>.
     */
    function toReadable(t) {
        let consumed = false;
        return {
            read: () => {
                if (consumed) {
                    return null;
                }
                consumed = true;
                return t;
            }
        };
    }
    exports.toReadable = toReadable;
    /**
     * Helper to transform a readable stream into another stream.
     */
    function transform(stream, transformer, reducer) {
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => target.write(transformer.data(data)),
            onError: error => target.error(transformer.error ? transformer.error(error) : error),
            onEnd: () => target.end()
        });
        return target;
    }
    exports.transform = transform;
    /**
     * Helper to take an existing readable that will
     * have a prefix injected to the beginning.
     */
    function prefixedReadable(prefix, readable, reducer) {
        let prefixHandled = false;
        return {
            read: () => {
                const chunk = readable.read();
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    // If we have also a read-result, make
                    // sure to reduce it to a single result
                    if (chunk !== null) {
                        return reducer([prefix, chunk]);
                    }
                    // Otherwise, just return prefix directly
                    return prefix;
                }
                return chunk;
            }
        };
    }
    exports.prefixedReadable = prefixedReadable;
    /**
     * Helper to take an existing stream that will
     * have a prefix injected to the beginning.
     */
    function prefixedStream(prefix, stream, reducer) {
        let prefixHandled = false;
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    return target.write(reducer([prefix, data]));
                }
                return target.write(data);
            },
            onError: error => target.error(error),
            onEnd: () => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    target.write(prefix);
                }
                target.end();
            }
        });
        return target;
    }
    exports.prefixedStream = prefixedStream;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[12/*vs/base/common/buffer*/], __M([0/*require*/,1/*exports*/,21/*vs/base/common/stream*/]), function (require, exports, streams) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodeBase64 = exports.decodeBase64 = exports.prefixedBufferStream = exports.prefixedBufferReadable = exports.newWriteableBufferStream = exports.streamToBufferReadableStream = exports.bufferToStream = exports.bufferedStreamToBuffer = exports.streamToBuffer = exports.bufferToReadable = exports.readableToBuffer = exports.writeUInt8 = exports.readUInt8 = exports.writeUInt32LE = exports.readUInt32LE = exports.writeUInt32BE = exports.readUInt32BE = exports.writeUInt16LE = exports.readUInt16LE = exports.VSBuffer = void 0;
    const hasBuffer = (typeof Buffer !== 'undefined');
    let textEncoder;
    let textDecoder;
    class VSBuffer {
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static alloc(byteLength) {
            if (hasBuffer) {
                return new VSBuffer(Buffer.allocUnsafe(byteLength));
            }
            else {
                return new VSBuffer(new Uint8Array(byteLength));
            }
        }
        /**
         * When running in a nodejs context, if `actual` is not a nodejs Buffer, the backing store for
         * the returned `VSBuffer` instance might use a nodejs Buffer allocated from node's Buffer pool,
         * which is not transferrable.
         */
        static wrap(actual) {
            if (hasBuffer && !(Buffer.isBuffer(actual))) {
                // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
                // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
                actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
            }
            return new VSBuffer(actual);
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static fromString(source, options) {
            const dontUseNodeBuffer = options?.dontUseNodeBuffer || false;
            if (!dontUseNodeBuffer && hasBuffer) {
                return new VSBuffer(Buffer.from(source));
            }
            else {
                if (!textEncoder) {
                    textEncoder = new TextEncoder();
                }
                return new VSBuffer(textEncoder.encode(source));
            }
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static fromByteArray(source) {
            const result = VSBuffer.alloc(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                result.buffer[i] = source[i];
            }
            return result;
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        static concat(buffers, totalLength) {
            if (typeof totalLength === 'undefined') {
                totalLength = 0;
                for (let i = 0, len = buffers.length; i < len; i++) {
                    totalLength += buffers[i].byteLength;
                }
            }
            const ret = VSBuffer.alloc(totalLength);
            let offset = 0;
            for (let i = 0, len = buffers.length; i < len; i++) {
                const element = buffers[i];
                ret.set(element, offset);
                offset += element.byteLength;
            }
            return ret;
        }
        constructor(buffer) {
            this.buffer = buffer;
            this.byteLength = this.buffer.byteLength;
        }
        /**
         * When running in a nodejs context, the backing store for the returned `VSBuffer` instance
         * might use a nodejs Buffer allocated from node's Buffer pool, which is not transferrable.
         */
        clone() {
            const result = VSBuffer.alloc(this.byteLength);
            result.set(this);
            return result;
        }
        toString() {
            if (hasBuffer) {
                return this.buffer.toString();
            }
            else {
                if (!textDecoder) {
                    textDecoder = new TextDecoder();
                }
                return textDecoder.decode(this.buffer);
            }
        }
        slice(start, end) {
            // IMPORTANT: use subarray instead of slice because TypedArray#slice
            // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
            // ensures the same, performance, behaviour.
            return new VSBuffer(this.buffer.subarray(start, end));
        }
        set(array, offset) {
            if (array instanceof VSBuffer) {
                this.buffer.set(array.buffer, offset);
            }
            else if (array instanceof Uint8Array) {
                this.buffer.set(array, offset);
            }
            else if (array instanceof ArrayBuffer) {
                this.buffer.set(new Uint8Array(array), offset);
            }
            else if (ArrayBuffer.isView(array)) {
                this.buffer.set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength), offset);
            }
            else {
                throw new Error(`Unknown argument 'array'`);
            }
        }
        readUInt32BE(offset) {
            return readUInt32BE(this.buffer, offset);
        }
        writeUInt32BE(value, offset) {
            writeUInt32BE(this.buffer, value, offset);
        }
        readUInt32LE(offset) {
            return readUInt32LE(this.buffer, offset);
        }
        writeUInt32LE(value, offset) {
            writeUInt32LE(this.buffer, value, offset);
        }
        readUInt8(offset) {
            return readUInt8(this.buffer, offset);
        }
        writeUInt8(value, offset) {
            writeUInt8(this.buffer, value, offset);
        }
    }
    exports.VSBuffer = VSBuffer;
    function readUInt16LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0));
    }
    exports.readUInt16LE = readUInt16LE;
    function writeUInt16LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
    }
    exports.writeUInt16LE = writeUInt16LE;
    function readUInt32BE(source, offset) {
        return (source[offset] * 2 ** 24
            + source[offset + 1] * 2 ** 16
            + source[offset + 2] * 2 ** 8
            + source[offset + 3]);
    }
    exports.readUInt32BE = readUInt32BE;
    function writeUInt32BE(destination, value, offset) {
        destination[offset + 3] = value;
        value = value >>> 8;
        destination[offset + 2] = value;
        value = value >>> 8;
        destination[offset + 1] = value;
        value = value >>> 8;
        destination[offset] = value;
    }
    exports.writeUInt32BE = writeUInt32BE;
    function readUInt32LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0) |
            ((source[offset + 2] << 16) >>> 0) |
            ((source[offset + 3] << 24) >>> 0));
    }
    exports.readUInt32LE = readUInt32LE;
    function writeUInt32LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 2] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 3] = (value & 0b11111111);
    }
    exports.writeUInt32LE = writeUInt32LE;
    function readUInt8(source, offset) {
        return source[offset];
    }
    exports.readUInt8 = readUInt8;
    function writeUInt8(destination, value, offset) {
        destination[offset] = value;
    }
    exports.writeUInt8 = writeUInt8;
    function readableToBuffer(readable) {
        return streams.consumeReadable(readable, chunks => VSBuffer.concat(chunks));
    }
    exports.readableToBuffer = readableToBuffer;
    function bufferToReadable(buffer) {
        return streams.toReadable(buffer);
    }
    exports.bufferToReadable = bufferToReadable;
    function streamToBuffer(stream) {
        return streams.consumeStream(stream, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBuffer = streamToBuffer;
    async function bufferedStreamToBuffer(bufferedStream) {
        if (bufferedStream.ended) {
            return VSBuffer.concat(bufferedStream.buffer);
        }
        return VSBuffer.concat([
            // Include already read chunks...
            ...bufferedStream.buffer,
            // ...and all additional chunks
            await streamToBuffer(bufferedStream.stream)
        ]);
    }
    exports.bufferedStreamToBuffer = bufferedStreamToBuffer;
    function bufferToStream(buffer) {
        return streams.toStream(buffer, chunks => VSBuffer.concat(chunks));
    }
    exports.bufferToStream = bufferToStream;
    function streamToBufferReadableStream(stream) {
        return streams.transform(stream, { data: data => typeof data === 'string' ? VSBuffer.fromString(data) : VSBuffer.wrap(data) }, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBufferReadableStream = streamToBufferReadableStream;
    function newWriteableBufferStream(options) {
        return streams.newWriteableStream(chunks => VSBuffer.concat(chunks), options);
    }
    exports.newWriteableBufferStream = newWriteableBufferStream;
    function prefixedBufferReadable(prefix, readable) {
        return streams.prefixedReadable(prefix, readable, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferReadable = prefixedBufferReadable;
    function prefixedBufferStream(prefix, stream) {
        return streams.prefixedStream(prefix, stream, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferStream = prefixedBufferStream;
    /** Decodes base64 to a uint8 array. URL-encoded and unpadded base64 is allowed. */
    function decodeBase64(encoded) {
        let building = 0;
        let remainder = 0;
        let bufi = 0;
        // The simpler way to do this is `Uint8Array.from(atob(str), c => c.charCodeAt(0))`,
        // but that's about 10-20x slower than this function in current Chromium versions.
        const buffer = new Uint8Array(Math.floor(encoded.length / 4 * 3));
        const append = (value) => {
            switch (remainder) {
                case 3:
                    buffer[bufi++] = building | value;
                    remainder = 0;
                    break;
                case 2:
                    buffer[bufi++] = building | (value >>> 2);
                    building = value << 6;
                    remainder = 3;
                    break;
                case 1:
                    buffer[bufi++] = building | (value >>> 4);
                    building = value << 4;
                    remainder = 2;
                    break;
                default:
                    building = value << 2;
                    remainder = 1;
            }
        };
        for (let i = 0; i < encoded.length; i++) {
            const code = encoded.charCodeAt(i);
            // See https://datatracker.ietf.org/doc/html/rfc4648#section-4
            // This branchy code is about 3x faster than an indexOf on a base64 char string.
            if (code >= 65 && code <= 90) {
                append(code - 65); // A-Z starts ranges from char code 65 to 90
            }
            else if (code >= 97 && code <= 122) {
                append(code - 97 + 26); // a-z starts ranges from char code 97 to 122, starting at byte 26
            }
            else if (code >= 48 && code <= 57) {
                append(code - 48 + 52); // 0-9 starts ranges from char code 48 to 58, starting at byte 52
            }
            else if (code === 43 || code === 45) {
                append(62); // "+" or "-" for URLS
            }
            else if (code === 47 || code === 95) {
                append(63); // "/" or "_" for URLS
            }
            else if (code === 61) {
                break; // "="
            }
            else {
                throw new SyntaxError(`Unexpected base64 character ${encoded[i]}`);
            }
        }
        const unpadded = bufi;
        while (remainder > 0) {
            append(0);
        }
        // slice is needed to account for overestimation due to padding
        return VSBuffer.wrap(buffer).slice(0, unpadded);
    }
    exports.decodeBase64 = decodeBase64;
    const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const base64UrlSafeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    /** Encodes a buffer to a base64 string. */
    function encodeBase64({ buffer }, padded = true, urlSafe = false) {
        const dictionary = urlSafe ? base64UrlSafeAlphabet : base64Alphabet;
        let output = '';
        const remainder = buffer.byteLength % 3;
        let i = 0;
        for (; i < buffer.byteLength - remainder; i += 3) {
            const a = buffer[i + 0];
            const b = buffer[i + 1];
            const c = buffer[i + 2];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4 | b >>> 4) & 0b111111];
            output += dictionary[(b << 2 | c >>> 6) & 0b111111];
            output += dictionary[c & 0b111111];
        }
        if (remainder === 1) {
            const a = buffer[i + 0];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4) & 0b111111];
            if (padded) {
                output += '==';
            }
        }
        else if (remainder === 2) {
            const a = buffer[i + 0];
            const b = buffer[i + 1];
            output += dictionary[a >>> 2];
            output += dictionary[(a << 4 | b >>> 4) & 0b111111];
            output += dictionary[(b << 2) & 0b111111];
            if (padded) {
                output += '=';
            }
        }
        return output;
    }
    exports.encodeBase64 = encodeBase64;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[22/*vs/base/common/symbols*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MicrotaskDelay = void 0;
    /**
     * Can be passed into the Delayed to defer using a microtask
     * */
    exports.MicrotaskDelay = Symbol('MicrotaskDelay');
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[7/*vs/editor/common/core/eolCounter*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.countEOL = exports.StringEOL = void 0;
    var StringEOL;
    (function (StringEOL) {
        StringEOL[StringEOL["Unknown"] = 0] = "Unknown";
        StringEOL[StringEOL["Invalid"] = 3] = "Invalid";
        StringEOL[StringEOL["LF"] = 1] = "LF";
        StringEOL[StringEOL["CRLF"] = 2] = "CRLF";
    })(StringEOL = exports.StringEOL || (exports.StringEOL = {}));
    function countEOL(text) {
        let eolCount = 0;
        let firstLineLength = 0;
        let lastLineStart = 0;
        let eol = 0 /* StringEOL.Unknown */;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charCodeAt(i);
            if (chr === 13 /* CharCode.CarriageReturn */) {
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* CharCode.LineFeed */) {
                    // \r\n... case
                    eol |= 2 /* StringEOL.CRLF */;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    eol |= 3 /* StringEOL.Invalid */;
                }
                lastLineStart = i + 1;
            }
            else if (chr === 10 /* CharCode.LineFeed */) {
                // \n... case
                eol |= 1 /* StringEOL.LF */;
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                lastLineStart = i + 1;
            }
        }
        if (eolCount === 0) {
            firstLineLength = text.length;
        }
        return [eolCount, firstLineLength, text.length - lastLineStart, eol];
    }
    exports.countEOL = countEOL;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[13/*vs/editor/common/encodedTokenAttributes*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenMetadata = exports.MetadataConsts = exports.StandardTokenType = exports.ColorId = exports.FontStyle = exports.LanguageId = void 0;
    /**
     * Open ended enum at runtime
     */
    var LanguageId;
    (function (LanguageId) {
        LanguageId[LanguageId["Null"] = 0] = "Null";
        LanguageId[LanguageId["PlainText"] = 1] = "PlainText";
    })(LanguageId = exports.LanguageId || (exports.LanguageId = {}));
    /**
     * A font style. Values are 2^x such that a bit mask can be used.
     */
    var FontStyle;
    (function (FontStyle) {
        FontStyle[FontStyle["NotSet"] = -1] = "NotSet";
        FontStyle[FontStyle["None"] = 0] = "None";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
        FontStyle[FontStyle["Bold"] = 2] = "Bold";
        FontStyle[FontStyle["Underline"] = 4] = "Underline";
        FontStyle[FontStyle["Strikethrough"] = 8] = "Strikethrough";
    })(FontStyle = exports.FontStyle || (exports.FontStyle = {}));
    /**
     * Open ended enum at runtime
     */
    var ColorId;
    (function (ColorId) {
        ColorId[ColorId["None"] = 0] = "None";
        ColorId[ColorId["DefaultForeground"] = 1] = "DefaultForeground";
        ColorId[ColorId["DefaultBackground"] = 2] = "DefaultBackground";
    })(ColorId = exports.ColorId || (exports.ColorId = {}));
    /**
     * A standard token type.
     */
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
    })(StandardTokenType = exports.StandardTokenType || (exports.StandardTokenType = {}));
    /**
     * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
     * The following assumptions have been made:
     *  - languageId < 256 => needs 8 bits
     *  - unique color count < 512 => needs 9 bits
     *
     * The binary format is:
     * - -------------------------------------------
     *     3322 2222 2222 1111 1111 1100 0000 0000
     *     1098 7654 3210 9876 5432 1098 7654 3210
     * - -------------------------------------------
     *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
     *     bbbb bbbb ffff ffff fFFF FBTT LLLL LLLL
     * - -------------------------------------------
     *  - L = LanguageId (8 bits)
     *  - T = StandardTokenType (2 bits)
     *  - B = Balanced bracket (1 bit)
     *  - F = FontStyle (4 bits)
     *  - f = foreground color (9 bits)
     *  - b = background color (9 bits)
     *
     */
    var MetadataConsts;
    (function (MetadataConsts) {
        MetadataConsts[MetadataConsts["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_MASK"] = 768] = "TOKEN_TYPE_MASK";
        MetadataConsts[MetadataConsts["BALANCED_BRACKETS_MASK"] = 1024] = "BALANCED_BRACKETS_MASK";
        MetadataConsts[MetadataConsts["FONT_STYLE_MASK"] = 30720] = "FONT_STYLE_MASK";
        MetadataConsts[MetadataConsts["FOREGROUND_MASK"] = 16744448] = "FOREGROUND_MASK";
        MetadataConsts[MetadataConsts["BACKGROUND_MASK"] = 4278190080] = "BACKGROUND_MASK";
        MetadataConsts[MetadataConsts["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
        MetadataConsts[MetadataConsts["BOLD_MASK"] = 4096] = "BOLD_MASK";
        MetadataConsts[MetadataConsts["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
        MetadataConsts[MetadataConsts["STRIKETHROUGH_MASK"] = 16384] = "STRIKETHROUGH_MASK";
        // Semantic tokens cannot set the language id, so we can
        // use the first 8 bits for control purposes
        MetadataConsts[MetadataConsts["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_STRIKETHROUGH"] = 8] = "SEMANTIC_USE_STRIKETHROUGH";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_FOREGROUND"] = 16] = "SEMANTIC_USE_FOREGROUND";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BACKGROUND"] = 32] = "SEMANTIC_USE_BACKGROUND";
        MetadataConsts[MetadataConsts["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
        MetadataConsts[MetadataConsts["BALANCED_BRACKETS_OFFSET"] = 10] = "BALANCED_BRACKETS_OFFSET";
        MetadataConsts[MetadataConsts["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
        MetadataConsts[MetadataConsts["FOREGROUND_OFFSET"] = 15] = "FOREGROUND_OFFSET";
        MetadataConsts[MetadataConsts["BACKGROUND_OFFSET"] = 24] = "BACKGROUND_OFFSET";
    })(MetadataConsts = exports.MetadataConsts || (exports.MetadataConsts = {}));
    /**
     */
    class TokenMetadata {
        static getLanguageId(metadata) {
            return (metadata & 255 /* MetadataConsts.LANGUAGEID_MASK */) >>> 0 /* MetadataConsts.LANGUAGEID_OFFSET */;
        }
        static getTokenType(metadata) {
            return (metadata & 768 /* MetadataConsts.TOKEN_TYPE_MASK */) >>> 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */;
        }
        static containsBalancedBrackets(metadata) {
            return (metadata & 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */) !== 0;
        }
        static getFontStyle(metadata) {
            return (metadata & 30720 /* MetadataConsts.FONT_STYLE_MASK */) >>> 11 /* MetadataConsts.FONT_STYLE_OFFSET */;
        }
        static getForeground(metadata) {
            return (metadata & 16744448 /* MetadataConsts.FOREGROUND_MASK */) >>> 15 /* MetadataConsts.FOREGROUND_OFFSET */;
        }
        static getBackground(metadata) {
            return (metadata & 4278190080 /* MetadataConsts.BACKGROUND_MASK */) >>> 24 /* MetadataConsts.BACKGROUND_OFFSET */;
        }
        static getClassNameFromMetadata(metadata) {
            const foreground = this.getForeground(metadata);
            let className = 'mtk' + foreground;
            const fontStyle = this.getFontStyle(metadata);
            if (fontStyle & 1 /* FontStyle.Italic */) {
                className += ' mtki';
            }
            if (fontStyle & 2 /* FontStyle.Bold */) {
                className += ' mtkb';
            }
            if (fontStyle & 4 /* FontStyle.Underline */) {
                className += ' mtku';
            }
            if (fontStyle & 8 /* FontStyle.Strikethrough */) {
                className += ' mtks';
            }
            return className;
        }
        static getInlineStyleFromMetadata(metadata, colorMap) {
            const foreground = this.getForeground(metadata);
            const fontStyle = this.getFontStyle(metadata);
            let result = `color: ${colorMap[foreground]};`;
            if (fontStyle & 1 /* FontStyle.Italic */) {
                result += 'font-style: italic;';
            }
            if (fontStyle & 2 /* FontStyle.Bold */) {
                result += 'font-weight: bold;';
            }
            let textDecoration = '';
            if (fontStyle & 4 /* FontStyle.Underline */) {
                textDecoration += ' underline';
            }
            if (fontStyle & 8 /* FontStyle.Strikethrough */) {
                textDecoration += ' line-through';
            }
            if (textDecoration) {
                result += `text-decoration:${textDecoration};`;
            }
            return result;
        }
        static getPresentationFromMetadata(metadata) {
            const foreground = this.getForeground(metadata);
            const fontStyle = this.getFontStyle(metadata);
            return {
                foreground: foreground,
                italic: Boolean(fontStyle & 1 /* FontStyle.Italic */),
                bold: Boolean(fontStyle & 2 /* FontStyle.Bold */),
                underline: Boolean(fontStyle & 4 /* FontStyle.Underline */),
                strikethrough: Boolean(fontStyle & 8 /* FontStyle.Strikethrough */),
            };
        }
    }
    exports.TokenMetadata = TokenMetadata;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[8/*vs/editor/common/tokens/lineTokens*/], __M([0/*require*/,1/*exports*/,13/*vs/editor/common/encodedTokenAttributes*/]), function (require, exports, encodedTokenAttributes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LineTokens = void 0;
    class LineTokens {
        static createEmpty(lineContent, decoder) {
            const defaultMetadata = LineTokens.defaultTokenMetadata;
            const tokens = new Uint32Array(2);
            tokens[0] = lineContent.length;
            tokens[1] = defaultMetadata;
            return new LineTokens(tokens, lineContent, decoder);
        }
        constructor(tokens, text, decoder) {
            this._lineTokensBrand = undefined;
            this.a = tokens;
            this.b = (this.a.length >>> 1);
            this.c = text;
            this.d = decoder;
        }
        equals(other) {
            if (other instanceof LineTokens) {
                return this.slicedEquals(other, 0, this.b);
            }
            return false;
        }
        slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
            if (this.c !== other.c) {
                return false;
            }
            if (this.b !== other.b) {
                return false;
            }
            const from = (sliceFromTokenIndex << 1);
            const to = from + (sliceTokenCount << 1);
            for (let i = from; i < to; i++) {
                if (this.a[i] !== other.a[i]) {
                    return false;
                }
            }
            return true;
        }
        getLineContent() {
            return this.c;
        }
        getCount() {
            return this.b;
        }
        getStartOffset(tokenIndex) {
            if (tokenIndex > 0) {
                return this.a[(tokenIndex - 1) << 1];
            }
            return 0;
        }
        getMetadata(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return metadata;
        }
        getLanguageId(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            const languageId = encodedTokenAttributes_1.TokenMetadata.getLanguageId(metadata);
            return this.d.decodeLanguageId(languageId);
        }
        getStandardTokenType(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.TokenMetadata.getTokenType(metadata);
        }
        getForeground(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.TokenMetadata.getForeground(metadata);
        }
        getClassName(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.TokenMetadata.getClassNameFromMetadata(metadata);
        }
        getInlineStyle(tokenIndex, colorMap) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
        }
        getPresentation(tokenIndex) {
            const metadata = this.a[(tokenIndex << 1) + 1];
            return encodedTokenAttributes_1.TokenMetadata.getPresentationFromMetadata(metadata);
        }
        getEndOffset(tokenIndex) {
            return this.a[tokenIndex << 1];
        }
        /**
         * Find the token containing offset `offset`.
         * @param offset The search offset
         * @return The index of the token containing the offset.
         */
        findTokenIndexAtOffset(offset) {
            return LineTokens.findIndexInTokensArray(this.a, offset);
        }
        inflate() {
            return this;
        }
        sliceAndInflate(startOffset, endOffset, deltaOffset) {
            return new SliceLineTokens(this, startOffset, endOffset, deltaOffset);
        }
        static convertToEndOffset(tokens, lineTextLength) {
            const tokenCount = (tokens.length >>> 1);
            const lastTokenIndex = tokenCount - 1;
            for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
                tokens[tokenIndex << 1] = tokens[(tokenIndex + 1) << 1];
            }
            tokens[lastTokenIndex << 1] = lineTextLength;
        }
        static findIndexInTokensArray(tokens, desiredIndex) {
            if (tokens.length <= 2) {
                return 0;
            }
            let low = 0;
            let high = (tokens.length >>> 1) - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const endOffset = tokens[(mid << 1)];
                if (endOffset === desiredIndex) {
                    return mid + 1;
                }
                else if (endOffset < desiredIndex) {
                    low = mid + 1;
                }
                else if (endOffset > desiredIndex) {
                    high = mid;
                }
            }
            return low;
        }
        /**
         * @pure
         * @param insertTokens Must be sorted by offset.
        */
        withInserted(insertTokens) {
            if (insertTokens.length === 0) {
                return this;
            }
            let nextOriginalTokenIdx = 0;
            let nextInsertTokenIdx = 0;
            let text = '';
            const newTokens = new Array();
            let originalEndOffset = 0;
            while (true) {
                const nextOriginalTokenEndOffset = nextOriginalTokenIdx < this.b ? this.a[nextOriginalTokenIdx << 1] : -1;
                const nextInsertToken = nextInsertTokenIdx < insertTokens.length ? insertTokens[nextInsertTokenIdx] : null;
                if (nextOriginalTokenEndOffset !== -1 && (nextInsertToken === null || nextOriginalTokenEndOffset <= nextInsertToken.offset)) {
                    // original token ends before next insert token
                    text += this.c.substring(originalEndOffset, nextOriginalTokenEndOffset);
                    const metadata = this.a[(nextOriginalTokenIdx << 1) + 1];
                    newTokens.push(text.length, metadata);
                    nextOriginalTokenIdx++;
                    originalEndOffset = nextOriginalTokenEndOffset;
                }
                else if (nextInsertToken) {
                    if (nextInsertToken.offset > originalEndOffset) {
                        // insert token is in the middle of the next token.
                        text += this.c.substring(originalEndOffset, nextInsertToken.offset);
                        const metadata = this.a[(nextOriginalTokenIdx << 1) + 1];
                        newTokens.push(text.length, metadata);
                        originalEndOffset = nextInsertToken.offset;
                    }
                    text += nextInsertToken.text;
                    newTokens.push(text.length, nextInsertToken.tokenMetadata);
                    nextInsertTokenIdx++;
                }
                else {
                    break;
                }
            }
            return new LineTokens(new Uint32Array(newTokens), text, this.d);
        }
    }
    LineTokens.defaultTokenMetadata = ((0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
        | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
        | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
    exports.LineTokens = LineTokens;
    class SliceLineTokens {
        constructor(source, startOffset, endOffset, deltaOffset) {
            this.a = source;
            this.b = startOffset;
            this.c = endOffset;
            this.d = deltaOffset;
            this.e = source.findTokenIndexAtOffset(startOffset);
            this.f = 0;
            for (let i = this.e, len = source.getCount(); i < len; i++) {
                const tokenStartOffset = source.getStartOffset(i);
                if (tokenStartOffset >= endOffset) {
                    break;
                }
                this.f++;
            }
        }
        getMetadata(tokenIndex) {
            return this.a.getMetadata(this.e + tokenIndex);
        }
        getLanguageId(tokenIndex) {
            return this.a.getLanguageId(this.e + tokenIndex);
        }
        getLineContent() {
            return this.a.getLineContent().substring(this.b, this.c);
        }
        equals(other) {
            if (other instanceof SliceLineTokens) {
                return (this.b === other.b
                    && this.c === other.c
                    && this.d === other.d
                    && this.a.slicedEquals(other.a, this.e, this.f));
            }
            return false;
        }
        getCount() {
            return this.f;
        }
        getForeground(tokenIndex) {
            return this.a.getForeground(this.e + tokenIndex);
        }
        getEndOffset(tokenIndex) {
            const tokenEndOffset = this.a.getEndOffset(this.e + tokenIndex);
            return Math.min(this.c, tokenEndOffset) - this.b + this.d;
        }
        getClassName(tokenIndex) {
            return this.a.getClassName(this.e + tokenIndex);
        }
        getInlineStyle(tokenIndex, colorMap) {
            return this.a.getInlineStyle(this.e + tokenIndex, colorMap);
        }
        getPresentation(tokenIndex) {
            return this.a.getPresentation(this.e + tokenIndex);
        }
        findTokenIndexAtOffset(offset) {
            return this.a.findTokenIndexAtOffset(offset + this.b - this.d) - this.e;
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[23/*vs/editor/common/tokens/contiguousTokensEditing*/], __M([0/*require*/,1/*exports*/,8/*vs/editor/common/tokens/lineTokens*/]), function (require, exports, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUint32Array = exports.ContiguousTokensEditing = exports.EMPTY_LINE_TOKENS = void 0;
    exports.EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;
    class ContiguousTokensEditing {
        static deleteBeginning(lineTokens, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            return ContiguousTokensEditing.delete(lineTokens, 0, toChIndex);
        }
        static deleteEnding(lineTokens, fromChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const lineTextLength = tokens[tokens.length - 2];
            return ContiguousTokensEditing.delete(lineTokens, fromChIndex, lineTextLength);
        }
        static delete(lineTokens, fromChIndex, toChIndex) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            // special case: deleting everything
            if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
                return exports.EMPTY_LINE_TOKENS;
            }
            const fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, fromChIndex);
            const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
            const fromTokenEndOffset = tokens[fromTokenIndex << 1];
            if (toChIndex < fromTokenEndOffset) {
                // the delete range is inside a single token
                const delta = (toChIndex - fromChIndex);
                for (let i = fromTokenIndex; i < tokensCount; i++) {
                    tokens[i << 1] -= delta;
                }
                return lineTokens;
            }
            let dest;
            let lastEnd;
            if (fromTokenStartOffset !== fromChIndex) {
                tokens[fromTokenIndex << 1] = fromChIndex;
                dest = ((fromTokenIndex + 1) << 1);
                lastEnd = fromChIndex;
            }
            else {
                dest = (fromTokenIndex << 1);
                lastEnd = fromTokenStartOffset;
            }
            const delta = (toChIndex - fromChIndex);
            for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
                const tokenEndOffset = tokens[tokenIndex << 1] - delta;
                if (tokenEndOffset > lastEnd) {
                    tokens[dest++] = tokenEndOffset;
                    tokens[dest++] = tokens[(tokenIndex << 1) + 1];
                    lastEnd = tokenEndOffset;
                }
            }
            if (dest === tokens.length) {
                // nothing to trim
                return lineTokens;
            }
            const tmp = new Uint32Array(dest);
            tmp.set(tokens.subarray(0, dest), 0);
            return tmp.buffer;
        }
        static append(lineTokens, _otherTokens) {
            if (_otherTokens === exports.EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            if (lineTokens === exports.EMPTY_LINE_TOKENS) {
                return _otherTokens;
            }
            if (lineTokens === null) {
                return lineTokens;
            }
            if (_otherTokens === null) {
                // cannot determine combined line length...
                return null;
            }
            const myTokens = toUint32Array(lineTokens);
            const otherTokens = toUint32Array(_otherTokens);
            const otherTokensCount = (otherTokens.length >>> 1);
            const result = new Uint32Array(myTokens.length + otherTokens.length);
            result.set(myTokens, 0);
            let dest = myTokens.length;
            const delta = myTokens[myTokens.length - 2];
            for (let i = 0; i < otherTokensCount; i++) {
                result[dest++] = otherTokens[(i << 1)] + delta;
                result[dest++] = otherTokens[(i << 1) + 1];
            }
            return result.buffer;
        }
        static insert(lineTokens, chIndex, textLength) {
            if (lineTokens === null || lineTokens === exports.EMPTY_LINE_TOKENS) {
                // nothing to do
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            let fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, chIndex);
            if (fromTokenIndex > 0) {
                const fromTokenStartOffset = tokens[(fromTokenIndex - 1) << 1];
                if (fromTokenStartOffset === chIndex) {
                    fromTokenIndex--;
                }
            }
            for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
                tokens[tokenIndex << 1] += textLength;
            }
            return lineTokens;
        }
    }
    exports.ContiguousTokensEditing = ContiguousTokensEditing;
    function toUint32Array(arr) {
        if (arr instanceof Uint32Array) {
            return arr;
        }
        else {
            return new Uint32Array(arr);
        }
    }
    exports.toUint32Array = toUint32Array;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[24/*vs/editor/common/tokens/contiguousMultilineTokens*/], __M([0/*require*/,1/*exports*/,25/*vs/base/common/arrays*/,12/*vs/base/common/buffer*/,37/*vs/editor/common/core/position*/,7/*vs/editor/common/core/eolCounter*/,23/*vs/editor/common/tokens/contiguousTokensEditing*/,38/*vs/editor/common/core/lineRange*/]), function (require, exports, arrays, buffer_1, position_1, eolCounter_1, contiguousTokensEditing_1, lineRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContiguousMultilineTokens = void 0;
    /**
     * Represents contiguous tokens over a contiguous range of lines.
     */
    class ContiguousMultilineTokens {
        static deserialize(buff, offset, result) {
            const view32 = new Uint32Array(buff.buffer);
            const startLineNumber = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            const count = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            const tokens = [];
            for (let i = 0; i < count; i++) {
                const byteCount = (0, buffer_1.readUInt32BE)(buff, offset);
                offset += 4;
                tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
                offset += byteCount;
            }
            result.push(new ContiguousMultilineTokens(startLineNumber, tokens));
            return offset;
        }
        /**
         * (Inclusive) start line number for these tokens.
         */
        get startLineNumber() {
            return this.a;
        }
        /**
         * (Inclusive) end line number for these tokens.
         */
        get endLineNumber() {
            return this.a + this.b.length - 1;
        }
        constructor(startLineNumber, tokens) {
            this.a = startLineNumber;
            this.b = tokens;
        }
        getLineRange() {
            return new lineRange_1.LineRange(this.a, this.a + this.b.length);
        }
        /**
         * @see {@link b}
         */
        getLineTokens(lineNumber) {
            return this.b[lineNumber - this.a];
        }
        appendLineTokens(lineTokens) {
            this.b.push(lineTokens);
        }
        serializeSize() {
            let result = 0;
            result += 4; // 4 bytes for the start line number
            result += 4; // 4 bytes for the line count
            for (let i = 0; i < this.b.length; i++) {
                const lineTokens = this.b[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                result += 4; // 4 bytes for the byte count
                result += lineTokens.byteLength;
            }
            return result;
        }
        serialize(destination, offset) {
            (0, buffer_1.writeUInt32BE)(destination, this.a, offset);
            offset += 4;
            (0, buffer_1.writeUInt32BE)(destination, this.b.length, offset);
            offset += 4;
            for (let i = 0; i < this.b.length; i++) {
                const lineTokens = this.b[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                (0, buffer_1.writeUInt32BE)(destination, lineTokens.byteLength, offset);
                offset += 4;
                destination.set(new Uint8Array(lineTokens.buffer), offset);
                offset += lineTokens.byteLength;
            }
            return offset;
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength] = (0, eolCounter_1.countEOL)(text);
            this.c(range);
            this.d(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        c(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this.a;
            const lastLineIndex = range.endLineNumber - this.a;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this.a -= deletedLinesCount;
                return;
            }
            if (firstLineIndex >= this.b.length) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= this.b.length) {
                // this deletion completely encompasses this block
                this.a = 0;
                this.b = [];
                return;
            }
            if (firstLineIndex === lastLineIndex) {
                // a delete on a single line
                this.b[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.delete(this.b[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            if (firstLineIndex >= 0) {
                // The first line survives
                this.b[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.deleteEnding(this.b[firstLineIndex], range.startColumn - 1);
                if (lastLineIndex < this.b.length) {
                    // The last line survives
                    const lastLineTokens = contiguousTokensEditing_1.ContiguousTokensEditing.deleteBeginning(this.b[lastLineIndex], range.endColumn - 1);
                    // Take remaining text on last line and append it to remaining text on first line
                    this.b[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.append(this.b[firstLineIndex], lastLineTokens);
                    // Delete middle lines
                    this.b.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
                }
                else {
                    // The last line does not survive
                    // Take remaining text on last line and append it to remaining text on first line
                    this.b[firstLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.append(this.b[firstLineIndex], null);
                    // Delete lines
                    this.b = this.b.slice(0, firstLineIndex + 1);
                }
            }
            else {
                // The first line does not survive
                const deletedBefore = -firstLineIndex;
                this.a -= deletedBefore;
                // Remove beginning from last line
                this.b[lastLineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.deleteBeginning(this.b[lastLineIndex], range.endColumn - 1);
                // Delete lines
                this.b = this.b.slice(lastLineIndex);
            }
        }
        d(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this.a;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this.a += eolCount;
                return;
            }
            if (lineIndex >= this.b.length) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this.b[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.insert(this.b[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this.b[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.deleteEnding(this.b[lineIndex], position.column - 1);
            this.b[lineIndex] = contiguousTokensEditing_1.ContiguousTokensEditing.insert(this.b[lineIndex], position.column - 1, firstLineLength);
            this.e(position.lineNumber, eolCount);
        }
        e(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            const lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this.b = arrays.arrayInsert(this.b, insertIndex, lineTokens);
        }
    }
    exports.ContiguousMultilineTokens = ContiguousMultilineTokens;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[14/*vs/editor/common/tokens/contiguousMultilineTokensBuilder*/], __M([0/*require*/,1/*exports*/,12/*vs/base/common/buffer*/,24/*vs/editor/common/tokens/contiguousMultilineTokens*/]), function (require, exports, buffer_1, contiguousMultilineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContiguousMultilineTokensBuilder = void 0;
    class ContiguousMultilineTokensBuilder {
        static deserialize(buff) {
            let offset = 0;
            const count = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            const result = [];
            for (let i = 0; i < count; i++) {
                offset = contiguousMultilineTokens_1.ContiguousMultilineTokens.deserialize(buff, offset, result);
            }
            return result;
        }
        constructor() {
            this.a = [];
        }
        add(lineNumber, lineTokens) {
            if (this.a.length > 0) {
                const last = this.a[this.a.length - 1];
                if (last.endLineNumber + 1 === lineNumber) {
                    // append
                    last.appendLineTokens(lineTokens);
                    return;
                }
            }
            this.a.push(new contiguousMultilineTokens_1.ContiguousMultilineTokens(lineNumber, [lineTokens]));
        }
        finalize() {
            return this.a;
        }
        serialize() {
            const size = this.b();
            const result = new Uint8Array(size);
            this.c(result);
            return result;
        }
        b() {
            let result = 0;
            result += 4; // 4 bytes for the count
            for (let i = 0; i < this.a.length; i++) {
                result += this.a[i].serializeSize();
            }
            return result;
        }
        c(destination) {
            let offset = 0;
            (0, buffer_1.writeUInt32BE)(destination, this.a.length, offset);
            offset += 4;
            for (let i = 0; i < this.a.length; i++) {
                offset = this.a[i].serialize(destination, offset);
            }
        }
    }
    exports.ContiguousMultilineTokensBuilder = ContiguousMultilineTokensBuilder;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[26/*vs/base/common/extpath*/], __M([0/*require*/,1/*exports*/,27/*vs/base/common/path*/,4/*vs/base/common/platform*/,28/*vs/base/common/strings*/,39/*vs/base/common/types*/]), function (require, exports, path_1, platform_1, strings_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.randomPath = exports.parseLineAndColumnAware = exports.indexOfPath = exports.getDriveLetter = exports.hasDriveLetter = exports.isRootOrDriveLetter = exports.sanitizeFilePath = exports.isWindowsDriveLetter = exports.isEqualOrParent = exports.isEqual = exports.isValidBasename = exports.isUNC = exports.getRoot = exports.toPosixPath = exports.toSlashes = exports.isPathSeparator = void 0;
    function isPathSeparator(code) {
        return code === 47 /* CharCode.Slash */ || code === 92 /* CharCode.Backslash */;
    }
    exports.isPathSeparator = isPathSeparator;
    /**
     * Takes a Windows OS path and changes backward slashes to forward slashes.
     * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
     * Using it on a Linux or MaxOS path might change it.
     */
    function toSlashes(osPath) {
        return osPath.replace(/[\\/]/g, path_1.posix.sep);
    }
    exports.toSlashes = toSlashes;
    /**
     * Takes a Windows OS path (using backward or forward slashes) and turns it into a posix path:
     * - turns backward slashes into forward slashes
     * - makes it absolute if it starts with a drive letter
     * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
     * Using it on a Linux or MaxOS path might change it.
     */
    function toPosixPath(osPath) {
        if (osPath.indexOf('/') === -1) {
            osPath = toSlashes(osPath);
        }
        if (/^[a-zA-Z]:(\/|$)/.test(osPath)) { // starts with a drive letter
            osPath = '/' + osPath;
        }
        return osPath;
    }
    exports.toPosixPath = toPosixPath;
    /**
     * Computes the _root_ this path, like `getRoot('c:\files') === c:\`,
     * `getRoot('files:///files/path') === files:///`,
     * or `getRoot('\\server\shares\path') === \\server\shares\`
     */
    function getRoot(path, sep = path_1.posix.sep) {
        if (!path) {
            return '';
        }
        const len = path.length;
        const firstLetter = path.charCodeAt(0);
        if (isPathSeparator(firstLetter)) {
            if (isPathSeparator(path.charCodeAt(1))) {
                // UNC candidate \\localhost\shares\ddd
                //               ^^^^^^^^^^^^^^^^^^^
                if (!isPathSeparator(path.charCodeAt(2))) {
                    let pos = 3;
                    const start = pos;
                    for (; pos < len; pos++) {
                        if (isPathSeparator(path.charCodeAt(pos))) {
                            break;
                        }
                    }
                    if (start !== pos && !isPathSeparator(path.charCodeAt(pos + 1))) {
                        pos += 1;
                        for (; pos < len; pos++) {
                            if (isPathSeparator(path.charCodeAt(pos))) {
                                return path.slice(0, pos + 1) // consume this separator
                                    .replace(/[\\/]/g, sep);
                            }
                        }
                    }
                }
            }
            // /user/far
            // ^
            return sep;
        }
        else if (isWindowsDriveLetter(firstLetter)) {
            // check for windows drive letter c:\ or c:
            if (path.charCodeAt(1) === 58 /* CharCode.Colon */) {
                if (isPathSeparator(path.charCodeAt(2))) {
                    // C:\fff
                    // ^^^
                    return path.slice(0, 2) + sep;
                }
                else {
                    // C:
                    // ^^
                    return path.slice(0, 2);
                }
            }
        }
        // check for URI
        // scheme://authority/path
        // ^^^^^^^^^^^^^^^^^^^
        let pos = path.indexOf('://');
        if (pos !== -1) {
            pos += 3; // 3 -> "://".length
            for (; pos < len; pos++) {
                if (isPathSeparator(path.charCodeAt(pos))) {
                    return path.slice(0, pos + 1); // consume this separator
                }
            }
        }
        return '';
    }
    exports.getRoot = getRoot;
    /**
     * Check if the path follows this pattern: `\\hostname\sharename`.
     *
     * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
     * @return A boolean indication if the path is a UNC path, on none-windows
     * always false.
     */
    function isUNC(path) {
        if (!platform_1.isWindows) {
            // UNC is a windows concept
            return false;
        }
        if (!path || path.length < 5) {
            // at least \\a\b
            return false;
        }
        let code = path.charCodeAt(0);
        if (code !== 92 /* CharCode.Backslash */) {
            return false;
        }
        code = path.charCodeAt(1);
        if (code !== 92 /* CharCode.Backslash */) {
            return false;
        }
        let pos = 2;
        const start = pos;
        for (; pos < path.length; pos++) {
            code = path.charCodeAt(pos);
            if (code === 92 /* CharCode.Backslash */) {
                break;
            }
        }
        if (start === pos) {
            return false;
        }
        code = path.charCodeAt(pos + 1);
        if (isNaN(code) || code === 92 /* CharCode.Backslash */) {
            return false;
        }
        return true;
    }
    exports.isUNC = isUNC;
    // Reference: https://en.wikipedia.org/wiki/Filename
    const WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;
    const UNIX_INVALID_FILE_CHARS = /[\\/]/g;
    const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;
    function isValidBasename(name, isWindowsOS = platform_1.isWindows) {
        const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return false; // require a name that is not just whitespace
        }
        invalidFileChars.lastIndex = 0; // the holy grail of software development
        if (invalidFileChars.test(name)) {
            return false; // check for certain invalid file characters
        }
        if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
            return false; // check for certain invalid file names
        }
        if (name === '.' || name === '..') {
            return false; // check for reserved values
        }
        if (isWindowsOS && name[name.length - 1] === '.') {
            return false; // Windows: file cannot end with a "."
        }
        if (isWindowsOS && name.length !== name.trim().length) {
            return false; // Windows: file cannot end with a whitespace
        }
        if (name.length > 255) {
            return false; // most file systems do not allow files > 255 length
        }
        return true;
    }
    exports.isValidBasename = isValidBasename;
    /**
     * @deprecated please use `IUriIdentityService.extUri.isEqual` instead. If you are
     * in a context without services, consider to pass down the `extUri` from the outside
     * or use `extUriBiasedIgnorePathCase` if you know what you are doing.
     */
    function isEqual(pathA, pathB, ignoreCase) {
        const identityEquals = (pathA === pathB);
        if (!ignoreCase || identityEquals) {
            return identityEquals;
        }
        if (!pathA || !pathB) {
            return false;
        }
        return (0, strings_1.equalsIgnoreCase)(pathA, pathB);
    }
    exports.isEqual = isEqual;
    /**
     * @deprecated please use `IUriIdentityService.extUri.isEqualOrParent` instead. If
     * you are in a context without services, consider to pass down the `extUri` from the
     * outside, or use `extUriBiasedIgnorePathCase` if you know what you are doing.
     */
    function isEqualOrParent(base, parentCandidate, ignoreCase, separator = path_1.sep) {
        if (base === parentCandidate) {
            return true;
        }
        if (!base || !parentCandidate) {
            return false;
        }
        if (parentCandidate.length > base.length) {
            return false;
        }
        if (ignoreCase) {
            const beginsWith = (0, strings_1.startsWithIgnoreCase)(base, parentCandidate);
            if (!beginsWith) {
                return false;
            }
            if (parentCandidate.length === base.length) {
                return true; // same path, different casing
            }
            let sepOffset = parentCandidate.length;
            if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
                sepOffset--; // adjust the expected sep offset in case our candidate already ends in separator character
            }
            return base.charAt(sepOffset) === separator;
        }
        if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
            parentCandidate += separator;
        }
        return base.indexOf(parentCandidate) === 0;
    }
    exports.isEqualOrParent = isEqualOrParent;
    function isWindowsDriveLetter(char0) {
        return char0 >= 65 /* CharCode.A */ && char0 <= 90 /* CharCode.Z */ || char0 >= 97 /* CharCode.a */ && char0 <= 122 /* CharCode.z */;
    }
    exports.isWindowsDriveLetter = isWindowsDriveLetter;
    function sanitizeFilePath(candidate, cwd) {
        // Special case: allow to open a drive letter without trailing backslash
        if (platform_1.isWindows && candidate.endsWith(':')) {
            candidate += path_1.sep;
        }
        // Ensure absolute
        if (!(0, path_1.isAbsolute)(candidate)) {
            candidate = (0, path_1.join)(cwd, candidate);
        }
        // Ensure normalized
        candidate = (0, path_1.normalize)(candidate);
        // Ensure no trailing slash/backslash
        if (platform_1.isWindows) {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open drive root ('C:\')
            if (candidate.endsWith(':')) {
                candidate += path_1.sep;
            }
        }
        else {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open root ('/')
            if (!candidate) {
                candidate = path_1.sep;
            }
        }
        return candidate;
    }
    exports.sanitizeFilePath = sanitizeFilePath;
    function isRootOrDriveLetter(path) {
        const pathNormalized = (0, path_1.normalize)(path);
        if (platform_1.isWindows) {
            if (path.length > 3) {
                return false;
            }
            return hasDriveLetter(pathNormalized) &&
                (path.length === 2 || pathNormalized.charCodeAt(2) === 92 /* CharCode.Backslash */);
        }
        return pathNormalized === path_1.posix.sep;
    }
    exports.isRootOrDriveLetter = isRootOrDriveLetter;
    function hasDriveLetter(path, isWindowsOS = platform_1.isWindows) {
        if (isWindowsOS) {
            return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* CharCode.Colon */;
        }
        return false;
    }
    exports.hasDriveLetter = hasDriveLetter;
    function getDriveLetter(path) {
        return hasDriveLetter(path) ? path[0] : undefined;
    }
    exports.getDriveLetter = getDriveLetter;
    function indexOfPath(path, candidate, ignoreCase) {
        if (candidate.length > path.length) {
            return -1;
        }
        if (path === candidate) {
            return 0;
        }
        if (ignoreCase) {
            path = path.toLowerCase();
            candidate = candidate.toLowerCase();
        }
        return path.indexOf(candidate);
    }
    exports.indexOfPath = indexOfPath;
    function parseLineAndColumnAware(rawPath) {
        const segments = rawPath.split(':'); // C:\file.txt:<line>:<column>
        let path = undefined;
        let line = undefined;
        let column = undefined;
        for (const segment of segments) {
            const segmentAsNumber = Number(segment);
            if (!(0, types_1.isNumber)(segmentAsNumber)) {
                path = !!path ? [path, segment].join(':') : segment; // a colon can well be part of a path (e.g. C:\...)
            }
            else if (line === undefined) {
                line = segmentAsNumber;
            }
            else if (column === undefined) {
                column = segmentAsNumber;
            }
        }
        if (!path) {
            throw new Error('Format for `--goto` should be: `FILE:LINE(:COLUMN)`');
        }
        return {
            path,
            line: line !== undefined ? line : undefined,
            column: column !== undefined ? column : line !== undefined ? 1 : undefined // if we have a line, make sure column is also set
        };
    }
    exports.parseLineAndColumnAware = parseLineAndColumnAware;
    const pathChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const windowsSafePathFirstChars = 'BDEFGHIJKMOQRSTUVWXYZbdefghijkmoqrstuvwxyz0123456789';
    function randomPath(parent, prefix, randomLength = 8) {
        let suffix = '';
        for (let i = 0; i < randomLength; i++) {
            let pathCharsTouse;
            if (i === 0 && platform_1.isWindows && !prefix && (randomLength === 3 || randomLength === 4)) {
                // Windows has certain reserved file names that cannot be used, such
                // as AUX, CON, PRN, etc. We want to avoid generating a random name
                // that matches that pattern, so we use a different set of characters
                // for the first character of the name that does not include any of
                // the reserved names first characters.
                pathCharsTouse = windowsSafePathFirstChars;
            }
            else {
                pathCharsTouse = pathChars;
            }
            suffix += pathCharsTouse.charAt(Math.floor(Math.random() * pathCharsTouse.length));
        }
        let randomFileName;
        if (prefix) {
            randomFileName = `${prefix}-${suffix}`;
        }
        else {
            randomFileName = suffix;
        }
        if (parent) {
            return (0, path_1.join)(parent, randomFileName);
        }
        return randomFileName;
    }
    exports.randomPath = randomPath;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[29/*vs/base/common/network*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/errors*/,4/*vs/base/common/platform*/,15/*vs/base/common/uri*/]), function (require, exports, errors, platform, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.COI = exports.FileAccess = exports.nodeModulesAsarUnpackedPath = exports.nodeModulesAsarPath = exports.nodeModulesPath = exports.builtinExtensionsPath = exports.RemoteAuthorities = exports.connectionTokenQueryName = exports.connectionTokenCookieName = exports.Schemas = void 0;
    var Schemas;
    (function (Schemas) {
        /**
         * A schema that is used for models that exist in memory
         * only and that have no correspondence on a server or such.
         */
        Schemas.inMemory = 'inmemory';
        /**
         * A schema that is used for setting files
         */
        Schemas.vscode = 'vscode';
        /**
         * A schema that is used for internal private files
         */
        Schemas.internal = 'private';
        /**
         * A walk-through document.
         */
        Schemas.walkThrough = 'walkThrough';
        /**
         * An embedded code snippet.
         */
        Schemas.walkThroughSnippet = 'walkThroughSnippet';
        Schemas.http = 'http';
        Schemas.https = 'https';
        Schemas.file = 'file';
        Schemas.mailto = 'mailto';
        Schemas.untitled = 'untitled';
        Schemas.data = 'data';
        Schemas.command = 'command';
        Schemas.vscodeRemote = 'vscode-remote';
        Schemas.vscodeRemoteResource = 'vscode-remote-resource';
        Schemas.vscodeUserData = 'vscode-userdata';
        Schemas.vscodeCustomEditor = 'vscode-custom-editor';
        Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
        Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
        Schemas.vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
        Schemas.vscodeInteractive = 'vscode-interactive';
        Schemas.vscodeInteractiveInput = 'vscode-interactive-input';
        Schemas.vscodeSettings = 'vscode-settings';
        Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
        Schemas.vscodeTerminal = 'vscode-terminal';
        /**
         * Scheme used internally for webviews that aren't linked to a resource (i.e. not custom editors)
         */
        Schemas.webviewPanel = 'webview-panel';
        /**
         * Scheme used for loading the wrapper html and script in webviews.
         */
        Schemas.vscodeWebview = 'vscode-webview';
        /**
         * Scheme used for extension pages
         */
        Schemas.extension = 'extension';
        /**
         * Scheme used as a replacement of `file` scheme to load
         * files with our custom protocol handler (desktop only).
         */
        Schemas.vscodeFileResource = 'vscode-file';
        /**
         * Scheme used for temporary resources
         */
        Schemas.tmp = 'tmp';
        /**
         * Scheme used vs live share
         */
        Schemas.vsls = 'vsls';
        /**
         * Scheme used for the Source Control commit input's text document
         */
        Schemas.vscodeSourceControl = 'vscode-scm';
    })(Schemas = exports.Schemas || (exports.Schemas = {}));
    exports.connectionTokenCookieName = 'vscode-tkn';
    exports.connectionTokenQueryName = 'tkn';
    class RemoteAuthoritiesImpl {
        constructor() {
            this.a = Object.create(null);
            this.b = Object.create(null);
            this.c = Object.create(null);
            this.d = 'http';
            this.e = null;
            this.f = `/${Schemas.vscodeRemoteResource}`;
        }
        setPreferredWebSchema(schema) {
            this.d = schema;
        }
        setDelegate(delegate) {
            this.e = delegate;
        }
        setServerRootPath(serverRootPath) {
            this.f = `${serverRootPath}/${Schemas.vscodeRemoteResource}`;
        }
        set(authority, host, port) {
            this.a[authority] = host;
            this.b[authority] = port;
        }
        setConnectionToken(authority, connectionToken) {
            this.c[authority] = connectionToken;
        }
        getPreferredWebSchema() {
            return this.d;
        }
        rewrite(uri) {
            if (this.e) {
                try {
                    return this.e(uri);
                }
                catch (err) {
                    errors.onUnexpectedError(err);
                    return uri;
                }
            }
            const authority = uri.authority;
            let host = this.a[authority];
            if (host && host.indexOf(':') !== -1 && host.indexOf('[') === -1) {
                host = `[${host}]`;
            }
            const port = this.b[authority];
            const connectionToken = this.c[authority];
            let query = `path=${encodeURIComponent(uri.path)}`;
            if (typeof connectionToken === 'string') {
                query += `&${exports.connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
            }
            return uri_1.URI.from({
                scheme: platform.isWeb ? this.d : Schemas.vscodeRemoteResource,
                authority: `${host}:${port}`,
                path: this.f,
                query
            });
        }
    }
    exports.RemoteAuthorities = new RemoteAuthoritiesImpl();
    exports.builtinExtensionsPath = 'vs/../../extensions';
    exports.nodeModulesPath = 'vs/../../node_modules';
    exports.nodeModulesAsarPath = 'vs/../../node_modules.asar';
    exports.nodeModulesAsarUnpackedPath = 'vs/../../node_modules.asar.unpacked';
    class FileAccessImpl {
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        asBrowserUri(resourcePath) {
            const uri = this.b(resourcePath, require);
            return this.uriToBrowserUri(uri);
        }
        /**
         * Returns a URI to use in contexts where the browser is responsible
         * for loading (e.g. fetch()) or when used within the DOM.
         *
         * **Note:** use `dom.ts#asCSSUrl` whenever the URL is to be used in CSS context.
         */
        uriToBrowserUri(uri) {
            // Handle remote URIs via `RemoteAuthorities`
            if (uri.scheme === Schemas.vscodeRemote) {
                return exports.RemoteAuthorities.rewrite(uri);
            }
            // Convert to `vscode-file` resource..
            if (
            // ...only ever for `file` resources
            uri.scheme === Schemas.file &&
                (
                // ...and we run in native environments
                platform.isNative ||
                    // ...or web worker extensions on desktop
                    (platform.isWebWorker && platform.globals.origin === `${Schemas.vscodeFileResource}://${FileAccessImpl.a}`))) {
                return uri.with({
                    scheme: Schemas.vscodeFileResource,
                    // We need to provide an authority here so that it can serve
                    // as origin for network and loading matters in chromium.
                    // If the URI is not coming with an authority already, we
                    // add our own
                    authority: uri.authority || FileAccessImpl.a,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        asFileUri(resourcePath) {
            const uri = this.b(resourcePath, require);
            return this.uriToFileUri(uri);
        }
        /**
         * Returns the `file` URI to use in contexts where node.js
         * is responsible for loading.
         */
        uriToFileUri(uri) {
            // Only convert the URI if it is `vscode-file:` scheme
            if (uri.scheme === Schemas.vscodeFileResource) {
                return uri.with({
                    scheme: Schemas.file,
                    // Only preserve the `authority` if it is different from
                    // our fallback authority. This ensures we properly preserve
                    // Windows UNC paths that come with their own authority.
                    authority: uri.authority !== FileAccessImpl.a ? uri.authority : null,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        b(uriOrModule, moduleIdToUrl) {
            if (uri_1.URI.isUri(uriOrModule)) {
                return uriOrModule;
            }
            return uri_1.URI.parse(moduleIdToUrl.toUrl(uriOrModule));
        }
    }
    FileAccessImpl.a = 'vscode-app';
    exports.FileAccess = new FileAccessImpl();
    var COI;
    (function (COI) {
        const coiHeaders = new Map([
            ['1', { 'Cross-Origin-Opener-Policy': 'same-origin' }],
            ['2', { 'Cross-Origin-Embedder-Policy': 'require-corp' }],
            ['3', { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' }],
        ]);
        COI.CoopAndCoep = Object.freeze(coiHeaders.get('3'));
        const coiSearchParamName = 'vscode-coi';
        /**
         * Extract desired headers from `vscode-coi` invocation
         */
        function getHeadersFromQuery(url) {
            let params;
            if (typeof url === 'string') {
                params = new URL(url).searchParams;
            }
            else if (url instanceof URL) {
                params = url.searchParams;
            }
            else if (uri_1.URI.isUri(url)) {
                params = new URL(url.toString(true)).searchParams;
            }
            const value = params?.get(coiSearchParamName);
            if (!value) {
                return undefined;
            }
            return coiHeaders.get(value);
        }
        COI.getHeadersFromQuery = getHeadersFromQuery;
        /**
         * Add the `vscode-coi` query attribute based on wanting `COOP` and `COEP`. Will be a noop when `crossOriginIsolated`
         * isn't enabled the current context
         */
        function addSearchParam(urlOrSearch, coop, coep) {
            if (!globalThis.crossOriginIsolated) {
                // depends on the current context being COI
                return;
            }
            const value = coop && coep ? '3' : coep ? '2' : '1';
            if (urlOrSearch instanceof URLSearchParams) {
                urlOrSearch.set(coiSearchParamName, value);
            }
            else {
                urlOrSearch[coiSearchParamName] = value;
            }
        }
        COI.addSearchParam = addSearchParam;
    })(COI = exports.COI || (exports.COI = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[16/*vs/base/common/resources*/], __M([0/*require*/,1/*exports*/,26/*vs/base/common/extpath*/,29/*vs/base/common/network*/,27/*vs/base/common/path*/,4/*vs/base/common/platform*/,28/*vs/base/common/strings*/,15/*vs/base/common/uri*/]), function (require, exports, extpath, network_1, paths, platform_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalResource = exports.DataUri = exports.distinctParents = exports.addTrailingPathSeparator = exports.removeTrailingPathSeparator = exports.hasTrailingPathSeparator = exports.isEqualAuthority = exports.isAbsolutePath = exports.resolvePath = exports.relativePath = exports.normalizePath = exports.joinPath = exports.dirname = exports.extname = exports.basename = exports.basenameOrAuthority = exports.getComparisonKey = exports.isEqualOrParent = exports.isEqual = exports.extUriIgnorePathCase = exports.extUriBiasedIgnorePathCase = exports.extUri = exports.ExtUri = exports.originalFSPath = void 0;
    function originalFSPath(uri) {
        return (0, uri_1.uriToFsPath)(uri, true);
    }
    exports.originalFSPath = originalFSPath;
    class ExtUri {
        constructor(a) {
            this.a = a;
        }
        compare(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return 0;
            }
            return (0, strings_1.compare)(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
        }
        isEqual(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return true;
            }
            if (!uri1 || !uri2) {
                return false;
            }
            return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
        }
        getComparisonKey(uri, ignoreFragment = false) {
            return uri.with({
                path: this.a(uri) ? uri.path.toLowerCase() : undefined,
                fragment: ignoreFragment ? null : undefined
            }).toString();
        }
        ignorePathCasing(uri) {
            return this.a(uri);
        }
        isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
            if (base.scheme === parentCandidate.scheme) {
                if (base.scheme === network_1.Schemas.file) {
                    return extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this.a(base)) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
                if ((0, exports.isEqualAuthority)(base.authority, parentCandidate.authority)) {
                    return extpath.isEqualOrParent(base.path, parentCandidate.path, this.a(base), '/') && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
            }
            return false;
        }
        // --- path math
        joinPath(resource, ...pathFragment) {
            return uri_1.URI.joinPath(resource, ...pathFragment);
        }
        basenameOrAuthority(resource) {
            return (0, exports.basename)(resource) || resource.authority;
        }
        basename(resource) {
            return paths.posix.basename(resource.path);
        }
        extname(resource) {
            return paths.posix.extname(resource.path);
        }
        dirname(resource) {
            if (resource.path.length === 0) {
                return resource;
            }
            let dirname;
            if (resource.scheme === network_1.Schemas.file) {
                dirname = uri_1.URI.file(paths.dirname(originalFSPath(resource))).path;
            }
            else {
                dirname = paths.posix.dirname(resource.path);
                if (resource.authority && dirname.length && dirname.charCodeAt(0) !== 47 /* CharCode.Slash */) {
                    console.error(`dirname("${resource.toString})) resulted in a relative path`);
                    dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
                }
            }
            return resource.with({
                path: dirname
            });
        }
        normalizePath(resource) {
            if (!resource.path.length) {
                return resource;
            }
            let normalizedPath;
            if (resource.scheme === network_1.Schemas.file) {
                normalizedPath = uri_1.URI.file(paths.normalize(originalFSPath(resource))).path;
            }
            else {
                normalizedPath = paths.posix.normalize(resource.path);
            }
            return resource.with({
                path: normalizedPath
            });
        }
        relativePath(from, to) {
            if (from.scheme !== to.scheme || !(0, exports.isEqualAuthority)(from.authority, to.authority)) {
                return undefined;
            }
            if (from.scheme === network_1.Schemas.file) {
                const relativePath = paths.relative(originalFSPath(from), originalFSPath(to));
                return platform_1.isWindows ? extpath.toSlashes(relativePath) : relativePath;
            }
            let fromPath = from.path || '/';
            const toPath = to.path || '/';
            if (this.a(from)) {
                // make casing of fromPath match toPath
                let i = 0;
                for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
                    if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
                        if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
                            break;
                        }
                    }
                }
                fromPath = toPath.substr(0, i) + fromPath.substr(i);
            }
            return paths.posix.relative(fromPath, toPath);
        }
        resolvePath(base, path) {
            if (base.scheme === network_1.Schemas.file) {
                const newURI = uri_1.URI.file(paths.resolve(originalFSPath(base), path));
                return base.with({
                    authority: newURI.authority,
                    path: newURI.path
                });
            }
            path = extpath.toPosixPath(path); // we allow path to be a windows path
            return base.with({
                path: paths.posix.resolve(base.path, path)
            });
        }
        // --- misc
        isAbsolutePath(resource) {
            return !!resource.path && resource.path[0] === '/';
        }
        isEqualAuthority(a1, a2) {
            return a1 === a2 || (a1 !== undefined && a2 !== undefined && (0, strings_1.equalsIgnoreCase)(a1, a2));
        }
        hasTrailingPathSeparator(resource, sep = paths.sep) {
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
            }
            else {
                const p = resource.path;
                return (p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */) && !(/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath)); // ignore the slash at offset 0
            }
        }
        removeTrailingPathSeparator(resource, sep = paths.sep) {
            // Make sure that the path isn't a drive letter. A trailing separator there is not removable.
            if ((0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path.substr(0, resource.path.length - 1) });
            }
            return resource;
        }
        addTrailingPathSeparator(resource, sep = paths.sep) {
            let isRootSep = false;
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                isRootSep = ((fsp !== undefined) && (fsp.length === extpath.getRoot(fsp).length) && (fsp[fsp.length - 1] === sep));
            }
            else {
                sep = '/';
                const p = resource.path;
                isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === 47 /* CharCode.Slash */;
            }
            if (!isRootSep && !(0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path + '/' });
            }
            return resource;
        }
    }
    exports.ExtUri = ExtUri;
    /**
     * Unbiased utility that takes uris "as they are". This means it can be interchanged with
     * uri#toString() usages. The following is true
     * ```
     * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
     * ```
     */
    exports.extUri = new ExtUri(() => false);
    /**
     * BIASED utility that _mostly_ ignored the case of urs paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriBiasedIgnorePathCase = new ExtUri(uri => {
        // A file scheme resource is in the same platform as code, so ignore case for non linux platforms
        // Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
        return uri.scheme === network_1.Schemas.file ? !platform_1.isLinux : true;
    });
    /**
     * BIASED utility that always ignores the casing of uris paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriIgnorePathCase = new ExtUri(_ => true);
    exports.isEqual = exports.extUri.isEqual.bind(exports.extUri);
    exports.isEqualOrParent = exports.extUri.isEqualOrParent.bind(exports.extUri);
    exports.getComparisonKey = exports.extUri.getComparisonKey.bind(exports.extUri);
    exports.basenameOrAuthority = exports.extUri.basenameOrAuthority.bind(exports.extUri);
    exports.basename = exports.extUri.basename.bind(exports.extUri);
    exports.extname = exports.extUri.extname.bind(exports.extUri);
    exports.dirname = exports.extUri.dirname.bind(exports.extUri);
    exports.joinPath = exports.extUri.joinPath.bind(exports.extUri);
    exports.normalizePath = exports.extUri.normalizePath.bind(exports.extUri);
    exports.relativePath = exports.extUri.relativePath.bind(exports.extUri);
    exports.resolvePath = exports.extUri.resolvePath.bind(exports.extUri);
    exports.isAbsolutePath = exports.extUri.isAbsolutePath.bind(exports.extUri);
    exports.isEqualAuthority = exports.extUri.isEqualAuthority.bind(exports.extUri);
    exports.hasTrailingPathSeparator = exports.extUri.hasTrailingPathSeparator.bind(exports.extUri);
    exports.removeTrailingPathSeparator = exports.extUri.removeTrailingPathSeparator.bind(exports.extUri);
    exports.addTrailingPathSeparator = exports.extUri.addTrailingPathSeparator.bind(exports.extUri);
    //#endregion
    function distinctParents(items, resourceAccessor) {
        const distinctParents = [];
        for (let i = 0; i < items.length; i++) {
            const candidateResource = resourceAccessor(items[i]);
            if (items.some((otherItem, index) => {
                if (index === i) {
                    return false;
                }
                return (0, exports.isEqualOrParent)(candidateResource, resourceAccessor(otherItem));
            })) {
                continue;
            }
            distinctParents.push(items[i]);
        }
        return distinctParents;
    }
    exports.distinctParents = distinctParents;
    /**
     * Data URI related helpers.
     */
    var DataUri;
    (function (DataUri) {
        DataUri.META_DATA_LABEL = 'label';
        DataUri.META_DATA_DESCRIPTION = 'description';
        DataUri.META_DATA_SIZE = 'size';
        DataUri.META_DATA_MIME = 'mime';
        function parseMetaData(dataUri) {
            const metadata = new Map();
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
            const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
            meta.split(';').forEach(property => {
                const [key, value] = property.split(':');
                if (key && value) {
                    metadata.set(key, value);
                }
            });
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the mime is: image/png
            const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
            if (mime) {
                metadata.set(DataUri.META_DATA_MIME, mime);
            }
            return metadata;
        }
        DataUri.parseMetaData = parseMetaData;
    })(DataUri = exports.DataUri || (exports.DataUri = {}));
    function toLocalResource(resource, authority, localScheme) {
        if (authority) {
            let path = resource.path;
            if (path && path[0] !== paths.posix.sep) {
                path = paths.posix.sep + path;
            }
            return resource.with({ scheme: localScheme, authority, path });
        }
        return resource.with({ scheme: localScheme });
    }
    exports.toLocalResource = toLocalResource;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[17/*vs/base/common/async*/], __M([0/*require*/,1/*exports*/,40/*vs/base/common/cancellation*/,6/*vs/base/common/errors*/,30/*vs/base/common/event*/,2/*vs/base/common/lifecycle*/,16/*vs/base/common/resources*/,4/*vs/base/common/platform*/,22/*vs/base/common/symbols*/]), function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, resources_1, platform_1, symbols_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createCancelableAsyncIterable = exports.CancelableAsyncIterableObject = exports.AsyncIterableObject = exports.Promises = exports.DeferredPromise = exports.IntervalCounter = exports.TaskSequentializer = exports.retry = exports.IdleValue = exports.runWhenIdle = exports.ThrottledWorker = exports.RunOnceWorker = exports.ProcessTimeRunOnceScheduler = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.Queue = exports.Limiter = exports.firstParallel = exports.first = exports.sequence = exports.disposableTimeout = exports.timeout = exports.AutoOpenBarrier = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.SequencerByKey = exports.Sequencer = exports.Throttler = exports.asPromise = exports.raceTimeout = exports.raceCancellablePromises = exports.raceCancellationError = exports.raceCancellation = exports.createCancelablePromise = exports.isThenable = void 0;
    function isThenable(obj) {
        return !!obj && typeof obj.then === 'function';
    }
    exports.isThenable = isThenable;
    function createCancelablePromise(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const thenable = callback(source.token);
        const promise = new Promise((resolve, reject) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                source.dispose();
                reject(new errors_1.CancellationError());
            });
            Promise.resolve(thenable).then(value => {
                subscription.dispose();
                source.dispose();
                resolve(value);
            }, err => {
                subscription.dispose();
                source.dispose();
                reject(err);
            });
        });
        return new class {
            cancel() {
                source.cancel();
            }
            then(resolve, reject) {
                return promise.then(resolve, reject);
            }
            catch(reject) {
                return this.then(undefined, reject);
            }
            finally(onfinally) {
                return promise.finally(onfinally);
            }
        };
    }
    exports.createCancelablePromise = createCancelablePromise;
    function raceCancellation(promise, token, defaultValue) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                resolve(defaultValue);
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellation = raceCancellation;
    /**
     * Returns a promise that rejects with an {@CancellationError} as soon as the passed token is cancelled.
     * @see {@link raceCancellation}
     */
    function raceCancellationError(promise, token) {
        return new Promise((resolve, reject) => {
            const ref = token.onCancellationRequested(() => {
                ref.dispose();
                reject(new errors_1.CancellationError());
            });
            promise.then(resolve, reject).finally(() => ref.dispose());
        });
    }
    exports.raceCancellationError = raceCancellationError;
    /**
     * Returns as soon as one of the promises is resolved and cancels remaining promises
     */
    async function raceCancellablePromises(cancellablePromises) {
        let resolvedPromiseIndex = -1;
        const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
        const result = await Promise.race(promises);
        cancellablePromises.forEach((cancellablePromise, index) => {
            if (index !== resolvedPromiseIndex) {
                cancellablePromise.cancel();
            }
        });
        return result;
    }
    exports.raceCancellablePromises = raceCancellablePromises;
    function raceTimeout(promise, timeout, onTimeout) {
        let promiseResolve = undefined;
        const timer = setTimeout(() => {
            promiseResolve?.(undefined);
            onTimeout?.();
        }, timeout);
        return Promise.race([
            promise.finally(() => clearTimeout(timer)),
            new Promise(resolve => promiseResolve = resolve)
        ]);
    }
    exports.raceTimeout = raceTimeout;
    function asPromise(callback) {
        return new Promise((resolve, reject) => {
            const item = callback();
            if (isThenable(item)) {
                item.then(resolve, reject);
            }
            else {
                resolve(item);
            }
        });
    }
    exports.asPromise = asPromise;
    /**
     * A helper to prevent accumulation of sequential async tasks.
     *
     * Imagine a mail man with the sole task of delivering letters. As soon as
     * a letter submitted for delivery, he drives to the destination, delivers it
     * and returns to his base. Imagine that during the trip, N more letters were submitted.
     * When the mail man returns, he picks those N letters and delivers them all in a
     * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
     *
     * The throttler implements this via the queue() method, by providing it a task
     * factory. Following the example:
     *
     * 		const throttler = new Throttler();
     * 		const letters = [];
     *
     * 		function deliver() {
     * 			const lettersToDeliver = letters;
     * 			letters = [];
     * 			return makeTheTrip(lettersToDeliver);
     * 		}
     *
     * 		function onLetterReceived(l) {
     * 			letters.push(l);
     * 			throttler.queue(deliver);
     * 		}
     */
    class Throttler {
        constructor() {
            this.a = null;
            this.b = null;
            this.d = null;
        }
        queue(promiseFactory) {
            if (this.a) {
                this.d = promiseFactory;
                if (!this.b) {
                    const onComplete = () => {
                        this.b = null;
                        const result = this.queue(this.d);
                        this.d = null;
                        return result;
                    };
                    this.b = new Promise(resolve => {
                        this.a.then(onComplete, onComplete).then(resolve);
                    });
                }
                return new Promise((resolve, reject) => {
                    this.b.then(resolve, reject);
                });
            }
            this.a = promiseFactory();
            return new Promise((resolve, reject) => {
                this.a.then((result) => {
                    this.a = null;
                    resolve(result);
                }, (err) => {
                    this.a = null;
                    reject(err);
                });
            });
        }
    }
    exports.Throttler = Throttler;
    class Sequencer {
        constructor() {
            this.a = Promise.resolve(null);
        }
        queue(promiseTask) {
            return this.a = this.a.then(() => promiseTask(), () => promiseTask());
        }
    }
    exports.Sequencer = Sequencer;
    class SequencerByKey {
        constructor() {
            this.a = new Map();
        }
        queue(key, promiseTask) {
            const runningPromise = this.a.get(key) ?? Promise.resolve();
            const newPromise = runningPromise
                .catch(() => { })
                .then(promiseTask)
                .finally(() => {
                if (this.a.get(key) === newPromise) {
                    this.a.delete(key);
                }
            });
            this.a.set(key, newPromise);
            return newPromise;
        }
    }
    exports.SequencerByKey = SequencerByKey;
    const timeoutDeferred = (timeout, fn) => {
        let scheduled = true;
        const handle = setTimeout(() => {
            scheduled = false;
            fn();
        }, timeout);
        return {
            isTriggered: () => scheduled,
            dispose: () => {
                clearTimeout(handle);
                scheduled = false;
            },
        };
    };
    const microtaskDeferred = (fn) => {
        let scheduled = true;
        queueMicrotask(() => {
            if (scheduled) {
                scheduled = false;
                fn();
            }
        });
        return {
            isTriggered: () => scheduled,
            dispose: () => { scheduled = false; },
        };
    };
    /**
     * A helper to delay (debounce) execution of a task that is being requested often.
     *
     * Following the throttler, now imagine the mail man wants to optimize the number of
     * trips proactively. The trip itself can be long, so he decides not to make the trip
     * as soon as a letter is submitted. Instead he waits a while, in case more
     * letters are submitted. After said waiting period, if no letters were submitted, he
     * decides to make the trip. Imagine that N more letters were submitted after the first
     * one, all within a short period of time between each other. Even though N+1
     * submissions occurred, only 1 delivery was made.
     *
     * The delayer offers this behavior via the trigger() method, into which both the task
     * to be executed and the waiting period (delay) must be passed in as arguments. Following
     * the example:
     *
     * 		const delayer = new Delayer(WAITING_PERIOD);
     * 		const letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			delayer.trigger(() => { return makeTheTrip(); });
     * 		}
     */
    class Delayer {
        constructor(defaultDelay) {
            this.defaultDelay = defaultDelay;
            this.a = null;
            this.b = null;
            this.d = null;
            this.f = null;
            this.g = null;
        }
        trigger(task, delay = this.defaultDelay) {
            this.g = task;
            this.h();
            if (!this.b) {
                this.b = new Promise((resolve, reject) => {
                    this.d = resolve;
                    this.f = reject;
                }).then(() => {
                    this.b = null;
                    this.d = null;
                    if (this.g) {
                        const task = this.g;
                        this.g = null;
                        return task();
                    }
                    return undefined;
                });
            }
            const fn = () => {
                this.a = null;
                this.d?.(null);
            };
            this.a = delay === symbols_1.MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
            return this.b;
        }
        isTriggered() {
            return !!this.a?.isTriggered();
        }
        cancel() {
            this.h();
            if (this.b) {
                this.f?.(new errors_1.CancellationError());
                this.b = null;
            }
        }
        h() {
            this.a?.dispose();
            this.a = null;
        }
        dispose() {
            this.cancel();
        }
    }
    exports.Delayer = Delayer;
    /**
     * A helper to delay execution of a task that is being requested often, while
     * preventing accumulation of consecutive executions, while the task runs.
     *
     * The mail man is clever and waits for a certain amount of time, before going
     * out to deliver letters. While the mail man is going out, more letters arrive
     * and can only be delivered once he is back. Once he is back the mail man will
     * do one more trip to deliver the letters that have accumulated while he was out.
     */
    class ThrottledDelayer {
        constructor(defaultDelay) {
            this.a = new Delayer(defaultDelay);
            this.b = new Throttler();
        }
        trigger(promiseFactory, delay) {
            return this.a.trigger(() => this.b.queue(promiseFactory), delay);
        }
        isTriggered() {
            return this.a.isTriggered();
        }
        cancel() {
            this.a.cancel();
        }
        dispose() {
            this.a.dispose();
        }
    }
    exports.ThrottledDelayer = ThrottledDelayer;
    /**
     * A barrier that is initially closed and then becomes opened permanently.
     */
    class Barrier {
        constructor() {
            this.a = false;
            this.b = new Promise((c, e) => {
                this.d = c;
            });
        }
        isOpen() {
            return this.a;
        }
        open() {
            this.a = true;
            this.d(true);
        }
        wait() {
            return this.b;
        }
    }
    exports.Barrier = Barrier;
    /**
     * A barrier that is initially closed and then becomes opened permanently after a certain period of
     * time or when open is called explicitly
     */
    class AutoOpenBarrier extends Barrier {
        constructor(autoOpenTimeMs) {
            super();
            this.f = setTimeout(() => this.open(), autoOpenTimeMs);
        }
        open() {
            clearTimeout(this.f);
            super.open();
        }
    }
    exports.AutoOpenBarrier = AutoOpenBarrier;
    function timeout(millis, token) {
        if (!token) {
            return createCancelablePromise(token => timeout(millis, token));
        }
        return new Promise((resolve, reject) => {
            const handle = setTimeout(() => {
                disposable.dispose();
                resolve();
            }, millis);
            const disposable = token.onCancellationRequested(() => {
                clearTimeout(handle);
                disposable.dispose();
                reject(new errors_1.CancellationError());
            });
        });
    }
    exports.timeout = timeout;
    function disposableTimeout(handler, timeout = 0) {
        const timer = setTimeout(handler, timeout);
        return (0, lifecycle_1.toDisposable)(() => clearTimeout(timer));
    }
    exports.disposableTimeout = disposableTimeout;
    /**
     * Runs the provided list of promise factories in sequential order. The returned
     * promise will complete to an array of results from each promise.
     */
    function sequence(promiseFactories) {
        const results = [];
        let index = 0;
        const len = promiseFactories.length;
        function next() {
            return index < len ? promiseFactories[index++]() : null;
        }
        function thenHandler(result) {
            if (result !== undefined && result !== null) {
                results.push(result);
            }
            const n = next();
            if (n) {
                return n.then(thenHandler);
            }
            return Promise.resolve(results);
        }
        return Promise.resolve(null).then(thenHandler);
    }
    exports.sequence = sequence;
    function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
        let index = 0;
        const len = promiseFactories.length;
        const loop = () => {
            if (index >= len) {
                return Promise.resolve(defaultValue);
            }
            const factory = promiseFactories[index++];
            const promise = Promise.resolve(factory());
            return promise.then(result => {
                if (shouldStop(result)) {
                    return Promise.resolve(result);
                }
                return loop();
            });
        };
        return loop();
    }
    exports.first = first;
    function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
        if (promiseList.length === 0) {
            return Promise.resolve(defaultValue);
        }
        let todo = promiseList.length;
        const finish = () => {
            todo = -1;
            for (const promise of promiseList) {
                promise.cancel?.();
            }
        };
        return new Promise((resolve, reject) => {
            for (const promise of promiseList) {
                promise.then(result => {
                    if (--todo >= 0 && shouldStop(result)) {
                        finish();
                        resolve(result);
                    }
                    else if (todo === 0) {
                        resolve(defaultValue);
                    }
                })
                    .catch(err => {
                    if (--todo >= 0) {
                        finish();
                        reject(err);
                    }
                });
            }
        });
    }
    exports.firstParallel = firstParallel;
    /**
     * A helper to queue N promises and run them all with a max degree of parallelism. The helper
     * ensures that at any time no more than M promises are running at the same time.
     */
    class Limiter {
        constructor(maxDegreeOfParalellism) {
            this.a = 0;
            this.d = maxDegreeOfParalellism;
            this.f = [];
            this.b = 0;
            this.g = new event_1.Emitter();
        }
        /**
         * An event that fires when every promise in the queue
         * has started to execute. In other words: no work is
         * pending to be scheduled.
         *
         * This is NOT an event that signals when all promises
         * have finished though.
         */
        get onDrained() {
            return this.g.event;
        }
        get size() {
            return this.a;
        }
        queue(factory) {
            this.a++;
            return new Promise((c, e) => {
                this.f.push({ factory, c, e });
                this.h();
            });
        }
        h() {
            while (this.f.length && this.b < this.d) {
                const iLimitedTask = this.f.shift();
                this.b++;
                const promise = iLimitedTask.factory();
                promise.then(iLimitedTask.c, iLimitedTask.e);
                promise.then(() => this.j(), () => this.j());
            }
        }
        j() {
            this.a--;
            this.b--;
            if (this.f.length > 0) {
                this.h();
            }
            else {
                this.g.fire();
            }
        }
        dispose() {
            this.g.dispose();
        }
    }
    exports.Limiter = Limiter;
    /**
     * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
     */
    class Queue extends Limiter {
        constructor() {
            super(1);
        }
    }
    exports.Queue = Queue;
    /**
     * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
     * by disposing them once the queue is empty.
     */
    class ResourceQueue {
        constructor() {
            this.a = new Map();
            this.b = new Set();
        }
        async whenDrained() {
            if (this.d()) {
                return;
            }
            const promise = new DeferredPromise();
            this.b.add(promise);
            return promise.p;
        }
        d() {
            for (const [, queue] of this.a) {
                if (queue.size > 0) {
                    return false;
                }
            }
            return true;
        }
        queueFor(resource, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            let queue = this.a.get(key);
            if (!queue) {
                queue = new Queue();
                event_1.Event.once(queue.onDrained)(() => {
                    queue?.dispose();
                    this.a.delete(key);
                    this.f();
                });
                this.a.set(key, queue);
            }
            return queue;
        }
        f() {
            if (!this.d()) {
                return; // not done yet
            }
            this.g();
        }
        g() {
            for (const drainer of this.b) {
                drainer.complete();
            }
            this.b.clear();
        }
        dispose() {
            for (const [, queue] of this.a) {
                queue.dispose();
            }
            this.a.clear();
            // Even though we might still have pending
            // tasks queued, after the queues have been
            // disposed, we can no longer track them, so
            // we release drainers to prevent hanging
            // promises when the resource queue is being
            // disposed.
            this.g();
        }
    }
    exports.ResourceQueue = ResourceQueue;
    class TimeoutTimer {
        constructor(runner, timeout) {
            this.a = -1;
            if (typeof runner === 'function' && typeof timeout === 'number') {
                this.setIfNotSet(runner, timeout);
            }
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this.a !== -1) {
                clearTimeout(this.a);
                this.a = -1;
            }
        }
        cancelAndSet(runner, timeout) {
            this.cancel();
            this.a = setTimeout(() => {
                this.a = -1;
                runner();
            }, timeout);
        }
        setIfNotSet(runner, timeout) {
            if (this.a !== -1) {
                // timer is already set
                return;
            }
            this.a = setTimeout(() => {
                this.a = -1;
                runner();
            }, timeout);
        }
    }
    exports.TimeoutTimer = TimeoutTimer;
    class IntervalTimer {
        constructor() {
            this.a = -1;
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this.a !== -1) {
                clearInterval(this.a);
                this.a = -1;
            }
        }
        cancelAndSet(runner, interval) {
            this.cancel();
            this.a = setInterval(() => {
                runner();
            }, interval);
        }
    }
    exports.IntervalTimer = IntervalTimer;
    class RunOnceScheduler {
        constructor(runner, delay) {
            this.b = -1;
            this.a = runner;
            this.d = delay;
            this.f = this.g.bind(this);
        }
        /**
         * Dispose RunOnceScheduler
         */
        dispose() {
            this.cancel();
            this.a = null;
        }
        /**
         * Cancel current scheduled runner (if any).
         */
        cancel() {
            if (this.isScheduled()) {
                clearTimeout(this.b);
                this.b = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.d) {
            this.cancel();
            this.b = setTimeout(this.f, delay);
        }
        get delay() {
            return this.d;
        }
        set delay(value) {
            this.d = value;
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.b !== -1;
        }
        flush() {
            if (this.isScheduled()) {
                this.cancel();
                this.h();
            }
        }
        g() {
            this.b = -1;
            if (this.a) {
                this.h();
            }
        }
        h() {
            this.a?.();
        }
    }
    exports.RunOnceScheduler = RunOnceScheduler;
    /**
     * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
     * > **NOTE**: Only offers 1s resolution.
     *
     * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
     * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
     * this scheduler will execute 3hrs **after waking the computer from sleep**.
     */
    class ProcessTimeRunOnceScheduler {
        constructor(runner, delay) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.a = runner;
            this.b = delay;
            this.d = 0;
            this.f = -1;
            this.g = this.h.bind(this);
        }
        dispose() {
            this.cancel();
            this.a = null;
        }
        cancel() {
            if (this.isScheduled()) {
                clearInterval(this.f);
                this.f = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.b) {
            if (delay % 1000 !== 0) {
                console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
            }
            this.cancel();
            this.d = Math.ceil(delay / 1000);
            this.f = setInterval(this.g, 1000);
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.f !== -1;
        }
        h() {
            this.d--;
            if (this.d > 0) {
                // still need to wait
                return;
            }
            // time elapsed
            clearInterval(this.f);
            this.f = -1;
            this.a?.();
        }
    }
    exports.ProcessTimeRunOnceScheduler = ProcessTimeRunOnceScheduler;
    class RunOnceWorker extends RunOnceScheduler {
        constructor(runner, timeout) {
            super(runner, timeout);
            this.j = [];
        }
        work(unit) {
            this.j.push(unit);
            if (!this.isScheduled()) {
                this.schedule();
            }
        }
        h() {
            const units = this.j;
            this.j = [];
            this.a?.(units);
        }
        dispose() {
            this.j = [];
            super.dispose();
        }
    }
    exports.RunOnceWorker = RunOnceWorker;
    /**
     * The `ThrottledWorker` will accept units of work `T`
     * to handle. The contract is:
     * * there is a maximum of units the worker can handle at once (via `maxWorkChunkSize`)
     * * there is a maximum of units the worker will keep in memory for processing (via `maxBufferedWork`)
     * * after having handled `maxWorkChunkSize` units, the worker needs to rest (via `throttleDelay`)
     */
    class ThrottledWorker extends lifecycle_1.Disposable {
        constructor(g, h) {
            super();
            this.g = g;
            this.h = h;
            this.a = [];
            this.b = this.B(new lifecycle_1.MutableDisposable());
            this.f = false;
        }
        /**
         * The number of work units that are pending to be processed.
         */
        get pending() { return this.a.length; }
        /**
         * Add units to be worked on. Use `pending` to figure out
         * how many units are not yet processed after this method
         * was called.
         *
         * @returns whether the work was accepted or not. If the
         * worker is disposed, it will not accept any more work.
         * If the number of pending units would become larger
         * than `maxPendingWork`, more work will also not be accepted.
         */
        work(units) {
            if (this.f) {
                return false; // work not accepted: disposed
            }
            // Check for reaching maximum of pending work
            if (typeof this.g.maxBufferedWork === 'number') {
                // Throttled: simple check if pending + units exceeds max pending
                if (this.b.value) {
                    if (this.pending + units.length > this.g.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
                // Unthrottled: same as throttled, but account for max chunk getting
                // worked on directly without being pending
                else {
                    if (this.pending + units.length - this.g.maxWorkChunkSize > this.g.maxBufferedWork) {
                        return false; // work not accepted: too much pending work
                    }
                }
            }
            // Add to pending units first
            for (const unit of units) {
                this.a.push(unit);
            }
            // If not throttled, start working directly
            // Otherwise, when the throttle delay has
            // past, pending work will be worked again.
            if (!this.b.value) {
                this.j();
            }
            return true; // work accepted
        }
        j() {
            // Extract chunk to handle and handle it
            this.h(this.a.splice(0, this.g.maxWorkChunkSize));
            // If we have remaining work, schedule it after a delay
            if (this.a.length > 0) {
                this.b.value = new RunOnceScheduler(() => {
                    this.b.clear();
                    this.j();
                }, this.g.throttleDelay);
                this.b.value.schedule();
            }
        }
        dispose() {
            super.dispose();
            this.f = true;
        }
    }
    exports.ThrottledWorker = ThrottledWorker;
    (function () {
        if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
            exports.runWhenIdle = (runner) => {
                (0, platform_1.setTimeout0)(() => {
                    if (disposed) {
                        return;
                    }
                    const end = Date.now() + 15; // one frame at 64fps
                    runner(Object.freeze({
                        didTimeout: true,
                        timeRemaining() {
                            return Math.max(0, end - Date.now());
                        }
                    }));
                });
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                    }
                };
            };
        }
        else {
            exports.runWhenIdle = (runner, timeout) => {
                const handle = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        cancelIdleCallback(handle);
                    }
                };
            };
        }
    })();
    /**
     * An implementation of the "idle-until-urgent"-strategy as introduced
     * here: https://philipwalton.com/articles/idle-until-urgent/
     */
    class IdleValue {
        constructor(executor) {
            this.d = false;
            this.a = () => {
                try {
                    this.f = executor();
                }
                catch (err) {
                    this.g = err;
                }
                finally {
                    this.d = true;
                }
            };
            this.b = (0, exports.runWhenIdle)(() => this.a());
        }
        dispose() {
            this.b.dispose();
        }
        get value() {
            if (!this.d) {
                this.b.dispose();
                this.a();
            }
            if (this.g) {
                throw this.g;
            }
            return this.f;
        }
        get isInitialized() {
            return this.d;
        }
    }
    exports.IdleValue = IdleValue;
    //#endregion
    async function retry(task, delay, retries) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return await task();
            }
            catch (error) {
                lastError = error;
                await timeout(delay);
            }
        }
        throw lastError;
    }
    exports.retry = retry;
    class TaskSequentializer {
        hasPending(taskId) {
            if (!this.a) {
                return false;
            }
            if (typeof taskId === 'number') {
                return this.a.taskId === taskId;
            }
            return !!this.a;
        }
        get pending() {
            return this.a?.promise;
        }
        cancelPending() {
            this.a?.cancel();
        }
        setPending(taskId, promise, onCancel) {
            this.a = { taskId, cancel: () => onCancel?.(), promise };
            promise.then(() => this.d(taskId), () => this.d(taskId));
            return promise;
        }
        d(taskId) {
            if (this.a && taskId === this.a.taskId) {
                // only set pending to done if the promise finished that is associated with that taskId
                this.a = undefined;
                // schedule the next task now that we are free if we have any
                this.f();
            }
        }
        f() {
            if (this.b) {
                const next = this.b;
                this.b = undefined;
                // Run next task and complete on the associated promise
                next.run().then(next.promiseResolve, next.promiseReject);
            }
        }
        setNext(run) {
            // this is our first next task, so we create associated promise with it
            // so that we can return a promise that completes when the task has
            // completed.
            if (!this.b) {
                let promiseResolve;
                let promiseReject;
                const promise = new Promise((resolve, reject) => {
                    promiseResolve = resolve;
                    promiseReject = reject;
                });
                this.b = {
                    run,
                    promise,
                    promiseResolve: promiseResolve,
                    promiseReject: promiseReject
                };
            }
            // we have a previous next task, just overwrite it
            else {
                this.b.run = run;
            }
            return this.b.promise;
        }
        hasNext() {
            return !!this.b;
        }
        async join() {
            return this.b?.promise ?? this.a?.promise;
        }
    }
    exports.TaskSequentializer = TaskSequentializer;
    //#endregion
    //#region
    /**
     * The `IntervalCounter` allows to count the number
     * of calls to `increment()` over a duration of
     * `interval`. This utility can be used to conditionally
     * throttle a frequent task when a certain threshold
     * is reached.
     */
    class IntervalCounter {
        constructor(d, f = () => Date.now()) {
            this.d = d;
            this.f = f;
            this.a = 0;
            this.b = 0;
        }
        increment() {
            const now = this.f();
            // We are outside of the range of `interval` and as such
            // start counting from 0 and remember the time
            if (now - this.a > this.d) {
                this.a = now;
                this.b = 0;
            }
            this.b++;
            return this.b;
        }
    }
    exports.IntervalCounter = IntervalCounter;
    /**
     * Creates a promise whose resolution or rejection can be controlled imperatively.
     */
    class DeferredPromise {
        get isRejected() {
            return this.d;
        }
        get isResolved() {
            return this.f;
        }
        get isSettled() {
            return this.d || this.f;
        }
        constructor() {
            this.d = false;
            this.f = false;
            this.p = new Promise((c, e) => {
                this.a = c;
                this.b = e;
            });
        }
        complete(value) {
            return new Promise(resolve => {
                this.a(value);
                this.f = true;
                resolve();
            });
        }
        error(err) {
            return new Promise(resolve => {
                this.b(err);
                this.d = true;
                resolve();
            });
        }
        cancel() {
            new Promise(resolve => {
                this.b(new errors_1.CancellationError());
                this.d = true;
                resolve();
            });
        }
    }
    exports.DeferredPromise = DeferredPromise;
    //#endregion
    //#region Promises
    var Promises;
    (function (Promises) {
        /**
         * A drop-in replacement for `Promise.all` with the only difference
         * that the method awaits every promise to either fulfill or reject.
         *
         * Similar to `Promise.all`, only the first error will be returned
         * if any.
         */
        async function settled(promises) {
            let firstError = undefined;
            const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
                if (!firstError) {
                    firstError = error;
                }
                return undefined; // do not rethrow so that other promises can settle
            })));
            if (typeof firstError !== 'undefined') {
                throw firstError;
            }
            return result; // cast is needed and protected by the `throw` above
        }
        Promises.settled = settled;
        /**
         * A helper to create a new `Promise<T>` with a body that is a promise
         * itself. By default, an error that raises from the async body will
         * end up as a unhandled rejection, so this utility properly awaits the
         * body and rejects the promise as a normal promise does without async
         * body.
         *
         * This method should only be used in rare cases where otherwise `async`
         * cannot be used (e.g. when callbacks are involved that require this).
         */
        function withAsyncBody(bodyFn) {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve, reject) => {
                try {
                    await bodyFn(resolve, reject);
                }
                catch (error) {
                    reject(error);
                }
            });
        }
        Promises.withAsyncBody = withAsyncBody;
    })(Promises = exports.Promises || (exports.Promises = {}));
    //#endregion
    //#region
    var AsyncIterableSourceState;
    (function (AsyncIterableSourceState) {
        AsyncIterableSourceState[AsyncIterableSourceState["Initial"] = 0] = "Initial";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneOK"] = 1] = "DoneOK";
        AsyncIterableSourceState[AsyncIterableSourceState["DoneError"] = 2] = "DoneError";
    })(AsyncIterableSourceState || (AsyncIterableSourceState = {}));
    /**
     * A rich implementation for an `AsyncIterable<T>`.
     */
    class AsyncIterableObject {
        static fromArray(items) {
            return new AsyncIterableObject((writer) => {
                writer.emitMany(items);
            });
        }
        static fromPromise(promise) {
            return new AsyncIterableObject(async (emitter) => {
                emitter.emitMany(await promise);
            });
        }
        static fromPromises(promises) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
            });
        }
        static merge(iterables) {
            return new AsyncIterableObject(async (emitter) => {
                await Promise.all(iterables.map(async (iterable) => {
                    for await (const item of iterable) {
                        emitter.emitOne(item);
                    }
                }));
            });
        }
        constructor(executor) {
            this.a = 0 /* AsyncIterableSourceState.Initial */;
            this.b = [];
            this.d = null;
            this.f = new event_1.Emitter();
            queueMicrotask(async () => {
                const writer = {
                    emitOne: (item) => this.g(item),
                    emitMany: (items) => this.h(items),
                    reject: (error) => this.k(error)
                };
                try {
                    await Promise.resolve(executor(writer));
                    this.j();
                }
                catch (err) {
                    this.k(err);
                }
                finally {
                    writer.emitOne = undefined;
                    writer.emitMany = undefined;
                    writer.reject = undefined;
                }
            });
        }
        [Symbol.asyncIterator]() {
            let i = 0;
            return {
                next: async () => {
                    do {
                        if (this.a === 2 /* AsyncIterableSourceState.DoneError */) {
                            throw this.d;
                        }
                        if (i < this.b.length) {
                            return { done: false, value: this.b[i++] };
                        }
                        if (this.a === 1 /* AsyncIterableSourceState.DoneOK */) {
                            return { done: true, value: undefined };
                        }
                        await event_1.Event.toPromise(this.f.event);
                    } while (true);
                }
            };
        }
        static map(iterable, mapFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    emitter.emitOne(mapFn(item));
                }
            });
        }
        map(mapFn) {
            return AsyncIterableObject.map(this, mapFn);
        }
        static filter(iterable, filterFn) {
            return new AsyncIterableObject(async (emitter) => {
                for await (const item of iterable) {
                    if (filterFn(item)) {
                        emitter.emitOne(item);
                    }
                }
            });
        }
        filter(filterFn) {
            return AsyncIterableObject.filter(this, filterFn);
        }
        static coalesce(iterable) {
            return AsyncIterableObject.filter(iterable, item => !!item);
        }
        coalesce() {
            return AsyncIterableObject.coalesce(this);
        }
        static async toPromise(iterable) {
            const result = [];
            for await (const item of iterable) {
                result.push(item);
            }
            return result;
        }
        toPromise() {
            return AsyncIterableObject.toPromise(this);
        }
        /**
         * The value will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        g(value) {
            if (this.a !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this.b.push(value);
            this.f.fire();
        }
        /**
         * The values will be appended at the end.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        h(values) {
            if (this.a !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            // it is important to add new values at the end,
            // as we may have iterators already running on the array
            this.b = this.b.concat(values);
            this.f.fire();
        }
        /**
         * Calling `resolve()` will mark the result array as complete.
         *
         * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        j() {
            if (this.a !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this.a = 1 /* AsyncIterableSourceState.DoneOK */;
            this.f.fire();
        }
        /**
         * Writing an error will permanently invalidate this iterable.
         * The current users will receive an error thrown, as will all future users.
         *
         * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
         */
        k(error) {
            if (this.a !== 0 /* AsyncIterableSourceState.Initial */) {
                return;
            }
            this.a = 2 /* AsyncIterableSourceState.DoneError */;
            this.d = error;
            this.f.fire();
        }
    }
    AsyncIterableObject.EMPTY = AsyncIterableObject.fromArray([]);
    exports.AsyncIterableObject = AsyncIterableObject;
    class CancelableAsyncIterableObject extends AsyncIterableObject {
        constructor(l, executor) {
            super(executor);
            this.l = l;
        }
        cancel() {
            this.l.cancel();
        }
    }
    exports.CancelableAsyncIterableObject = CancelableAsyncIterableObject;
    function createCancelableAsyncIterable(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const innerIterable = callback(source.token);
        return new CancelableAsyncIterableObject(source, async (emitter) => {
            const subscription = source.token.onCancellationRequested(() => {
                subscription.dispose();
                source.dispose();
                emitter.reject(new errors_1.CancellationError());
            });
            try {
                for await (const item of innerIterable) {
                    if (source.token.isCancellationRequested) {
                        // canceled in the meantime
                        return;
                    }
                    emitter.emitOne(item);
                }
                subscription.dispose();
                source.dispose();
            }
            catch (err) {
                subscription.dispose();
                source.dispose();
                emitter.reject(err);
            }
        });
    }
    exports.createCancelableAsyncIterable = createCancelableAsyncIterable;
});
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[18/*vs/editor/common/languages/nullTokenize*/], __M([0/*require*/,1/*exports*/,19/*vs/editor/common/languages*/]), function (require, exports, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nullTokenizeEncoded = exports.nullTokenize = exports.NullState = void 0;
    exports.NullState = new class {
        clone() {
            return this;
        }
        equals(other) {
            return (this === other);
        }
    };
    function nullTokenize(languageId, state) {
        return new languages_1.TokenizationResult([new languages_1.Token(0, '', languageId)], state);
    }
    exports.nullTokenize = nullTokenize;
    function nullTokenizeEncoded(languageId, state) {
        const tokens = new Uint32Array(2);
        tokens[0] = 0;
        tokens[1] = ((languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)
            | (0 /* StandardTokenType.Other */ << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)
            | (0 /* FontStyle.None */ << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
            | (1 /* ColorId.DefaultForeground */ << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
            | (2 /* ColorId.DefaultBackground */ << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        return new languages_1.EncodedTokenizationResult(tokens, state === null ? exports.NullState : state);
    }
    exports.nullTokenizeEncoded = nullTokenizeEncoded;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[31/*vs/editor/common/model/textModelTokens*/], __M([0/*require*/,1/*exports*/,25/*vs/base/common/arrays*/,17/*vs/base/common/async*/,6/*vs/base/common/errors*/,2/*vs/base/common/lifecycle*/,4/*vs/base/common/platform*/,41/*vs/base/common/stopwatch*/,7/*vs/editor/common/core/eolCounter*/,19/*vs/editor/common/languages*/,18/*vs/editor/common/languages/nullTokenize*/,14/*vs/editor/common/tokens/contiguousMultilineTokensBuilder*/,8/*vs/editor/common/tokens/lineTokens*/]), function (require, exports, arrays, async_1, errors_1, lifecycle_1, platform_1, stopwatch_1, eolCounter_1, languages_1, nullTokenize_1, contiguousMultilineTokensBuilder_1, lineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextModelTokenization = exports.TokenizationStateStore = exports.ContiguousGrowingArray = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["CHEAP_TOKENIZATION_LENGTH_LIMIT"] = 2048] = "CHEAP_TOKENIZATION_LENGTH_LIMIT";
    })(Constants || (Constants = {}));
    /**
     * An array that avoids being sparse by always
     * filling up unused indices with a default value.
     */
    class ContiguousGrowingArray {
        constructor(c) {
            this.c = c;
            this.a = [];
        }
        get(index) {
            if (index < this.a.length) {
                return this.a[index];
            }
            return this.c;
        }
        set(index, value) {
            while (index >= this.a.length) {
                this.a[this.a.length] = this.c;
            }
            this.a[index] = value;
        }
        // TODO have `replace` instead of `delete` and `insert`
        delete(deleteIndex, deleteCount) {
            if (deleteCount === 0 || deleteIndex >= this.a.length) {
                return;
            }
            this.a.splice(deleteIndex, deleteCount);
        }
        insert(insertIndex, insertCount) {
            if (insertCount === 0 || insertIndex >= this.a.length) {
                return;
            }
            const arr = [];
            for (let i = 0; i < insertCount; i++) {
                arr[i] = this.c;
            }
            this.a = arrays.arrayInsert(this.a, insertIndex, arr);
        }
    }
    exports.ContiguousGrowingArray = ContiguousGrowingArray;
    /**
     * Stores the states at the start of each line and keeps track of which lines
     * must be re-tokenized. Also uses state equality to quickly validate lines
     * that don't need to be re-tokenized.
     *
     * For example, when typing on a line, the line gets marked as needing to be tokenized.
     * Once the line is tokenized, the end state is checked for equality against the begin
     * state of the next line. If the states are equal, tokenization doesn't need to run
     * again over the rest of the file. If the states are not equal, the next line gets marked
     * as needing to be tokenized.
     */
    class TokenizationStateStore {
        get invalidLineStartIndex() {
            return this.d;
        }
        constructor(tokenizationSupport, initialState) {
            this.tokenizationSupport = tokenizationSupport;
            this.initialState = initialState;
            /**
             * `lineBeginState[i]` contains the begin state used to tokenize line number `i + 1`.
             */
            this.a = new ContiguousGrowingArray(null);
            /**
             * `lineNeedsTokenization[i]` describes if line number `i + 1` needs to be tokenized.
             */
            this.c = new ContiguousGrowingArray(true);
            this.d = 0;
            this.a.set(0, this.initialState);
        }
        markMustBeTokenized(lineIndex) {
            this.c.set(lineIndex, true);
            this.d = Math.min(this.d, lineIndex);
        }
        getBeginState(lineIndex) {
            return this.a.get(lineIndex);
        }
        /**
         * Returns `false` if the end state equals the previous end state.
         */
        setEndState(linesLength, lineIndex, endState) {
            this.c.set(lineIndex, false);
            this.d = lineIndex + 1;
            // Check if the end state has changed
            const previousEndState = this.a.get(lineIndex + 1);
            if (previousEndState === null || !endState.equals(previousEndState)) {
                this.a.set(lineIndex + 1, endState);
                this.markMustBeTokenized(lineIndex + 1);
                return true;
            }
            // Perhaps we can skip tokenizing some lines...
            let i = lineIndex + 1;
            while (i < linesLength) {
                if (this.c.get(i)) {
                    break;
                }
                i++;
            }
            this.d = i;
            return false;
        }
        applyEdits(range, eolCount) {
            this.markMustBeTokenized(range.startLineNumber - 1);
            this.a.delete(range.startLineNumber, range.endLineNumber - range.startLineNumber);
            this.c.delete(range.startLineNumber, range.endLineNumber - range.startLineNumber);
            this.a.insert(range.startLineNumber, eolCount);
            this.c.insert(range.startLineNumber, eolCount);
        }
        updateTokensUntilLine(textModel, languageIdCodec, builder, lineNumber) {
            const languageId = textModel.getLanguageId();
            const linesLength = textModel.getLineCount();
            const endLineIndex = lineNumber - 1;
            // Validate all states up to and including endLineIndex
            for (let lineIndex = this.invalidLineStartIndex; lineIndex <= endLineIndex; lineIndex++) {
                const text = textModel.getLineContent(lineIndex + 1);
                const lineStartState = this.getBeginState(lineIndex);
                const r = safeTokenize(languageIdCodec, languageId, this.tokenizationSupport, text, true, lineStartState);
                builder.add(lineIndex + 1, r.tokens);
                this.setEndState(linesLength, lineIndex, r.endState);
                lineIndex = this.invalidLineStartIndex - 1; // -1 because the outer loop increments it
            }
        }
        isTokenizationComplete(textModel) {
            return this.invalidLineStartIndex >= textModel.getLineCount();
        }
    }
    exports.TokenizationStateStore = TokenizationStateStore;
    class TextModelTokenization extends lifecycle_1.Disposable {
        constructor(g, h, j) {
            super();
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = null;
            this.c = null;
            this.f = this.B(new lifecycle_1.MutableDisposable());
            this.B(languages_1.TokenizationRegistry.onDidChange((e) => {
                const languageId = this.g.getLanguageId();
                if (e.changedLanguages.indexOf(languageId) === -1) {
                    return;
                }
                this.k();
                this.h.clearTokens();
            }));
            this.k();
        }
        handleDidChangeContent(e) {
            if (e.isFlush) {
                this.k();
                return;
            }
            if (this.a) {
                for (let i = 0, len = e.changes.length; i < len; i++) {
                    const change = e.changes[i];
                    const [eolCount] = (0, eolCounter_1.countEOL)(change.text);
                    this.a.applyEdits(change.range, eolCount);
                }
            }
            this.c?.handleChanges();
        }
        handleDidChangeAttached() {
            this.c?.handleChanges();
        }
        handleDidChangeLanguage(e) {
            this.k();
            this.h.clearTokens();
        }
        k() {
            const [tokenizationSupport, initialState] = initializeTokenization(this.g, this.h);
            if (tokenizationSupport && initialState) {
                this.a = new TokenizationStateStore(tokenizationSupport, initialState);
            }
            else {
                this.a = null;
            }
            this.f.clear();
            this.c = null;
            if (this.a) {
                const b = {
                    setTokens: (tokens) => {
                        this.h.setTokens(tokens);
                    },
                    backgroundTokenizationFinished: () => {
                        this.h.handleBackgroundTokenizationFinished();
                    },
                    setEndState: (lineNumber, state) => {
                        if (!state) {
                            throw new errors_1.BugIndicatingError();
                        }
                        const invalidLineStartIndex = this.a?.invalidLineStartIndex;
                        if (invalidLineStartIndex !== undefined && lineNumber - 1 >= invalidLineStartIndex) {
                            // Don't accept states for definitely valid states
                            this.a?.setEndState(this.g.getLineCount(), lineNumber - 1, state);
                        }
                    },
                };
                if (tokenizationSupport && tokenizationSupport.createBackgroundTokenizer) {
                    this.f.value = tokenizationSupport.createBackgroundTokenizer(this.g, b);
                }
                if (!this.f.value) {
                    this.f.value = this.c =
                        new DefaultBackgroundTokenizer(this.g, this.a, b, this.j);
                    this.c.handleChanges();
                }
            }
        }
        tokenizeViewport(startLineNumber, endLineNumber) {
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            this.l(builder, startLineNumber, endLineNumber);
            this.h.setTokens(builder.finalize());
            this.c?.checkFinished();
        }
        reset() {
            this.k();
            this.h.clearTokens();
        }
        forceTokenization(lineNumber) {
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            this.a?.updateTokensUntilLine(this.g, this.j, builder, lineNumber);
            this.h.setTokens(builder.finalize());
            this.c?.checkFinished();
        }
        getTokenTypeIfInsertingCharacter(position, character) {
            if (!this.a) {
                return 0 /* StandardTokenType.Other */;
            }
            this.forceTokenization(position.lineNumber);
            const lineStartState = this.a.getBeginState(position.lineNumber - 1);
            if (!lineStartState) {
                return 0 /* StandardTokenType.Other */;
            }
            const languageId = this.g.getLanguageId();
            const lineContent = this.g.getLineContent(position.lineNumber);
            // Create the text as if `character` was inserted
            const text = (lineContent.substring(0, position.column - 1)
                + character
                + lineContent.substring(position.column - 1));
            const r = safeTokenize(this.j, languageId, this.a.tokenizationSupport, text, true, lineStartState);
            const lineTokens = new lineTokens_1.LineTokens(r.tokens, text, this.j);
            if (lineTokens.getCount() === 0) {
                return 0 /* StandardTokenType.Other */;
            }
            const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
            return lineTokens.getStandardTokenType(tokenIndex);
        }
        tokenizeLineWithEdit(position, length, newText) {
            const lineNumber = position.lineNumber;
            const column = position.column;
            if (!this.a) {
                return null;
            }
            this.forceTokenization(lineNumber);
            const lineStartState = this.a.getBeginState(lineNumber - 1);
            if (!lineStartState) {
                return null;
            }
            const curLineContent = this.g.getLineContent(lineNumber);
            const newLineContent = curLineContent.substring(0, column - 1)
                + newText + curLineContent.substring(column - 1 + length);
            const languageId = this.g.getLanguageIdAtPosition(lineNumber, 0);
            const result = safeTokenize(this.j, languageId, this.a.tokenizationSupport, newLineContent, true, lineStartState);
            const lineTokens = new lineTokens_1.LineTokens(result.tokens, newLineContent, this.j);
            return lineTokens;
        }
        isCheapToTokenize(lineNumber) {
            if (!this.a) {
                return true;
            }
            const firstInvalidLineNumber = this.a.invalidLineStartIndex + 1;
            if (lineNumber > firstInvalidLineNumber) {
                return false;
            }
            if (lineNumber < firstInvalidLineNumber) {
                return true;
            }
            if (this.g.getLineLength(lineNumber) < 2048 /* Constants.CHEAP_TOKENIZATION_LENGTH_LIMIT */) {
                return true;
            }
            return false;
        }
        /**
         * The result is not cached.
         */
        l(builder, startLineNumber, endLineNumber) {
            if (!this.a) {
                // nothing to do
                return;
            }
            if (endLineNumber <= this.a.invalidLineStartIndex) {
                // nothing to do
                return;
            }
            if (startLineNumber <= this.a.invalidLineStartIndex) {
                // tokenization has reached the viewport start...
                this.a.updateTokensUntilLine(this.g, this.j, builder, endLineNumber);
                return;
            }
            let state = this.m(startLineNumber);
            const languageId = this.g.getLanguageId();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const text = this.g.getLineContent(lineNumber);
                const r = safeTokenize(this.j, languageId, this.a.tokenizationSupport, text, true, state);
                builder.add(lineNumber, r.tokens);
                state = r.endState;
            }
            // We overrode the tokens. Because old states might get reused (thus stopping invalidation),
            // we have to explicitly request the tokens for this range again.
            this.f.value?.requestTokens(startLineNumber, endLineNumber + 1);
        }
        m(lineNumber) {
            let nonWhitespaceColumn = this.g.getLineFirstNonWhitespaceColumn(lineNumber);
            const likelyRelevantLines = [];
            let initialState = null;
            for (let i = lineNumber - 1; nonWhitespaceColumn > 1 && i >= 1; i--) {
                const newNonWhitespaceIndex = this.g.getLineFirstNonWhitespaceColumn(i);
                // Ignore lines full of whitespace
                if (newNonWhitespaceIndex === 0) {
                    continue;
                }
                if (newNonWhitespaceIndex < nonWhitespaceColumn) {
                    likelyRelevantLines.push(this.g.getLineContent(i));
                    nonWhitespaceColumn = newNonWhitespaceIndex;
                    initialState = this.a.getBeginState(i - 1);
                    if (initialState) {
                        break;
                    }
                }
            }
            if (!initialState) {
                initialState = this.a.initialState;
            }
            likelyRelevantLines.reverse();
            const languageId = this.g.getLanguageId();
            let state = initialState;
            for (const line of likelyRelevantLines) {
                const r = safeTokenize(this.j, languageId, this.a.tokenizationSupport, line, false, state);
                state = r.endState;
            }
            return state;
        }
    }
    exports.TextModelTokenization = TextModelTokenization;
    function initializeTokenization(textModel, tokenizationPart) {
        if (textModel.isTooLargeForTokenization()) {
            return [null, null];
        }
        const tokenizationSupport = languages_1.TokenizationRegistry.get(tokenizationPart.getLanguageId());
        if (!tokenizationSupport) {
            return [null, null];
        }
        let initialState;
        try {
            initialState = tokenizationSupport.getInitialState();
        }
        catch (e) {
            (0, errors_1.onUnexpectedError)(e);
            return [null, null];
        }
        return [tokenizationSupport, initialState];
    }
    function safeTokenize(languageIdCodec, languageId, tokenizationSupport, text, hasEOL, state) {
        let r = null;
        if (tokenizationSupport) {
            try {
                r = tokenizationSupport.tokenizeEncoded(text, hasEOL, state.clone());
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        if (!r) {
            r = (0, nullTokenize_1.nullTokenizeEncoded)(languageIdCodec.encodeLanguageId(languageId), state);
        }
        lineTokens_1.LineTokens.convertToEndOffset(r.tokens, text.length);
        return r;
    }
    class DefaultBackgroundTokenizer {
        constructor(c, d, f, g) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = false;
            this.h = false;
        }
        dispose() {
            this.a = true;
        }
        handleChanges() {
            this.j();
        }
        j() {
            if (this.h || !this.c.isAttachedToEditor() || !this.m()) {
                return;
            }
            this.h = true;
            (0, async_1.runWhenIdle)((deadline) => {
                this.h = false;
                this.k(deadline);
            });
        }
        /**
         * Tokenize until the deadline occurs, but try to yield every 1-2ms.
         */
        k(deadline) {
            // Read the time remaining from the `deadline` immediately because it is unclear
            // if the `deadline` object will be valid after execution leaves this function.
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                if (this.a || !this.c.isAttachedToEditor() || !this.m()) {
                    // disposed in the meantime or detached or finished
                    return;
                }
                this.l();
                if (Date.now() < endTime) {
                    // There is still time before reaching the deadline, so yield to the browser and then
                    // continue execution
                    (0, platform_1.setTimeout0)(execute);
                }
                else {
                    // The deadline has been reached, so schedule a new idle callback if necessary
                    this.j();
                }
            };
            execute();
        }
        /**
         * Tokenize for at least 1ms.
         */
        l() {
            const lineCount = this.c.getLineCount();
            const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
            const sw = stopwatch_1.StopWatch.create(false);
            do {
                if (sw.elapsed() > 1) {
                    // the comparison is intentionally > 1 and not >= 1 to ensure that
                    // a full millisecond has elapsed, given how microseconds are rounded
                    // to milliseconds
                    break;
                }
                const tokenizedLineNumber = this.n(builder);
                if (tokenizedLineNumber >= lineCount) {
                    break;
                }
            } while (this.m());
            this.f.setTokens(builder.finalize());
            this.checkFinished();
        }
        m() {
            if (!this.d) {
                return false;
            }
            return this.d.invalidLineStartIndex < this.c.getLineCount();
        }
        n(builder) {
            if (!this.d || !this.m()) {
                return this.c.getLineCount() + 1;
            }
            const lineNumber = this.d.invalidLineStartIndex + 1;
            this.d.updateTokensUntilLine(this.c, this.g, builder, lineNumber);
            return lineNumber;
        }
        checkFinished() {
            if (this.a) {
                return;
            }
            if (this.d.isTokenizationComplete(this.c)) {
                this.f.backgroundTokenizationFinished();
            }
        }
        requestTokens(startLineNumber, endLineNumberExclusive) {
            for (let lineNumber = startLineNumber; lineNumber < endLineNumberExclusive; lineNumber++) {
                this.d.markMustBeTokenized(lineNumber - 1);
            }
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[32/*vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport*/], __M([0/*require*/,1/*exports*/,30/*vs/base/common/event*/,2/*vs/base/common/lifecycle*/,13/*vs/editor/common/encodedTokenAttributes*/,19/*vs/editor/common/languages*/]), function (require, exports, event_1, lifecycle_1, encodedTokenAttributes_1, languages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateTokenizationSupport = void 0;
    class TextMateTokenizationSupport extends lifecycle_1.Disposable {
        constructor(c, f, g, h) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = [];
            this.b = this.B(new event_1.Emitter());
            this.onDidEncounterLanguage = this.b.event;
        }
        getInitialState() {
            return this.f;
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        createBackgroundTokenizer(textModel, store) {
            if (this.h) {
                return this.h(textModel, store);
            }
            return undefined;
        }
        tokenizeEncoded(line, hasEOL, state) {
            const textMateResult = this.c.tokenizeLine2(line, state, 500);
            if (textMateResult.stoppedEarly) {
                console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
                // return the state at the beginning of the line
                return new languages_1.EncodedTokenizationResult(textMateResult.tokens, state);
            }
            if (this.g) {
                const seenLanguages = this.a;
                const tokens = textMateResult.tokens;
                // Must check if any of the embedded languages was hit
                for (let i = 0, len = (tokens.length >>> 1); i < len; i++) {
                    const metadata = tokens[(i << 1) + 1];
                    const languageId = encodedTokenAttributes_1.TokenMetadata.getLanguageId(metadata);
                    if (!seenLanguages[languageId]) {
                        seenLanguages[languageId] = true;
                        this.b.fire(languageId);
                    }
                }
            }
            let endState;
            // try to save an object if possible
            if (state.equals(textMateResult.ruleStack)) {
                endState = state;
            }
            else {
                endState = textMateResult.ruleStack;
            }
            return new languages_1.EncodedTokenizationResult(textMateResult.tokens, endState);
        }
    }
    exports.TextMateTokenizationSupport = TextMateTokenizationSupport;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[33/*vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit*/], __M([0/*require*/,1/*exports*/,18/*vs/editor/common/languages/nullTokenize*/,2/*vs/base/common/lifecycle*/,11/*vs/base/common/observable*/]), function (require, exports, nullTokenize_1, lifecycle_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenizationSupportWithLineLimit = void 0;
    class TokenizationSupportWithLineLimit extends lifecycle_1.Disposable {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B((0, observable_1.keepAlive)(this.c));
        }
        getInitialState() {
            return this.b.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            // Do not attempt to tokenize if a line is too long
            if (line.length >= this.c.get()) {
                return (0, nullTokenize_1.nullTokenizeEncoded)(this.a, state);
            }
            return this.b.tokenizeEncoded(line, hasEOL, state);
        }
        createBackgroundTokenizer(textModel, store) {
            if (this.b.createBackgroundTokenizer) {
                return this.b.createBackgroundTokenizer(textModel, store);
            }
            else {
                return undefined;
            }
        }
    }
    exports.TokenizationSupportWithLineLimit = TokenizationSupportWithLineLimit;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[34/*vs/workbench/services/textMate/common/TMScopeRegistry*/], __M([0/*require*/,1/*exports*/,16/*vs/base/common/resources*/]), function (require, exports, resources) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TMScopeRegistry = void 0;
    class TMScopeRegistry {
        constructor() {
            this.a = Object.create(null);
        }
        reset() {
            this.a = Object.create(null);
        }
        register(def) {
            if (this.a[def.scopeName]) {
                const existingRegistration = this.a[def.scopeName];
                if (!resources.isEqual(existingRegistration.location, def.location)) {
                    console.warn(`Overwriting grammar scope name to file mapping for scope ${def.scopeName}.\n` +
                        `Old grammar file: ${existingRegistration.location.toString()}.\n` +
                        `New grammar file: ${def.location.toString()}`);
                }
            }
            this.a[def.scopeName] = def;
        }
        getGrammarDefinition(scopeName) {
            return this.a[scopeName] || null;
        }
    }
    exports.TMScopeRegistry = TMScopeRegistry;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[35/*vs/workbench/services/textMate/common/TMGrammarFactory*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/lifecycle*/,34/*vs/workbench/services/textMate/common/TMScopeRegistry*/]), function (require, exports, lifecycle_1, TMScopeRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TMGrammarFactory = exports.missingTMGrammarErrorMessage = void 0;
    exports.missingTMGrammarErrorMessage = 'No TM Grammar registered for this language.';
    class TMGrammarFactory extends lifecycle_1.Disposable {
        constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
            super();
            this.a = host;
            this.b = vscodeTextmate.INITIAL;
            this.c = new TMScopeRegistry_1.TMScopeRegistry();
            this.f = {};
            this.g = {};
            this.h = new Map();
            this.j = this.B(new vscodeTextmate.Registry({
                onigLib: onigLib,
                loadGrammar: async (scopeName) => {
                    const grammarDefinition = this.c.getGrammarDefinition(scopeName);
                    if (!grammarDefinition) {
                        this.a.logTrace(`No grammar found for scope ${scopeName}`);
                        return null;
                    }
                    const location = grammarDefinition.location;
                    try {
                        const content = await this.a.readFile(location);
                        return vscodeTextmate.parseRawGrammar(content, location.path);
                    }
                    catch (e) {
                        this.a.logError(`Unable to load and parse grammar for scope ${scopeName} from ${location}`, e);
                        return null;
                    }
                },
                getInjections: (scopeName) => {
                    const scopeParts = scopeName.split('.');
                    let injections = [];
                    for (let i = 1; i <= scopeParts.length; i++) {
                        const subScopeName = scopeParts.slice(0, i).join('.');
                        injections = [...injections, ...(this.f[subScopeName] || [])];
                    }
                    return injections;
                }
            }));
            for (const validGrammar of grammarDefinitions) {
                this.c.register(validGrammar);
                if (validGrammar.injectTo) {
                    for (const injectScope of validGrammar.injectTo) {
                        let injections = this.f[injectScope];
                        if (!injections) {
                            this.f[injectScope] = injections = [];
                        }
                        injections.push(validGrammar.scopeName);
                    }
                    if (validGrammar.embeddedLanguages) {
                        for (const injectScope of validGrammar.injectTo) {
                            let injectedEmbeddedLanguages = this.g[injectScope];
                            if (!injectedEmbeddedLanguages) {
                                this.g[injectScope] = injectedEmbeddedLanguages = [];
                            }
                            injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
                        }
                    }
                }
                if (validGrammar.language) {
                    this.h.set(validGrammar.language, validGrammar.scopeName);
                }
            }
        }
        has(languageId) {
            return this.h.has(languageId);
        }
        setTheme(theme, colorMap) {
            this.j.setTheme(theme, colorMap);
        }
        getColorMap() {
            return this.j.getColorMap();
        }
        async createGrammar(languageId, encodedLanguageId) {
            const scopeName = this.h.get(languageId);
            if (typeof scopeName !== 'string') {
                // No TM grammar defined
                throw new Error(exports.missingTMGrammarErrorMessage);
            }
            const grammarDefinition = this.c.getGrammarDefinition(scopeName);
            if (!grammarDefinition) {
                // No TM grammar defined
                throw new Error(exports.missingTMGrammarErrorMessage);
            }
            const embeddedLanguages = grammarDefinition.embeddedLanguages;
            if (this.g[scopeName]) {
                const injectedEmbeddedLanguages = this.g[scopeName];
                for (const injected of injectedEmbeddedLanguages) {
                    for (const scope of Object.keys(injected)) {
                        embeddedLanguages[scope] = injected[scope];
                    }
                }
            }
            const containsEmbeddedLanguages = (Object.keys(embeddedLanguages).length > 0);
            let grammar;
            try {
                grammar = await this.j.loadGrammarWithConfiguration(scopeName, encodedLanguageId, {
                    embeddedLanguages,
                    tokenTypes: grammarDefinition.tokenTypes,
                    balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
                    unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors,
                });
            }
            catch (err) {
                if (err.message && err.message.startsWith('No grammar provided for')) {
                    // No TM grammar defined
                    throw new Error(exports.missingTMGrammarErrorMessage);
                }
                throw err;
            }
            return {
                languageId: languageId,
                grammar: grammar,
                initialState: this.b,
                containsEmbeddedLanguages: containsEmbeddedLanguages
            };
        }
    }
    exports.TMGrammarFactory = TMGrammarFactory;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[36/*vs/workbench/services/textMate/browser/worker/textMateWorkerModel*/], __M([0/*require*/,1/*exports*/,42/*vs/editor/common/model/mirrorTextModel*/,31/*vs/editor/common/model/textModelTokens*/,43/*vscode-textmate*/,14/*vs/editor/common/tokens/contiguousMultilineTokensBuilder*/,7/*vs/editor/common/core/eolCounter*/,8/*vs/editor/common/tokens/lineTokens*/,32/*vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport*/,17/*vs/base/common/async*/,11/*vs/base/common/observable*/,33/*vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit*/]), function (require, exports, mirrorTextModel_1, textModelTokens_1, vscode_textmate_1, contiguousMultilineTokensBuilder_1, eolCounter_1, lineTokens_1, textMateTokenizationSupport_1, async_1, observable_1, tokenizationSupportWithLineLimit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateWorkerModel = void 0;
    class TextMateWorkerModel extends mirrorTextModel_1.MirrorTextModel {
        constructor(uri, lines, eol, versionId, worker, languageId, encodedLanguageId, maxTokenizationLineLength) {
            super(uri, lines, eol, versionId);
            this.s = (0, observable_1.observableValue)('_maxTokenizationLineLength', -1);
            this.t = new async_1.RunOnceScheduler(() => this.v(), 10);
            this.a = null;
            this.b = worker;
            this.c = languageId;
            this.m = encodedLanguageId;
            this.q = false;
            this.s.set(maxTokenizationLineLength, undefined);
            this.u();
        }
        dispose() {
            this.q = true;
            super.dispose();
        }
        onLanguageId(languageId, encodedLanguageId) {
            this.c = languageId;
            this.m = encodedLanguageId;
            this.u();
        }
        onEvents(e) {
            super.onEvents(e);
            if (this.a) {
                // Changes are sorted in descending order
                for (let i = 0; i < e.changes.length; i++) {
                    const change = e.changes[i];
                    const [eolCount] = (0, eolCounter_1.countEOL)(change.text);
                    this.a.applyEdits(change.range, eolCount);
                }
            }
            this.t.schedule();
        }
        acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
            this.s.set(maxTokenizationLineLength, undefined);
        }
        retokenize(startLineNumber, endLineNumberExclusive) {
            if (this.a) {
                for (let lineNumber = startLineNumber; lineNumber < endLineNumberExclusive; lineNumber++) {
                    this.a.markMustBeTokenized(lineNumber - 1);
                }
                this.t.schedule();
            }
        }
        u() {
            this.a = null;
            const languageId = this.c;
            const encodedLanguageId = this.m;
            this.b.getOrCreateGrammar(languageId, encodedLanguageId).then((r) => {
                if (this.q ||
                    languageId !== this.c ||
                    encodedLanguageId !== this.m ||
                    !r) {
                    return;
                }
                if (r.grammar) {
                    const tokenizationSupport = new tokenizationSupportWithLineLimit_1.TokenizationSupportWithLineLimit(this.m, new textMateTokenizationSupport_1.TextMateTokenizationSupport(r.grammar, r.initialState, false), this.s);
                    this.a = new textModelTokens_1.TokenizationStateStore(tokenizationSupport, tokenizationSupport.getInitialState());
                }
                else {
                    this.a = null;
                }
                this.v();
            });
        }
        v() {
            if (this.q || !this.a) {
                return;
            }
            const startTime = new Date().getTime();
            while (true) {
                const builder = new contiguousMultilineTokensBuilder_1.ContiguousMultilineTokensBuilder();
                const lineCount = this.f.length;
                let tokenizedLines = 0;
                const stateDeltaBuilder = new StateDeltaBuilder();
                // Validate all states up to and including endLineIndex
                while (this.a.invalidLineStartIndex < lineCount) {
                    const lineIndex = this.a.invalidLineStartIndex;
                    tokenizedLines++;
                    // TODO don't spam the renderer
                    if (tokenizedLines > 200) {
                        break;
                    }
                    const text = this.f[lineIndex];
                    const lineStartState = this.a.getBeginState(lineIndex);
                    const tokenizeResult = this.a.tokenizationSupport.tokenizeEncoded(text, true, lineStartState);
                    if (this.a.setEndState(lineCount, lineIndex, tokenizeResult.endState)) {
                        const delta = (0, vscode_textmate_1.diffStateStacksRefEq)(lineStartState, tokenizeResult.endState);
                        stateDeltaBuilder.setState(lineIndex + 1, delta);
                    }
                    else {
                        stateDeltaBuilder.setState(lineIndex + 1, null);
                    }
                    lineTokens_1.LineTokens.convertToEndOffset(tokenizeResult.tokens, text.length);
                    builder.add(lineIndex + 1, tokenizeResult.tokens);
                    const deltaMs = new Date().getTime() - startTime;
                    if (deltaMs > 20) {
                        // yield to check for changes
                        break;
                    }
                }
                if (tokenizedLines === 0) {
                    break;
                }
                const stateDeltas = stateDeltaBuilder.getStateDeltas();
                this.b.setTokensAndStates(this.d, this.h, builder.serialize(), stateDeltas);
                const deltaMs = new Date().getTime() - startTime;
                if (deltaMs > 20) {
                    // yield to check for changes
                    setTimeout(() => this.v(), 3);
                    return;
                }
            }
        }
    }
    exports.TextMateWorkerModel = TextMateWorkerModel;
    class StateDeltaBuilder {
        constructor() {
            this.a = -1;
            this.b = [];
        }
        setState(lineNumber, stackDiff) {
            if (lineNumber === this.a + 1) {
                this.b[this.b.length - 1].stateDeltas.push(stackDiff);
            }
            else {
                this.b.push({ startLineNumber: lineNumber, stateDeltas: [stackDiff] });
            }
            this.a = lineNumber;
        }
        getStateDeltas() {
            return this.b;
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[44/*vs/workbench/services/textMate/browser/worker/textMate.worker*/], __M([0/*require*/,1/*exports*/,15/*vs/base/common/uri*/,35/*vs/workbench/services/textMate/common/TMGrammarFactory*/,36/*vs/workbench/services/textMate/browser/worker/textMateWorkerModel*/]), function (require, exports, uri_1, TMGrammarFactory_1, textMateWorkerModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.TextMateTokenizationWorker = void 0;
    class TextMateTokenizationWorker {
        constructor(ctx, f) {
            this.f = f;
            this.b = Object.create(null);
            this.c = [];
            this.a = ctx.host;
            const grammarDefinitions = f.grammarDefinitions.map((def) => {
                return {
                    location: uri_1.URI.revive(def.location),
                    language: def.language,
                    scopeName: def.scopeName,
                    embeddedLanguages: def.embeddedLanguages,
                    tokenTypes: def.tokenTypes,
                    injectTo: def.injectTo,
                    balancedBracketSelectors: def.balancedBracketSelectors,
                    unbalancedBracketSelectors: def.unbalancedBracketSelectors,
                };
            });
            this.d = this.g(grammarDefinitions);
        }
        async g(grammarDefinitions) {
            const uri = this.f.textmateMainUri;
            const vscodeTextmate = await new Promise((resolve_1, reject_1) => { require([uri], resolve_1, reject_1); });
            const vscodeOniguruma = await new Promise((resolve_2, reject_2) => { require([this.f.onigurumaMainUri], resolve_2, reject_2); });
            const response = await fetch(this.f.onigurumaWASMUri);
            // Using the response directly only works if the server sets the MIME type 'application/wasm'.
            // Otherwise, a TypeError is thrown when using the streaming compiler.
            // We therefore use the non-streaming compiler :(.
            const bytes = await response.arrayBuffer();
            await vscodeOniguruma.loadWASM(bytes);
            const onigLib = Promise.resolve({
                createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
                createOnigString: (str) => vscodeOniguruma.createOnigString(str)
            });
            return new TMGrammarFactory_1.TMGrammarFactory({
                logTrace: (msg) => { },
                logError: (msg, err) => console.error(msg, err),
                readFile: (resource) => this.a.readFile(resource)
            }, grammarDefinitions, vscodeTextmate, onigLib);
        }
        // #region called by renderer
        acceptNewModel(data) {
            const uri = uri_1.URI.revive(data.uri);
            const key = uri.toString();
            this.b[key] = new textMateWorkerModel_1.TextMateWorkerModel(uri, data.lines, data.EOL, data.versionId, this, data.languageId, data.encodedLanguageId, data.maxTokenizationLineLength);
        }
        acceptModelChanged(strURL, e) {
            this.b[strURL].onEvents(e);
        }
        retokenize(strURL, startLineNumber, endLineNumberExclusive) {
            this.b[strURL].retokenize(startLineNumber, endLineNumberExclusive);
        }
        acceptModelLanguageChanged(strURL, newLanguageId, newEncodedLanguageId) {
            this.b[strURL].onLanguageId(newLanguageId, newEncodedLanguageId);
        }
        acceptRemovedModel(strURL) {
            if (this.b[strURL]) {
                this.b[strURL].dispose();
                delete this.b[strURL];
            }
        }
        async acceptTheme(theme, colorMap) {
            const grammarFactory = await this.d;
            grammarFactory?.setTheme(theme, colorMap);
        }
        acceptMaxTokenizationLineLength(strURL, value) {
            this.b[strURL].acceptMaxTokenizationLineLength(value);
        }
        // #endregion
        // #region called by worker model
        async getOrCreateGrammar(languageId, encodedLanguageId) {
            const grammarFactory = await this.d;
            if (!grammarFactory) {
                return Promise.resolve(null);
            }
            if (!this.c[encodedLanguageId]) {
                this.c[encodedLanguageId] = grammarFactory.createGrammar(languageId, encodedLanguageId);
            }
            return this.c[encodedLanguageId];
        }
        setTokensAndStates(resource, versionId, tokens, stateDeltas) {
            this.a.setTokensAndStates(resource, versionId, tokens, stateDeltas);
        }
    }
    exports.TextMateTokenizationWorker = TextMateTokenizationWorker;
    function create(ctx, createData) {
        return new TextMateTokenizationWorker(ctx, createData);
    }
    exports.create = create;
});

}).call(this);
//# sourceMappingURL=textMate.worker.js.map

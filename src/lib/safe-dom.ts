export function withDocument<TReturn = void>(fn: (document: Document) => TReturn) {
    if (typeof document !== "undefined") {
        return fn(document);
    }
}

export function withWindow<TReturn = void>(fn: (window: Window & typeof globalThis) => TReturn) {
    if (typeof window !== "undefined") {
        return fn(window);
    }
}

export function withLocation<TReturn = void>(fn: (location: Location) => TReturn) {
    if (typeof location !== "undefined") {
        return fn(location);
    }
}
import { BeforeRequestListener } from "../types";

// function isFunction(x: any): x is Function
export function isFunction(x: BeforeRequestListener | Electron.Filter): x is BeforeRequestListener {
    return typeof x === "function"
}

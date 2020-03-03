export function isFilter(x: object): x is Electron.Filter {
    return "urls" in x
}
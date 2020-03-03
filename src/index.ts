import { session, WebRequest, protocol } from "electron";
import { isFilter } from "./typeguards/isFilter";
import { BeforeRequestListener } from "./types";
import { isFunction } from "./typeguards/isFunction";



function onBeforeRequest<C extends MITM<string | WebRequest> | WebRequest, T extends BeforeRequestListener>(this: C, listener: BeforeRequestListener): void 
function onBeforeRequest<C extends MITM<string | WebRequest> | WebRequest, T extends Electron.Filter>(this: C, filter: Electron.Filter, listener: BeforeRequestListener): void 
function onBeforeRequest<C extends MITM<string | WebRequest> | WebRequest, T>(this: C, paramOne: T extends Electron.Filter ? Electron.Filter : BeforeRequestListener, paramTwo?: T extends Electron.Filter ? BeforeRequestListener : undefined): void{

    if("function" === typeof paramOne){

    } else {

    }
}

export default class MITM<T> {

    
    scheme!: string
    webRequest!: WebRequest
    detailsMap: Map<number, Electron.OnBeforeRequestListenerDetails> = new Map<number, Electron.OnBeforeRequestListenerDetails>();
    listener(details: Electron.OnBeforeRequestListenerDetails, cb:(response: Electron.Response)=> void): void{
        
        if(new RegExp("^" + this.scheme, "i").test(details.url)){
            
            cb({
                cancel: false
            })
        }
        else {
            this.detailsMap.set(details.id, details);
            cb({
                cancel: false,
                redirectURL: `${this.scheme}://./index.html?${details.id}`
            })
        }
    }
    origOnBeforeRequest!: typeof session.defaultSession.webRequest.onBeforeRequest
    constructor(scheme?: T extends string ? string : WebRequest, webRequest?: T extends string ? WebRequest: undefined) {

        if(typeof scheme === "string" || (scheme === undefined && webRequest)){

            this.scheme = scheme || "mitm"
            this.webRequest = (webRequest || session.defaultSession.webRequest) as WebRequest;
        } else {
            this.scheme = "mitm"
            this.webRequest = (scheme || session.defaultSession.webRequest) as WebRequest;
        }
        this.origOnBeforeRequest = this.webRequest.onBeforeRequest;
        //@ts-ignore
        this.webRequest.onBeforeRequest = this.onBeforeRequest.bind(this)
        this.registerProtocol()
    }
    on(){
        this.origOnBeforeRequest = this.webRequest.onBeforeRequest
        this.webRequest.onBeforeRequest = this.onBeforeRequest
        this.origOnBeforeRequest.call(this.webRequest, this.listener)
    }
    off(){
        this.webRequest.onBeforeRequest = this.origOnBeforeRequest
        if(this.addedCallbackRule){

            if(this.addedFilter){
                this.webRequest.onBeforeRequest(this.addedFilter, this.addedCallbackRule)
            } else {
                this.webRequest.onBeforeRequest(this.addedCallbackRule)
            }
        } else {
            this.webRequest.onBeforeRequest(null)
        }
    }
    private addedFilter?: Electron.Filter
    private addedCallbackRule?: BeforeRequestListener
    private onBeforeRequest<T extends BeforeRequestListener>(this: MITM<string | WebRequest>, listener: BeforeRequestListener): void 
    private onBeforeRequest<T extends Electron.Filter>(this: MITM<string | WebRequest>, filter: Electron.Filter, listener: BeforeRequestListener): void 
    private onBeforeRequest<T>(this: MITM<string | WebRequest>, paramOne: T extends Electron.Filter ? Electron.Filter : BeforeRequestListener, paramTwo?: T extends Electron.Filter ? BeforeRequestListener : undefined): void {

        if(isFilter(paramOne)){

            this.addedFilter = paramOne
            this.addedCallbackRule = paramTwo
        } else if(isFunction(paramOne)){

            this.addedCallbackRule = paramOne
            this.addedFilter = undefined
        }
    }
    private registerProtocol(){
        protocol.registerBufferProtocol(this.scheme, this.protocolHandler);
    }
    private async protocolHandler(
        request: Electron.Request, cb: (buffer?: Buffer | Electron.MimeTypedBuffer | undefined) => void,
        completion?: ((error: Error) => void) | undefined
    ){

        const id = +request.url.split("?")[1]
        if(Number.isNaN(id)) throw Error("invalid request id: " + request.url);
        const details = this.detailsMap.get(id)
        // before headers send 

        // before data recived
        // if(details){
        console.log(this.addedCallbackRule)
        this.addedCallbackRule
        //@ts-ignore
        && this.addedCallbackRule(details, () => {})
        // }
    }
}


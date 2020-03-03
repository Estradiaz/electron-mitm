
import { WebRequest } from "electron"
import MITM from "../src"
import { mockWebRequest, getWebRequest, protocol, session } from "../__mocks__/electron"

describe("men in the middle for electron webRequest", function(){

    

    beforeEach(function(){

        Object.entries(mockWebRequest)
        .forEach(([key, jestFn]) => {
            jestFn.mockClear && jestFn.mockClear()
        })
        getWebRequest.mockClear()
        protocol.registerBufferProtocol.mockClear()
    })

    it("should create an instance of MITM with webRequest as first argument", function(){

        let mitm = (new MITM<WebRequest>(mockWebRequest))
        expect( mitm instanceof MITM).toBe(true) 
        expect(getWebRequest).not.toBeCalled()
        expect(mitm.scheme).toBe("mitm")
    })
    it("should create an instance of MITM with scheme as first argument", function(){

        let mitm = (new MITM<string>("proxy"))
        expect(mitm instanceof MITM).toBe(true)
        expect(getWebRequest).toBeCalledTimes(1)
        expect(mitm.scheme).toBe("proxy")
    })
    it("should create an instance of MITM without arguments", function(){

        let mitm = (new MITM<any>())
        expect(mitm instanceof MITM).toBe(true)
        expect(getWebRequest).toBeCalledTimes(1)
        expect(mitm.scheme).toBe("mitm")
    })
    it("should create an instance of MITM with scheme as first argument and webRequest as second argument", function(){
        
        let mitm = (new MITM<string>("proxy", mockWebRequest))
        expect( mitm instanceof MITM).toBe(true)
        expect(getWebRequest).not.toBeCalled()
    })
    const schemes = [
        {
            in: "proxy",
            out: "proxy"
        },
        {
            in: "anything",
            out: "anything"
        }, 
        {
            in: undefined,
            out: "mitm"
        }, 
    ]
    schemes.forEach(scheme => {

        it("should register a buffer protocol based on instance schme", function(){
    
            let mitm = (new MITM<string>(scheme.in, mockWebRequest))
            expect(mitm.scheme).toBe(scheme.out)
            expect(protocol.registerBufferProtocol).toBeCalledWith(scheme.out, expect.anything())
        })
    })

    const request
    // : Electron.OnBeforeRequestListenerDetails 
    = {
        id: Math.random() * 100 | 0,
        url: "https://www.google.de",
        method: "GET",
    }
    
    it("should forward the request to scheme://./index.html?:id", function(){
        let mitm = new MITM()
        let cb = jest.fn()
        mitm.listener(request as any, cb)
        expect(cb).toBeCalledWith({
            cancel: false, 
            redirectURL: `mitm://./index.html?${request.id}`
        })
        expect(mitm.detailsMap.get(request.id)).toEqual({
            ...request
        })
    })
    it("should not intercept traffic to scheme://./index.html?:id", function(){
        let mitm = new MITM()
        let cb = jest.fn()
        request.url = "mitm://./index.html?" + request.id
        mitm.listener(request as any, cb)
        expect(cb).toBeCalledWith({
            cancel: false, 
        })
    })
    it("should register one additional webRequestListener", function(){

        let mitm = new MITM()
        let listener = jest.fn()
        session.defaultSession.webRequest.onBeforeRequest(listener)
        //@ts-ignore
        expect(mitm.addedCallbackRule).toBe(listener)
        let cb = jest.fn()
        request.url = "https://www.google.de"
        mitm.listener(request as any, cb)
        expect(cb).toBeCalledWith({
            cancel: false, 
            redirectURL: `mitm://./index.html?${request.id}`
        })
        expect(mitm.detailsMap.get(request.id)).toEqual({
            ...request,
        })
        request.url = `mitm://./index.html?${request.id}`
        //@ts-ignore
        mitm.protocolHandler(request)
        expect(listener).toBeCalled()
    })
})
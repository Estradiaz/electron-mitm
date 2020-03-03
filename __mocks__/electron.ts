import { protocol as prtcl, WebRequest } from "electron";

export const mockWebRequest 
// : WebRequest
= {
    onBeforeRedirect: jest.fn(),
    onBeforeRequest: jest.fn(),
    onBeforeSendHeaders: jest.fn(),
    onCompleted: jest.fn(),
    onErrorOccurred: jest.fn(),
    onHeadersReceived: jest.fn(),
    onResponseStarted: jest.fn(),
    onSendHeaders: jest.fn(),
}

export const getWebRequest = jest.fn()
getWebRequest.mockReturnValue(mockWebRequest);
export const setWebRequest = jest.fn()
export const session = {
    defaultSession: {
        get webRequest(): WebRequest {
            return getWebRequest()
        },
        set webRequest(webRequest: WebRequest){
            setWebRequest(webRequest)
        }
    }
}
export const protocol
// : typeof prtcl 
= {

    registerBufferProtocol: jest.fn()
}

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

/////////////////////////////////////////////////////////////////////////////////////////
/// Built-in interceptors supported in Winery.js

import { log } from 'napajs';
import * as utils from './utils';

import { ResponseCode, Response } from './response'
import { RequestContext } from './request-context'

/// <summary> Interceptor: pass through.
/// This interceptor is used for debug purpose when doing per-request override
/// <summary> 
export async function passThrough(
    context: RequestContext): Promise<Response> {
    return await context.continueExecution();
}

/// <summary> Interceptor: short circuit. 
/// This interceptor is used for debug purpose when doing per-request override
/// <summary> 
export async function shortCircuit(
    context: RequestContext): Promise<Response> {
    return Promise.resolve({
        responseCode: ResponseCode.Success
    });
}

/// <summary> Interceptor: execute entryPoint </summary>
export async function executeEntryPoint(
    context: RequestContext): Promise<Response> {

    let response = await context.continueExecution();
    response.output = await utils.makePromiseIfNotAlready(
            context.entryPoint(context, context.input));

    return response;
}

/// <summary> Interceptor: log request only. </summary>
export async function logRequest(
    context: RequestContext): Promise<Response> {

    log.debug(JSON.stringify(context.request));
    return await context.continueExecution();
}

/// <summary> Interceptor: log response only. </summary>
export async function logResponse(
    context: RequestContext): Promise<Response> {
    
    let response = await context.continueExecution();
    log.debug(JSON.stringify(response));
    return response;
}

/// <summary> Interceptor: log request and response. </summary>
export async function logRequestResponse(
    context: RequestContext): Promise<Response> {

    log.debug(JSON.stringify(context.request));
    let response = await context.continueExecution();
    log.debug(JSON.stringify(response));
    return response;
}

/// <summary> Interceptor: finalize response </summary>
export async function finalizeResponse(
    context: RequestContext): Promise<Response> {

    let response = await context.continueExecution();

    // Attach debug info if needed.
    if (context.controlFlags.debug) {
        response.debugInfo = context.debugger.getOutput();
    }

    // Attach performance data if needed.
    if (context.controlFlags.perf) {
        response.perfInfo = context.perf.data;
    }

    return response;
}

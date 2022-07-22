"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContext = void 0;
class MessageContext {
    constructor() {
        this.ApplicationName = "Telemetry Application";
        this.CreatedBy = "Telemetry User";
        this.CreatedAt = (new Date()).toString();
        this.UserId = "Telemetry User ID";
        this.CustomProperties = {};
    }
}
exports.MessageContext = MessageContext;

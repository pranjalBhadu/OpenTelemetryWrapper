"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryProvider = void 0;
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const sdk_trace_node_1 = require("@opentelemetry/sdk-trace-node");
const monitor_opentelemetry_exporter_1 = require("@azure/monitor-opentelemetry-exporter");
const sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
const api_1 = require("@opentelemetry/api");
const TelemetryConstants_1 = require("./TelemetryConstants");
const MessageContext_1 = require("./MessageContext");
class TelemetryProvider {
    constructor(TracerName, TracerVersion, ConnectionString) {
        this.TelemetryExporter = new monitor_opentelemetry_exporter_1.AzureMonitorTraceExporter({
            connectionString: ConnectionString
        });
        this.TelemetryProcessor = new sdk_trace_base_1.BatchSpanProcessor(this.TelemetryExporter);
        this.TelemetryResource =
            resources_1.Resource.default().
                merge(new resources_1.Resource({
                [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: TelemetryConstants_1.TelemetryConstants.ServiceName,
                [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: TelemetryConstants_1.TelemetryConstants.ServiceVersion,
            }));
        this.Provider = new sdk_trace_node_1.NodeTracerProvider({
            resource: this.TelemetryResource,
        });
        this.Provider.addSpanProcessor(this.TelemetryProcessor);
        this.Provider.register();
        api_1.trace.setGlobalTracerProvider(this.Provider);
        this.TelemetryTracer = api_1.trace.getTracer(TracerName, TracerVersion);
    }
    startTracing(spanName, parentSpan = undefined, kind = 0, message = undefined) {
        const spanKind = this.getSpanKind(kind);
        let ctx;
        if (parentSpan == undefined) {
            ctx = api_1.ROOT_CONTEXT;
        }
        else {
            ctx = api_1.trace.setSpan(this.getActiveContext(), parentSpan);
        }
        const span = this.TelemetryTracer.startSpan(spanName, { kind: spanKind }, ctx);
        if (message != undefined) {
            this.setSpanTags(span, message);
        }
        else {
            this.setInitialTags(span);
        }
        return span;
    }
    addTraceEvent(span, name, attrOrStartTime, startTime) {
        span.addEvent(name, attrOrStartTime, startTime);
    }
    getTelemetryTracer() {
        return this.TelemetryTracer;
    }
    getActiveContext() {
        return api_1.context.active();
    }
    getSpanKind(kind) {
        if (kind == 0)
            return api_1.SpanKind.INTERNAL;
        else if (kind == 1)
            return api_1.SpanKind.SERVER;
        else if (kind == 2)
            return api_1.SpanKind.CLIENT;
        else if (kind == 3)
            return api_1.SpanKind.PRODUCER;
        return api_1.SpanKind.CONSUMER;
    }
    setSpanTags(span, message) {
        if (message == null) {
            throw new Error("NULL MESSAGE PASSED!!");
        }
        if (span.isRecording()) {
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.TelemetryAppName, message.ApplicationName);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.CreatedBy, message.CreatedBy);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.CreatedAt, message.CreatedAt);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.UserId, message.UserId);
            if (message.CustomProperties != {}) {
                for (const [key, value] of Object.entries(message.CustomProperties)) {
                    span.setAttribute(TelemetryConstants_1.TelemetryConstants.TelemetryCustomProperties + "." + key, value);
                }
            }
        }
    }
    setInitialTags(span) {
        const message = new MessageContext_1.MessageContext();
        if (span.isRecording()) {
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.TelemetryAppName, message.ApplicationName);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.CreatedBy, message.CreatedBy);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.CreatedAt, message.CreatedAt);
            span.setAttribute(TelemetryConstants_1.TelemetryConstants.UserId, message.UserId);
        }
    }
    endTracing(span, endTime) {
        span.end(endTime);
    }
    getMessageContext() {
        return new MessageContext_1.MessageContext();
    }
}
exports.TelemetryProvider = TelemetryProvider;

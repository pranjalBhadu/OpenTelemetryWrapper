import { Resource } from "@opentelemetry/resources";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SpanKind, Context, Span, Tracer, TimeInput, Attributes } from "@opentelemetry/api";
import { MessageContext } from "./MessageContext";
export declare class TelemetryProvider {
    TelemetryResource: Resource;
    Provider: NodeTracerProvider;
    TelemetryExporter: AzureMonitorTraceExporter;
    TelemetryProcessor: BatchSpanProcessor;
    TelemetryTracer: Tracer;
    constructor(TracerName: string, TracerVersion: string, ConnectionString: string);
    startTracing(spanName: string, parentSpan?: Span | undefined, kind?: number, message?: MessageContext | undefined): Span;
    addTraceEvent(span: Span, name: string, attrOrStartTime?: Attributes | TimeInput, startTime?: TimeInput): void;
    getTelemetryTracer(): Tracer;
    getActiveContext(): Context;
    getSpanKind(kind: number): SpanKind;
    setSpanTags(span: Span, message: MessageContext): void;
    setInitialTags(span: Span): void;
    endTracing(span: Span, endTime?: TimeInput): void;
    getMessageContext(): MessageContext;
}

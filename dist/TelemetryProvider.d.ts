import { Resource } from "@opentelemetry/resources";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { AzureMonitorTraceExporter } from "@azure/monitor-opentelemetry-exporter";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { SpanKind, Context, Span, Tracer } from "@opentelemetry/api";
export declare class TelemetryProvider {
    TelemetryResource: Resource;
    Provider: NodeTracerProvider;
    TelemetryExporter: AzureMonitorTraceExporter;
    TelemetryProcessor: BatchSpanProcessor;
    TelemetryTracer: Tracer;
    constructor(TracerName: string, TracerVersion: string, ConnectionString: string);
    startTracing(spanName: string, parentSpan?: Span | undefined, kind?: number, attributes?: Object | null): Span;
    getTelemetryTracer(): Tracer;
    getActiveContext(): Context;
    getSpanKind(kind: number): SpanKind;
    setSpanTags(span: Span, attributes: Object): void;
    endTracing(span: Span): void;
}

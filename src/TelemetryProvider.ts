import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {AzureMonitorTraceExporter} from "@azure/monitor-opentelemetry-exporter"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { trace, SpanKind, Context, Span, Tracer, context, SpanContext, ROOT_CONTEXT, TimeInput, Attributes }  from "@opentelemetry/api";
import { TelemetryConstants } from "./TelemetryConstants";
import {MessageContext} from "./MessageContext";

export class TelemetryProvider{
    TelemetryResource: Resource;
    Provider: NodeTracerProvider;
    TelemetryExporter: AzureMonitorTraceExporter;
    TelemetryProcessor: BatchSpanProcessor;
    TelemetryTracer: Tracer;

    constructor(TracerName: string, TracerVersion: string, ConnectionString: string){
        this.TelemetryExporter = new AzureMonitorTraceExporter({
            connectionString: ConnectionString
        });
        this.TelemetryProcessor = new BatchSpanProcessor(this.TelemetryExporter);

        this.TelemetryResource =
        Resource.default().
        merge(
            new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: TelemetryConstants.ServiceName,
                [SemanticResourceAttributes.SERVICE_VERSION]: TelemetryConstants.ServiceVersion,
            })
        );
        this.Provider = new NodeTracerProvider({
            resource: this.TelemetryResource,
        });
        this.Provider.addSpanProcessor(this.TelemetryProcessor)
        this.Provider.register();
        trace.setGlobalTracerProvider(this.Provider)
        this.TelemetryTracer = trace.getTracer(TracerName, TracerVersion)
    }

    startTracing(spanName: string, parentSpan: Span|undefined = undefined, kind: number = 0, message: MessageContext|undefined = undefined): Span{
        const spanKind: SpanKind =  this.getSpanKind(kind);
        let ctx: Context;
        if(parentSpan == undefined){
            ctx = ROOT_CONTEXT
        }else{
            ctx = trace.setSpan(this.getActiveContext(), parentSpan)
        }
        const span: Span = this.TelemetryTracer.startSpan(spanName, {kind: spanKind}, ctx);
        if(message != undefined){
            this.setSpanTags(span, message);
        }else{
            this.setInitialTags(span);
        }
        return span
    }

    addTraceEvent(span: Span, name: string, attrOrStartTime?: Attributes|TimeInput, startTime?: TimeInput): void{
        span.addEvent(name, attrOrStartTime, startTime);
    }

    getTelemetryTracer(): Tracer{
        return this.TelemetryTracer;
    }

    getActiveContext(): Context{
        return context.active();
    }

    getSpanKind(kind: number): SpanKind {
        if(kind == 0) return SpanKind.INTERNAL
        else if(kind == 1) return SpanKind.SERVER
        else if(kind == 2) return SpanKind.CLIENT
        else if(kind == 3) return SpanKind.PRODUCER
        return SpanKind.CONSUMER
    }

    setSpanTags(span: Span, message: MessageContext): void {
        if(message == null){
            throw new Error("NULL MESSAGE PASSED!!")
        }

        if(span.isRecording()){
            span.setAttribute(TelemetryConstants.TelemetryAppName, message.ApplicationName);
            span.setAttribute(TelemetryConstants.CreatedBy, message.CreatedBy)
            span.setAttribute(TelemetryConstants.CreatedAt, message.CreatedAt)
            span.setAttribute(TelemetryConstants.UserId, message.UserId)
            if(message.CustomProperties != {}){
                for (const [key, value] of Object.entries(message.CustomProperties)){
                    span.setAttribute(TelemetryConstants.TelemetryCustomProperties + "." +key, value)
                }
            }
        }
    }

    setInitialTags(span: Span): void{
        const message: MessageContext = new MessageContext();
        if(span.isRecording()){
            span.setAttribute(TelemetryConstants.TelemetryAppName, message.ApplicationName);
            span.setAttribute(TelemetryConstants.CreatedBy, message.CreatedBy)
            span.setAttribute(TelemetryConstants.CreatedAt, message.CreatedAt)
            span.setAttribute(TelemetryConstants.UserId, message.UserId)
        }
    }

    endTracing(span: Span, endTime?: TimeInput): void{
        span.end(endTime);
    }

    getMessageContext(): MessageContext{
        return new MessageContext();
    }
}
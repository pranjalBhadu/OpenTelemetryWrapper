export class MessageContext{
    public ApplicationName:string = "Telemetry Application";
    public CreatedBy: string = "Telemetry User";
    public CreatedAt: string = (new Date()).toString();
    public UserId: string = "Telemetry User ID";
    public CustomProperties: Object = {};
}
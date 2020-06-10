 
import { ObjectType, Field } from "type-graphql";
import { PlaybackData } from "./PlaybackData";

@ObjectType()
export class DocumentUpdateNotification {
    @Field()
    id: string;
  
    @Field()
    name: string;
  
    @Field()
    data: PlaybackData;
  
    @Field({nullable:true})
    timestamp: string;
}

export interface DocumentUpdateNotificationPayload {
    documentId: string;
    data: PlaybackData;
    name: string;
}
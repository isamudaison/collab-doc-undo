 
import { ObjectType, Field } from "type-graphql";
import { PlaybackData } from "./PlaybackData";

@ObjectType()
export class DocumentCreateNotification {
  @Field()
  documentId: string;

  @Field()
  name: string;

  @Field()
  data: PlaybackData;

  @Field({nullable:true})
  timestamp: string;
}

export interface DocumentCreateNotificationPayload {
  documentId: string;
  data: PlaybackData;
  name: string;
}
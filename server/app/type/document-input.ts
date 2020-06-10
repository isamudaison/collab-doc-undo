import { InputType, Field, ID} from "type-graphql";
import { Document } from "../type/Document";
import { PlaybackDataInput } from "./PlaybackData";

@InputType()
export class DocumentInput implements Partial<Document> {

  @Field(() => ID) 
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field({nullable:true})
  timestamp?: string;

  @Field(() => PlaybackDataInput)
  data: PlaybackDataInput;

}
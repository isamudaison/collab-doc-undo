
import { ObjectType, Field, ID} from "type-graphql";

@ObjectType({ description: "The Document model" })
export  class Document {
  @Field(() => ID)
  documentId: string;

  @Field()
  ownerId: string;

  @Field()
  body: string;

  @Field({nullable:true})
  timestamp?: string;
}
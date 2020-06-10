
import { InputType, ObjectType, Field, Int} from "type-graphql";
import { DocumentAction } from "./DocumentAction";

@ObjectType({ description: "The model for tracking LedgerEntry details" })
export  class PlaybackData {
    @Field()
    ownerId: string;  

    @Field(() => Int)
    charStart: number;

    @Field(() => Int, {nullable:true})
    updateLength?: number;

    @Field({nullable:true})
    data?: string;

    @Field(() => DocumentAction)
    action: DocumentAction;
}

@InputType()
export class PlaybackDataInput {

    @Field()
    ownerId: string;  

    @Field(() => Int)
    charStart: number;

    @Field(() => Int, {nullable:true})
    updateLength?: number;

    @Field({nullable:true})
    data?: string;

    @Field(() => DocumentAction)
    action: DocumentAction;
}
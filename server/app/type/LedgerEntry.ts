
import { ObjectType, Field} from "type-graphql";
import { PlaybackData } from "./PlaybackData";

@ObjectType({ description: "The LedgerEntry model" })
export  class LedgerEntry {
    @Field()
    ownerId: string;  

    @Field()
    data: PlaybackData;

    @Field()
    timestamp:string;
}
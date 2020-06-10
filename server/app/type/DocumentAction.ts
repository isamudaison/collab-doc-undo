import { registerEnumType } from "type-graphql";


/**
 * Enum class to track LedgerEntry 'actions'
 * Should be shared with the client
 */
export enum DocumentAction{
    CREATE,ADD,DELETE
}

registerEnumType(DocumentAction, {
    name: "DocumentAction",
    description: "All possible actions to perform on a document",
  });
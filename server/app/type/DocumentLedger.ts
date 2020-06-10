
import { LedgerEntry } from "./LedgerEntry";
import { Stack } from "stack-typescript";

export  class DocumentLedger extends Map<string, Stack<LedgerEntry>> {
    //TODO: adding things here to track things like: persistence, locking, etc.
   
}
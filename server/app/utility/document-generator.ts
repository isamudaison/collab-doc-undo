import { LedgerEntry } from "../type/LedgerEntry";
import { Document } from "../type/Document";
import { Stack } from "stack-typescript";
import { PlaybackData } from "../type/PlaybackData";
import { DocumentAction } from "../type/DocumentAction";
import { DocumentInput } from "../type/document-input";

export class DocumentGenerator{
    
    private static applyPlaybackData(body:string, playbackData:PlaybackData):string{

        if(!body) body = "";

        const firstPartOfString = body.substring(0, playbackData.charStart);

        const endIndexOfUpdate = playbackData.charStart+1;

        const secondPartOfString = body.substring(endIndexOfUpdate);

        switch(playbackData.action){
            case DocumentAction.ADD:

                body = `${firstPartOfString}${playbackData.data}${secondPartOfString}`;  

                break;
            case DocumentAction.DELETE:

                body = `${firstPartOfString}${secondPartOfString}`; 

                break;
            default:
                // Don't do anything
                break;
        }

        return body;

    }

    public static generateDocument(documentId:string, ledgerEntries:Stack<LedgerEntry>):Document{

        const document = new Document();

        if(!documentId || !ledgerEntries){
            return document;
        }
        document.documentId = documentId;

        const ledgerStackAsArray:LedgerEntry[] = ledgerEntries.toArray();

        var documentBody:string = "";

        for(var i = ledgerStackAsArray.length-1; i > -1; i--){

            var ledgerEntry:LedgerEntry = ledgerStackAsArray[i];

            if(!document.ownerId){
                document.ownerId = ledgerEntry.ownerId;
            }

            documentBody = this.applyPlaybackData(documentBody, ledgerEntry.data);            
        }

        document.body = documentBody;

        return document;

    }

    public static generateReverseLedgerEntry(ledgerEntry:LedgerEntry):LedgerEntry{

        switch(ledgerEntry.data.action){

            case DocumentAction.ADD:
                ledgerEntry.data.action = DocumentAction.DELETE;
                break;
            case DocumentAction.DELETE:
                ledgerEntry.data.action = DocumentAction.ADD;
                break;
            default:
                break;

        }

        return ledgerEntry;
    }

    public static generateNewLedgerEntry(data: DocumentInput): LedgerEntry {
        const newLedgerEntry = new LedgerEntry();

        newLedgerEntry.ownerId = data.ownerId;
        newLedgerEntry.timestamp = data.timestamp ? data.timestamp.toString() : new Date().toString();
        newLedgerEntry.data = data.data;

        return newLedgerEntry;
    }


}
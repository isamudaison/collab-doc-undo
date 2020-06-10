import { Resolver, Mutation, Arg, Query, PubSub, PubSubEngine, Root, Subscription, Publisher } from "type-graphql";
import { LedgerEntry } from "../type/LedgerEntry";
import { DocumentLedger } from "../type/DocumentLedger";
import { DocumentInput } from "../type/document-input";
import { Document } from "../type/Document";
import { Stack } from "stack-typescript";
import { DocumentCreateNotificationPayload, DocumentCreateNotification } from "../type/DocumentCreate";
import { DocumentUpdateNotificationPayload, DocumentUpdateNotification } from "../type/DocumentUpdate";
import { DocumentAction } from "../type/DocumentAction";
import { DocumentGenerator } from "../utility/document-generator";


@Resolver()
export class DocumentResolver {

    private documentLedger: DocumentLedger = new DocumentLedger();
    
    @Query(() => Document || Boolean,{nullable:true})
    async getDocument(@Arg("documentId") documentId:string): Promise<Document | Boolean> {

        var ledgerEntryStack = this.documentLedger.get(documentId);

        if(!ledgerEntryStack) return false;

        return DocumentGenerator.generateDocument(documentId, ledgerEntryStack);           
    }

    @Subscription({ topics: "DOC_CREATE" })
    createDocumentSubscription(@Root() { documentId, data, name }: DocumentCreateNotificationPayload): DocumentCreateNotification {
        return { documentId, data, name, timestamp: new Date().toString() };
    }

    @Subscription({ topics: "DOC_UPDATE" })
    updateDocumentSubscription(@Root() { documentId, data, name }: DocumentUpdateNotificationPayload): DocumentUpdateNotification {
        return { id: documentId, data, name, timestamp: new Date().toString() };
    }

    @Mutation(() => LedgerEntry, {nullable:true})
    async updateDocument(
        @PubSub() pubSub: PubSubEngine,
        @Arg("data") data: DocumentInput): Promise<LedgerEntry | Boolean> {

        var ledgerEntryStack = this.documentLedger.get(data.name);
        var newLedgerEntry = null;
        var publishTopic: string = "";

        if (DocumentAction.CREATE === data.data.action) {
            //we're in 'document creation' mode
            if (ledgerEntryStack) {
                // There already exists a Document with data.data.id
                return false;
            }

            publishTopic = "DOC_CREATE";

            ledgerEntryStack = new Stack<LedgerEntry>();
            this.documentLedger.set(data.name, ledgerEntryStack);
        }
        else {
            //we're adding to/removing data from an existing document
            if (!ledgerEntryStack) {
                // There is no Document with data.data.id
                return false;
            }

            publishTopic = "DOC_UPDATE";
        }

        newLedgerEntry = DocumentGenerator.generateNewLedgerEntry(data);

        ledgerEntryStack.push(newLedgerEntry);

        await pubSub.publish(publishTopic, { documentId: data.id, name: data.name, data: data.data });


        return newLedgerEntry;
    };

    @Mutation(() => LedgerEntry)
    async undo(
        @PubSub("DOC_UPDATE") publish: Publisher<DocumentUpdateNotificationPayload>,
        @Arg("documentId") documentId: string): Promise<Boolean> {

        var ledgerEntryStack = this.documentLedger.get(documentId);

         //we're adding to/removing data from an existing document
         if (!ledgerEntryStack) {
            // There is no Document with documentId
            return false;
        }

        var reversedLedgerEntry = DocumentGenerator.generateReverseLedgerEntry(ledgerEntryStack.pop());
          
        await publish({ documentId, name: reversedLedgerEntry.data.ownerId, data: reversedLedgerEntry.data });

        return true;
    };
}
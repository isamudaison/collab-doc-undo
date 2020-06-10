import "reflect-metadata";
import { DocumentGenerator } from './document-generator';
import { Stack } from 'stack-typescript';
import { LedgerEntry } from '../type/LedgerEntry';
import { PlaybackData } from '../type/PlaybackData';
import { DocumentAction } from '../type/DocumentAction';

const OWNER_ID:string = "ownerID-1";
const CREATE_PLAYBACK:PlaybackData = new PlaybackData();
CREATE_PLAYBACK.action = DocumentAction.CREATE;
CREATE_PLAYBACK.charStart = 0;
CREATE_PLAYBACK.ownerId = OWNER_ID;

const CREATE_LEDGER_ENTRY:LedgerEntry = new LedgerEntry();
CREATE_LEDGER_ENTRY.ownerId = OWNER_ID;
CREATE_LEDGER_ENTRY.data = CREATE_PLAYBACK;

const SIMPLE_LEDGER_ENTRY:LedgerEntry = new LedgerEntry();
SIMPLE_LEDGER_ENTRY.ownerId = OWNER_ID;

describe('Tests the DocumentGenerator class', () => {
    it('Should assemble a single entry document properly', async () => {

        const documentId:string = "docu_ID";

        const ledgerEntries:Stack<LedgerEntry> = new Stack();
        ledgerEntries.push(CREATE_LEDGER_ENTRY);

        const simplePlaybackData:PlaybackData = new PlaybackData();
        simplePlaybackData.action = DocumentAction.ADD;
        simplePlaybackData.charStart = 0;
        simplePlaybackData.data = "abc-123";
        simplePlaybackData.ownerId = OWNER_ID;

        SIMPLE_LEDGER_ENTRY.data = simplePlaybackData;

        ledgerEntries.push(SIMPLE_LEDGER_ENTRY);
          
        const result = DocumentGenerator.generateDocument(documentId, ledgerEntries);
      
    expect(result.ownerId).toBe(OWNER_ID);
    expect(result.documentId).toBe(documentId);
    expect(result.body).toBe("abc-123");

  });
  it('Should assemble a multiple ADD entry document properly', async () => {

        const documentId:string = "docu_ID";

        const ledgerEntries:Stack<LedgerEntry> = new Stack();
        ledgerEntries.push(CREATE_LEDGER_ENTRY);

        const simplePlaybackDataOne:PlaybackData = new PlaybackData();
        simplePlaybackDataOne.action = DocumentAction.ADD;
        simplePlaybackDataOne.charStart = 0;
        simplePlaybackDataOne.data = "abc-123";
        simplePlaybackDataOne.ownerId = OWNER_ID;

        const ledgerEntryOne:LedgerEntry = new LedgerEntry();
        ledgerEntryOne.ownerId = OWNER_ID;

        ledgerEntryOne.data = simplePlaybackDataOne;

        ledgerEntries.push(ledgerEntryOne);

        const simplePlaybackDataTwo:PlaybackData = new PlaybackData();
        simplePlaybackDataTwo.action = DocumentAction.ADD;
        simplePlaybackDataTwo.charStart = 7;
        simplePlaybackDataTwo.data = "xyz-987";
        simplePlaybackDataTwo.ownerId = OWNER_ID;

        const ledgerEntryTwo:LedgerEntry = new LedgerEntry();
        ledgerEntryTwo.ownerId = OWNER_ID;

        ledgerEntryTwo.data = simplePlaybackDataTwo;

        ledgerEntries.push(ledgerEntryTwo);


          
        const result = DocumentGenerator.generateDocument(documentId, ledgerEntries);
      
    expect(result.ownerId).toBe(OWNER_ID);
    expect(result.documentId).toBe(documentId);
    expect(result.body).toBe("abc-123xyz-987");

  });
  it('Should assemble with both ADD and DELETE entry document properly', async () => {

        const documentId:string = "docu_ID";

        const ledgerEntries:Stack<LedgerEntry> = new Stack();
        ledgerEntries.push(CREATE_LEDGER_ENTRY);

        const simplePlaybackDataOne:PlaybackData = new PlaybackData();
        simplePlaybackDataOne.action = DocumentAction.ADD;
        simplePlaybackDataOne.charStart = 0;
        simplePlaybackDataOne.data = "abc-123";
        simplePlaybackDataOne.ownerId = OWNER_ID;

        const ledgerEntryOne:LedgerEntry = new LedgerEntry();
        ledgerEntryOne.ownerId = OWNER_ID;

        ledgerEntryOne.data = simplePlaybackDataOne;

        ledgerEntries.push(ledgerEntryOne);

        const simplePlaybackDataTwo:PlaybackData = new PlaybackData();
        simplePlaybackDataTwo.action = DocumentAction.DELETE;
        simplePlaybackDataTwo.charStart = 3;
        simplePlaybackDataTwo.data = "-";
        simplePlaybackDataTwo.ownerId = OWNER_ID;

        const ledgerEntryTwo:LedgerEntry = new LedgerEntry();
        ledgerEntryTwo.ownerId = OWNER_ID;

        ledgerEntryTwo.data = simplePlaybackDataTwo;

        ledgerEntries.push(ledgerEntryTwo);


          
        const result = DocumentGenerator.generateDocument(documentId, ledgerEntries);
      
    expect(result.ownerId).toBe(OWNER_ID);
    expect(result.documentId).toBe(documentId);
    expect(result.body).toBe("abc123");

  });
  it('Should assemble with ADD, DELETE, and UNDO entries document properly', async () => {

    const documentId:string = "docu_ID";

    const ledgerEntries:Stack<LedgerEntry> = new Stack();
    ledgerEntries.push(CREATE_LEDGER_ENTRY);

    const simplePlaybackDataOne:PlaybackData = new PlaybackData();
    simplePlaybackDataOne.action = DocumentAction.ADD;
    simplePlaybackDataOne.charStart = 0;
    simplePlaybackDataOne.data = "abc-123";
    simplePlaybackDataOne.ownerId = OWNER_ID;

    const ledgerEntryOne:LedgerEntry = new LedgerEntry();
    ledgerEntryOne.ownerId = OWNER_ID;

    ledgerEntryOne.data = simplePlaybackDataOne;

    ledgerEntries.push(ledgerEntryOne);

    const simplePlaybackDataTwo:PlaybackData = new PlaybackData();
    simplePlaybackDataTwo.action = DocumentAction.DELETE;
    simplePlaybackDataTwo.charStart = 3;
    simplePlaybackDataTwo.data = "-";
    simplePlaybackDataTwo.ownerId = OWNER_ID;

    const ledgerEntryTwo:LedgerEntry = new LedgerEntry();
    ledgerEntryTwo.ownerId = OWNER_ID;

    ledgerEntryTwo.data = simplePlaybackDataTwo;

    ledgerEntries.push(ledgerEntryTwo);
                
    const result = DocumentGenerator.generateDocument(documentId, ledgerEntries);
      
    expect(result.ownerId).toBe(OWNER_ID);
    expect(result.documentId).toBe(documentId);
    expect(result.body).toBe("abc123");

    // Now we put an undo LedgerEntry on the stack and re-generate

    const undoLedgerEntry:LedgerEntry = DocumentGenerator.generateReverseLedgerEntry(ledgerEntryTwo);

    ledgerEntries.push(undoLedgerEntry);

    const undoResult = DocumentGenerator.generateDocument(documentId, ledgerEntries);
      
    expect(undoResult.ownerId).toBe(OWNER_ID);
    expect(undoResult.documentId).toBe(documentId);
    expect(undoResult.body).toBe("abc-123");
  })
});
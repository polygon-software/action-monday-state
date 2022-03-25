import monday from '../src/monday';
import dotenv from 'dotenv';

const TEST_ITEM_ID = '2453434956';
const TEST_COLUMN_TITLE = 'Status Column!';
const TEST_BOARD_ID = '2453434889';
const TEST_COLUM_ID = 'status';

const TEST_STATE_BEFORE = 'State Before'
const TEST_STATE_AFTER = 'State After'

beforeAll(() => {
  dotenv.config();
  monday.initializeSdk(process.env.MONDAY_TOKEN);
})

describe('1. Board Resolving', () => {
  test('1.1: Resolve Board ID by Item', async () => {
    const boardId = await monday.boardByItem(TEST_ITEM_ID);
    expect(boardId).toBe(TEST_BOARD_ID);
  })
  test('1.2: Handle unavailable item', async () => {
    await expect(async () => await monday.boardByItem('-1')).rejects.toThrow();
  })
})

describe('2. Column ID Resolving', () => {
  test('2.1: Resolve Column ID by Title', async () => {
    const columnId = await monday.columnIdByTitle(TEST_BOARD_ID, TEST_COLUMN_TITLE);
    expect(columnId).toBe(TEST_COLUM_ID);
  })
  test('2.2: Handle unavailable column', async () => {
    const columnTitle = 'Unavailable Column!';
    await expect(async () => await monday.columnIdByTitle(TEST_BOARD_ID, columnTitle)).rejects.toThrow();
  })
});

describe('3. Change Status column', () => {
  test('3.1: Change status column to valid value', async () => {
    let updatedStatus = await monday.updateItemStatus(TEST_ITEM_ID, TEST_BOARD_ID, TEST_COLUM_ID, TEST_STATE_BEFORE);
    expect(updatedStatus).toBe(TEST_STATE_BEFORE);

    updatedStatus = await monday.updateItemStatus(TEST_ITEM_ID, TEST_BOARD_ID, TEST_COLUM_ID, TEST_STATE_AFTER);
    expect(updatedStatus).toBe(TEST_STATE_AFTER);
  })
})

describe('4: Parse Monday.com Item IDs from String', () => {
  test('4.1: Parse from simple strings', () => {
    const str = `${TEST_ITEM_ID}`;
    expect(monday.parseItemIds(str)).toEqual([TEST_ITEM_ID]);
  })
  test('4.2: Fail if string contains no ID', () => {
    const str = `There is no ID here`;
    expect(() => monday.parseItemIds(str)).toThrow();
  })
  test('4.3: Parse with prefix and postfix', () => {
    const str = `#(${TEST_ITEM_ID})`;
    const config = { prefix: '#(', postfix: ')' }
    expect(monday.parseItemIds(str, config)).toEqual([TEST_ITEM_ID]);
  })
  test('4.4: Parse Semantic PR Title', () => {
    const str = `fix(#${TEST_ITEM_ID}): Finished item on monday.com`;
    expect(monday.parseItemIds(str)).toEqual([TEST_ITEM_ID]);
  })
  test('4.5: Parse Semantic PR Title with specified prefix/postfix', () => {
    const str = `fix(#${TEST_ITEM_ID}): Finished item on monday.com`;
    const config = { prefix: '(#', postfix: ')' }
    expect(monday.parseItemIds(str, config)).toEqual([TEST_ITEM_ID]);
  })
  test('4.6: Parse commit message', () => {
    const str = `Pushed fix for monday.com item nr.${TEST_ITEM_ID} into dev branch`;
    expect(monday.parseItemIds(str)).toEqual([TEST_ITEM_ID]);
  })
  test('4.7: Fail if ID is too long / too short', () => {
    const short = `123456789`;
    expect(() => monday.parseItemIds(short)).toThrow();

    const long = `12345678910`;
    expect(() => monday.parseItemIds(long)).toThrow();
  })
  test('4.8: Multiple IDs can be extracted', async () => {
    const TEST_ITEM_ID_2 = `2453434908`
    const multiple = true;
    const str = `${TEST_ITEM_ID} ${TEST_ITEM_ID_2}`;
    expect(monday.parseItemIds(str, { multiple })).toEqual([TEST_ITEM_ID, TEST_ITEM_ID_2]);
  })
  test('4.9: Multiple IDs are only extracted once', async () => {
    const str = `${TEST_ITEM_ID} ${TEST_ITEM_ID}`;
    const multiple = true;
    expect(monday.parseItemIds(str, { multiple })).toEqual([TEST_ITEM_ID]);
  })
})

describe('5: Read item Status', () => {
  test('5.1: Get Status of Item', async () => {
    const status = await monday.getItemStatus('2454858795', 'status');
    expect(status).toBe('State Test');
  })
  test('5.1: Get Status of Item that has no status set', async () => {
    const status = await monday.getItemStatus('2454858997', 'status');
    expect(status).toBe('');
  })
})

describe('6: Get Item Names', () => {
  test('6.1: Get Item Name', async () => {
    const status = await monday.getItemName('2453434956');
    expect(status).toBe('Github Action Monday State: JEST');
  })
})

describe('7: Integration test for whole action', () => {
  test('7.1: Simple usecase', async () => {
    const { itemIds, message } = await monday.action({
      mondayToken: process.env.MONDAY_TOKEN,
      text: `fix(#${TEST_ITEM_ID}): Finished item on monday.com`,
      statusColumnTitle: TEST_COLUMN_TITLE,
      status: TEST_STATE_BEFORE,
      mondayOrganization: 'polygonsoftware'
    })
    expect(itemIds).toEqual([TEST_ITEM_ID]);
  })
})

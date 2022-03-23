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
    expect(monday.parseItemId(str)).toBe(TEST_ITEM_ID);
  })
  test('4.2: Fail if string contains no ID', () => {
    const str = `There is no ID here`;
    expect(() => monday.parseItemId(str)).toThrow();
  })
  test('4.3: Parse with prefix and postfix', () => {
    const str = `#(${TEST_ITEM_ID})`;
    const config = { prefix: '#(', postfix: ')' }
    expect(monday.parseItemId(str, config)).toBe(TEST_ITEM_ID);
  })
  test('4.4: Parse Semantic PR Title', () => {
    const str = `fix(#${TEST_ITEM_ID}): Finished item on monday.com`;
    expect(monday.parseItemId(str)).toBe(TEST_ITEM_ID);
  })
  test('4.5: Parse Semantic PR Title with specified prefix/postfix', () => {
    const str = `fix(#${TEST_ITEM_ID}): Finished item on monday.com`;
    const config = { prefix: '(#', postfix: ')' }
    expect(monday.parseItemId(str, config)).toBe(TEST_ITEM_ID);
  })
  test('4.6: Parse commit message', () => {
    const str = `Pushed fix for monday.com item nr.${TEST_ITEM_ID} into dev branch`;
    expect(monday.parseItemId(str)).toBe(TEST_ITEM_ID);
  })
  test('4.7: Fail if ID is too long / too short', () => {
    const short = `123456789`;
    expect(() => monday.parseItemId(short)).toThrow();

    const long = `12345678910`;
    expect(() => monday.parseItemId(long)).toThrow();
  })
})

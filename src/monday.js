import mondaySdk from 'monday-sdk-js';

import assert from 'assert';
import { get } from 'lodash';

const monday = mondaySdk();

function initializeSdk(token) {
  assert.ok(!!token, 'Monday Token is required');
  monday.setToken(token);
}

function escapeStringRegexp(string) {
  if (!string) { return string; }
  return string
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d');
}

function parseItemId(text, { prefix, postfix } = {}) {
  const pre = escapeStringRegexp(prefix) || '(?<!\\d)';
  const pos = escapeStringRegexp(postfix) || '(?!\\d)';
  const pattern = `${pre}\\d{10}${pos}`;
  const regex = new RegExp(pattern);
  const matches = text.match(regex);
  assert.ok(matches && matches.length > 0, 'No monday.com Item-ID was found');
  let match = matches[0];
  if (prefix) { match = match.slice(prefix.length); }
  if (postfix) { match = match.slice(0, match.length - postfix.length); }
  return match;
}

async function boardByItem(itemId) {
  const boardQuery = await monday.api(`query { 
    items (ids: ${itemId}) {
      board { id }
    }   
  }`);
  const boardId = await get(boardQuery, 'data.items[0].board.id', undefined);
  assert.ok(boardId, `Item with id ${itemId} could not be fetched through monday.com API. Ensure your API Token has sufficient access rights!`);
  return boardId;
}

async function columnIdByTitle(boardId, columnTitle) {
  const columnQuery = await monday.api(`query {
    boards (ids: ${boardId}) {
      columns () { title, id }
    }
  }`);
  const columns = get(columnQuery, 'data.boards[0].columns');
  assert.ok(!!columns, `Unable to load columns for board with ID ${boardId}. Ensure your API Token has sufficient access rights!`);
  const correctColumn = columns.find((col) => col.title === columnTitle);
  assert.ok(!!correctColumn, `Column with title ${columnTitle} could not be found in board with ID ${boardId} where the given item is present`);
  return correctColumn.id;
}

async function updateItemStatus(itemId, boardId, columnId, columnStatus) {
  const mutationQuery = await monday.api(`mutation change_column_value($value: JSON!) {
    change_column_value (item_id: ${itemId}, board_id: ${boardId}, column_id: "${columnId}", value: $value) {
        column_values (ids: ${columnId}) { text }
    }
  }`, { variables: { value: JSON.stringify({ label: columnStatus }) } });
  const newStatus = get(mutationQuery, 'data.change_column_value.column_values[0].text');
  assert.equal(newStatus, columnStatus, `Failed to set Item status to ${columnStatus} - given status text probably does not exist!`);
  return newStatus;
}

export default {
  initializeSdk,
  parseItemId,
  boardByItem,
  columnIdByTitle,
  updateItemStatus,
}

import mondaySdk from 'monday-sdk-js';

import assert from 'assert';
import { get } from 'lodash';
import * as core from "@actions/core";

const monday = mondaySdk();

/**
 * Initializes the AWS SDK
 * @param {string} token - AWS SDK Token, provided by monday.com
 */
function initializeSdk(token) {
  assert.ok(!!token, 'Monday Token is required');
  monday.setToken(token);
}

/**
 * Escapes all special characters from a string that would otherwise be interpreted as regex commands
 * @param {string} string - String that must be cleaned
 * @returns {string} - String with escaped special characters
 */
function escapeStringRegexp(string) {
  if (!string) { return string; }
  return string
    .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    .replace(/-/g, '\\x2d');
}

/**
 * Returns a list of monday.com item IDs
 * @param {string} text - Text from which IDs shall be extracted
 * @param {string} prefix - Text snippet that must occur right before each item ID
 * @param {string} postfix - Text snippet that must occur right after each item ID
 * @param {boolean} multiple - Whether to return all matches or just the first one
 * @returns {string[]}- List of monday.com item IDs
 */
function parseItemIds(text, { prefix, postfix, multiple } = {}) {
  const pre = escapeStringRegexp(prefix) || '(?<!\\d)';
  const pos = escapeStringRegexp(postfix) || '(?!\\d)';
  const multi = multiple || false;
  const pattern = `${pre}\\d{10}${pos}`;

  const flags = multiple ? ['g'] : [];
  const regex = new RegExp(pattern, flags);
  let matches = text.match(regex);

  assert.ok(matches && matches.length > 0, 'No monday.com Item-ID was found');
  matches = matches.map((match) => {
    let m = match;
    if (prefix) { m = m.slice(prefix.length); }
    if (postfix) { m = m.slice(0, m.length - postfix.length); }
    return m;
  })
  if (!multi) { return [matches[0]]; }
  return [...new Set(matches)];
}

/**
 * Returns the board ID in which a given monday.com item is located
 * @param {string} itemId - ID of monday.com item of which board must be determined
 * @returns {Promise<string>} - Board ID
 */
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

/**
 * Finds the ID of a column given the columns title (display name)
 * @param {string} boardId - Monday Board ID of which Status Column ID shall be resolved
 * @param {string} columnTitle - Display Name of Status Column in Monday Board
 * @returns {Promise<string>}- ID of Status Column
 */
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

/**
 * Updates the status of a given Item
 * @param {string} itemId - ID of monday.com Item
 * @param {string} boardId - ID of monday.com board in which the given Item is located
 * @param {string} columnId - ID of status column (NOT name)
 * @param {string} columnStatus - Display name of new status that shall be set
 * @returns {Promise<undefined>} - Updated item status
 */
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

/**
 * Runs the complete Github Action
 *
 * @param {string} mondayToken - AWS SDK Token, provided by monday.com
 * @param {string} text - Text from which IDs shall be extracted * @param {string} statusColumnTitle
 * @param {string} statusColumnTitle - Display Name of Status Column in Monday Board
 * @param {string} statusColumnId - ID of status column (NOT name)
 * @param {string} prefix - Text snippet that must occur right before each item ID
 * @param {string} postfix - Text snippet that must occur right after each item ID
 * @param {string} status - Display name of new status that shall be set
 * @param {boolean} multiple - Whether to return all matches or just the first one * @returns {Promise<string[]>}
 * @returns {Promise<string[]>} List of monday.com item IDs of which status was updated
 */
async function action({
  mondayToken,
  text,
  statusColumnTitle,
  statusColumnId,
  prefix,
  postfix,
  status,
  multiple,
}) {
  initializeSdk(mondayToken);
  core.debug('Initialized monday SDK')

  const itemIds = parseItemIds(text, { prefix, postfix, multiple })
  core.debug(`Parsed text, found Item with IDs ${JSON.stringify(itemIds)}`)

  await Promise.all(itemIds.map(async (itemId) => {
    const boardId = await boardByItem(itemId);
    core.debug(`Found board corresponding to Item. Board-iD is: ${boardId}`)

    const columnId = statusColumnId || await columnIdByTitle(boardId, statusColumnTitle);
    core.debug(`Found Column ID: ${columnId}`)

    const newStatus = await updateItemStatus(itemId, boardId, columnId, status);
    core.debug(`Updated status to ${newStatus}`);

    return itemId;
  }));

  return itemIds;
}

export default {
  initializeSdk,
  parseItemIds,
  boardByItem,
  columnIdByTitle,
  updateItemStatus,
  action,
}

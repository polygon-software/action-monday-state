import * as core from '@actions/core';
import monday from './monday';

async function main() {
  const mondayToken = core.getInput('monday-token');
  const text = core.getInput('text');
  const statusColumnTitle = core.getInput('status-column-title');
  const statusColumnId = core.getInput('status-column-id');
  const prefix = core.getInput('prefix');
  const postfix = core.getInput('postfix');
  const status = core.getInput('status');

  monday.initializeSdk(mondayToken);
  core.debug('Initialized monday SDK')

  const itemId = monday.parseItemId(text, { prefix, postfix })
  core.debug(`Parsed text, found Item with ID ${itemId}`)

  const boardId = await monday.boardByItem(itemId);
  core.debug(`Found board corresponding to Item. Board-iD is: ${boardId}`)

  const columnId = statusColumnId || await monday.columnIdByTitle(boardId, statusColumnTitle);
  core.debug(`Found Column ID: ${columnId}`)

  const newStatus = await monday.updateItemStatus(itemId, boardId, columnId, status);
  core.debug(`Updated status to ${newStatus}`);

  return itemId;
}

main()
  .then((itemId) => {
    core.info(`Successfully updated status of item with ID ${itemId}`)
    core.setOutput("item-id", itemId);
  })
  .catch((error) => {
    core.error(error);
    core.setFailed(error.message);
  })



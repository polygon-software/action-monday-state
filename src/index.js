import core from '@actions/core';
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
  const itemId = monday.parseItemId(text, { prefix, postfix })
  const boardId = await monday.boardByItem(itemId);
  const columnId = statusColumnId || await monday.columnIdByTitle(boardId, statusColumnTitle);
  await monday.updateItemStatus(itemId, boardId, columnId, status);
  return itemId;
}

main()
  .then((itemId) => {
    core.setOutput("item-id", itemId);
  })
  .catch((error) => {
    core.setFailed(error.message);
  })



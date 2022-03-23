import * as core from '@actions/core';
import { action } from './monday';


const mondayToken = core.getInput('monday-token');
const text = core.getInput('text');
const statusColumnTitle = core.getInput('status-column-title');
const statusColumnId = core.getInput('status-column-id');
const prefix = core.getInput('prefix');
const postfix = core.getInput('postfix');
const status = core.getInput('status');
const multiple = core.getBooleanInput('multiple')

const config = {
  mondayToken,
  text,
  statusColumnTitle,
  statusColumnId,
  prefix,
  postfix,
  status,
  multiple,
}

action(config)
  .then((itemIds) => {
    core.info(`Successfully updated status of item with ID ${JSON.stringify(itemIds)}`)
    core.setOutput("item-id", JSON.stringify(itemIds));
  })
  .catch((error) => {
    core.error(error);
    core.setFailed(error.message);
  })



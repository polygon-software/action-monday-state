import * as core from '@actions/core';
import monday from './monday';


const mondayToken = core.getInput('monday-token');
const text = core.getInput('text');
const statusColumnTitle = core.getInput('status-column-title');
const statusColumnId = core.getInput('status-column-id');
const prefix = core.getInput('prefix');
const postfix = core.getInput('postfix');
const status = core.getInput('set-status');
const statusBefore = core.getInput('require-status');
const multiple = core.getBooleanInput('multiple')
const mondayOrganization = core.getInput('monday-organization');
const doNotFail = core.getBooleanInput('allow-no-item-id');

const config = {
  mondayToken,
  text,
  statusColumnTitle,
  statusColumnId,
  prefix,
  postfix,
  statusBefore,
  status,
  multiple,
  mondayOrganization,
  doNotFail,
}

monday.action(config)
  .then(({ itemIds, message }) => {
    core.info(`Successfully updated status of item with ID ${JSON.stringify(itemIds)}`)
    core.setOutput("item-ids", JSON.stringify(itemIds));
    core.setOutput('message', message);
  })
  .catch((error) => {
    core.error(error);
    core.setFailed(error.message);
  })



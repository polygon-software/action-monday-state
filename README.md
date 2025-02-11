# Set monday.com Item Status - Github Action

This simple github action parses a monday.com Item-ID from any text (like a PR Title) and sets the items state
on monday.com. 

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=polygon-software_action-monday-state&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=polygon-software_action-monday-state)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=polygon-software_action-monday-state&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=polygon-software_action-monday-state)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=polygon-software_action-monday-state&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=polygon-software_action-monday-state)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=polygon-software_action-monday-state&metric=coverage)](https://sonarcloud.io/summary/new_code?id=polygon-software_action-monday-state)


This Github Action can be very useful in the following scenarios:
- Set item status to "In PR" if a PR is opened that mentions the Item in the PR Title
- Set item status as "Merged" if a PR is closed that mentions the Item in the PR Title
- etc.

## Usage

In the following example, the Github Action is used to set the Status Column "Development Stage"
for the Monday Item mentioned in the PR title to the status "In PR". 

The PR Title could look as follows: *fix(main): Solved Bug that prevented login #1234567890*
where _1234567890_ is of course the monday.com item ID. 

```yaml
on:
  pull_request:
    branches: [master, main]
    
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - name: Checkout 🛎
        uses: actions/checkout@master
          
      - name: Use Github Action to set Status of item on monday.com
        uses: polygon-software/action-monday-state@main
        with:
          monday-token: ${{ secrets.MONDAY_TOKEN }}
          text: ${{ github.event.pull_request.title }}
          status-column-title: 'Development Stage'
          status: 'In PR'
```

## Variables

| Variable            | Required | Example                              | Description                                                                                                                                                                 |
|---------------------|:---------|:-------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| monday-token        | true     | E3JDIJ.HJDI737JD...                  | API Access token for monday.com                                                                                                                                             |
| text                | true     | ${{github.event.pull_request.title}} | Text that includes the Item ID.                                                                                                                                             |
| require-status      | false    | In Development                       | Only update Items that have a current status matching this argument, e.g. only allow status changes from "require-status" -> "set-status", like "In Development" -> "In PR" |
| set-status          | true     | In PR                                | Item-Status text that shall be set                                                                                                                                          |
| status-column-title | depends  | Development Stage                    | Title of column of which status shall be updated                                                                                                                            |
| status-column-id    | depends  | status1                              | ID of column of which status shall be updated. If ID is specified, Title is ignored.                                                                                        |
| prefix              | false    | #(                                   | String that must occur right before the item ID, like "#(" for fix(#1234567890)                                                                                             |
| postfix             | false    | )                                    | String that must occur right after the item ID, like ")" for fix(#1234567890)                                                                                               |
| multiple            | false    | true                                 | String that must occur right after the item ID, like ")" for fix(#1234567890)                                                                                               |
| monday-organization | false    | polygonsoftware                      | Monday.com organization name - used to generate the directlinks in the action output message                                                                                |
| allow-no-item-id         | false    | false                                | Per default, the action fails if on monday.com Item IDs could be found. Setting this boolean to 'true' prevents this failure and always                                     |

## Outputs

| Variable           | Example              | Description                                                                                                     |
|--------------------|:---------------------|:----------------------------------------------------------------------------------------------------------------|
| item-ids           | 1234465546,459765765 | Comma separated list of IDs that got updated through the action                                                 |
| message            | *See example below   | A Markdown formatted message containing links to all items that were updated. Perfect to attach as a PR comment |


**\*Example of a message:**
```markdown
The status of the following items has been referenced on monday.com:
- [State Before] Github Action Monday State: JEST [↪](https://polygonsoftware.monday.com/boards/2453434889/pulses/2453434956)
```

## Examples

### Mark items mentioned in a PR Title as 'In PR' and comment on PR which items were updated

```yaml
on:
  pull_request:
    branches: [master, main]
    
jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - name: Checkout 🛎
        uses: actions/checkout@master
          
      - name: Use Github Action to set Status of item on monday.com
        id: monday-state
        uses: polygon-software/action-monday-state@main
        with:
          monday-token: ${{ secrets.MONDAY_TOKEN }}
          text: ${{ github.event.pull_request.title }}
          status-column-title: 'Development Stage'
          status: 'In PR'

      - name: Comment PR
        uses: polygon-software/actions-comment-pull-request@v1
        with:
          message: ${{ steps.monday-state.outputs.message }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Credits

I am an [AI Engineer from Zurich](https://joelbarmettler.xyz/) and do [AI research](https://joelbarmettler.xyz/research/), [AI Keynote Speaker](https://joelbarmettler.xyz/auftritte/) and [AI Webinars](https://joelbarmettler.xyz/auftritte/webinar-2024-rewind-2025-ausblick/) in Zurich, Switzerland! I also have an [AI Podcast in swiss german](https://joelbarmettler.xyz/podcast/)!

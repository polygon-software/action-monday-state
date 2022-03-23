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

## Credits

[This project was developed in Zurich, switzerland by PolygonSoftware](https://polygon-software.ch/)

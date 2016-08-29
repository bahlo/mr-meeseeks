# Mr. Meeseeks
<img align="right" width="25%" src="https://cloud.githubusercontent.com/assets/1725839/18070833/ed3ba76a-6e50-11e6-8227-28413f619627.jpg">

> "I'm Mr. Meeseeks! Look at me!"

## What?

Mr. Meeseeks is a deploy bot for Slack and Ansible.
When you direct-mention your bot like this: `@mm deploy app beta`, 
it runs [Ansible](http://ansible.com) with the tag `deploy_app_beta` 
and tells you if it worked or not and how long it took.

## Install

1. Make sure you have `node` and `npm` installed
2. Clone this repository `git clone https://github.com/bahlo/mr-meeseeks.git`
3. Install dependencies `npm install`
4. Run bot `npm start`

## Environment

You'll need the following environment variables:
- `SLACK_TOKEN`: The token from your Slack bot creation page
- `SLACK_CHANNEL`: The channel name (without the `#`)
- `PLAYBOOK_REPO`: The repository which contains the playbooks

## License

This project is licensed under MIT, for more information see the LICENSE file.

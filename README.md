# Messaging

Simple realtime messaging system. Contains an API to send message through sockets, where clients can subscribe.

## Installation

```
npm ci
```

## Running the app

```
npm run start
```

## Build & run for production

```
npm run build
node dist/main.js
```

## Configuration

See the configuration keys with the [Ansible playbook](https://github.com/thefirstspine/ansible/blob/master/volume/playbooks/deploy-messaging.yaml)

To help you configure your local environment to generate a dotenv file you can use the [configurator](https://github.com/thefirstspine/configurator) using this command:

```
node configurator.js create messaging --conf-path [local copy of ansible volume]/conf --force-http true
```

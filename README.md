# Digital Student ID <!-- omit in toc -->

A web application and the associated backend are to be developed using the IOTA Identity framework developed by the IOTA Foundation. The web application is to prototype a digital student ID.

- [1. Setting up your environment](#1-setting-up-your-environment)
  - [1.1. Set up `node.js` using `nodeenv`](#11-set-up-nodejs-using-nodeenv)
    - [1.1.1. Create a virtual node environment](#111-create-a-virtual-node-environment)

# 1. Setting up your environment

## 1.1. Set up `node.js` using `nodeenv`

You can always go ahead and install `node.js` globally on your system from [here](https://nodejs.org/).  
The following steps will only guide you through the process of creating a virtual environment for `node.js` using `nodeenv`.

### 1.1.1. Create a virtual node environment

> **IMPORTANT** This will require Python version 3 or greater and `pip` installed on your system.

First, open a shell inside the repo's root directory, then install the `node.js` environment manager `nodeenv` using `pip`.

```shell
pip install nodeenv
```

Now create an environment called `.node`.  
For this environment, we will use `node.js` version `18.8.0`.
Your command line will need elevated privileges for this to work.

```shell
nodeenv .node --node=18.8.0
```
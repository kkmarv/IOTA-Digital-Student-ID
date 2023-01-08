# Digital Student ID <!-- omit in toc -->

A web application and the associated backend are to be developed using the IOTA Identity framework developed by the IOTA Foundation. The web application is to prototype a digital student ID.

- [1. How it works](#1-how-it-works)
- [2. Setting up your environment](#2-setting-up-your-environment)
  - [2.1. Set up `node.js` using `nodeenv`](#21-set-up-nodejs-using-nodeenv)
    - [2.1.1. Create a virtual node environment](#211-create-a-virtual-node-environment)

# 1. How it works

- Precondition: Identities for the issuer and the holder exist on the Tangle.
1. The holder requests a challenge from the issuer, signs it and sends it back (off-chain).
1. The issuer verifies the signature of the challenge. Now they can be sure that the holder controls their DID.
1. Issuer creates, signs and sends the Verifiable Credential to the holder (off-chain).
1. Verifier sends the holder a challenge and requests a signed Verifiable Presentation (off-chain).
1. Holder creates and sends a verifiable presentation including the challenge from the issued credential (off-chain).
1. Verifier receives the Verifiable Presentation and verifies it.


# 2. Setting up your environment

## 2.1. Set up `node.js` using `nodeenv`

You can always go ahead and install `node.js` globally on your system from [here](https://nodejs.org/).  
The following steps will only guide you through the process of creating a virtual environment for `node.js` using `nodeenv`.

### 2.1.1. Create a virtual node environment

> **IMPORTANT** This will require Python version 3 or greater and `pip` installed on your system.

First, open a shell inside the repo's root directory, then install the `node.js` environment manager `nodeenv` using `pip`.

```shell
pip install nodeenv
```

Now create an environment called `.node`.  
For this environment, we will use `node.js` version `18.12.1`.
Your command line will need elevated privileges for this to work.

```shell
nodeenv .node --node=18.12.1
```

<details><summary><b>Good to know</b>: Node.js versions that will not work correctly</summary>
- 18.8.0 (some problems with <a href="https://www.npmjs.com/package/@iota/identity-wasm">@iota/identity-wasm@0.6.0"</a>)
</details>
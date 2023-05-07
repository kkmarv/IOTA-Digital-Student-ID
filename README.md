# Digital Student ID Demo <!-- omit in toc -->

Newest efforts in Digital Identity and Self Sovereign Identity (SSI) leave the hope that digital governing may come true.  
Organizations such as the [IOTA Foundation](https://www.iota.org/) are creating decentralized frameworks that make this possible. IOTA has the unique concept of the [Tangle](https://wiki.iota.org/learn/about-iota/tangle) which makes SSI possible today.  

To showcase a possible scenario where SSI would greatly benefit everyday life, this project aims to prototype a Digital Student ID for the use on a university website.

# Contents <!-- omit in toc -->

- [1. Verifiable StudentCredential](#1-verifiable-studentcredential)
  - [1.1. How it works](#11-how-it-works)
    - [1.1.1. Registration | Matriculation](#111-registration--matriculation)
    - [1.1.2. Login | Authentication](#112-login--authentication)
  - [1.2. Credential Contents](#12-credential-contents)
- [2. Design](#2-design)
  - [2.1. System Architecture](#21-system-architecture)
  - [2.2. User Navigation](#22-user-navigation)
- [3. Setting up your local environment](#3-setting-up-your-local-environment)
  - [3.1. Quick Start Guide](#31-quick-start-guide)
  - [3.2. Set up `node.js` using `nodeenv`](#32-set-up-nodejs-using-nodeenv)
    - [3.2.1. Create a virtual node environment](#321-create-a-virtual-node-environment)

# 1. Verifiable StudentCredential

## 1.1. How it works

Some high-level explanation

The following steps expect that DIDs for both, the university and the Student, already exist on the Tangle. If you want to learn more about DID creation, see the [Keeper documentation](./keeper/README.md).

### 1.1.1. Registration | Matriculation

The process of enrollment via the StudentCredential.

```mermaid
%%---
%%title: Registration | Matriculation
%%---
sequenceDiagram

participant S as Student
participant U as University
participant T as Tangle

S ->> U: Hi University, I am did:iota:example:123<br>and I'd like to enroll myself.
Note over U: The uni needs to know <br> whether the Student has control <br> of did:iota:example:123. <br> So it sends a challenge <br> to the Student.
U ->> S: Authenticate yourself, please.
Note over S: The Student<br>signs the challenge <br> with their private <br> key and sends it back.
S --x U: Sure.
U ->> T: I need document with ID <br> did:iota:example:123
T --x U: Sure.
Note over U: The uni decrypts the signed <br> challenge with the Student's public key. <br> If it matches with the original challenge, <br> the Student has proven ownership of their DID.
U ->> S: I need your personal data.
Note over S: Now, the Student <br> can decide <br> whether to send <br> their data or not.
S --x U: Sure.
Note over U: With the Student's personal data, <br> the uni needs to verify its validity.
Note over U: If the data is valid, the uni creates <br> and signs a StudentCredential. <br> The uni also disposes all information <br> about the Student as everything is <br> contained within the StudentCredential.
U --x S: Here's your signed Student ID.
Note over S: With the StudentCredential <br> at hand, they are now able to <br> verify their status as a <br> student of University.
```

### 1.1.2. Login | Authentication

The process of authentication via the StudentCredential.

```mermaid
%%---
%%title: Login | Authentication
%%---
sequenceDiagram

participant S as Student
participant U as University
participant T as Tangle

S ->> U: Hi University, I am did:iota:example:123 <br> and I want to use your website.
Note over U: As with the registration, <br> the uni needs to know <br> whether the Student is <br> who they claim to be.
U --x S: Sure thing. <br> But first we need your matriculation status. <br> And please sign this challenge.
Note over S: The Student creates a <br> Verifiable Presentation <br> of their StudentCredential, <br> includes the challenge, <br>signs and sends it.
S ->> U: Here's proof of my matriculation.
U ->> T: I need document with ID <br> did:iota:example:123
T --x U: Sure.
Note over U: The uni is now able to <br> verify the Student's <br> matriculation status by verifying <br> the Presentation and the Credential.
Note over U: If the validation is successful, <br> the Student currently is enrolled.
U --x S: You may proceed.
```

## 1.2. Credential Contents

The StudentCredential makes several assertions about its holder.  
For now it will contain a students personal information, which in a fully working ecosystem will not be necessary nor desirable. This will be done via official government issuers. But as such infrastructure does not exist yet, the design decision was to include personal information in the StudentCredential just for convenience.

**Personal information**

- Full name
- Address
- Picture of the student

**Study information**

- Name of the university
- Current semester
- Matriculation number
- Name of the study subject
- Degree (Bachelor | Master)

# 2. Design

## 2.1. System Architecture

The overall architecture of this framework.

```mermaid
%%---
%%title: System Architecture
%%---
flowchart
    subgraph University
        UniversityKeeper(Keeper)
        IssuanceService(Issuance Service)
    end
    
    subgraph Student
        StudentKeeper(Keeper)
        Browser(Browser)
    end
    
    StudentKeeper-.->Tangle
    UniversityKeeper-.->Tangle
    Browser-->IssuanceService
    Browser--->StudentKeeper
    IssuanceService-->UniversityKeeper
```

## 2.2. User Navigation

The simple user navigation in the web app.

```mermaid
%%---
%%title: User Navigation
%%---
stateDiagram-v2
    [*] --> Login/Registration

    state Login/Registration {
        direction LR

        state fork_state <<fork>>
        state join_state <<join>>

        [*] --> fork_state
        fork_state --> EnterUsername
        fork_state --> EnterPassword

        join_state --> [*]
        EnterUsername --> join_state
        EnterPassword --> join_state
    }   

    Login/Registration --> ActionSelect

    state ActionSelect {
        direction LR
        state if_state <<choice>>
        
        [*] --> if_state
        if_state --> ...
        ... --> [*]
        if_state --> [*]
        if_state --> Cafeteria
        Cafeteria --> [*]

        state Cafeteria {
            direction LR
            [*] --> SelectMeal
            SelectMeal --> Pay
            Pay --> [*]
        }
    }

    ActionSelect --> [*]    
```

# 3. Setting up your local environment

## 3.1. Quick Start Guide

If you don't already have `node.js` installed on your system, download and install it from [here](https://nodejs.org/). 

Next, after cloning/downloading the repository, open 3 different terminal sessions and and navigate to the following paths in one terminal each:
- `/university`
- `/keeper`
- `/gisa-did`

Now go ahead and execute the following command in each of the terminals:
```shell
npm install
```

Finally, in the `/university` and `/keeper` teminals, execute
```shell
npm run dev
```
while in the `/gisa-did` terminal, execute
```shell
npm start
```
On [localhost:4200](https://localhost:4200/) you should now have the fully functional web app running with the backend servers running as well.

## 3.2. Set up `node.js` using `nodeenv`

You can always go ahead and install `node.js` globally on your system from [here](https://nodejs.org/).  
The following steps will only guide you through the process of creating a virtual environment for `node.js` using `nodeenv`.

### 3.2.1. Create a virtual node environment

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

<details><summary><b>Good to know</b>: Node.js versions that are known not to work:</summary>

<table>
  <tr>
		<td>Version</td>
    <td>Incompatibility</td>
	</tr>
	<tr>
		<td><code>18.8.0</code></td>
    <td>some problems with <a href="https://www.npmjs.com/package/@iota/identity-wasm">@iota/identity-wasm@0.6.0</a></td>
	</tr>
</table>

</details>

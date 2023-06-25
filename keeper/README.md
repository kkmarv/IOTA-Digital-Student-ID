# Keeper Technical Design Document<!-- omit in toc -->

*Keeper* is a RESTful wallet for DIDs and Verifiable Credentials designed to run on consumer hardware, enabling third party software to securely interact with local DIDs or create Verifiable Presentations, just by providing a username and a password. It uses [IOTA Stronghold](https://wiki.iota.org/stronghold.rs/welcome/) under the hood, which handles a user's private keys with the highest security standards.

## Content <!-- omit in toc -->

- [1. Identity Creation](#1-identity-creation)
- [2. Identity Login](#2-identity-login)
- [3. Verifiable Credential Deposit](#3-verifiable-credential-deposit)
- [4. Verifiable Presentation Creation](#4-verifiable-presentation-creation)

<!-- TODO insert general architecture diagram here -->

# 1. Identity Creation

```mermaid
%%---
%%title: Identity Creation
%%---
sequenceDiagram
    participant U as Keeper<br>Web UI
    box Keeper Backend
        participant K as REST service
        participant S as Stronghold
    end
    participant T as Tangle Client

    rect rgba(34, 28, 75, .3)
        Note over U,S: Create DID Document locally
        U->>+K: register(username, password)
        K->>+S: build(username, password)
        break if identity store already exists
            S-->>K: error()
            K-->>U: 409 Conflict
        end
        S->>S: createDIDDocument()
        S-->>-K: 
    end
    
    rect rgba(75, 37, 95, .3)
        Note over U,T: Publish DID Document
        K->>+T: publish()
        Note left of T: Publishing a DID requires <br> few seconds of waiting <br> for PoW to finish.
        break if no connection
            T-->>K: error()
            K-->>-U: 503 Service Unavailable
            Note left of K: Stronghold will keep the DID <br> document and the user will have <br> to try again later.
        end
        T-->>-K: 
        K-->>U: 200 OK
    end
```

# 2. Identity Login

```mermaid
%%---
%%title: Identity Login
%%---
sequenceDiagram
    participant U as Keeper<br>Web UI
    box Keeper Backend
        participant K as REST service
        participant S as Stronghold
    end

    U->>+K: login(username, password)
    K->>+S: build(username, password)
    break if identity store does not exist
        S-->>K: error()
        K-->>U: 401 Unauthorized
    end
    break on wrong password
        S-->>K: error()
        K-->>U: 401 Unauthorized
    end
    S-->>-K: 
    K->>K: Create and sign JWT containing the username
    K-->>-U: JWT
```

# 3. Verifiable Credential Deposit

```mermaid
%%---
%%title: Verifiable Credential Deposit
%%---
sequenceDiagram
    participant U as Keeper<br>Web UI
    box Keeper Backend
        participant K as REST service
        participant S as Stronghold
    end

    U->>+K: deposit(password, VC, credentialName)
    break if user is not logged in
        K-->>U: 401 Unauthorized
    end
    K->>+S: encrypt(password, VC)
    S-->>-K: encryptedVC

    K->>K: saveToFileSystem(encryptedVC, credentialName)
    K-->>U: 200 OK

```

# 4. Verifiable Presentation Creation

```mermaid
%%---
%%title: Verifiable Presentation Creation
%%---
sequenceDiagram
    participant U as Keeper<br>Web UI
    box Keeper Backend
        participant K as REST service
        participant S as Stronghold
    end

    U->>+K: requestVP(<br>password, credentialNames,challenge)
    break if user is not logged in
        K-->>U: 401 Unauthorized
    end
    K ->>K: loadFromFileSystem(credentialNames)
    break if any credential name cannot be resolved
        K-->>U: 404 Not Found
    end
    K->>+S: decryptVCs(password, encryptedVCs)
    break if the password is wrong
        S-->>K: error()
        K-->>U: 401 Unauthorized
    end
    S-->>-K: decryptedVCs
    K->>K: createVP(challenge, decryptedVCs)
    K->>+S: signVP(password)
    S-->>-K: signedVP
    K-->>-U: signedVP
```

# Keeper <!-- omit in toc -->

*Keeper* is a RESTful wallet for DIDs and Verifiable Credentials designed to run on local hardware, enabling third party software to securely interact with local DIDs, create Verifiable Presentations and so on just by providing a username and a password. It uses IOTA Stronghold under the hood, which handles all private keys.

## Content <!-- omit in toc -->

- [1. User Registration](#1-user-registration)
- [2. User Login](#2-user-login)
- [3. Verifiable Presentation Request](#3-verifiable-presentation-request)

# 1. User Registration

```mermaid
---
title: User Registration
---
sequenceDiagram
    actor U as User
    participant K as Keeper
    participant S as Stronghold
    participant T as Tangle

    U->>+K: register(username, password)
    K->>+S: build(username, password)
    break if file already exists
        S-->K: error()
        K-->U: 409 Conflict
    end
    break on wrong password
        S-->K: error()
        K-->U: 409 Conflict
    end
    S->>S: createDID()
    S-->-K: 
    K->>+T: publish()
    Note left of T: Publishing a DID requires <br> few seconds of waiting <br> for PoW to finish.
    T-->-K: 
    break if no connection
        K-->-U: 503 Service Unavailable
        Note left of K: Stronghold will keep the DID <br> and the user will have <br> to try again later.
    end
    K-->U: 200 OK
```

# 2. User Login

```mermaid
---
title: User Login
---
sequenceDiagram
   actor U as User
    participant K as Keeper
    participant S as Stronghold

    U->>+K: login(username, password)
    K->>+S: build(username, password)
    break if file does not exist
        S-->K: error()
        K-->U: 401 Unauthorized
    end
    break on wrong password
        S-->K: error()
        K-->U: 401 Unauthorized
    end
    S-->-K: 
    K->>K: Create and sign JWT containing the username
    K-->-U: JWT
```

# 3. Verifiable Presentation Request

```mermaid
---
title: Verifiable Presentation Request
---
sequenceDiagram
    actor U as User
    participant K as Keeper
    participant S as Stronghold

    Note over U,S: The user must be logged in and have at least one <br> Verifiable Credential stored to request a Verifiable Presentation.

    U->>+K: requestVP(password, <br>challenge, <br>credentialNames)
    K->>+S: loadVC(password, credentialNames)
    break if the password is wrong
        S-->K: error()
        K-->U: 401 Unauthorized
    end
    break if any of the credentialNames cannot be found
        S-->K: error()
        K-->U: 404 Not Found
    end
    S-->-K: List of VCs
    K->>K: createVP(challenge, VCs)
    K->>+S: signVP(password)
    S-->-K: signed VP
    K-->-U: signed VP
```

# keeper

*keeper* is a RESTful DID management software designed to run on local hardware.
It uses the IOTA Stronghold framework to securely store DID private keys.

Another app may use *keeper*'s REST API to create a DID by providing a username and a password. 
The username is used to identify the Stronghold file while the password is used to encrypt it.

*keeper* also provides the ability to store credentials and create Verifiable Presentations from them.


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

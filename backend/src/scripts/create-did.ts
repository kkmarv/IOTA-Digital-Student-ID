import {
  Account, AccountBuilder, Client, Document, ExplorerUrl, KeyPair, KeyType
} from "@iota/identity-wasm/node/identity_wasm.js"
import cfg from "../config.js"

async function createIdentity(): Promise<Account> {
  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig)
  const account = await builder.createIdentity()
  await account.publish()

  console.log(account.document())

  return account
}

async function createIdentity2() {
  // Generate a new ed25519 public/private key pair.
  const keyPair = new KeyPair(KeyType.Ed25519);

  // Create a DID Document (an identity) from the generated key pair.
  const doc = new Document(keyPair, cfg.iota.clientConfig.network.name());

  // Sign the DID Document with the generated key.
  doc.signSelf(keyPair, doc.defaultSigningMethod().id());

  // Create a client instance to publish messages to the configured Tangle network.
  const client = await Client.fromConfig(cfg.iota.clientConfig);

  // Publish the Identity to the IOTA Network, this may take a few seconds to complete Proof-of-Work.
  const receipt = await client.publishDocument(doc);

  // Log the results.
  console.log(`DID Document Transaction: ${ExplorerUrl.devnet().messageUrl(receipt.messageId())}`);
  console.log(`Explore the DID Document: ${ExplorerUrl.devnet().resolverUrl(doc.id())}`);

  // Return the results.
  return { keyPair, doc, receipt };
}

createIdentity()
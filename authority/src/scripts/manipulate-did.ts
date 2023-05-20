import { AccountBuilder, DID } from "@iota/identity-wasm/node";
import { exit } from "process";
import cfg from "../config.js";

/**
 * Manipulate a DID by inserting an example service into its document.
 * Beware that it has to publish the DID or otherwise the account
 * implementation will not save changes to the Stronghold.
 * @param did The DID serving as an example.
 */
async function manipulateIdentity(did: DID): Promise<void> {
  if (!(await cfg.iota.accountBuilderConfig.storage.didExists(did))) {
    console.log("DID does not exist in Stronghold.");
    return;
  }

  const builder = new AccountBuilder(cfg.iota.accountBuilderConfig);
  const account = await builder.loadIdentity(did);

  // Add a new service to the identity.
  await account.createService({
    fragment: "my-service-1",
    type: "MyCustomServiceProvingManipulationWorks",
    endpoint: "https://example.com",
  });

  // Important: The account won't save changes to the Stronghold that aren't on the Tangle (But why?)
  await account.publish();

  console.dir(account.document().toJSON(), { depth: null });
}

if (!process.argv[2]) {
  console.log("Please specify a DID as first argument");
  exit();
}

manipulateIdentity(DID.parse(process.argv[2]));

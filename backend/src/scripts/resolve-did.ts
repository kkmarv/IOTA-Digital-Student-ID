import { DID, ResolvedDocument, Resolver } from "@iota/identity-wasm/node/identity_wasm.js";
import { exit } from "process";
import cfg from "../config.js";

async function resolveDID(did: DID): Promise<ResolvedDocument> {
  // Retrieve the published DID Document from the Tangle.
  const resolver = await Resolver
    .builder()
    .clientConfig(cfg.iota.clientConfig)
    .build();

  const doc = await resolver.resolve(did)
  console.log(doc.toJSON());

  return doc
}

const arg = process.argv[2]
if (!arg) {
  console.log("Please specify a DID as first argument");
  exit()
}
const did = DID.parse(arg)

resolveDID(did)
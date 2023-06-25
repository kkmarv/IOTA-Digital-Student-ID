import identity from '@iota/identity-wasm/node/identity_wasm.js'
import { NextFunction, Request, Response } from 'express'
import { clientConfig, credentialTypes, failureReasons } from '../config'
import { challenges } from './server.js'

const resolver = await new identity.ResolverBuilder().clientConfig(clientConfig).build()

export function validateDID() {
  // TODO validate request bodies containing DIDs
}

export async function validateVP(req: Request, res: Response, next: NextFunction) {
  let presentation: identity.Presentation

  // First parse the request body
  try {
    presentation = identity.Presentation.fromJSON(req.body)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).send({ reason: `${failureReasons.presentationParsingFailed}: ${error.message}` })
    } else {
      return res.status(400).send({ reason: failureReasons.presentationParsingFailed })
    }
  }

  // Then validate the request body
  const holderDid = presentation.holder()
  if (!holderDid) {
    return res.status(400).send({ reason: failureReasons.presentationHolderMissing })
  }

  const challenge = challenges.get(holderDid)?.challenge
  if (!challenge) {
    return res.status(428).send({ reason: failureReasons.presentationChallengeMissing })
  }

  const credentials = presentation.verifiableCredential()
  if (credentials.length === 0) {
    return res.status(400).send({ reason: failureReasons.presentationCredentialMissing })
  }

  const credential = credentials[0]
  if (!credential.type().includes(credentialTypes.nationalID)) {
    return res
      .status(415)
      .send({ reason: failureReasons.presentationCredentialTypeMismatch(credentialTypes.nationalID) })
  }

  // Lastly, we need to validate the presentation
  const presentationValidationOptions = new identity.PresentationValidationOptions({
    subjectHolderRelationship: identity.SubjectHolderRelationship.AlwaysSubject, // must be subject of all credentials
    presentationVerifierOptions: new identity.VerifierOptions({
      // purpose: identity.ProofPurpose.authentication(), // TODO see https://www.w3.org/TR/did-core/#authentication
      challenge: challenge, // must include a challenge and match the one we generated
      allowExpired: false, // credentials must not be expired
    }),
  })

  try {
    await resolver.verifyPresentation(presentation, presentationValidationOptions, identity.FailFast.AllErrors)
  } catch (error) {
    res.status(403)
    if (error instanceof Error) return res.send({ reason: error.message })
    else return res.send({ reason: failureReasons.presentationValidationFailedUnknown })
  }

  req.body = { credential, holderDid }

  return next()
}

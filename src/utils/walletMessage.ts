import { config } from "@src/components/DefuseSDK/config"
import { nearClient } from "@src/components/DefuseSDK/constants/nearClient"
import { formatSignedIntent } from "@src/components/DefuseSDK/core/formatters"
import { createWalletVerificationMessage } from "@src/components/DefuseSDK/core/messages"
import type { ChainType } from "@src/hooks/useConnectWallet"
import { hasMessage } from "@src/utils/errors"
import type { CodeResult } from "near-api-js/lib/providers/provider"

export async function verifyWalletSignature(
  signature: Parameters<typeof formatSignedIntent>[0],
  credential: string,
  credentialType: ChainType
): Promise<boolean> {
  if (
    /**
     * NEP-413 signatures can't be verified onchain for explicit account IDs (e.g., foo.near)
     * until the user sends a one-time transaction to register their public key with the account.
     * So we fall back to local verification.
     */
    signature.type === "NEP413"
  ) {
    return signature.signatureData.accountId === credential
  }

  const signedIntent = formatSignedIntent(signature, {
    credential,
    credentialType,
  })

  // todo: Consider moving verification to SDK?
  try {
    // Warning: `CodeResult` is not correct type for `call_function`, but it's closest we have.
    await nearClient.query<CodeResult>({
      request_type: "call_function",
      account_id: config.env.contractID,
      method_name: "simulate_intents",
      args_base64: btoa(JSON.stringify({ signed: [signedIntent] })),
      finality: "optimistic",
    })

    // If didn't throw, signature is valid
    return true
  } catch (err) {
    if (hasMessage(err, "invalid signature")) {
      return false
    }
    throw err
  }
}

export function walletVerificationMessageFactory(
  credential: string,
  credentialType: ChainType
) {
  return createWalletVerificationMessage(
    {
      signerId: { credential, credentialType },
    },
    credentialType
  )
}

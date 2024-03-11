import * as process from 'process'
import TonConnect from '@tonconnect/sdk'

import { TonConnectStorage } from './storage.js'

export function getConnector(chatId: number): TonConnect {
  return new TonConnect({
    manifestUrl: process.env.MANIFEST_URL,
    storage: new TonConnectStorage(chatId),
  })
}

import { CHAIN, toUserFriendlyAddress } from '@tonconnect/sdk'

import { getConnector, getWalletInfo } from '../../ton-connect/index.js'
import { ContextType } from '../../types/index.js'

export const showMyWalletCommand = async (ctx: ContextType) => {
  try {
    const chatId = ctx.chat?.id!

    const connector = getConnector(chatId)
    await connector.restoreConnection()

    if (!connector.connected) {
      await ctx.reply("You didn't connect a wallet")
      return
    }

    const walletInfo = await getWalletInfo(connector.wallet!.device.appName)
    const walletName = walletInfo?.name || connector.wallet!.device.appName

    await ctx.reply(
      `Connected wallet: ${walletName}\nYour address: ${toUserFriendlyAddress(
        connector.wallet!.account.address,
        connector.wallet!.account.chain === CHAIN.TESTNET
      )}`
    )
  } catch (e) {
    console.log(e)
  }
}

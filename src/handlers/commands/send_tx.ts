import { UserRejectsError } from '@tonconnect/sdk'

import { getConnector, getWalletInfo } from '../../ton-connect/index.js'
import { ContextType } from '../../types/index.js'

export const sendTxCommand = async (ctx: ContextType) => {
  try {
    const chatId = ctx.chat?.id!

    const connector = getConnector(chatId)

    await connector.restoreConnection()
    if (!connector.connected) {
      await ctx.reply('Connect wallet to send transaction')
      return
    }

    connector
      .sendTransaction({
        validUntil: Math.round(Date.now() / 1000) + 600, // timeout is SECONDS
        messages: [
          {
            amount: '30000000',
            address:
              '0:410e65bc371a428ab4815b8b54177bafa4ca95443aa8956d6b5434c180648ac3',
          },
          {
            amount: '970000000',
            address:
              '0:7eb4b8b4c7943d684c090473b65fee67565285861f4a30959523cec359f9504b',
          },
        ],
      })
      .then(() => {
        ctx.reply(`Transaction sent successfully`)
      })
      .catch(e => {
        if (e instanceof UserRejectsError) {
          ctx.reply(`You rejected the transaction`)
          return
        }

        ctx.reply(`Unknown error happened`)
      })
      .finally(() => connector.pauseConnection())

    let deeplink = ''
    const walletInfo = await getWalletInfo(connector.wallet!.device.appName)
    if (walletInfo) {
      deeplink = (walletInfo as any).universalLink
    }

    await ctx.reply(
      `Open ${
        walletInfo?.name || connector.wallet!.device.appName
      } and confirm transaction`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Wallet',
                url: deeplink,
              },
            ],
          ],
        },
      }
    )
  } catch (e) {
    console.log(e)
  }
}

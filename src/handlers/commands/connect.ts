import QRCode from 'qrcode'
import {
  CHAIN,
  isWalletInfoRemote,
  toUserFriendlyAddress,
  UserRejectsError,
} from '@tonconnect/sdk'
import { InputFile } from 'grammy'

import { getConnector, getWalletInfo, getWallets } from '../../ton-connect/index.js'
import { buildUniversalKeyboard } from '../../utils/index.js'
import { ContextType } from '../../types/index.js'

let newConnectRequestListenersMap = new Map<number, () => void>()

export const connectCommand = async (ctx: ContextType) => {
  try {
    const chatId = ctx.chat?.id!
    let messageWasDeleted = false

    newConnectRequestListenersMap.get(chatId)?.()

    const connector = getConnector(chatId, () => {
      unsubscribe()
      newConnectRequestListenersMap.delete(chatId)
      deleteMessage()
    })

    await connector.restoreConnection()

    if (connector.connected) {
      const walletInfo = await getWalletInfo(connector.wallet!.device.appName)
      const connectedName = walletInfo?.name || connector.wallet!.device.appName

      await ctx.reply(
        `You have already connect ${connectedName} wallet\nYour address: ${toUserFriendlyAddress(
          connector.wallet!.account.address,
          connector.wallet!.account.chain === CHAIN.TESTNET
        )}\n\n Disconnect wallet firstly to connect a new one`
      )

      return
    }

    const unsubscribe = connector.onStatusChange(async wallet => {
      if (wallet) {
        await deleteMessage()

        const walletName =
          (await getWalletInfo(wallet.device.appName))?.name || wallet.device.appName
        await ctx.reply(`${walletName} wallet connected successfully`)
        unsubscribe()
        newConnectRequestListenersMap.delete(chatId)
      }
    })

    const wallets = await getWallets()
    const link = connector.connect(wallets)
    const QRCodeBuffer = await QRCode.toBuffer(link)
    const image = new InputFile(QRCodeBuffer)
    const keyboard = await buildUniversalKeyboard(link, wallets)

    const botMessage = await ctx.replyWithPhoto(image, {
      reply_markup: {
        inline_keyboard: [keyboard],
      },
    })

    const deleteMessage = async (): Promise<void> => {
      if (!messageWasDeleted) {
        messageWasDeleted = true
        await ctx.api.deleteMessage(chatId, botMessage.message_id)
      }
    }

    newConnectRequestListenersMap.set(chatId, async () => {
      unsubscribe()

      await deleteMessage()

      newConnectRequestListenersMap.delete(chatId)
    })
  } catch (e) {
    console.log(e)
  }
}

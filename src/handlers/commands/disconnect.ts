import { getConnector } from '../../ton-connect/index.js'
import { ContextType } from '../../types/index.js'

export const disconnectCommand = async (ctx: ContextType) => {
  try {
    const chatId = ctx.chat?.id!

    const connector = getConnector(chatId)
    await connector.restoreConnection()

    if (!connector.connected) {
      await ctx.reply("You didn't connect a wallet")
      return
    }

    await connector.disconnect()

    await ctx.reply('Wallet has been disconnected')
  } catch (e) {
    console.log(e)
  }
}

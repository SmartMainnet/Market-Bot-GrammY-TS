import QRCode from 'qrcode'
import { InputFile } from 'grammy'

import { getConnector, getWallets } from '../../ton-connect/index.js'
import { ContextType } from '../../types/index.js'

export const connectCommand = async (ctx: ContextType) => {
  try {
    const chatId = ctx.chat?.id!
    const wallets = await getWallets()

    const connector = getConnector(chatId)

    connector.onStatusChange((wallet: any) => {
      if (wallet) {
        ctx.reply(`${wallet.device.appName} wallet connected!`)
      }
    })

    const link = connector.connect(wallets)
    const QRCodeBuffer = await QRCode.toBuffer(link)
    const image = new InputFile(QRCodeBuffer)

    await ctx.replyWithPhoto(image, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Choose a Wallet',
              callback_data: JSON.stringify({ method: 'chose_wallet' }),
            },
            {
              text: 'Open Link',
              url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
                link
              )}`,
            },
          ],
        ],
      },
    })
  } catch (e) {
    console.log(e)
  }
}

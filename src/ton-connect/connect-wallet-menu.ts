import QRCode from 'qrcode'
import { InputFile, InputMediaBuilder } from 'grammy'

import { getConnector, getWallets } from './index.js'
import { ContextType } from '../types/index.js'

export const walletMenuCallbacks = {
  chose_wallet: onChooseWalletClick,
  select_wallet: onWalletClick,
  universal_qr: onOpenUniversalQRClick,
}

export async function onChooseWalletClick(
  ctx: ContextType,
  _: string
): Promise<void> {
  const wallets = await getWallets()

  await ctx.editMessageReplyMarkup({
    reply_markup: {
      inline_keyboard: [
        wallets.map((wallet: any) => ({
          text: wallet.name,
          callback_data: JSON.stringify({
            method: 'select_wallet',
            data: wallet.appName,
          }),
        })),
        [
          {
            text: '« Back',
            callback_data: JSON.stringify({
              method: 'universal_qr',
            }),
          },
        ],
      ],
    },
  })
}

async function onWalletClick(ctx: ContextType, data: string): Promise<void> {
  const query = ctx.update.callback_query!
  const chatId = query.message!.chat.id
  const connector = getConnector(chatId)

  const wallets = await getWallets()
  const selectedWallet = wallets.find(wallet => wallet.name === data)

  if (!selectedWallet) {
    return
  }

  const link = connector.connect({
    bridgeUrl: (selectedWallet as any).bridgeUrl,
    universalLink: (selectedWallet as any).universalLink,
  })

  await editQR(ctx, link)

  await ctx.editMessageReplyMarkup({
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '« Back',
            callback_data: JSON.stringify({ method: 'chose_wallet' }),
          },
          {
            text: `Open ${selectedWallet.name}`,
            url: link,
          },
        ],
      ],
    },
  })
}

export async function onOpenUniversalQRClick(
  ctx: ContextType,
  _: string
): Promise<void> {
  const chatId = ctx.chat?.id!
  const wallets = await getWallets()
  const connector = getConnector(chatId)
  const link = connector.connect(wallets)

  await editQR(ctx, link)

  await ctx.editMessageReplyMarkup({
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
}

export async function editQR(ctx: ContextType, link: string): Promise<void> {
  const QRCodeBuffer = await QRCode.toBuffer(link)
  const image = new InputFile(QRCodeBuffer)
  const newMedia = InputMediaBuilder.photo(image)

  await ctx.editMessageMedia(newMedia)
}

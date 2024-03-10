import { buyInlineKeyboard } from '../../keyboards/inline_keyboard/index.js'
import { getProduct } from '../../database/methods/index.js'
import { ContextType } from '../../types/index.js'

export const startCommand = async (ctx: ContextType) => {
  try {
    const payload = String(ctx.match)
    const ProductRegExp = /^P[0-9]+$/

    if (ProductRegExp.test(payload)) {
      const productId = Number(payload.replace('P', ''))
      const product = await getProduct(productId)

      if (!product) {
        await ctx.reply(`Product #P${productId} - not found`)
        return
      }

      await ctx.reply(`Product #P${product.id}`, {
        reply_markup: buyInlineKeyboard(product),
      })
    } else {
      await ctx.reply(ctx.t('start', { bot_name: ctx.me.first_name }))
    }
  } catch (e) {
    console.log(e)
  }
}

import { getProduct } from '../../database/methods/index.js'
import { ContextType } from '../../types/index.js'

export const buyCallback = async (ctx: ContextType) => {
  try {
    const callback = ctx.update.callback_query!

    const data = callback.data!
    const user = callback.from!
    const msgWait = callback.message!

    const productId = Number(data.replace('P', ''))
    const product = await getProduct(productId)

    if (!product) {
      await ctx.reply(`Product #P${productId} - not found`)
      return
    }

    await ctx.replyWithDocument(product.file_id, {
      caption: `Product #P${product.id}`,
    })
    await ctx.api.deleteMessage(msgWait.chat.id, msgWait.message_id)
  } catch (e) {
    console.log(e)
  }
}

import * as db from '../../database/methods/index.js'
import { ContextType, ConversationType } from '../../types/index.js'

export const newProduct = async (
  conversation: ConversationType,
  ctx: ContextType
) => {
  let msgWait

  msgWait = await ctx.reply('Пришлите файл, который хотите продать:')
  const { message: msgDocument } = await conversation.wait()
  await ctx.api.deleteMessage(msgWait.chat.id, msgWait.message_id)
  await ctx.api.deleteMessage(msgDocument!.chat.id, msgDocument!.message_id)

  msgWait = await ctx.reply(`Пришлите цену товара в TON:`)
  const { message: msgAmount } = await conversation.wait()
  await ctx.api.editMessageText(msgWait.chat.id, msgWait.message_id, 'Сохранение...')
  await ctx.api.deleteMessage(msgAmount!.chat.id, msgAmount!.message_id)

  const user = msgAmount!.from!
  const product = await db.newProduct(user, {
    file_id: msgDocument?.document?.file_id!,
    amount: Number(msgAmount?.text!),
  })
  console.log('product: ', product)

  await ctx.api.editMessageText(
    msgWait.chat.id,
    msgWait.message_id,
    `Product #P${product?.id}\n\nНапишите в чат покупателя \`@test_sm1_bot P5\`\nИли отправьте ссылку \`t.me/${ctx.me.username}?start=P${product?.id}\``,
    { parse_mode: 'Markdown' }
  )
}

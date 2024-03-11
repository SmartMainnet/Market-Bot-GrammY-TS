import { ContextType } from '../../types/index.js'

export const newProductCommand = async (ctx: ContextType) => {
  try {
    await ctx.conversation.enter('newProduct')
  } catch (e) {
    console.log(e)
  }
}

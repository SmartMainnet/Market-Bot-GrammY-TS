import { ContextType } from '../../types/index.js'

export const newproductCommand = async (ctx: ContextType) => {
  try {
    await ctx.conversation.enter('newProduct')
  } catch (e) {
    console.log(e)
  }
}

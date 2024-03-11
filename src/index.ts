import 'dotenv/config'
import mongoose from 'mongoose'
import { Bot, session } from 'grammy'
import { MongoDBAdapter, ISession } from '@grammyjs/storage-mongodb'
import { conversations, createConversation } from '@grammyjs/conversations'

import { connectMongoose } from './database/connect/index.js'
import { i18nMiddleware, limitMiddleware } from './middlewares/plugins/index.js'
import { deleteCommandMiddleware } from './middlewares/utils/index.js'
import { newProduct } from './handlers/scenes/index.js'
import {
  connectCommand,
  newproductCommand,
  startCommand,
} from './handlers/commands/index.js'
import { buyCallback, choseWalletCallback } from './handlers/callbacks/index.js'
import { ContextType } from './types/index.js'

await connectMongoose()
const collection = mongoose.connection.db.collection<ISession>('sessions')

const { BOT_TOKEN } = process.env
const bot = new Bot<ContextType>(BOT_TOKEN!)

// set commands
await bot.api.setMyCommands([
  { command: 'start', description: 'Restart bot' },
  { command: 'connect', description: 'Connect wallet' },
  { command: 'newproduct', description: 'Create new product' },
])

// plugins
bot.use(i18nMiddleware)
bot.use(limitMiddleware)

// scenes
bot.use(
  session({
    initial: () => ({}),
    storage: new MongoDBAdapter({ collection }),
  })
)
bot.use(conversations())
bot.use(createConversation(newProduct))

// commands
bot.command('start', startCommand)
bot.command('connect', deleteCommandMiddleware, connectCommand)
bot.command('newproduct', newproductCommand)

// messages
bot.hears(/./, async (ctx: ContextType) => {
  console.log(ctx.update.message)
  await ctx.replyWithDocument(ctx.update.message?.document?.file_id!)
})

// callbacks
bot.callbackQuery(/^P[0-9]+$/, buyCallback)
bot.callbackQuery(/./, choseWalletCallback)

// start bot
bot.start({
  onStart(botInfo) {
    console.log('botInfo: ', botInfo)
  },
})

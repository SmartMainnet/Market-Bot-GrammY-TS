import mongoose from 'mongoose'

import { getNextSequence } from '../utils/index.js'

const { Schema } = mongoose

const Products = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: Number,
      required: true,
    },
    file_id: {
      type: String,
      required: true,
    }, // file_id
    asset: {
      type: String,
      default: 'TON',
    }, // USDT, TON
    amount: {
      type: Number,
      required: true,
    }, // 100
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)

Products.index({ id: 1 }, { unique: true })
Products.index({ user_id: 1 })

Products.pre('save', async function (next) {
  if (this.isNew) {
    this.id = await getNextSequence('Products')
  }
  next()
})

export const ProductsModel = mongoose.model('Products', Products)

import { User } from 'grammy/types'

import { ProductsModel } from '../models/index.js'
import { ISceneProduct } from '../../types/index.js'

export const newProduct = async (user: User, product: ISceneProduct) => {
  try {
    return await ProductsModel.create({
      user_id: user.id,
      file_id: product.file_id,
      amount: product.amount,
    })
  } catch (e) {
    console.log(e)
  }
}

export const getProduct = async (id: number) => {
  try {
    return await ProductsModel.findOne({ id })
  } catch (e) {
    console.log(e)
  }
}

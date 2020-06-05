'use strict'

const Product = use('App/Models/Product')

class ProductController {
  /**
   * Show a list of all products.
   * GET products
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index () {
    return await Product.all()
  }
  async store ({ request, response }) {
  }
  async show ({ params}) {
      const product = await Product.findOrFail(params.id)
      return product
  }

  async update ({ params, request, response }) {
    //carregando os dados que estão no Banco de Dados
    const product = await Product.findOrFail(params.id)
    //preparando a alteração
    const data = request.only(['name','description','price', 'stock','photo'])

    //executando a alteração no Objeto Product
    product.merge(data)

    //executando no MySQL
    await product.save()

    return product
  }

  /**
   * Delete a product with id.
   * DELETE products/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = ProductController

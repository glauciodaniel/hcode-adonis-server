'use strict'

// carregando os dados do usuário vindo do MySQL
// utilizando o Model User
const User = use('App/Models/User')
const Helpers = use('Helpers')
const fs = use('fs')
const readFile = Helpers.promisify(fs.readFile)
const uploadDir = 'uploads'

class UserController {

    async store ({ request }){
        const data = request.only(['name','email','photo','birth_at','level','password'])

        const user = await User.create(data)

        return user
    }

    async index() {
        return await User.all()
    }


    async show({ params }){
        const user = await User.findOrFail(params.id)

        return user
    }

    async destroy({ params, auth, response}){
        const user = await User.findOrFail(params.id)

        if(user.id !== auth.user.id) {
            return response.status(401).send({ error: 'Not authorized'})
        }
        await user.delete()
    }

    async update({params, request}){
        const user = await User.findOrFail(params.id)

        const data = request.only(['name','email','photo','birth_at','level','password'])

        user.merge(data)

        await user.save()

        return user
    }

    async changePhoto({params, request, response}) {

        const photo = request.file('file', {
            maxSize: '2mb',
            allowedExtensions: ['jpg', 'png', 'webP', 'jpeg']
        })

        if (!photo) {
            response.status(400).json({error: 'File required' })
            return
        }

        const user = await User.findOrFail(params.id)
        const name = `${user.id}/photo.${photo.extname}`

        await photo.move(Helpers.resourcesPath(uploadDir), {
            name,
            overwrite: true
        })

        if( !photo.moved()){
            response.status(400).json({'error': photo.error()})
        }

        user.photo = `${uploadDir}/${name}`
        await user.save()
        return user
    }

    async photo({params, response }) {
        const user = await User.findOrFail(params.id)
        const content = await readFile(Helpers.resourcesPath(user.photo))
        response.header('Content-type', 'image/*').send(content)
    }

    async changePassword({params, request, response, auth}) {
        const user = await User.findOrFail(params.id)

        const data = request.only(['passwordCurrent','passwordNew'])

        await auth.attempt(user.email, data.passwordCurrent )

        user.password = data.passwordNew

        await user.save()

        return user

    }


}

module.exports = UserController

import { PicGo } from 'picgo'

export = (ctx: PicGo) => {
  const register = (): void => {
    ctx.helper.uploader.register('picgo-plugin-freeimagehost-uploader', {
      handle (ctx) {
        console.log(ctx)
      }
    })
  }
  const commands = (ctx: PicGo) => [{
    label: '',
    key: '',
    name: '',
    async handle (ctx: PicGo, guiApi: any) {}
  }]
  return {
    uploader: 'picgo-plugin-freeimagehost-uploader',
    commands,
    register
  }
}

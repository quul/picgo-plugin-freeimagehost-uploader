import {IPluginConfig, IReqOptions, PicGo} from 'picgo'
import type {IFreeImageHost, IPOSTData} from "./types";
import {URLSearchParams} from "url";

const API_ENDPOINT_URL = 'https://freeimage.host/api/1/upload'

const makePOSTOptions = (data: IPOSTData):IReqOptions => {
  // Workaround. Is there a better way?
  // Since node<18 has no FormData and I don't want polyfill
  const params = new URLSearchParams();
  Object.keys(data).forEach(key=>{
    params.append(key, data[key])
  })
  return {
    method: "post",
    url: API_ENDPOINT_URL,
    data: params.toString(),
    resolveWithFullResponse: true
  }
}

const config = (ctx: PicGo) => {
  const userConfig = ctx.getConfig<IFreeImageHost>('picBed.freeimagehost-uploader')
  const prompts: IPluginConfig[] = [
    {
      name: 'APIKEY',
      type: 'input',
      default: userConfig?.APIKEY || "",
      required: true,
    }
  ]
  return prompts
}


export = (ctx: PicGo) => {
  const register = (): void => {
    ctx.helper.uploader.register('freeimagehost-uploader', {
      async handle(ctx) {
        const config = ctx.getConfig<IFreeImageHost>('picBed.freeimagehost-uploader')
        if (!config && !config.APIKEY) throw new Error('No API KEY')
        try {
          const imageList = ctx.output
          for (const img of imageList) {
            if (img.fileName && img.buffer) {
              const base64Image = img.base64Image || Buffer.from(img.buffer).toString('base64')
              // POST Body
              const data: IPOSTData = {
                key: config.APIKEY,
                action: 'upload',
                source: base64Image,
                format: 'json'
              }
              const postOptions = makePOSTOptions(data)
              const resp = await ctx.request(postOptions)
              const respData = resp.data
              const statusCode = respData['status_code']
              if (statusCode === 200) {
                console.log(respData)
                img.imgUrl = respData["image"]["url"]
              } else {
                throw new Error(`Server error with error: ${respData['status_txt']}, please try again`)
              }
            }
          }
          return ctx
        } catch (e: any) {
          ctx.emit("notification", {
            title: ctx.i18n.translate('UPLOAD_FAILED'),
            body: e.message
          })
          throw e
        }
      },
      name: 'FreeImage.Host',
      config
    })
  }

  return {
    uploader: 'freeimagehost-uploader',
    config,
    register
  }
}

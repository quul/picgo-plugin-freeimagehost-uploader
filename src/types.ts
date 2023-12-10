type IFreeImageHost = {
  APIKEY: string
}

type IPOSTData = {
  key: string
  action: 'upload',
  source: string,
  format: 'json'
}

export {IFreeImageHost, IPOSTData}
let localAppId = ''
try {
  localAppId = require('./appID').default
  console.log('appID', localAppId)
} catch (error) {}

const config = {
  isCustomElement: true,
  appID: localAppId,
  token: '',
  defaultChannelId: 'testdcg',
  pluginPath: '',
  nativeSDKLogPath: './Agora_SDK.log',
  addonLogPath: './Agora_SDK_Addon.log',
  nativeSDKVideoSourceLogPath: './Agora_SDK_Video_Source.log',
}

export default config

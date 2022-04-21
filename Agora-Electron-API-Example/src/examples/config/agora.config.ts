let localAppId = '';
try {
  localAppId = require('./appID').default;
  console.log('appID', localAppId);
} catch (error) {}

const config = {
  appID: localAppId,
  token: '',
  defaultChannelId: 'test',
  pluginPath: '',
  nativeSDKLogPath: './Agora_SDK.log',
  addonLogPath: './Agora_SDK_Addon.log',
  nativeSDKVideoSourceLogPath: './Agora_SDK_Video_Source.log',
  videoSourceAddonLogPath: './Agora_SDK_Video_Source_Addon.log',
};

export default config;

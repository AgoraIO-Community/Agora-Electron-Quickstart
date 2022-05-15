//
//  plugin.hpp
//  plugin
//
//  Created by Jerry-Luo on 2021/5/25.
//

#ifndef plugin_hpp
#define plugin_hpp

#include <iris_rtc_raw_data_plugin.h>
#include <stdio.h>

class MyIAVFramePlugin : public IAVFramePlugin {
public:
  virtual int load(const char *path) override;
  virtual int unLoad() override;
  virtual int enable() override;
  virtual int disable() override;
  virtual int setParameter(const char *param) override;
  virtual const char *getParameter(const char *key) override;
  virtual int release() override;

  virtual bool onPluginCaptureVideoFrame(VideoPluginFrame *videoFrame) override;
  virtual bool onPluginRenderVideoFrame(unsigned int uid,
                                        VideoPluginFrame *videoFrame) override;

  virtual bool onPluginRecordAudioFrame(AudioPluginFrame *audioFrame) override;
  virtual bool
  onPluginPlaybackAudioFrame(AudioPluginFrame *audioFrame) override;
  virtual bool onPluginMixedAudioFrame(AudioPluginFrame *audioFrame) override;
  virtual bool
  onPluginPlaybackAudioFrameBeforeMixing(unsigned int uid,
                                         AudioPluginFrame *audioFrame) override;

  virtual bool onPluginSendAudioPacket(PluginPacket *packet) override;
  virtual bool onPluginSendVideoPacket(PluginPacket *packet) override;
  virtual bool onPluginReceiveAudioPacket(PluginPacket *packet) override;
  virtual bool onPluginReceiveVideoPacket(PluginPacket *packet) override;
};

#endif /* plugin_hpp */

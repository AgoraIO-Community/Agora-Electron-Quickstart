//
//  plugin.cpp
//  plugin
//
//  Created by Jerry-Luo on 2021/5/25.
//

#include "plugin.hpp"
#include <fstream>
using namespace std;
static ofstream fout;

int MyIAVFramePlugin::load(const char *path) { return 0; }
int MyIAVFramePlugin::unLoad() { return 0; }
int MyIAVFramePlugin::enable() { return 0; }
int MyIAVFramePlugin::disable() { return 0; }
int MyIAVFramePlugin::setParameter(const char *param) { return 0; }
const char *MyIAVFramePlugin::getParameter(const char *key) { return key; }
int MyIAVFramePlugin::release() { return 0; }

bool MyIAVFramePlugin::onPluginCaptureVideoFrame(VideoPluginFrame *videoFrame) {
  fout << "onPluginCaptureVideoFrame" << endl;
  fout << endl;
  return true;
}
bool MyIAVFramePlugin::onPluginRenderVideoFrame(unsigned int uid,
                                                VideoPluginFrame *videoFrame) {
  fout << "onPluginRenderVideoFrame" << endl;
  fout << endl;
  return true;
}

bool MyIAVFramePlugin::onPluginRecordAudioFrame(AudioPluginFrame *audioFrame) {
  fout << "onPluginRecordAudioFrame" << endl;
  fout << endl;
  return true;
}
bool MyIAVFramePlugin::onPluginPlaybackAudioFrame(
    AudioPluginFrame *audioFrame) {
  return true;
}
bool MyIAVFramePlugin::onPluginMixedAudioFrame(AudioPluginFrame *audioFrame) {
  fout << "onPluginMixedAudioFrame" << endl;
  fout << endl;
  return true;
}

bool MyIAVFramePlugin::onPluginPlaybackAudioFrameBeforeMixing(
    unsigned int uid, AudioPluginFrame *audioFrame) {
  fout << "onPluginPlaybackAudioFrameBeforeMixing" << endl;
  fout << endl;
  return true;
}

bool MyIAVFramePlugin::onPluginSendAudioPacket(PluginPacket *packet) {
  fout << "onPluginSendAudioPacket" << endl;
  fout << endl;
  return true;
}
bool MyIAVFramePlugin::onPluginSendVideoPacket(PluginPacket *packet) {
  fout << "onPluginSendVideoPacket" << endl;
  fout << endl;
  return true;
}
bool MyIAVFramePlugin::onPluginReceiveAudioPacket(PluginPacket *packet) {
  fout << "onPluginReceiveAudioPacket" << endl;
  fout << endl;
  return true;
}
bool MyIAVFramePlugin::onPluginReceiveVideoPacket(PluginPacket *packet) {
  fout << "onPluginReceiveVideoPacket" << endl;
  fout << endl;
  return true;
}

IAVFramePlugin *createAVFramePlugin() {
  fout = std::ofstream("./plugin.log");

  MyIAVFramePlugin *myPluginPtr = new MyIAVFramePlugin();
  return myPluginPtr;
}

chooseExampleType=$1
outterZipName="electronDemo.zip"

packOldPremium() {
  pushd Agora-Electron-Premium
  echo 当前工作路径:$(pwd)
  rm -rf node_modules
  yarn
  cp -P -R ../Electron-*/* node_modules/agora-electron-sdk/
  yarn dist:zip

  pushd dist/mac
  zip -ry $(pwd)/../../../${outterZipName} agora-electron.app
  popd
  popd
}

packIris() {
  pushd Agora-Electron-Iris
  echo 当前工作路径:$(pwd)
  rm -rf node_modules
  rm -rf src/node_modules
  yarn
  cp -P -R ../Electron-*/* src/node_modules/agora-electron-sdk/
  yarn package-mac

  pushd release/mac
  zip -ry $(pwd)/../../../${outterZipName} ElectronReact.app
  popd

  popd
}

case $chooseExampleType in
1)
  echo '打包: 老版本Premium'
  packOldPremium
  ;;
2)
  echo '打包: Iris'
  packIris
  ;;
3)
  echo '你选择了 3'
  ;;
4)
  echo '你选择了 4'
  ;;
*)
  echo '你没有输入 1 到 4 之间的数字'
  ;;
esac

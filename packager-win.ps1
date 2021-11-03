$chooseExampleType=$args[0]
$outterZipName="electronDemo.zip"


function ChooseArch($type)
{
  if($type -eq 1){
    write-host("ChooseArch x32")
    Copy-Item -Path ../.npmrc_x32 -Destination ./.npmrc -Force
  } elseif($type -eq 2){
    write-host("ChooseArch x64")
    Copy-Item -Path ../.npmrc_x64 -Destination ./.npmrc -Force
  }else {
    write-host("not set arch type")
  }
}

function distByArch($type)
{
  
  if($type -eq 1){
    write-host("distByArch x32")
    yarn dist:win32
  } elseif($type -eq 2){
    write-host("distByArch x64")
    yarn dist:win64
  }else {
    write-host("not set arch type")
  }
}

switch -Regex ($chooseExampleType)
{
    1 {
      pushd Agora-Electron-API-Example
      # choose arch
      ChooseArch -type $args[1]
      # remove node_modules
      Remove-Item -Path node_modules -Recurse -Force -ErrorAction Ignore;
      # remove node_modules
      Remove-Item -Path src/node_modules -Recurse -Force -ErrorAction Ignore;
      # remove dist
      Remove-Item -Path release -Recurse -Force -ErrorAction Ignore;
      yarn
      # copy native sdk
      Copy-Item -Path ../Electron-*/* -Destination src/node_modules/agora-electron-sdk/ -Recurse -Force
      # dist start
      DistByArch -type $args[1]
      # move zip
      Copy-Item -Path release/ElectronReact-*.zip -Destination ../$outterZipName -Recurse -Force
      popd;
      Break
    }
    2 {
      pushd Agora-Electron-API-Example-Iris
      # choose arch
      ChooseArch -type $args[1]
      # remove node_modules
      Remove-Item -Path node_modules -Recurse -Force -ErrorAction Ignore;
      # remove node_modules
      Remove-Item -Path src/node_modules -Recurse -Force -ErrorAction Ignore;
      # remove dist
      Remove-Item -Path release -Recurse -Force -ErrorAction Ignore;
      yarn
      # copy native sdk
      Copy-Item -Path ../Electron-*/* -Destination src/node_modules/agora-electron-sdk/ -Recurse -Force
      # dist start
      DistByArch -type $args[1]
      # move zip
      Copy-Item -Path release/ElectronReact-*.zip -Destination ../$outterZipName -Recurse -Force
      popd;
      Break
    }
    3 {
      pushd Agora-Electron-Premium
      # choose arch
      ChooseArch -type $args[1]
      # remove node_modules
      Remove-Item -Path node_modules -Recurse -Force -ErrorAction Ignore;
      # remove dist
      Remove-Item -Path dist -Recurse -Force -ErrorAction Ignore;
      yarn
      # copy native sdk
      Copy-Item -Path ../Electron-*/* -Destination ./node_modules/agora-electron-sdk/ -Recurse -Force
      # dist start
      DistByArch -type $args[1]
      # move zip
      Copy-Item -Path dist/agora-electron-*.zip -Destination ../$outterZipName -Recurse -Force
      popd;
      Break
    }
    4 {"It is four."; Break}
}


echo "结束"

# IF "%chooseExampleType%"=="0" (
#   cd Agora-Electron-Premium
#   echo 当前工作路径: %cd%

#   @REM del /f/q/s node_modules
#   @REM call yarn --verbose
  
#   xcopy %cd%/Electron-*  node_modules/agora-electron-sdk/ /s /e /y
#   @REM call yarn dist:zip

#   @REM pushd dist
#   @REM 7z a %cd%/../../../%outterZipName% win-unpacked
#   @REM popd
#   @REM popd
# ) ELSE IF "%chooseExampleType%"=="1" (
#   echo 1
# ) ELSE IF "%chooseExampleType%"=="2" (
  
#   echo 2
# ) ELSE (
  
#   echo default
# )


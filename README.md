## Issues

UPDATE 22/4/2025: react-native-queue is removed entirely.

1. If face error `/node_modules/react-native-queue/node_modules/realm/node_modules/.bin/node-pre-gyp" "install" "--fallback-to-build"`

   - Steps
   - 1. remove package `"react-native-queue": "^1.2.1",`
   - 2. run command `yarn`
   - 3. run command `nvm use v10.15.1`
   - 4. run command `yarn add react-native-queue`
        To check if you have the required node version
   - run command `nvm ls`
   - if don't have the version, run command `nvm install v10.15.1`, after install run command in step 3 and step 4

2. If having error in running android emulator

   - Add this "x86_64", "x86" to build.gradle ('arm64-v8a')

3. If having tslint related error

   - Add this to eslintrc.js "rules: {'prettier/prettier': ['error', {endOfLine: 'auto'}]},"
#   t e s t - e p o d - m i g r a t e  
 
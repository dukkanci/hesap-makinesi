[app]

# (str) Title of your application
title = Hesap Makinesi

# (str) Package name
package.name = hesapmakinesi

# (str) Package domain (needed for android/ios packaging)
package.domain = org.example

# (str) Source code where the main.py live
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas,json

# (list) List of inclusions using pattern matching
#source.include_patterns = assets/*,images/*.png

# (list) Source files to exclude (let empty to not exclude anything)
#source.exclude_exts = spec

# (list) List of directory to exclude (let empty to not exclude anything)
#source.exclude_patterns = license,images/*/*.jpg

# (str) Application versioning (method 1)
version = 1.0.0

# (str) Application versioning (method 2)
# version.regex = __version__ = ['"](.*)['"]
# version.filename = %(source.dir)s/main.py

# (str) Main Python file to use as entry point
main = main.py

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3,kivy==2.3.0

# (str) Custom source folders for requirements
# Sets custom source for any requirements with recipes
# requirements.source = my_requirements

# (str) Presplash of the application
#presplash.filename = %(source.dir)s/data/presplash.png

# (str) Icon of the application
#icon.filename = %(source.dir)s/data/icon.png

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = portrait

# (list) List of service to declare
#services = NAME:ENTRYPOINT_TO_PY,NAME2:ENTRYPOINT2_TO_PY

#
# OSX Specific
#

# (str) Change the major version of python used by the app
osx.python_version = 3

# (str) Kivy version to use
osx.kivy_version = 2.3.0

#
# Android specific
#

# (bool) Indicate if the application should be fullscreen or not
fullscreen = 0

# (str) Presplash background color (new android toolchain)
# Supported formats are: #RRGGBB #AARRGGBB or one of the following names:
# red, blue, green, black, white, gray, cyan, magenta, yellow, lightgray,
# darkgray, grey, lightgrey, darkgrey, aqua, fuchsia, lime, maroon, navy,
# olive, purple, silver, teal.
android.presplash_color = #1a1a1a

# (str) Presplash animation using Lottie format
# see https://lottiefiles.com/ for examples
#android.presplash_lottie = %(source.dir)s/presplash.json

# (list) Permissions
android.permissions = INTERNET

# (int) Target Android API, should be as high as possible.
android.api = 34

# (int) Minimum API your APK / AAB will support.
android.minapi = 21

# (int) Android SDK version to use
android.sdk = 34

# (str) Android NDK version to use
android.ndk = 27c

# (int) Android NDK API to use. This is the minimum API your app will support, it should usually match android.minapi.
android.ndk_api = 21

# (bool) Use --private data storage (True) or dir public storage (False)
#android.private_storage = True

# (str) Android NDK directory (if empty, it will be automatically downloaded.)
#android.ndk_path =

# (str) Android SDK directory (if empty, it will be automatically downloaded.)
#android.sdk_path =

# (str) ANT directory (if empty, it will be automatically downloaded.)
#android.ant_path =

# (bool) If True, then skip trying to update the Android SDK
# This can be useful to speed up the build if you know the SDK is up to date
#android.skip_update = False

# (bool) If True, then automatically accept SDK license
android.accept_sdk_license = True

# (str) Android entry point, default is ok for Kivy-based app
#android.entrypoint = org.kivy.android.PythonActivity

# (str) Full name including package path of the Java class that implements Android Activity
# Use that parameter together with android.entrypoint to use custom Java class
#android.activity_class_name = org.kivy.android.PythonActivity

# (str) Extra xml to write directly inside the <manifest> element of AndroidManifest.xml
# Use that parameter to provide a custom manifest
#android.manifest = <manifest ...></manifest>

# (str) Extra xml to write directly inside the <manifest><application> tag of AndroidManifest.xml
#android.application = <application ...></application>

# (str) Extra xml to write directly inside the <manifest><activity> tag of AndroidManifest.xml
#android.activity = <activity ...></activity>

# (str) Intent filters to add to the activity tag in AndroidManifest.xml
#android.intent_filters =

# (bool) Copy library instead of making a libpymodules.so
#android.copy_libs = 1

# (str) The Android arch to build for, choices: armeabi-v7a, arm64-v8a, x86, x86_64
# In past, was `android.arch` but we're using `android.archs` now
# Build for both arm architectures for maximum compatibility
android.archs = armeabi-v7a,arm64-v8a

# (int) port number to specify an explicit --port= p argument to buildozer
#android.port = 8888

# (bool) Enable AndroidX support
android.enable_androidx = True

# (str) Add a custom manifest placeholder
#android.manifest_placeholders =

# (list) Add shared libraries to the APK
#android.add_libs_armeabi_v7a = libs/armeabi-v7a/*.so
#android.add_libs_arm64_v8a = libs/arm64-v8a/*.so

# (list) Gradle dependencies to add
#android.gradle_dependencies =

# (str) python-for-android branch to use, if not master
p4a.branch = master

# (str) OUYA Console category
#android.ouya.category = GAME

# (str) Filename of OUYA Console icon
#android.ouya.icon.filename = %(source.dir)s/data/ouya_icon.png

# (str) XML to include as an intent filter in <activity> tag
#android.manifest.intent_filter =

# (str) launchMode to set for the main activity
#android.manifest.launch_mode = standard

# (list) Android additional libraries to copy into libs/armeabi
#android.add_libs_armeabi = libs/armeabi/*.so

# (list) Android additional libraries to copy into libs/armeabi-v7a
#android.add_libs_armeabi_v7a = libs/armeabi-v7a/*.so

# (list) Android additional libraries to copy into libs/arm64-v8a
#android.add_libs_arm64_v8a = libs/arm64-v8a/*.so

# (list) Android additional libraries to copy into libs/x86
#android.add_libs_x86 = libs/x86/*.so

# (list) Android additional libraries to copy into libs/x86_64
#android.add_libs_x86_64 = libs/x86_64/*.so

# (str) Android logcat filters to use
#android.logcat_filters = *:S python:D

# (bool) Copy library instead of making a libpymodules.so
#android.copy_libs = 1

#
# iOS specific
#

# (str) Path to a custom kivy-ios folder
#ios.kivy_ios_dir = ../kivy-ios

# (str) Name of the certificate to use for signing the debug version
# Get a list of available identities: buildozer ios list_identities
#ios.codesign.debug = "iPhone Developer: <lastname> <firstname> (<hexstring>)"

# (str) Name of the certificate to use for signing the release version
#ios.codesign.release = %(ios.codesign.debug)

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug (with command output))
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 1

# (str) Path to build artifact storage, absolute or relative to spec file
# build_dir = ./.buildozer

# (str) Path to build output (i.e. .apk, .ipa) storage
# bin_dir = ./bin

#    -----------------------------------------------------------------------------
#    List as sections
#
# You can define multiple "list as" sections:
# [list as section_name]
# key1 = value1
# key2 = value2
# ...
#    -----------------------------------------------------------------------------
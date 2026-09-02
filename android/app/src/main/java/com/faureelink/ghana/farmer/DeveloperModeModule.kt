package com.faureelink.ghana.farmer

import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeveloperModeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DeveloperModeModule"

    @ReactMethod
    fun isDeveloperModeEnabled(promise: Promise) {
        try {
            val devMode = Settings.Secure.getInt(
                reactApplicationContext.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            )
            promise.resolve(devMode != 0)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}

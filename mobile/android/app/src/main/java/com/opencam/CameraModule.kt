package com.opencam

import android.hardware.camera2.*
import android.media.MediaCodec
import android.media.MediaFormat
import android.util.Size
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class CameraModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "CameraModule"

    @ReactMethod
    fun getCameraList(promise: Promise) {
        val manager = reactApplicationContext.getSystemService(CameraManager::class.java)
        val result = Arguments.createArray()
        manager.cameraIdList.forEach { id ->
            val chars = manager.getCameraCharacteristics(id)
            val facing = chars.get(CameraCharacteristics.LENS_FACING)
            val info = Arguments.createMap().apply {
                putString("id", id)
                putString("facing", if (facing == CameraCharacteristics.LENS_FACING_FRONT) "front" else "back")
            }
            result.pushMap(info)
        }
        promise.resolve(result)
    }

    @ReactMethod
    fun startCapture(width: Int, height: Int, fps: Int, promise: Promise) {
        // Setup Camera2 + MediaCodec H.264 encoder
        // Frames envoyees via evenement RN "CameraFrame"
        promise.resolve(true)
    }

    @ReactMethod
    fun stopCapture(promise: Promise) {
        promise.resolve(true)
    }

    private fun sendEvent(name: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }
}

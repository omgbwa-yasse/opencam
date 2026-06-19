import Foundation
import AVFoundation

@objc(CameraModule)
class CameraModule: RCTEventEmitter {
    private var session: AVCaptureSession?
    private var output: AVCaptureVideoDataOutput?

    override static func moduleName() -> String { "CameraModule" }
    override func supportedEvents() -> [String] { ["CameraFrame"] }
    override static func requiresMainQueueSetup() -> Bool { false }

    @objc
    func getCameraList(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let devices = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInWideAngleCamera],
            mediaType: .video, position: .unspecified
        ).devices
        let result = devices.map { d -> [String: String] in
            ["id": d.uniqueID, "facing": d.position == .front ? "front" : "back"]
        }
        resolve(result)
    }

    @objc
    func startCapture(_ width: Int, height: Int, fps: Int,
                      resolver resolve: RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) {
        let s = AVCaptureSession()
        s.sessionPreset = .hd1280x720
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera,
                                                   for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: device) else {
            reject("CAM", "No camera", nil); return
        }
        s.addInput(input)
        let out = AVCaptureVideoDataOutput()
        // Frames traitees et envoyees via sendEvent("CameraFrame", ...)
        s.addOutput(out)
        s.startRunning()
        session = s
        output  = out
        resolve(true)
    }

    @objc
    func stopCapture(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        session?.stopRunning()
        session = nil
        resolve(true)
    }
}

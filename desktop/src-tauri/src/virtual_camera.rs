use std::sync::atomic::{AtomicBool, Ordering};

static ACTIVE: AtomicBool = AtomicBool::new(false);

pub fn set_active(active: bool) {
    ACTIVE.store(active, Ordering::Relaxed);
}

#[cfg(target_os = "linux")]
pub fn push_frame(frame: &[u8]) -> anyhow::Result<()> {
    if !ACTIVE.load(Ordering::Relaxed) { return Ok(()); }
    use std::io::Write;
    let mut f = std::fs::OpenOptions::new().write(true).open("/dev/video10")?;
    f.write_all(frame)?;
    Ok(())
}

#[cfg(target_os = "windows")]
pub fn push_frame(frame: &[u8]) -> anyhow::Result<()> {
    if !ACTIVE.load(Ordering::Relaxed) { return Ok(()); }
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    // Ecriture dans la shared memory DirectShow
    let name: Vec<u16> = OsStr::new("OpenCamFrameBuffer")
        .encode_wide().chain(std::iter::once(0)).collect();
    unsafe {
        let mapping = windows_sys::Win32::System::Memory::OpenFileMappingW(
            0x0002, // FILE_MAP_WRITE
            0,
            name.as_ptr(),
        );
        if mapping.is_null() { return Ok(()); }
        let ptr = windows_sys::Win32::System::Memory::MapViewOfFile(
            mapping, 0x0002, 0, 0, 0
        );
        if !ptr.is_null() {
            // Header = 24 bytes, on ecrit la frame apres
            let dst = (ptr as *mut u8).add(24);
            std::ptr::copy_nonoverlapping(frame.as_ptr(), dst, frame.len());
            windows_sys::Win32::System::Memory::UnmapViewOfFile(ptr);
        }
        windows_sys::Win32::Foundation::CloseHandle(mapping);
    }
    Ok(())
}

#[cfg(target_os = "macos")]
pub fn push_frame(_frame: &[u8]) -> anyhow::Result<()> {
    // XPC vers l'extension CoreMediaIO -- implementation complete dans driver/macos/
    if !ACTIVE.load(Ordering::Relaxed) { return Ok(()); }
    log::debug!("push_frame macOS: XPC stub");
    Ok(())
}

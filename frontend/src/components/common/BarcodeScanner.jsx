import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export function BarcodeScanner({ onScanSuccess, onClose }) {
    const scannerRef = useRef(null);
    // Use a ref to keep track of the scanner instance so we can clear it reliably
    const html5QrcodeScannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Wait for the verify DOM element to be ready
        if (!scannerRef.current) return;

        // Custom config
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.QR_CODE
            ]
        };

        const scannerId = "reader";

        // Cleanup function to clear scanner
        const cleanupScanner = async () => {
            if (html5QrcodeScannerRef.current) {
                try {
                    await html5QrcodeScannerRef.current.clear();
                    html5QrcodeScannerRef.current = null;
                } catch (error) {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                }
            }
        };

        // Initialize scanner
        const initScanner = async () => {
            // Ensure previous instance is cleared
            await cleanupScanner();

            try {
                const scanner = new Html5QrcodeScanner(scannerId, config, /* verbose= */ false);
                html5QrcodeScannerRef.current = scanner;

                const onScanSuccessCallback = (decodedText, decodedResult) => {
                    // Handle the scanned code
                    console.log(`Code matched = ${decodedText}`, decodedResult);
                    onScanSuccess(decodedText);

                    // Stop scanning after success
                    cleanupScanner();
                };

                const onScanFailureCallback = (errorMessage) => {
                    // console.warn(`Code scan error = ${errorMessage}`);
                };

                scanner.render(onScanSuccessCallback, onScanFailureCallback);

            } catch (err) {
                console.error("Error starting scanner", err);
                setScanError("Failed to start camera. Please ensure permissions are granted.");
            }
        };

        initScanner();

        // Cleanup
        return () => {
            cleanupScanner();
        };
    }, []); // Removed dependency to prevent re-initialization

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Scan Barcode</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {scanError ? (
                        <div className="text-red-500 text-center py-8">
                            <p>{scanError}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-gray-100 rounded-md text-sm font-medium hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div id="reader" ref={scannerRef} className="w-full"></div>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Point your camera at a barcode to scan.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

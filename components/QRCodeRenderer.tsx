import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { QRCodeConfig } from '../types';

interface Props {
  config: QRCodeConfig;
  className?: string;
}

export interface QRCodeHandle {
  download: () => void;
}

const QRCodeRenderer = forwardRef<QRCodeHandle, Props>(({ config, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useImperativeHandle(ref, () => ({
    download: async () => {
      if (!qrCode.current) return;
      
      // Calculate proportional margin for high-res export (approx 5% of size)
      // This ensures the "padding" look is preserved in the downloaded file
      const exportMargin = Math.floor(config.size * 0.05);

      // Update with full size and proportional margin for download
      qrCode.current.update({
          width: config.size,
          height: config.size,
          margin: exportMargin
      });
      
      await qrCode.current.download({ 
        name: `qr-studio-${Date.now()}`, 
        extension: config.fileExt 
      });

      // Revert to preview size and fixed preview margin
      qrCode.current.update({
          width: 280,
          height: 280,
          margin: 10
      });
    }
  }));

  // Initialize
  useEffect(() => {
    if (!qrCode.current) {
        qrCode.current = new QRCodeStyling({
            width: 280, 
            height: 280,
            margin: 10, // Add default padding to preview
            type: "svg",
            data: config.value,
            image: config.logoUrl || undefined,
            qrOptions: {
                errorCorrectionLevel: config.errorCorrectionLevel
            },
            dotsOptions: {
                color: config.dotColor,
                type: config.dotStyle
            },
            backgroundOptions: {
                color: config.bgEnabled && config.bgType === 'color' ? config.bgColor : 'transparent',
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 5
            }
        });
        if (containerRef.current) {
            containerRef.current.innerHTML = '';
            qrCode.current.append(containerRef.current);
        }
    }
  }, []);

  // Update
  useEffect(() => {
    if (!qrCode.current) return;

    const options: any = {
        width: 280, // Preview size
        height: 280,
        margin: 10, // Maintain padding in preview
        data: config.value,
        image: config.logoUrl || undefined,
        qrOptions: {
            errorCorrectionLevel: config.errorCorrectionLevel
        },
        dotsOptions: {
            type: config.dotStyle,
            color: config.dotColor
        },
        backgroundOptions: {
             // If image background is used, we set the QR library background to transparent
             // so the underlying image div shows through.
             color: config.bgEnabled && config.bgType === 'color' ? config.bgColor : 'transparent',
        },
        cornersSquareOptions: {
            type: config.cornerSquareStyle,
            color: config.useGradient ? undefined : config.dotColor 
        },
        cornersDotOptions: {
            type: config.cornerDotStyle,
            color: config.useGradient ? undefined : config.dotColor
        }
    };

    // Apply Gradient
    if (config.useGradient) {
        const gradient = {
            type: config.gradient.type,
            rotation: (config.gradient.rotation * Math.PI) / 180,
            colorStops: [
                { offset: 0, color: config.gradient.color1 },
                { offset: 1, color: config.gradient.color2 }
            ]
        };
        options.dotsOptions.gradient = gradient;
        options.cornersSquareOptions.gradient = gradient;
        options.cornersDotOptions.gradient = gradient;
        
        // Remove solid colors so gradient shows
        delete options.dotsOptions.color;
        delete options.cornersSquareOptions.color;
        delete options.cornersDotOptions.color;
    } else {
        options.dotsOptions.gradient = undefined;
        options.cornersSquareOptions.gradient = undefined;
        options.cornersDotOptions.gradient = undefined;
    }

    qrCode.current.update(options);

  }, [config]);

  return (
    <div className={`relative ${className}`}>
        {/* Layered Background Image for Preview */}
        {config.bgEnabled && config.bgType === 'image' && config.bgImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center rounded-sm z-0" 
                style={{ 
                    backgroundImage: `url(${config.bgImage})`, 
                    opacity: config.bgOpacity,
                    // Ensures the background fits nicely behind the QR code
                }}
            />
        )}
        
        {/* QR Code Canvas */}
        <div ref={containerRef} className="relative z-10" id="canvas-container"></div>
    </div>
  );
});

QRCodeRenderer.displayName = "QRCodeRenderer";
export default QRCodeRenderer;
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

function getRoundedRectPath(x: number, y: number, w: number, h: number, radii: [number, number, number, number]) {
  const [tl, tr, br, bl] = radii;
  return `
    M ${x + tl} ${y}
    L ${x + w - tr} ${y}
    Q ${x + w} ${y} ${x + w} ${y + tr}
    L ${x + w} ${y + h - br}
    Q ${x + w} ${y + h} ${x + w - br} ${y + h}
    L ${x + bl} ${y + h}
    Q ${x} ${y + h} ${x} ${y + h - bl}
    L ${x} ${y + tl}
    Q ${x} ${y} ${x + tl} ${y} Z
  `;
}

function getClipPathCSS(radii: [number, number, number, number]) {
  const [tl, tr, br, bl] = radii;
  const p = (val: number) => `${val}%`;
  // Construct complex polygon or just use border-radius for CSS
  // Using standard border-radius CSS is easier for HTML div overlay:
  return `${p(tl)} ${p(tr)} ${p(br)} ${p(bl)}`;
}

const QRCodeRenderer = forwardRef<QRCodeHandle, Props>(({ config, className }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  // Re-apply SVG styling whenever it mutates or config changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    let isProcessing = false;
    
    const fixSvg = () => {
        if (isProcessing) return;
        
        const svg = containerRef.current?.querySelector('svg');
        if (!svg) return;
        
        // Prevent observation of our own changes
        isProcessing = true;
        
        try {
            if (svg.getAttribute('viewBox') !== '0 0 1000 1000') {
                svg.setAttribute('viewBox', '0 0 1000 1000');
            }
            if (svg.getAttribute('width') !== '100%') {
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
            }
            
            let defs = svg.querySelector('defs');
            if (!defs) {
                defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                svg.insertBefore(defs, svg.firstChild);
            }

            // Apply background clipping
            const bgRects = Array.from(svg.querySelectorAll('rect'));
            const bgRect = bgRects.find(r => r.getAttribute('width') === '1000' || r.getAttribute('width') === '100%');
            
            const [bgTL, bgTR, bgBR, bgBL] = config.bgRadius;
            if (bgRect && (bgTL > 0 || bgTR > 0 || bgBR > 0 || bgBL > 0)) {
                let bgClip = defs.querySelector('#bg-clip');
                if (!bgClip) {
                    bgClip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                    bgClip.setAttribute('id', 'bg-clip');
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    bgClip.appendChild(path);
                    defs.appendChild(bgClip);
                }
                const pTL = bgTL * 10; const pTR = bgTR * 10; const pBR = bgBR * 10; const pBL = bgBL * 10;
                const d = getRoundedRectPath(0, 0, 1000, 1000, [pTL, pTR, pBR, pBL]);
                
                const pathNode = bgClip.firstChild as Element;
                if (pathNode.getAttribute('d') !== d) {
                    pathNode.setAttribute('d', d);
                }
                
                if (bgRect.getAttribute('clip-path') !== 'url(#bg-clip)') {
                    bgRect.setAttribute('clip-path', 'url(#bg-clip)');
                }
            } else if (bgRect && bgRect.hasAttribute('clip-path')) {
                bgRect.removeAttribute('clip-path');
            }

            // Handle logo rounding
            const imageNode = svg.querySelector('image');
            if (imageNode) {
                const x = parseFloat(imageNode.getAttribute('x') || '0');
                const y = parseFloat(imageNode.getAttribute('y') || '0');
                const w = parseFloat(imageNode.getAttribute('width') || '0');
                const h = parseFloat(imageNode.getAttribute('height') || '0');
                
                const [lTL, lTR, lBR, lBL] = config.logoRadius;
                if (w > 0 && h > 0 && (lTL > 0 || lTR > 0 || lBR > 0 || lBL > 0)) {
                     let logoClip = defs.querySelector('#logo-clip');
                     if (!logoClip) {
                         logoClip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
                         logoClip.setAttribute('id', 'logo-clip');
                         const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                         logoClip.appendChild(path);
                         defs.appendChild(logoClip);
                     }
                     const maxRadius = Math.min(w, h) / 2;
                     const pTL = (lTL / 50) * maxRadius; 
                     const pTR = (lTR / 50) * maxRadius;
                     const pBR = (lBR / 50) * maxRadius;
                     const pBL = (lBL / 50) * maxRadius;
                     const d = getRoundedRectPath(x, y, w, h, [pTL, pTR, pBR, pBL]);
                     
                     const pathNode = logoClip.firstChild as Element;
                     if (pathNode.getAttribute('d') !== d) {
                         pathNode.setAttribute('d', d);
                     }
                     
                     if (imageNode.getAttribute('clip-path') !== 'url(#logo-clip)') {
                         imageNode.setAttribute('clip-path', 'url(#logo-clip)');
                     }
                } else if (imageNode.hasAttribute('clip-path')) {
                    imageNode.removeAttribute('clip-path');
                }
            }
        } finally {
            // Processing done, allow observation again
            setTimeout(() => { isProcessing = false; }, 0);
        }
    };
    
    // Watch for internal SVG rebuilds
    const observer = new MutationObserver(fixSvg);
    observer.observe(containerRef.current, { childList: true, subtree: true, attributes: true });
    
    // Explicitly call fix once 
    setTimeout(fixSvg, 50);
    
    return () => observer.disconnect();
  }, [config]);

  useImperativeHandle(ref, () => ({
    download: async () => {
      const svgNode = containerRef.current?.querySelector('svg');
      if (!svgNode) return;
      
      const clone = svgNode.cloneNode(true) as SVGSVGElement;
      
      // Calculate export sizing
      const exportMargin = Math.floor(config.size * 0.05); // 5% native padding
      // Re-scale internal viewport if we want, or just let SVG scale to custom canvas width
      // Since viewBox is 0 0 1000 1000, forcing width/height to config.size is perfect.
      clone.setAttribute('width', config.size.toString());
      clone.setAttribute('height', config.size.toString());
      
      // If we use an HTML background image, we must inject it into the SVG clone for export
      if (config.bgEnabled && config.bgType === 'image' && config.bgImage) {
           const bgImg = document.createElementNS("http://www.w3.org/2000/svg", "image");
           bgImg.setAttribute("href", config.bgImage);
           bgImg.setAttribute("x", "0");
           bgImg.setAttribute("y", "0");
           bgImg.setAttribute("width", "1000"); // Matches viewBox
           bgImg.setAttribute("height", "1000");
           bgImg.setAttribute("preserveAspectRatio", "xMidYMid slice");
           bgImg.setAttribute("opacity", config.bgOpacity.toString());
           
           // Apply background clipping if any
           const [bgTL, bgTR, bgBR, bgBL] = config.bgRadius;
           if (bgTL > 0 || bgTR > 0 || bgBR > 0 || bgBL > 0) {
               bgImg.setAttribute('clip-path', 'url(#bg-clip)');
           }
           
           clone.insertBefore(bgImg, clone.firstChild);
      }

      const serialized = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      if (config.fileExt === 'svg') {
          const link = document.createElement("a");
          link.href = url;
          link.download = `qr-studio-${Date.now()}.svg`;
          link.click();
          URL.revokeObjectURL(url);
      } else {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = config.size;
              canvas.height = config.size;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                  // Transparent base
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, config.size, config.size);
                  const dataUrl = canvas.toDataURL(`image/${config.fileExt}`, 1.0);
                  const link = document.createElement("a");
                  link.href = dataUrl;
                  link.download = `qr-studio-${Date.now()}.${config.fileExt}`;
                  link.click();
              }
              URL.revokeObjectURL(url);
          };
          img.crossOrigin = "anonymous";
          img.src = url;
      }
    }
  }));

  // Initialize
  useEffect(() => {
    if (!qrCode.current) {
        qrCode.current = new QRCodeStyling({
            width: 1000, 
            height: 1000,
            margin: 50,
            type: "svg",
            data: config.value,
            image: config.logoUrl || undefined,
            qrOptions: { errorCorrectionLevel: config.errorCorrectionLevel },
            dotsOptions: { color: config.dotColor, type: config.dotStyle },
            backgroundOptions: { color: config.bgEnabled && config.bgType === 'color' ? config.bgColor : 'transparent' },
            imageOptions: { crossOrigin: "anonymous", margin: 5 }
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
        width: 1000, 
        height: 1000,
        margin: 50, 
        data: config.value,
        image: config.logoUrl || undefined,
        qrOptions: { errorCorrectionLevel: config.errorCorrectionLevel },
        dotsOptions: { type: config.dotStyle, color: config.dotColor },
        backgroundOptions: {
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

  const cssRadii = getClipPathCSS(config.bgRadius);

  return (
    <div className={`relative ${className}`}>
        {/* Layered Background Image for Preview */}
        {config.bgEnabled && config.bgType === 'image' && config.bgImage && (
            <div 
                className="absolute inset-0 bg-cover bg-center z-0 overflow-hidden" 
                style={{ 
                    backgroundImage: `url(${config.bgImage})`, 
                    opacity: config.bgOpacity,
                    borderRadius: cssRadii
                }}
            />
        )}
        
        {/* QR Code Canvas */}
        <div ref={containerRef} className="relative z-10 w-full h-full flex items-center justify-center"></div>
    </div>
  );
});

QRCodeRenderer.displayName = "QRCodeRenderer";
export default QRCodeRenderer;
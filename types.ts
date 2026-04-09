export enum QRType {
  WEBSITE = 'website',
  TEXT = 'text',
  WIFI = 'wifi',
  VCARD = 'vcard',
  PHONE = 'phone',
  LOCATION = 'location',
  CALENDAR = 'calendar',
  BUSINESS = 'business',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  YOUTUBE = 'youtube'
}

export type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerType = 'square' | 'dot' | 'extra-rounded';
export type GradientType = 'linear' | 'radial';
export type FileExtension = 'png' | 'jpeg' | 'svg' | 'webp';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface GradientConfig {
  type: GradientType;
  rotation: number;
  color1: string;
  color2: string;
}

export interface QRCodeConfig {
  // Content
  type: QRType;
  value: string;
  
  // Design - Dots
  dotStyle: DotType;
  dotColor: string;
  useGradient: boolean;
  gradient: GradientConfig;

  // Design - Background
  bgEnabled: boolean;
  bgType: 'color' | 'image';
  bgColor: string;
  bgImage: string | null;
  bgOpacity: number;

  // Design - Corners
  cornerSquareStyle: CornerType; // 'square' | 'dot' | 'extra-rounded'
  cornerDotStyle: CornerType;    // 'square' | 'dot'

  // Configuration
  errorCorrectionLevel: ErrorCorrectionLevel;

  // Logo
  logoUrl: string | null;
  
  // Meta
  size: number;
  fileExt: FileExtension;
}

export const DEFAULT_CONFIG: QRCodeConfig = {
  type: QRType.WEBSITE,
  value: 'https://example.com',
  
  dotStyle: 'square',
  dotColor: '#000000',
  useGradient: false,
  gradient: {
    type: 'linear',
    rotation: 135,
    color1: '#000000',
    color2: '#2563eb'
  },
  
  bgEnabled: true,
  bgType: 'color',
  bgColor: '#ffffff',
  bgImage: null,
  bgOpacity: 1,

  cornerSquareStyle: 'square',
  cornerDotStyle: 'square',

  errorCorrectionLevel: 'M',

  logoUrl: null,
  
  size: 1000,
  fileExt: 'png'
};
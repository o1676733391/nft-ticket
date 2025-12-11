// src/components/DebugImage.js
import React from 'react';
import { Image as RNImage } from 'react-native';

/**
 * Debug wrapper for Image component to catch object vs string issues
 */
export default function DebugImage(props) {
  const { source, ...rest } = props;
  
  // Log what we're receiving
  if (source) {
    console.log('DebugImage source:', {
      type: typeof source,
      isObject: typeof source === 'object',
      hasUri: source?.uri !== undefined,
      value: source,
      stack: new Error().stack.split('\n')[2], // Show caller
    });
    
    // Check for common mistakes
    if (typeof source === 'object' && source.uri && typeof source.uri === 'object') {
      console.error('🚨 FOUND IT! source.uri is an object:', source.uri);
      console.error('Stack:', new Error().stack);
      
      // Try to extract string
      if (source.uri.uri) {
        console.warn('Fixing nested uri...');
        return <RNImage {...rest} source={{ uri: source.uri.uri }} />;
      }
    }
  }
  
  return <RNImage {...props} />;
}

// src/components/RemoteImage.js
import React, { useState } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';

/**
 * Image component with loading state and fallback
 * Just renders Image directly - no prefetch needed
 */
export default function RemoteImage({ source, style, resizeMode, onLoad, onError, ...props }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle local require() assets
  if (typeof source === 'number') {
    return <Image source={source} style={style} resizeMode={resizeMode} {...props} />;
  }

  // Handle no source
  if (!source?.uri) {
    return (
      <Image
        source={require("../../asset/concert-show-performance.jpg")}
        style={style}
        resizeMode={resizeMode}
        {...props}
      />
    );
  }

  // Show fallback if error
  if (error) {
    return (
      <Image
        source={require("../../asset/concert-show-performance.jpg")}
        style={style}
        resizeMode={resizeMode}
        {...props}
      />
    );
  }

  return (
    <View style={style}>
      {loading && (
        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }]}>
          <ActivityIndicator size="small" color="#10b981" />
        </View>
      )}
      <Image
        source={{ uri: source.uri }}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={() => {
          console.log('🔄 Image loading:', source.uri);
          setLoading(true);
        }}
        onLoad={(e) => {
          console.log('✅ Image loaded:', source.uri);
          setLoading(false);
          setError(false);
          onLoad?.(e);
        }}
        onError={(e) => {
          console.error('❌ Image error:', source.uri);
          console.error('Error:', e.nativeEvent);
          setLoading(false);
          setError(true);
          onError?.(e);
        }}
        {...props}
      />
    </View>
  );
}

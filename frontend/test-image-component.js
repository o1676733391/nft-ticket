import React from 'react';
import { View, Image, Text } from 'react-native';

// Simple test component to isolate Image loading issue
export default function TestImageComponent() {
  const testImages = [
    // Test 1: Local asset (should work)
    { 
      type: 'local', 
      source: require('./asset/concert-show-performance.jpg'),
      label: 'Local Asset (require)'
    },
    // Test 2: Simple placeholder (should work)
    { 
      type: 'http', 
      source: { uri: 'https://via.placeholder.com/400x300.png' },
      label: 'Placeholder (via.placeholder.com)'
    },
    // Test 3: Your actual Supabase image
    { 
      type: 'supabase', 
      source: { uri: 'https://xuqswkwbgaoilulgllbu.supabase.co/storage/v1/object/public/images/events/7dc9cf92-dc75-4f13-ba2e-b3df8af5deec/d39b7a36-e040-4dcd-8d98-079dba156fe0.png' },
      label: 'Supabase Storage'
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Image Loading Test</Text>
      
      {testImages.map((test, index) => (
        <View key={index} style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>{test.label}</Text>
          <View style={{ 
            width: '100%', 
            height: 200, 
            backgroundColor: '#e5e7eb',
            borderWidth: 2,
            borderColor: '#9ca3af'
          }}>
            {console.log(`🧪 Rendering ${test.type} image...`)}
            <Image
              source={test.source}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onLoadStart={() => console.log(`✓ ${test.type} onLoadStart`)}
              onLoad={() => console.log(`✓ ${test.type} onLoad`)}
              onLoadEnd={() => console.log(`✓ ${test.type} onLoadEnd`)}
              onError={(e) => console.error(`✗ ${test.type} onError:`, e.nativeEvent?.error)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

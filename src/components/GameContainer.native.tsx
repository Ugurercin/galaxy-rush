import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  onMessage?: (data: string) => void;
}

export default function GameContainer({ onMessage }: Props) {
  const webViewRef = useRef<WebView>(null);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>WebView Error:{'\n'}{error}</Text>
      </View>
    );
  }

  return (
    <WebView
      ref={webViewRef}
      style={styles.webview}
      // Load directly from android assets
      source={{ uri: 'file:///android_asset/game/index.html' }}
      // Required for local file access on Android
      originWhitelist={['*']}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      allowFileAccessFromFileURLs={true}
      // Audio requires this to be false
      mediaPlaybackRequiresUserAction={false}
      // JS settings
      javaScriptEnabled={true}
      domStorageEnabled={true}
      // Prevent scroll bounce interfering with game input
      scrollEnabled={false}
      bounces={false}
      // Error handling — shows message instead of silent black screen
      onError={(e) => {
        console.error('[WebView error]', e.nativeEvent);
        setError(JSON.stringify(e.nativeEvent, null, 2));
      }}
      onHttpError={(e) => {
        console.error('[WebView HTTP error]', e.nativeEvent);
      }}
      // Message bridge from Phaser → React Native
      onMessage={(event) => {
        onMessage?.(event.nativeEvent.data);
      }}
      // Log when page loads successfully
      onLoad={() => console.log('[WebView] Game loaded successfully')}
      onLoadStart={() => console.log('[WebView] Loading started')}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#060a12',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#060a12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3355',
    fontFamily: 'monospace',
    fontSize: 12,
    textAlign: 'center',
  },
});
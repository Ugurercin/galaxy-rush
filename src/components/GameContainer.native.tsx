import { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  onMessage?: (data: string) => void;
}

export default function GameContainer({ onMessage }: Props) {
  const webViewRef = useRef<WebView>(null);

  return (
    <WebView
      ref={webViewRef}
      style={styles.webview}
      source={{ uri: 'file:///android_asset/game/index.html' }}
      originWhitelist={['*']}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
      mediaPlaybackRequiresUserAction={false}
      onMessage={(event) => {
        onMessage?.(event.nativeEvent.data);
      }}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#060a12',
  },
});
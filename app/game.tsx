import GameContainer from '@/src/components/GameContainer';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function GameScreen() {
  const handleMessage = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      console.log('[Game message]', parsed);
      // We'll handle coin saves, score updates etc. here later
    } catch {
      console.log('[Game raw]', data);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GameContainer onMessage={handleMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060a12',
  },
});
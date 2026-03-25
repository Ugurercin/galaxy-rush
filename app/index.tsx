import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>GALAXY</Text>
        <Text style={styles.titleAccent}>RUSH</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/game')}
        >
          <Text style={styles.buttonText}>PLAY</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060a12',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 52,
    fontFamily: 'monospace',
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 6,
  },
  titleAccent: {
    fontSize: 52,
    fontFamily: 'monospace',
    color: '#00e5ff',
    fontWeight: 'bold',
    letterSpacing: 6,
    marginBottom: 40,
  },
  button: {
    borderWidth: 1,
    borderColor: '#00e5ff',
    paddingVertical: 14,
    paddingHorizontal: 48,
    backgroundColor: '#0a1628',
  },
  buttonText: {
    color: '#00e5ff',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
});
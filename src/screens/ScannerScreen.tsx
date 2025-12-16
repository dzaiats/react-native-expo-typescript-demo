import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useThemeStore } from '@/store/themeStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '@/navigation/AppNavigator';
import Toast from 'react-native-toast-message';

type NavigationProp = BottomTabNavigationProp<TabParamList>;

export const ScannerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useThemeStore((state) => state.theme);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraKey, setCameraKey] = useState(0);

  // Reset scanner when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset scanned state and camera when screen is focused
      setScanned(false);
      setCameraKey((prev) => prev + 1); // Force camera re-render
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permissions in your device settings to scan QR codes.',
        [{ text: 'OK' }]
      );
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    Toast.show({
      type: 'success',
      text1: 'QR Code Scanned',
      text2: data,
      position: 'bottom',
      visibilityTime: 2000,
    });

    // Redirect to Events tab after a short delay
    setTimeout(() => {
      navigation.navigate('EventsTab');
      // Reset after navigation so camera is ready when user comes back
      setTimeout(() => {
        setScanned(false);
        setCameraKey((prev) => prev + 1);
      }, 500);
    }, 2000);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View
        testID="scanner-loading"
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          testID="scanner-loading-text"
          style={[styles.text, { color: theme.colors.text }]}
        >
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        testID="scanner-permission-denied"
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          testID="scanner-permission-text"
          style={[styles.text, { color: theme.colors.text, marginBottom: 16 }]}
        >
          Camera permission is required to scan QR codes.
        </Text>
        <TouchableOpacity
          testID="scanner-permission-button"
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      testID="scanner-screen"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <CameraView
        key={cameraKey}
        testID="scanner-camera"
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View
          testID="scanner-overlay"
          style={styles.overlay}
        >
          <View
            testID="scanner-frame"
            style={[styles.scanFrame, { borderColor: theme.colors.primary }]}
          />
          <Text
            testID="scanner-instruction"
            style={[styles.instructionText, { color: '#FFFFFF' }]}
          >
            Point your camera at a QR code
          </Text>
        </View>
      </CameraView>

      <View
        testID="scanner-controls"
        style={[
          styles.controls,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <TouchableOpacity
          testID="scanner-flip-button"
          style={[
            styles.controlButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={toggleCameraFacing}
        >
          <Text
            testID="scanner-flip-button-text"
            style={[styles.controlButtonText, { color: theme.colors.text }]}
          >
            Flip Camera
          </Text>
        </TouchableOpacity>

        {scanned && (
          <TouchableOpacity
            testID="scanner-rescan-button"
            style={[
              styles.controlButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              setScanned(false);
              setCameraKey((prev) => prev + 1); // Force camera re-render
            }}
          >
            <Text
              testID="scanner-rescan-button-text"
              style={styles.controlButtonText}
            >
              Scan Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: 8,
  },
  instructionText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  controls: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});


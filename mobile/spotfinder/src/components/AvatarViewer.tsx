import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  View,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';

const { width: SW, height: SH } = Dimensions.get('window');
const TARGET_SIZE = Math.min(SW * 0.72, 320);

interface Props {
  uri: string;
  visible: boolean;
  onClose: () => void;
  originSize?: number; // size of the tapped avatar
}

export function AvatarViewer({ uri, visible, onClose, originSize = 40 }: Props) {
  const scale     = useRef(new Animated.Value(0)).current;
  const opacity   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.centeredContainer} pointerEvents="box-none">
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.imageWrap,
                {
                  transform: [
                    {
                      scale: scale.interpolate({
                        inputRange: [0, 1],
                        outputRange: [originSize / TARGET_SIZE, 1],
                      }),
                    },
                  ],
                  opacity,
                },
              ]}
            >
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 20,
  },
  image: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
});

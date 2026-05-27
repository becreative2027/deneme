import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const { width: SW, height: SH } = Dimensions.get('window');

// ── Ratio options ─────────────────────────────────────────────────────────────
const RATIOS = [
  { label: '1:1', w: 1, h: 1 },
  { label: '4:5', w: 4, h: 5 },
  { label: '16:9', w: 16, h: 9 },
] as const;

type RatioOption = (typeof RATIOS)[number];

function getPinchDistance(touches: { pageX: number; pageY: number }[]) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

interface Props {
  uri: string;
  visible: boolean;
  onCancel: () => void;
  onCrop: (croppedUri: string) => void;
}

export function CropModal({ uri, visible, onCancel, onCrop }: Props) {
  const insets = useSafeAreaInsets();
  const [ratio, setRatio] = useState<RatioOption>(RATIOS[0]);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [isCropping, setIsCropping] = useState(false);

  // ── Crop frame dimensions ─────────────────────────────────────────────────
  const FRAME_W = SW;
  const FRAME_H = Math.round(SW * (ratio.h / ratio.w));

  // Available height after top/bottom chrome
  const CHROME_TOP = insets.top + 52;    // close button area
  const CHROME_BOTTOM = insets.bottom + 96; // ratio bar + confirm
  const CONTAINER_H = SH;

  // Frame's center on screen (vertically centered in available area)
  const FRAME_CY = CHROME_TOP + (CONTAINER_H - CHROME_TOP - CHROME_BOTTOM) / 2;
  const FRAME_TOP = FRAME_CY - FRAME_H / 2;

  // ── Transform state ───────────────────────────────────────────────────────
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const scaleRef = useRef(1);
  const txRef    = useRef(0);
  const tyRef    = useRef(0);
  const minScale = useRef(1);

  // gesture bookkeeping
  const startTx         = useRef(0);
  const startTy         = useRef(0);
  const lastPinchDist   = useRef<number | null>(null);
  const lastPinchScale  = useRef(1);
  const prevTouchCount  = useRef(0);

  // ── Init on open ──────────────────────────────────────────────────────────
  const initTransform = useCallback(
    (natW: number, natH: number, fW: number, fH: number) => {
      const s = Math.max(fW / natW, fH / natH);
      minScale.current = s;
      scaleRef.current = s;
      lastPinchScale.current = s;
      txRef.current = 0;
      tyRef.current = 0;
      scaleAnim.setValue(s);
      translateXAnim.setValue(0);
      translateYAnim.setValue(0);
    },
    [scaleAnim, translateXAnim, translateYAnim],
  );

  useEffect(() => {
    if (!visible || !uri) return;
    Image.getSize(uri, (w, h) => {
      setImgNatural({ w, h });
      initTransform(w, h, FRAME_W, FRAME_H);
    });
  }, [uri, visible]);

  // Re-init when ratio changes
  useEffect(() => {
    if (!visible) return;
    initTransform(imgNatural.w, imgNatural.h, FRAME_W, FRAME_H);
  }, [ratio, visible]);

  // ── Constraint helper ─────────────────────────────────────────────────────
  const constrain = useCallback(
    (tx: number, ty: number, s: number) => {
      const displayW = imgNatural.w * s;
      const displayH = imgNatural.h * s;
      const maxTx = Math.max(0, (displayW - FRAME_W) / 2);
      const maxTy = Math.max(0, (displayH - FRAME_H) / 2);
      return {
        tx: Math.min(Math.max(tx, -maxTx), maxTx),
        ty: Math.min(Math.max(ty, -maxTy), maxTy),
      };
    },
    [imgNatural, FRAME_W, FRAME_H],
  );

  // ── PanResponder ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        startTx.current = txRef.current;
        startTy.current = tyRef.current;
        lastPinchDist.current = null;
        prevTouchCount.current = 0;
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        const count   = touches.length;

        // Reset pan start when switching from pinch back to single touch
        if (prevTouchCount.current === 2 && count === 1) {
          startTx.current = txRef.current;
          startTy.current = tyRef.current;
          lastPinchDist.current = null;
        }
        prevTouchCount.current = count;

        if (count >= 2) {
          // ── Pinch ────────────────────────────────────────────────────────
          const dist = getPinchDistance([
            { pageX: touches[0].pageX, pageY: touches[0].pageY },
            { pageX: touches[1].pageX, pageY: touches[1].pageY },
          ]);
          if (lastPinchDist.current === null) {
            lastPinchDist.current = dist;
            lastPinchScale.current = scaleRef.current;
            return;
          }
          const delta    = dist / lastPinchDist.current;
          const newScale = Math.min(
            Math.max(lastPinchScale.current * delta, minScale.current),
            minScale.current * 5,
          );
          scaleRef.current = newScale;
          scaleAnim.setValue(newScale);
          lastPinchDist.current  = dist;
          lastPinchScale.current = newScale;

          // Constrain translation after scale change
          const { tx, ty } = constrain(txRef.current, tyRef.current, newScale);
          txRef.current = tx;
          tyRef.current = ty;
          translateXAnim.setValue(tx);
          translateYAnim.setValue(ty);
        } else {
          // ── Pan ──────────────────────────────────────────────────────────
          const raw = constrain(
            startTx.current + gestureState.dx,
            startTy.current + gestureState.dy,
            scaleRef.current,
          );
          txRef.current = raw.tx;
          tyRef.current = raw.ty;
          translateXAnim.setValue(raw.tx);
          translateYAnim.setValue(raw.ty);
        }
      },

      onPanResponderRelease: () => {
        lastPinchDist.current = null;
      },
    }),
  ).current;

  // ── Crop & confirm ────────────────────────────────────────────────────────
  const handleConfirm = useCallback(async () => {
    setIsCropping(true);
    try {
      const s   = scaleRef.current;
      const tx  = txRef.current;
      const ty  = tyRef.current;
      const natW = imgNatural.w;
      const natH = imgNatural.h;

      // Image top-left position on screen (relative to frame top-left)
      const imgScreenLeft = SW / 2 + tx - (natW * s) / 2;
      const imgScreenTop  = FRAME_CY + ty - (natH * s) / 2;
      const frameScreenLeft = (SW - FRAME_W) / 2;
      const frameScreenTop  = FRAME_TOP;

      // Convert to original image pixel coordinates
      const originX = Math.max(0, (frameScreenLeft - imgScreenLeft) / s);
      const originY = Math.max(0, (frameScreenTop  - imgScreenTop)  / s);
      const cropW   = Math.min(FRAME_W / s, natW - originX);
      const cropH   = Math.min(FRAME_H / s, natH - originY);

      const result = await manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: Math.round(originX),
              originY: Math.round(originY),
              width:   Math.max(1, Math.round(cropW)),
              height:  Math.max(1, Math.round(cropH)),
            },
          },
          // Resize to a consistent output width (1080px — standard post size)
          { resize: { width: 1080 } },
        ],
        { compress: 0.9, format: SaveFormat.JPEG },
      );
      onCrop(result.uri);
    } catch (e) {
      console.warn('CropModal error:', e);
      onCrop(uri); // fallback: use original
    } finally {
      setIsCropping(false);
    }
  }, [uri, imgNatural, FRAME_W, FRAME_H, FRAME_CY, FRAME_TOP, onCrop]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        {/* Image layer */}
        <Animated.Image
          source={{ uri }}
          style={[
            styles.image,
            {
              transform: [
                { translateX: translateXAnim },
                { translateY: Animated.add(
                    translateYAnim,
                    new Animated.Value(FRAME_CY - SH / 2),
                  ) },
                { scale: scaleAnim },
              ],
            },
          ]}
          resizeMode="contain"
          {...panResponder.panHandlers}
        />

        {/* Darkened overlay outside crop frame */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {/* Top */}
          <View style={[styles.shadow, { top: 0, left: 0, right: 0, height: FRAME_TOP }]} />
          {/* Bottom */}
          <View style={[styles.shadow, { top: FRAME_TOP + FRAME_H, left: 0, right: 0, bottom: 0 }]} />
          {/* Crop frame border */}
          <View
            style={[
              styles.frameBorder,
              { top: FRAME_TOP, left: (SW - FRAME_W) / 2, width: FRAME_W, height: FRAME_H },
            ]}
          />
          {/* Rule-of-thirds grid */}
          <View style={[styles.gridLine, styles.gridV1, { top: FRAME_TOP, height: FRAME_H, left: SW / 3 }]} />
          <View style={[styles.gridLine, styles.gridV2, { top: FRAME_TOP, height: FRAME_H, left: (SW / 3) * 2 }]} />
          <View style={[styles.gridLine, styles.gridH1, { left: 0, width: SW, top: FRAME_TOP + FRAME_H / 3 }]} />
          <View style={[styles.gridLine, styles.gridH2, { left: 0, width: SW, top: FRAME_TOP + (FRAME_H / 3) * 2 }]} />
        </View>

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onCancel} style={styles.topBtn}>
            <Text style={styles.topBtnText}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Kırp</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.topBtn, styles.topBtnConfirm]}
            disabled={isCropping}
          >
            {isCropping ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.topBtnText, styles.topBtnConfirmText]}>Uygula</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Ratio selector */}
        <View style={[styles.ratioBar, { paddingBottom: insets.bottom + 16 }]}>
          {RATIOS.map((r) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.ratioBtn, ratio.label === r.label && styles.ratioBtnActive]}
              onPress={() => setRatio(r)}
            >
              <Text style={[styles.ratioBtnText, ratio.label === r.label && styles.ratioBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: SW,
    height: SH,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  frameBorder: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  gridV1: { width: StyleSheet.hairlineWidth },
  gridV2: { width: StyleSheet.hairlineWidth },
  gridH1: { height: StyleSheet.hairlineWidth },
  gridH2: { height: StyleSheet.hairlineWidth },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  topTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  topBtnConfirm: {
    backgroundColor: '#F5A623',
  },
  topBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  topBtnConfirmText: {
    fontWeight: '700',
  },
  ratioBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  ratioBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ratioBtnActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  ratioBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  ratioBtnTextActive: {
    color: '#fff',
  },
});

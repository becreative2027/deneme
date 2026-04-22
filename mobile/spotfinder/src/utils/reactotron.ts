import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron.configure({
    name: 'SpotFinder',
    host: 'localhost',
  })
    .useReactNative({
      networking: {
        ignoreUrls: /\/logs$/,
      },
    })
    .connect();

  // Temiz console için
  (console as any).tron = Reactotron;
}

export default Reactotron;

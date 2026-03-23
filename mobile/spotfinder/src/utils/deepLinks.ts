/**
 * Phase 8.1 — Deep Link / Universal Link configuration
 *
 * Supported schemes:
 *   spotfinder://place/:placeId      → PlaceDetail screen
 *   spotfinder://user/:userId        → UserProfile screen
 *   https://spotfinder.app/place/:id → same (universal link)
 *   https://spotfinder.app/user/:id  → same
 *
 * Pass this object to <NavigationContainer linking={linking}>.
 */
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'spotfinder://',
    'https://spotfinder.app',
    'http://spotfinder.app', // dev / staging
  ],

  config: {
    screens: {
      Main: {
        screens: {
          FeedTab: {
            screens: {
              Feed: '',
              PlaceDetail: 'place/:placeId',
              UserProfile: 'user/:userId',
            },
          },
          SearchTab: {
            screens: {
              Search: 'search',
              PlaceDetail: 'place/:placeId',
            },
          },
        },
      },
      // Auth routes are not reachable via deep link
      Auth: 'auth',
    },
  },
};

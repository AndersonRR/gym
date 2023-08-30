import { useTheme } from 'native-base';
import { Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { Home } from '@screens/Home';
import { Profile } from '@screens/Profile';
import { History } from '@screens/History';
import { Exercise } from '@screens/Exercise';

import HomeSvg from '@assets/home.svg';
import ProfileSvg from '@assets/profile.svg';
import HistorySvg from '@assets/history.svg';

type AppRoutes = {
  home: undefined;
  history: undefined;
  profile: undefined;
  exercise: undefined;
};

export type AppNavigatorRoutesProps = BottomTabNavigationProp<AppRoutes>;

const { Navigator, Screen } = createBottomTabNavigator();

export function AppRoutes() {
  const { sizes, colors } = useTheme();
  const iconSize = sizes[6];

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.gray[200],
        tabBarStyle: {
          backgroundColor: colors.gray[600],
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 'auto' : 96,
          paddingBottom: sizes[10],
          paddingTop: sizes[6],
        },
      }}
    >
      <Screen
        name='home'
        component={Home}
        options={{
          tabBarIcon: ({ color }) => (
            <HomeSvg
              width={iconSize}
              height={iconSize}
              fill={color}
            />
          ),
        }}
      />

      <Screen
        name='history'
        component={History}
        options={{
          tabBarIcon: ({ color }) => (
            <HistorySvg
              width={iconSize}
              height={iconSize}
              fill={color}
            />
          ),
        }}
      />

      <Screen
        name='profile'
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <ProfileSvg
              width={iconSize}
              height={iconSize}
              fill={color}
            />
          ),
        }}
      />

      <Screen
        name='exercise'
        component={Exercise}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Navigator>
  );
}

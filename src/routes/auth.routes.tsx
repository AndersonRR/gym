import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import { SignUp } from '@screens/SignUp';
import { SignIn } from '@screens/SignIn';

type AuthRoutes = {
  signIn: undefined;
  signUp: undefined;
};

export type AuthNavigatorRoutesProps = NativeStackNavigationProp<AuthRoutes>;

const { Navigator, Screen } = createNativeStackNavigator();

export function AuthRoutes() {
  return (
    <Navigator screenOptions={{ headerShown: false }}>
      <Screen
        name='SignIn'
        component={SignIn}
      />
      <Screen
        name='SignUp'
        component={SignUp}
      />
    </Navigator>
  );
}

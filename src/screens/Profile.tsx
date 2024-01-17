import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, TouchableOpacity } from 'react-native';
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from 'native-base';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';
import { AppError } from '@utils/AppError';

import defaultUserPhotoImg from '@assets/userPhotoDefault.png';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { UserPhoto } from '@components/UserPhoto';
import { ScreenHeader } from '@components/ScreenHeader';

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email?: string;
  old_password?: string;
  password?: string | null;
  confirm_password?: string | null;
};

const profileSchema = yup.object({
  name: yup.string().required('Nome obrigatário'),
  password: yup
    .string()
    .min(6, 'No mínimo 6 caracteres')
    .nullable()
    .transform((value: string) => (value ? value : null)),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'As senhas devem ser iguais')
    .nullable()
    .transform((value: string) => (value ? value : null))
    .when('password', {
      is: (Field: string) => Field,
      then: schema =>
        schema
          .nullable()
          .required('Informe a confirmação da senha')
          .transform((value: string) => (value ? value : null)),
    }),
});

export function Profile() {
  const [isUpdating, setUpdating] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);

  const toast = useToast();
  const { user, updateUserProfile } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
  });

  async function handleSelectPhoto() {
    setPhotoIsLoading(true);

    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);

        if (photoInfo.exists && photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
          return Alert.alert('Imagem muito grande. Tamanho máximo é 5 MB.');
        }
      }

      const fileExtension = photoSelected.assets[0].uri.split('.').pop();
      const photoFile = {
        name: `${user.name}.${fileExtension}`.toLocaleLowerCase(),
        uri: photoSelected.assets[0].uri,
        type: `${photoSelected.assets[0].type}/${fileExtension}`,
      } as never;

      const userPhotoUploadForm = new FormData();
      userPhotoUploadForm.append('avatar', photoFile);

      const response = await api.patch('/users/avatar', userPhotoUploadForm, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      user.avatar = response.data.avatar;
      void updateUserProfile(user);

      toast.show({
        title: 'Foto atualizada com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
    }
  }

  async function handleUpdateProfile(data: FormDataProps) {
    try {
      setUpdating(true);

      const userUpdated = user;
      userUpdated.name = data.name;

      await api.put('/users', data);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível atualizar o perfil.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView>
        <Center
          mt={6}
          px={10}
        >
          {photoIsLoading ? (
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded="full"
              startColor="gray.500"
              endColor="gray.300"
            />
          ) : (
            <UserPhoto
              source={
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                user.avatar
                  ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` }
                  : defaultUserPhotoImg
              }
              alt="Foto do usuário"
              size={33}
            />
          )}

          <TouchableOpacity onPress={() => void handleSelectPhoto()}>
            <Text
              color="green.500"
              fontWeight="bold"
              fontSize="md"
              mt={2}
              mb={8}
            >
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                bg="gray.600"
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                isDisabled
                bg="gray.600"
                placeholder="E-mail"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </Center>

        <VStack
          px={10}
          mt={12}
          mb={9}
        >
          <Heading
            fontFamily="heading"
            color="gray.200"
            fontSize="md"
            mb={2}
          >
            Alterar senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                bg="gray.600"
                placeholder="Confirme a senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={() => handleSubmit(handleUpdateProfile)}
            isLoading={isUpdating}
          />
        </VStack>
      </ScrollView>
    </VStack>
  );
}

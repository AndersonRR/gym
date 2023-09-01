import { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Center, Heading, ScrollView, Skeleton, Text, VStack } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { UserPhoto } from '@components/UserPhoto';
import { ScreenHeader } from '@components/ScreenHeader';

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://github.com/andersonrr.png');
  const PHOTO_SIZE = 33;

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
    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
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
              source={{ uri: userPhoto }}
              alt="Foto do usuário"
              size={33}
            />
          )}

          <TouchableOpacity onPress={handleSelectPhoto}>
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

          <Input
            bg="gray.600"
            placeholder="Nome"
          />

          <Input
            bg="gray.600"
            placeholder="E-mail"
            isDisabled
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

          <Input
            bg="gray.600"
            placeholder="Senha antiga"
            secureTextEntry
          />
          <Input
            bg="gray.600"
            placeholder="Nova senha"
            secureTextEntry
          />
          <Input
            bg="gray.600"
            placeholder="Confirme a senha"
            secureTextEntry
          />

          <Button
            title="Atualizar"
            mt={4}
          ></Button>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

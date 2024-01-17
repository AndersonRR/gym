import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { VStack, SectionList, Heading, Text, useToast } from 'native-base';

import { Loading } from '@components/Loading';
import { HistoryCard } from '@components/HistoryCard';
import { ScreenHeader } from '@components/ScreenHeader';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function fetchHistory() {
        try {
          setIsLoading(true);

          const response = await api.get('/history');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setExercises(response.data);
        } catch (error) {
          const isAppError = error instanceof AppError;
          const title = isAppError ? error.message : 'Não foi possível carregar o histórico.';

          toast.show({
            title,
            placement: 'top',
            bgColor: 'red.500',
          });
        } finally {
          setIsLoading(false);
        }
      }

      void fetchHistory();
    }, [toast]),
  );

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />

      {isLoading ? (
        <Loading />
      ) : (
        <SectionList
          px={8}
          showsVerticalScrollIndicator={false}
          sections={exercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <HistoryCard data={item} />}
          renderSectionHeader={({ section }) => (
            <Heading
              fontFamily="heading"
              color="gray.200"
              fontSize="md"
              mt={10}
              mb={3}
            >
              {section.title}
            </Heading>
          )}
          contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: 'center' }}
          ListEmptyComponent={() => (
            <Text
              color="gray.100"
              textAlign="center"
            >
              Não há exercícios cadastrados. {'\n'} Bora fazer exercícios hoje?
            </Text>
          )}
        />
      )}
    </VStack>
  );
}
